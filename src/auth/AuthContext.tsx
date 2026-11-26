import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isAuthConfigured } from '../lib/supabase'

export interface AuthResult {
  error: string | null
  /** Set when the account needs an email confirmation before it can sign in. */
  needsConfirmation?: boolean
}

interface AuthContextValue {
  isConfigured: boolean
  loading: boolean
  session: Session | null
  user: User | null
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signInWithGoogle: () => Promise<AuthResult>
  sendPasswordReset: (email: string) => Promise<AuthResult>
  updatePassword: (password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const NOT_CONFIGURED = 'Accounts are not set up yet. Sign-in will work once the site is connected to its database.'

const AuthContext = createContext<AuthContextValue | null>(null)

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message
  return 'Something went wrong. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isAuthConfigured)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    const notConfigured: AuthResult = { error: NOT_CONFIGURED }

    return {
      isConfigured: isAuthConfigured,
      loading,
      session,
      user: session?.user ?? null,

      signIn: async (email, password) => {
        if (!supabase) return notConfigured
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error ? errorMessage(error) : null }
      },

      signUp: async (email, password) => {
        if (!supabase) return notConfigured
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/login` },
        })
        if (error) return { error: errorMessage(error) }
        // With email confirmation enabled, there is no session until the address is verified.
        return { error: null, needsConfirmation: !data.session }
      },

      signInWithGoogle: async () => {
        if (!supabase) return notConfigured
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/account` },
        })
        return { error: error ? errorMessage(error) : null }
      },

      sendPasswordReset: async (email) => {
        if (!supabase) return notConfigured
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        return { error: error ? errorMessage(error) : null }
      },

      updatePassword: async (password) => {
        if (!supabase) return notConfigured
        const { error } = await supabase.auth.updateUser({ password })
        return { error: error ? errorMessage(error) : null }
      },

      signOut: async () => {
        if (supabase) await supabase.auth.signOut()
      },
    }
  }, [loading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
