import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { isAuthConfigured } from '../lib/supabase'

/**
 * Admin route guard. FAILS CLOSED: nothing admin-related is shown unless a verified admin role is found.
 *
 * Role lookup is not built yet (it needs the database tables and RLS). Until then, no one is treated as an admin,
 * so this guard always denies. This client-side check is for UX only. Real protection must come from the
 * server (Row Level Security and server functions).
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth()

  if (loading) {
    return <main className="admin-gate"><p>Checking access…</p></main>
  }

  if (!isAuthConfigured) {
    return (
      <main className="admin-gate">
        <h1>Admin area</h1>
        <p>Admin access is not connected yet. It needs the database and sign-in to be set up first.</p>
        <Link to="/">Back to the storefront</Link>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="admin-gate">
        <h1>Admin sign-in</h1>
        <p>Sign in with an administrator account.</p>
        <Link to="/login">Go to sign-in</Link>
      </main>
    )
  }

  // Role lookup from the database goes here. It stays false until that exists, so access is denied.
  const roleVerified = false
  if (roleVerified) return <>{children}</>

  return (
    <main className="admin-gate">
      <h1>Access denied</h1>
      <p>This account does not have administrator access.</p>
      <Link to="/">Back to the storefront</Link>
    </main>
  )
}
