import { WorkshopUserRole } from '../types/database'

export type Permission = 
  | 'read' 
  | 'write' 
  | 'delete' 
  | 'start' 
  | 'manage_users' 
  | 'archive' 
  | 'edit_settings'

const PERMISSIONS: Record<WorkshopUserRole, Permission[]> = {
  owner: ['read', 'write', 'delete', 'start', 'manage_users', 'archive', 'edit_settings'],
  collaborator: ['read', 'write', 'start']
}

export function canUserPerformAction(
  role: WorkshopUserRole | null,
  action: Permission
): boolean {
  if (!role) return false
  return PERMISSIONS[role].includes(action)
}

export function getUserPermissions(role: WorkshopUserRole | null): Permission[] {
  if (!role) return []
  return PERMISSIONS[role]
}

export function canEditSettings(role: WorkshopUserRole | null): boolean {
  return canUserPerformAction(role, 'edit_settings')
}

export function canManageUsers(role: WorkshopUserRole | null): boolean {
  return canUserPerformAction(role, 'manage_users')
}

export function canArchive(role: WorkshopUserRole | null): boolean {
  return canUserPerformAction(role, 'archive')
}

export function canDelete(role: WorkshopUserRole | null): boolean {
  return canUserPerformAction(role, 'delete')
}

export function canStart(role: WorkshopUserRole | null): boolean {
  return canUserPerformAction(role, 'start')
}

export function canWrite(role: WorkshopUserRole | null): boolean {
  return canUserPerformAction(role, 'write')
}

export function canRead(role: WorkshopUserRole | null): boolean {
  return canUserPerformAction(role, 'read')
}
