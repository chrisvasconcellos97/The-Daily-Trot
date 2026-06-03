import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import Lillie from '../components/Lillie'
import { useSchedule } from '../hooks/useSchedule'
import { useChildren } from '../hooks/useChildren'
import { useGrocery } from '../hooks/useGrocery'
import C from '../colors'

function DiamondDivider() {
  return (
    <svg width="48" height="12" viewBox="0 0 48 12">
      <line x1="0" y1="6" x2="16" y2="6" stroke={C.goldLight} strokeWidth="0.6"/>
      <line x1="32" y1="6" x2="48" y2="6" stroke={C.goldLight} strokeWidth="0.6"/>
      <g transform="translate(24,6) rotate(45)"><rect x="-3" y="-3" width="6" height="6" fill="none" stroke={C.goldLight} strokeWidth="0.8"/></g>
    </svg>
  )
}

function formatTime12(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: C.sans, fontSize: 9, letterSpacing: '0.22em', color: C.goldDark, fontWeight: 600, padding: '22px 20px 10px' }}>
      {children}
    </div>
  )
}

const MORE_TILES = [
  { label: 'SCHEDULE', route: '/schedule', icon: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={C.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
    </svg>
  )},
  { label: 'MEALS', route: '/meals', icon: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={C.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4M6 10c4 0 8-2 8-6M18 22V12M18 12c0-3-2-5-5-5"/>
    </svg>
  )},
  { label: 'COMMUNITY', route: '/community', icon: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={C.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/>
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M13 20c.5-2.5 2-4 4-4s3.5 1.5 4 4"/>
    </svg>
  )},
  { label: 'PACKING', route: '/packing', icon: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={C.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9h14l-1.5 11H6.5L5 9z"/><path d="M9 9V7a3 3 0 016 0v2"/>
    </svg>
  )},
  { label: 'PLACES', route: '/places', icon: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={C.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-8-6.9-8-12a8 8 0 1116 0c0 5.1-8 12-8 12z"/>
      <circle cx="12" cy="9" r="2.5" fill={C.primary}/>
    </svg>
  )},
  { label: 'LIBRARY', route: '/library', icon: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={C.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5c2-.5 5-.5 8 1 3-1.5 6-1.5 8-1v14c-2-.5-5-.5-8 1-3-1.5-6-1.5-8-1V5z"/>
      <path d="M12 6v14"/>
    </svg>
  )},
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function HomeView({ familyId, session }) {
  const navigate = useNavigate()
  const { events } = useSchedule(familyId)
  const { children } = useChildren(familyId)
  const { items } = useGrocery(familyId)

  const rawName = session?.user?.email?.split('@')[0] || 'there'
  const firstName = rawName.split(/[._]/)[0].charAt(0).toUpperCase() + rawName.split(/[._]/)[0].slice(1)

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const dayOfWeek = format(new Date(), 'EEEE').toUpperCase()
  const monthDay = format(new Date(), 'MMMM d')
  const todayEvents = events
    .filter(e => e.date === todayStr)
    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
  const groceryCount = items.filter(i => !i.checked).length

  return (
    <div className="view-enter">
      {/* ── HERO ── dark green panel */}
      <div style={{
        background: C.primary, paddingTop: 58, paddingBottom: 28,
        paddingLeft: 22, paddingRight: 22, flexShrink: 0,
      }}>
        {/* wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: C.sans, fontSize: 8.5, letterSpacing: '0.32em', color: C.goldLight, fontWeight: 600, opacity: 0.8 }}>THE</div>
            <div style={{ fontFamily: C.serif, fontSize: 20, letterSpacing: '0.2em', color: C.goldLight, fontWeight: 700, lineHeight: 1 }}>DAILY TROT</div>
          </div>
          <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, padding: 4 }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={C.bgLight} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
            </svg>
          </button>
        </div>

        {/* date + greeting */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontFamily: C.serif, fontSize: 42, fontWeight: 700, color: '#F6F0DE', lineHeight: 1, letterSpacing: '0.02em' }}>{dayOfWeek}</div>
          <div style={{ fontFamily: C.serif, fontSize: 16, color: C.goldLight, marginTop: 3, fontStyle: 'italic' }}>{monthDay} · {getGreeting()}, {firstName}.</div>
        </div>

        <div style={{ marginTop: 14 }}><DiamondDivider/></div>

        {/* summary chips */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            onClick={() => navigate('/today')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(246,240,222,0.12)', border: '1px solid rgba(212,188,138,0.3)',
              borderRadius: 20, padding: '7px 14px', cursor: 'pointer',
            }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={C.goldLight} strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>
            <span style={{ fontFamily: C.sans, fontSize: 11, color: '#F6F0DE', fontWeight: 500 }}>
              {todayEvents.length > 0 ? `${todayEvents.length} event${todayEvents.length > 1 ? 's' : ''} today` : 'Free day'}
            </span>
          </button>
          <button
            onClick={() => navigate('/grocery')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(246,240,222,0.12)', border: '1px solid rgba(212,188,138,0.3)',
              borderRadius: 20, padding: '7px 14px', cursor: 'pointer',
            }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={C.goldLight} strokeWidth="1.8"><path d="M3 4h2l2 12h11l2-8H6"/><circle cx="9" cy="20" r="1.3" fill={C.goldLight}/><circle cx="17" cy="20" r="1.3" fill={C.goldLight}/></svg>
            <span style={{ fontFamily: C.sans, fontSize: 11, color: '#F6F0DE', fontWeight: 500 }}>
              {groceryCount > 0 ? `${groceryCount} to get` : 'List clear'}
            </span>
          </button>
        </div>
      </div>

      {/* ── TODAY PREVIEW ── */}
      {todayEvents.length > 0 && (
        <>
          <SectionLabel>UP NEXT</SectionLabel>
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {todayEvents.slice(0, 3).map((event, i) => (
              <div
                key={event.id}
                className="list-item"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', background: C.card,
                  borderRadius: i === 0 ? '12px 12px 0 0' : i === Math.min(todayEvents.length, 3) - 1 ? '0 0 12px 12px' : '0',
                  borderBottom: i < Math.min(todayEvents.length, 3) - 1 ? `1px solid ${C.border}` : 'none',
                  border: `1px solid ${C.border}`,
                  borderTop: i > 0 ? 'none' : undefined,
                  cursor: 'pointer', animationDelay: `${i * 0.05}s`,
                }}
                onClick={() => navigate('/today')}
              >
                <div style={{
                  fontFamily: C.sans, fontSize: 10, color: C.gold, fontWeight: 600,
                  width: 46, textAlign: 'right', flexShrink: 0, letterSpacing: '0.02em',
                }}>{formatTime12(event.start_time)}</div>
                <div style={{ width: 1.5, height: 28, background: C.border, flexShrink: 0 }}/>
                <div style={{ fontFamily: C.serif, fontSize: 15, color: C.ink, fontWeight: 600 }}>{event.title}</div>
              </div>
            ))}
            {todayEvents.length > 3 && (
              <button
                onClick={() => navigate('/today')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', textAlign: 'left', fontFamily: C.sans, fontSize: 11, color: C.gold, fontWeight: 600, letterSpacing: '0.08em' }}
              >
                +{todayEvents.length - 3} MORE →
              </button>
            )}
          </div>
        </>
      )}

      {/* ── KIDS ── */}
      {children.length > 0 && (
        <>
          <SectionLabel>KIDS</SectionLabel>
          <div style={{ padding: '0 20px', display: 'flex', gap: 14, overflowX: 'auto' }}>
            {children.map(child => {
              const initial = (child.name || '?').charAt(0).toUpperCase()
              return (
                <button
                  key={child.id}
                  onClick={() => navigate('/kids')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                >
                  <div style={{
                    width: 54, height: 54, borderRadius: '50%',
                    background: child.color || C.gold,
                    border: `3px solid ${C.bg}`,
                    boxShadow: `0 0 0 1.5px ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: C.serif, fontSize: 24, fontWeight: 700, color: '#fff',
                  }}>{initial}</div>
                  <div style={{ fontFamily: C.sans, fontSize: 10, color: C.inkMuted, fontWeight: 500, letterSpacing: '0.04em' }}>{child.name.split(' ')[0].toUpperCase()}</div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* ── MORE ── */}
      <SectionLabel>MORE</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '0 20px 20px' }}>
        {MORE_TILES.map((tile, i) => (
          <button
            key={tile.label}
            className="list-item"
            style={{
              aspectRatio: '1 / 1.05',
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: '10px 4px', cursor: 'pointer', animationDelay: `${i * 0.04}s`,
            }}
            onClick={() => navigate(tile.route)}
          >
            {tile.icon}
            <div style={{ fontFamily: C.sans, fontSize: 8, letterSpacing: '0.16em', color: C.primary, fontWeight: 600 }}>{tile.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
