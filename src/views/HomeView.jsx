import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import Lillie from '../components/Lillie'
import { useSchedule } from '../hooks/useSchedule'
import { useChildren } from '../hooks/useChildren'
import C from '../colors'

function Divider({ width = 100 }) {
  const mid = width / 2
  return (
    <svg width={width} height="12" viewBox={`0 0 ${width} 12`} style={{ display: 'block' }}>
      <line x1="0" y1="6" x2={mid - 8} y2="6" stroke="#B5986A" strokeWidth="0.6"/>
      <line x1={mid + 8} y1="6" x2={width} y2="6" stroke="#B5986A" strokeWidth="0.6"/>
      <g transform={`translate(${mid}, 6) rotate(45)`}>
        <rect x="-3" y="-3" width="6" height="6" fill="none" stroke="#B5986A" strokeWidth="0.7"/>
      </g>
    </svg>
  )
}

function TileIcon({ kind }) {
  const s = { fill: 'none', stroke: C.primary, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (kind) {
    case 'cal': return (
      <svg viewBox="0 0 32 32" width="32" height="32" {...s}>
        <rect x="5" y="8" width="22" height="19" rx="2"/>
        <path d="M5 13h22M11 5v5M21 5v5"/>
        <rect x="9" y="16" width="3" height="3" fill={C.primary}/>
      </svg>
    )
    case 'dish': return (
      <svg viewBox="0 0 32 32" width="32" height="32" {...s}>
        <path d="M5 22h22M7 22a9 9 0 0118 0"/>
        <circle cx="16" cy="9" r="1.5" fill={C.primary}/>
        <path d="M16 11v2"/>
      </svg>
    )
    case 'abc': return (
      <svg viewBox="0 0 32 32" width="32" height="32" {...s}>
        <rect x="4" y="11" width="11" height="11" rx="1.5"/>
        <rect x="17" y="11" width="11" height="11" rx="1.5"/>
        <rect x="10" y="2" width="11" height="11" rx="1.5" transform="rotate(8 16 7)"/>
        <text x="9.5" y="20" fontSize="7" fontFamily="serif" fill={C.primary} stroke="none" fontWeight="600">A</text>
        <text x="22" y="20" fontSize="7" fontFamily="serif" fill={C.primary} stroke="none" fontWeight="600">C</text>
      </svg>
    )
    case 'clip': return (
      <svg viewBox="0 0 32 32" width="32" height="32" {...s}>
        <rect x="7" y="6" width="18" height="22" rx="2"/>
        <rect x="12" y="3" width="8" height="5" rx="1.2" fill={C.bg}/>
        <path d="M11 14h10M11 18h10M11 22h6"/>
      </svg>
    )
    case 'bag': return (
      <svg viewBox="0 0 32 32" width="32" height="32" {...s}>
        <path d="M6 12h20l-2 14H8L6 12z"/>
        <path d="M11 12V9a5 5 0 0110 0v3"/>
        <path d="M11 16v2M21 16v2"/>
      </svg>
    )
    case 'pin': return (
      <svg viewBox="0 0 32 32" width="32" height="32" {...s}>
        <circle cx="16" cy="14" r="9"/>
        <circle cx="16" cy="14" r="3" fill={C.primary}/>
      </svg>
    )
    case 'clock': return (
      <svg viewBox="0 0 32 32" width="32" height="32" {...s}>
        <circle cx="16" cy="16" r="11"/>
        <path d="M16 9v7l5 3"/>
      </svg>
    )
    case 'book': return (
      <svg viewBox="0 0 32 32" width="32" height="32" {...s}>
        <path d="M5 7c3-1 7-1 11 2 4-3 8-3 11-2v18c-3-1-7-1-11 2-4-3-8-3-11-2V7z"/>
        <path d="M16 9v18"/>
      </svg>
    )
    case 'note': return (
      <svg viewBox="0 0 32 32" width="32" height="32" {...s}>
        <rect x="7" y="5" width="18" height="22" rx="2"/>
        <path d="M11 11h10M11 15h10M11 19h7"/>
        <path d="M21 22l3 3 4-5" stroke={C.gold}/>
      </svg>
    )
    case 'cart': return (
      <svg viewBox="0 0 32 32" width="32" height="32" {...s}>
        <path d="M4 6h3l3 14h14l3-10H9"/>
        <circle cx="12" cy="24" r="1.8" fill={C.primary}/>
        <circle cx="22" cy="24" r="1.8" fill={C.primary}/>
      </svg>
    )
    case 'star': return (
      <svg viewBox="0 0 32 32" width="32" height="32" {...s}>
        <path d="M16 4l3 8h9l-7 5 3 8-8-5-8 5 3-8-7-5h9z"/>
      </svg>
    )
    case 'scan': return (
      <svg viewBox="0 0 32 32" width="32" height="32" {...s}>
        <rect x="4" y="4" width="8" height="8" rx="1"/>
        <rect x="20" y="4" width="8" height="8" rx="1"/>
        <rect x="4" y="20" width="8" height="8" rx="1"/>
        <path d="M20 20h2M24 20h4M20 24v4M24 24h4M24 28h4"/>
        <line x1="14" y1="4" x2="14" y2="28" strokeWidth="1"/>
        <line x1="17" y1="4" x2="17" y2="28" strokeWidth="2"/>
      </svg>
    )
    default: return null
  }
}

const tiles = [
  { label: 'SCHEDULE',      icon: 'cal',   route: '/schedule' },
  { label: 'GROCERY',       icon: 'cart',  route: '/grocery' },
  { label: 'EVENTS',        icon: 'star',  route: '/events' },
  { label: 'SCANNER',       icon: 'scan',  route: '/scanner' },
  { label: 'PACKING LISTS', icon: 'bag',   route: '/packing' },
  { label: 'MY PLACES',     icon: 'pin',   route: '/places' },
  { label: 'ROUTINES',      icon: 'clock', route: null },
  { label: 'RESOURCES',     icon: 'book',  route: null },
  { label: 'NOTES',         icon: 'note',  route: null },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatTime12(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default function HomeView({ familyId, session, toast }) {
  const navigate = useNavigate()
  const { events } = useSchedule(familyId)
  const { children } = useChildren(familyId)

  const rawName = session?.user?.email?.split('@')[0] || 'there'
  const firstName = rawName.split(/[._]/)[0].charAt(0).toUpperCase() + rawName.split(/[._]/)[0].slice(1)

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayEvents = events.filter(e => e.date === todayStr)
  const firstEvent = todayEvents[0]

  return (
    <div className="view-enter">
      <div style={{ paddingTop: 52, paddingBottom: 4, textAlign: 'center' }}>
        <div style={{ fontFamily: C.serif, fontSize: 11, letterSpacing: '0.32em', color: C.primary, opacity: 0.7 }}>THE</div>
        <div style={{ fontFamily: C.serif, fontSize: 22, letterSpacing: '0.18em', color: C.primary, fontWeight: 700 }}>DAILY TROT</div>
      </div>

      {/* Greeting */}
      <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          fontFamily: C.serif, fontSize: 21, color: C.ink, fontWeight: 600, textAlign: 'center',
        }}>
          {getGreeting()}, {firstName}.
        </div>
        <div style={{ marginTop: 6 }}><Divider width={50}/></div>
      </div>

      {/* 3×3 tile grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
        padding: '16px 18px 0',
      }}>
        {tiles.map((tile, i) => (
          <button
            key={tile.label}
            className="list-item"
            style={{
              aspectRatio: '1 / 1.04',
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 6, padding: '8px 4px',
              cursor: 'pointer', animationDelay: `${i * 0.04}s`,
            }}
            onClick={() => tile.route ? navigate(tile.route) : toast('Coming soon!', 'success')}
          >
            <TileIcon kind={tile.icon}/>
            <div style={{
              fontFamily: C.sans, fontSize: 8, letterSpacing: '0.16em',
              color: C.primary, fontWeight: 600,
            }}>{tile.label}</div>
          </button>
        ))}
      </div>

      {/* Lillie's Reminder card */}
      <div
        style={{
          margin: '12px 18px 0',
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer',
        }}
        onClick={() => navigate('/today')}
      >
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: C.bgLight, border: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Lillie size={26} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: C.sans, fontSize: 9, letterSpacing: '0.18em',
            color: C.goldDark, fontWeight: 600,
          }}>LILLIE'S REMINDER</div>
          <div style={{
            fontFamily: C.serif, fontSize: 12, color: C.ink, marginTop: 3, lineHeight: 1.3,
          }}>
            {firstEvent
              ? `${firstEvent.title}${firstEvent.start_time ? ' — ' + formatTime12(firstEvent.start_time) : ''}`
              : 'Your day is clear — enjoy it!'}
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.goldDark} strokeWidth="1.8">
          <path d="M9 6l6 6-6 6"/>
        </svg>
      </div>
    </div>
  )
}
