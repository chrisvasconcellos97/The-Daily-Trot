import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import ScallopHeader from '../components/ScallopHeader'
import { useSchedule } from '../hooks/useSchedule'
import { useChildren } from '../hooks/useChildren'
import C from '../colors'

const iconMap = {
  Calendar: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Star: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  CheckSquare: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  MapPin: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Clock: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  BookOpen: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
}

const tiles = [
  { label: 'Schedule', icon: 'Calendar', route: '/schedule' },
  { label: 'Activities', icon: 'Star', route: null },
  { label: 'Tasks', icon: 'CheckSquare', route: null },
  { label: 'Packing Lists', icon: 'ShoppingBag', route: '/packing' },
  { label: 'Places', icon: 'MapPin', route: '/places' },
  { label: 'Routines', icon: 'Clock', route: null },
  { label: 'Notes', icon: 'BookOpen', route: null },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatTime12(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const period = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

export default function HomeView({ familyId, session, toast }) {
  const navigate = useNavigate()
  const { events } = useSchedule(familyId)
  const { children } = useChildren(familyId)

  const rawName = session?.user?.email?.split('@')[0] || 'there'
  const firstName = rawName.split(/[._]/)[0].charAt(0).toUpperCase() + rawName.split(/[._]/)[0].slice(1)

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayDisplay = format(new Date(), 'EEEE, MMMM d')
  const todayEvents = events.filter(e => e.date === todayStr)
  const firstEvent = todayEvents[0]

  const handleTileClick = (tile) => {
    if (tile.route) {
      navigate(tile.route)
    } else {
      toast('Coming soon!', 'success')
    }
  }

  return (
    <div className="view-enter">
      <ScallopHeader
        title={`${getGreeting()}, ${firstName}.`}
        subtitle={todayDisplay}
        greeting
      />

      <div style={{ padding: '32px 20px 20px' }}>
        {/* Tile grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {tiles.map((tile, i) => {
            const IconComp = iconMap[tile.icon]
            return (
              <button
                key={tile.label}
                className="card list-item"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '20px 8px',
                  border: 'none',
                  cursor: 'pointer',
                  animationDelay: `${i * 0.05}s`,
                }}
                onClick={() => handleTileClick(tile)}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: C.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <IconComp />
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: C.textDark, textAlign: 'center', lineHeight: 1.3 }}>
                  {tile.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Lillie's reminder */}
        {firstEvent && (
          <div
            className="card"
            style={{
              marginTop: 24,
              background: C.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/today')}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>🐕</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Lillie's Reminder
                </span>
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                {firstEvent.title}
                {firstEvent.start_time && <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}> — {formatTime12(firstEvent.start_time)}</span>}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        )}

        {/* Kids quick view */}
        {children.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: C.textDark }}>My Kids</div>
                <div className="section-accent" />
              </div>
              <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/kids')}>
                Manage
              </button>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {children.map(child => (
                <div key={child.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: child.color || C.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.white,
                  }}>
                    {child.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: C.textDark }}>{child.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
