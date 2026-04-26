export interface AdminPermissions {
  canViewReports: boolean
}

// Map email -> permissions. Add new users here to control access.
const PERMISSIONS_MAP: Record<string, AdminPermissions> = {
  'marrakech@dev.com': { canViewReports: true },
  'operador@dev.com':  { canViewReports: false },
}

export function getPermissionsForEmail(email: string): AdminPermissions {
  const key = email.toLowerCase()
  return PERMISSIONS_MAP[key] ?? { canViewReports: false }
}
