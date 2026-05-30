import { useState } from 'react'
import { supabase } from '../lib/supabase'
import SimpleHeader from '../components/SimpleHeader'
import C from '../colors'

export default function AuthView({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const validate = () => {
    if (mode === 'signup') {
      if (password !== confirmPassword) return 'Passwords do not match'
      if (password.length < 8) return 'Password must be at least 8 characters'
      if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter'
      if (!/[0-9]/.test(password)) return 'Password must contain a number'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <SimpleHeader title="THE DAILY TROT" subtitle="Family planning, simplified." />
      <div style={{ flex: 1, padding: '40px 24px 32px' }}>
        {/* Tab switcher */}
        <div style={{ display: 'flex', background: 'rgba(30,61,47,0.06)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
          {['login', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null) }}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
                fontFamily: 'Inter, sans-serif',
                background: mode === m ? C.primary : 'transparent',
                color: mode === m ? C.white : 'rgba(44,24,16,0.5)',
                transition: 'all 0.2s ease',
              }}
            >
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
          {mode === 'signup' && (
            <div>
              <label className="field-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <div style={{ color: C.error, fontSize: 14, padding: '10px 14px', background: C.errorFaint, borderRadius: 8 }}>
              {error}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            className="btn-ghost"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  )
}
