import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export function Nav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="nav-logo" aria-hidden="true" />
          <span>
            Mini<strong>Cloud</strong>
          </span>
        </Link>
        {user && (
          <nav className="nav-right">
            <span className="nav-user">{user.firstName} {user.lastName}</span>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
