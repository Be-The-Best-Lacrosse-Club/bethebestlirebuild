import fs from 'fs';

const btbOsPath = '/Users/bethe/BTB-OS/public/playbooks/playbook-studio.html';
const mainSitePath = '/Users/bethe/bethebestlirebuild/public/playbook-studio.html';

let content = fs.readFileSync(btbOsPath, 'utf8');
const osAuthBlockRegex = /\/\/ ── STAFF-ONLY AUTH GATE ──[\s\S]*?\}\)\(\);/;
const mainSiteAuthBlock = `// ── COACH-ONLY AUTH GATE ────────────────────────────────────────────
  (function () {
    var key = 'btbPlaybookStudioUnlocked';
    if (Number(localStorage.getItem('btb-owner-access-until')) > Date.now()) return;
    if (sessionStorage.getItem(key) === 'yes') return;
    var pass = prompt('Enter BTB coach password:');
    if (pass === '#BTBCOACH26') {
      sessionStorage.setItem(key, 'yes');
      return;
    }
    alert('Coach access required.');
    window.location.href = '/login?redirect=/playbook-studio.html';
  })();`;

content = content.replace(osAuthBlockRegex, mainSiteAuthBlock);
fs.writeFileSync(mainSitePath, content, 'utf8');
console.log('Synced to main site');
