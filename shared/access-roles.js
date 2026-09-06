// Roles come only from verified Identity app metadata, never editable profile metadata.
export function identityRoles(user) {
  const metadata = user?.appMetadata ?? user?.app_metadata;
  const roles = [
    ...(Array.isArray(user?.roles) ? user.roles : []),
    ...(Array.isArray(metadata?.roles) ? metadata.roles : []),
    ...(typeof user?.role === "string" ? [user.role] : []),
  ];
  if (roles.some((role) => ["owner", "admin", "director"].includes(role))) roles.push("owner");
  return [...new Set(roles)];
}
