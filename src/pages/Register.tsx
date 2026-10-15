import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, api } from '../api'

export function Register() {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await api.register({ firstName, lastName, email, password })
      navigate('/login', {
        replace: true,
        state: { registered: true },
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to register.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Ship your first deployment in minutes.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="field-row">
          <label className="field">
            <span>First name</span>
            <input
              type="text"
              value={firstName}
              autoComplete="given-name"
              required
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ada"
            />
          </label>
          <label className="field">
            <span>Last name</span>
            <input
              type="text"
              value={lastName}
              autoComplete="family-name"
              required
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Lovelace"
            />
          </label>
        </div>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            autoComplete="email"
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            autoComplete="new-password"
            required
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </label>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="auth-foot">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}
