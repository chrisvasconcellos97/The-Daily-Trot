import { useNavigate, useLocation } from 'react-router-dom'

const DachshundSVG = () => (
  <svg width="32" height="20" viewBox="0 0 32 20" fill="white" aria-hidden="true">
    <ellipse cx="14" cy="12" rx="10" ry="6" />
    <circle cx="26" cy="10" r="5" />
    <ellipse cx="24" cy="8" rx="3" ry="2" />
    <rect x="6" y="16" width="3" height="5" rx="1.5" />
    <rect x="11" y="17" width="3" height="4" rx="1.5" />
    <rect x="17" y="16" width="3" height="5" rx="1.5" />
    <rect x="22" y="17" width="3" height="4" rx="1.5" />
    <ellipse cx="2" cy="13" rx="3" ry="2" />
  </svg>
)

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export default function BottomNav({ onLillie }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <button
        className={`nav-item${isActive('/') ? ' active' : ''}`}
        onClick={() => navigate('/')}
        aria-label="Home"
      >
        <HomeIcon />
        <span>Home</span>
      </button>

      <button
        className={`nav-item${isActive('/today') ? ' active' : ''}`}
        onClick={() => navigate('/today')}
        aria-label="Today"
      >
        <CalendarIcon />
        <span>Today</span>
      </button>

      <div className="nav-center-wrap">
        <button className="nav-center" onClick={onLillie} aria-label="Open Lillie AI">
          <DachshundSVG />
        </button>
      </div>

      <button
        className={`nav-item${isActive('/community') ? ' active' : ''}`}
        onClick={() => navigate('/community')}
        aria-label="Community"
      >
        <UsersIcon />
        <span>Community</span>
      </button>

      <button
        className={`nav-item${isActive('/profile') ? ' active' : ''}`}
        onClick={() => navigate('/profile')}
        aria-label="Profile"
      >
        <UserIcon />
        <span>Profile</span>
      </button>
    </nav>
  )
}
