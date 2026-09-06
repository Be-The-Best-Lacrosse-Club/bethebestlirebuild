import assert from 'node:assert/strict';
import test from 'node:test';
import { identityRoles } from '../shared/access-roles.js';
import { authorizeIdentity } from '../netlify/functions/_identity.js';

for (const role of ['owner', 'admin', 'director']) {
  test(`${role} can access owner-protected APIs after Identity verification`, async () => {
    const result = await authorizeIdentity({ headers: { Authorization: 'Bearer test-session' } }, ['owner'], {
      fetchImpl: async () => ({ ok: true, json: async () => ({ id: 'staff', app_metadata: { roles: [role] } }) }),
    });
    assert.equal(result.ok, true);
    assert.ok(identityRoles({ appMetadata: { roles: [role] } }).includes('owner'));
  });
}

test('editable profile metadata cannot grant admin or coach access', async () => {
  const user = { id: 'player', user_metadata: { roles: ['owner'], role: 'director' }, app_metadata: { roles: ['player'] } };
  assert.deepEqual(identityRoles(user), ['player']);
  const result = await authorizeIdentity({ headers: { Authorization: 'Bearer test-session' } }, ['owner', 'coach'], {
    fetchImpl: async () => ({ ok: true, json: async () => user }),
  });
  assert.equal(result.statusCode, 403);
});

test('an empty normalized roles list does not hide assigned app metadata roles', () => {
  assert.ok(identityRoles({ roles: [], appMetadata: { roles: ['coach'] } }).includes('coach'));
});

test('coaches and players never gain administrative access', () => {
  for (const role of ['coach', 'player', 'authenticated']) {
    assert.equal(identityRoles({ app_metadata: { roles: [role] } }).includes('owner'), false);
  }
});

// Exercise our auth adapter with Identity's invite behavior: accepting an invite
// returns a user but does not create the cookie-backed session used by getUser.
test('accepting an invitation establishes a login session before opening the hub', async () => {
  const { readFile } = await import('node:fs/promises');
  const ts = await import('typescript');
  const values = new Map([['btb-pending-auth-action', JSON.stringify({ type: 'invite', token: 'invitation-token' })]]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const originalWindow = globalThis.window;
  globalThis.window = { sessionStorage: storage, localStorage: storage };
  const user = { id: 'coach', email: 'coach@example.test', appMetadata: { roles: ['coach'], program: 'girls', programs: ['girls'] } };
  let session = null;
  const calls = [];
  globalThis.__btbIdentityTest = {
    acceptInvite: async (token, password) => { calls.push(['invite', token, password]); return user; },
    login: async (email, password) => { calls.push(['login', email, password]); session = user; return user; },
    getUser: async () => session,
  };
  try {
    const names = ['acceptInvite', 'getUser', 'handleAuthCallback', 'login', 'logout', 'onAuthChange', 'refreshSession', 'requestPasswordRecovery', 'signup', 'updateUser'];
    const mockSource = names.map(name => `export const ${name} = (...args) => globalThis.__btbIdentityTest.${name}?.(...args);`).join('\n');
    const mockUrl = `data:text/javascript;base64,${Buffer.from(mockSource).toString('base64')}`;
    const source = await readFile(new URL('../src/lib/auth.ts', import.meta.url), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
      .replace('"@netlify/identity"', JSON.stringify(mockUrl))
      .replace('"../../shared/access-roles.js"', JSON.stringify(new URL('../shared/access-roles.js', import.meta.url).href));
    const auth = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
    await auth.completePendingPassword('new-password-123');
    assert.deepEqual(calls, [['invite', 'invitation-token', 'new-password-123'], ['login', 'coach@example.test', 'new-password-123']]);
    assert.equal((await auth.validateSession()).gender, 'girls');
    assert.equal(auth.getPendingAuthAction(), null);
    assert.ok(Number(storage.getItem('btb-coach-girls-access-until')) > Date.now());
    assert.equal(storage.getItem('btb-coach-boys-access-until'), null);
    assert.equal(storage.getItem('btb-owner-access-until'), null);
  } finally {
    globalThis.window = originalWindow;
    delete globalThis.__btbIdentityTest;
  }
});
