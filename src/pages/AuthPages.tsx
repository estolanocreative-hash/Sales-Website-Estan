import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8

function AuthShell({ title, lede, children }: { title: string; lede: string; children: ReactNode }) {
  return (
    <main className="auth">
      <div className="auth__card">
        <Link to="/" className="auth__back">← Back to shop</Link>
        <h1 className="auth__title">{title}</h1>
        <p className="auth__lede">{lede}</p>
        {children}
      </div>
    </main>
  )
}

function Notice({ kind, children }: { kind: 'error' | 'info'; children: ReactNode }) {
  return (
    <div className={`auth__notice auth__notice--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}

function GoogleButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" className="btn btn--ghost auth__google" disabled={disabled} onClick={onClick}>
      Continue with Google
    </button>
  )
}

export function LoginPage() {
  const { isConfigured, loading, user, signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && user) return <Navigate to="/account" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.')
    if (!password) return setError('Enter your password.')
    setBusy(true)
    const res = await signIn(email.trim(), password)
    setBusy(false)
    if (res.error) return setError(res.error)
    navigate('/account', { replace: true })
  }

  async function onGoogle() {
    setError(null)
    const res = await signInWithGoogle()
    if (res.error) setError(res.error)
  }

  return (
    <AuthShell title="Log in" lede="Sign in to view your orders, downloads, and bookings.">
      {!isConfigured && <Notice kind="info">Accounts are not connected yet. This form will work once the database is set up.</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      <form className="auth__form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={busy || !isConfigured}>
          {busy ? 'Signing in…' : 'Log in'}
        </button>
      </form>

      <div className="auth__divider"><span>or</span></div>
      <GoogleButton disabled={!isConfigured} onClick={onGoogle} />

      <div className="auth__links">
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/register">Create an account</Link>
      </div>
    </AuthShell>
  )
}

export function RegisterPage() {
  const { isConfigured, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.')
    if (password.length < MIN_PASSWORD) return setError(`Password must be at least ${MIN_PASSWORD} characters.`)
    if (password !== confirm) return setError('Passwords do not match.')
    setBusy(true)
    const res = await signUp(email.trim(), password)
    setBusy(false)
    if (res.error) return setError(res.error)
    setDone(true)
  }

  if (done) {
    return (
      <AuthShell title="Check your email" lede="We sent a verification link.">
        <Notice kind="info">
          Open the link in your email to verify your address, then log in. If you don’t see it, check your spam folder.
        </Notice>
        <div className="auth__links">
          <Link to="/login">Go to log in</Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create account" lede="Customer accounts are required before checkout.">
      {!isConfigured && <Notice kind="info">Accounts are not connected yet. Registration will work once the database is set up.</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      <form className="auth__form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <small>At least {MIN_PASSWORD} characters.</small>
        </label>
        <label className="field">
          <span>Confirm password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={busy || !isConfigured}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="auth__links">
        <Link to="/login">Already have an account? Log in</Link>
      </div>
    </AuthShell>
  )
}

export function ForgotPasswordPage() {
  const { isConfigured, sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.')
    setBusy(true)
    const res = await sendPasswordReset(email.trim())
    setBusy(false)
    if (res.error) return setError(res.error)
    // Same message whether or not the account exists, to avoid revealing registered emails.
    setSent(true)
  }

  return (
    <AuthShell title="Reset password" lede="Enter your email and we will send a reset link.">
      {!isConfigured && <Notice kind="info">Accounts are not connected yet.</Notice>}
      {error && <Notice kind="error">{error}</Notice>}
      {sent ? (
        <Notice kind="info">If an account exists for that email, a reset link is on its way.</Notice>
      ) : (
        <form className="auth__form" onSubmit={onSubmit} noValidate>
          <label className="field">
            <span>Email</span>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button type="submit" className="btn btn--primary" disabled={busy || !isConfigured}>
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
      <div className="auth__links">
        <Link to="/login">Back to log in</Link>
      </div>
    </AuthShell>
  )
}

export function ResetPasswordPage() {
  const { isConfigured, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < MIN_PASSWORD) return setError(`Password must be at least ${MIN_PASSWORD} characters.`)
    if (password !== confirm) return setError('Passwords do not match.')
    setBusy(true)
    const res = await updatePassword(password)
    setBusy(false)
    if (res.error) return setError(res.error)
    navigate('/account', { replace: true })
  }

  return (
    <AuthShell title="Choose a new password" lede="Use the link from your email to set a new password.">
      {!isConfigured && <Notice kind="info">Accounts are not connected yet.</Notice>}
      {error && <Notice kind="error">{error}</Notice>}
      <form className="auth__form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span>New password</span>
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <small>At least {MIN_PASSWORD} characters.</small>
        </label>
        <label className="field">
          <span>Confirm new password</span>
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </label>
        <button type="submit" className="btn btn--primary" disabled={busy || !isConfigured}>
          {busy ? 'Saving…' : 'Save password'}
        </button>
      </form>
    </AuthShell>
  )
}
