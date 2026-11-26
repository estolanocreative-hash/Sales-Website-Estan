// Admin roles and permissions (spec section 17).
// This is the shared vocabulary for the UI. It is NOT the security boundary: every permission must be
// enforced again on the server (Supabase Row Level Security and server functions) before it protects real data.

export const PERMISSIONS = [
  'products.view',
  'products.edit',
  'inventory.manage',
  'orders.view',
  'orders.update',
  'customers.view',
  'digital.manage',
  'bookings.manage',
  'content.edit',
  'reports.view',
  'activity.view',
  'admins.manage',
  'settings.edit',
] as const

export type Permission = (typeof PERMISSIONS)[number]

export const ROLES = ['owner', 'manager', 'product_editor', 'order_manager', 'support_staff'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  manager: 'Manager',
  product_editor: 'Product Editor',
  order_manager: 'Order Manager',
  support_staff: 'Support Staff',
}

/** Suggested defaults. The owner can change these. Owner is the only role that manages administrators. */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  owner: PERMISSIONS,
  manager: PERMISSIONS.filter((p) => p !== 'admins.manage' && p !== 'settings.edit'),
  product_editor: ['products.view', 'products.edit', 'inventory.manage', 'digital.manage', 'content.edit'],
  order_manager: ['orders.view', 'orders.update', 'customers.view', 'bookings.manage'],
  support_staff: ['orders.view', 'customers.view', 'bookings.manage'],
}

export function hasPermission(role: Role | null, permission: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role].includes(permission)
}
