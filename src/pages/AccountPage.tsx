import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const upcoming = ['Profile', 'My orders', 'My downloads', 'My services', 'Notifications']

/** Protected customer area. Only signed-in customers can see this page. */
export function AccountPage() {
  const { loading, user, signOut, isConfigured } = useAuth()

  if (loading) {
    return (
      <main className="auth">
        <p>Loading your account…</p>
      </main>
    )
  }
  if (!user) return <Navigate to="/login" replace />

  return (
    <main className="account">
      <div className="account__inner">
        <p className="eyebrow">My account</p>
        <h1 className="account__title">Welcome back</h1>
        <p className="account__email">Signed in as {user.email}</p>

        <ul className="account__grid">
          {upcoming.map((label) => (
            <li key={label} className="account__tile">
              <h2>{label}</h2>
              <p>Coming in the next phase.</p>
            </li>
          ))}
        </ul>

        <button type="button" className="btn btn--ghost" onClick={() => void signOut()} disabled={!isConfigured}>
          Log out
        </button>
      </div>
    </main>
  )
}
