import { useNavigate, useLocation } from 'react-router-dom'
import C from '../colors'
import Lillie from './Lillie'

export default function BottomNav({ onLillie }) {
  const navigate = useNavigate()
  const location = useLocation()
  const active = location.pathname === '/' ? 'home'
    : location.pathname === '/today' ? 'today'
    : location.pathname === '/community' ? 'community'
    : location.pathname === '/profile' ? 'profile' : ''

  const Item = ({ id, label, icon, onClick }) => {
    const isActive = active === id
    return (
      <button
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 3,
          color: C.bgLight, opacity: isActive ? 1 : 0.7,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '8px 4px 0',
        }}
        onClick={onClick}
        aria-label={label}
      >
        <div style={{ width: 18, height: 18 }}>{icon}</div>
        <div style={{ fontFamily: C.sans, fontSize: 8, letterSpacing: '0.12em', fontWeight: 600 }}>{label}</div>
        {isActive && <div style={{ width: 14, height: 1.5, background: C.goldLight, marginTop: 1 }}/>}
      </button>
    )
  }

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <Item id="home" label="HOME" onClick={() => navigate('/')} icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'100%',height:'100%'}}>
          <path d="M3 12l9-8 9 8v9a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1v-9z"/>
        </svg>
      }/>
      <Item id="today" label="TODAY" onClick={() => navigate('/today')} icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'100%',height:'100%'}}>
          <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
        </svg>
      }/>
      {/* Center FAB — dachshund */}
      <div style={{ width: 70, position: 'relative', flexShrink: 0 }}>
        <button
          style={{
            position: 'absolute', left: '50%', top: -22, transform: 'translateX(-50%)',
            width: 58, height: 58, borderRadius: '50%',
            background: C.primary, border: `2px solid ${C.gold}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            cursor: 'pointer',
          }}
          onClick={onLillie}
          aria-label="Open Lillie AI"
        >
          <Lillie size={38} shield />
        </button>
      </div>
      <Item id="community" label="COMMUNITY" onClick={() => navigate('/community')} icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'100%',height:'100%'}}>
          <circle cx="9" cy="9" r="3"/><circle cx="17" cy="11" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M14 20c0-2 2-4 4-4s4 2 4 4"/>
        </svg>
      }/>
      <Item id="profile" label="PROFILE" onClick={() => navigate('/profile')} icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'100%',height:'100%'}}>
          <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
        </svg>
      }/>
    </nav>
  )
}
