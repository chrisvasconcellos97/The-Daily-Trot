import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import Lillie from '../components/Lillie'
import { useSchedule } from '../hooks/useSchedule'
import { useChildren } from '../hooks/useChildren'
import { useGrocery } from '../hooks/useGrocery'
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

function SectionHeader({ children }) {
  return (
    <div style={{ fontFamily: C.sans, fontSize: 9, letterSpacing: '0.18em', color: C.goldDark, fontWeight: 600, padding: '18px 18px 8px' }}>
      {children}
    </div>
  )
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.goldDark} strokeWidth="1.8" style={{ flexShrink: 0 }}>
      <path d="M9 6l6 6-6 6"/>
    </svg>
  )
}

function TileIcon({ kind }) {
  const s = { fill: 'none', stroke: C.primary, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (kind) {
    case 'cal': return (
      <svg viewBox="0 0 32 32" width="28" height="28" {...s}>
        <rect x="5" y="8" width="22" height="19" rx="2"/>
        <path d="M5 13h22M11 5v5M21 5v5"/>
        <rect x="9" y="16" width="3" height="3" fill={C.primary}/>
      </svg>
    )
    case 'dish': return (
      <svg viewBox="0 0 32 32" width="28" height="28" {...s}>
        <path d="M5 22h22M7 22a9 9 0 0118 0"/>
        <circle cx="16" cy="9" r="1.5" fill={C.primary}/>
        <path d="M16 11v2"/>
      </svg>
    )
    case 'people': return (
      <svg viewBox="0 0 32 32" width="28" height="28" {...s}>
        <circle cx="12" cy="11" r="4"/><circle cx="22" cy="13" r="3.2"/>
        <path d="M4 26c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5M19 26c0-3 2.5-5 5-5s5 2 5 5"/>
      </svg>
    )
    case 'bag': return (
      <svg viewBox="0 0 32 32" width="28" height="28" {...s}>
        <path d="M6 12h20l-2 14H8L6 12z"/>
        <path d="M11 12V9a5 5 0 0110 0v3"/>
        <path d="M11 16v2M21 16v2"/>
      </svg>
    )
    case 'pin': return (
      <svg viewBox="0 0 32 32" width="28" height="28" {...s}>
        <path d="M16 28s9-8 9-15a9 9 0 10-18 0c0 7 9 15 9 15z"/>
        <circle cx="16" cy="13" r="3" fill={C.primary}/>
      </svg>
    )
    case 'book': return (
      <svg viewBox="0 0 32 32" width="28" height="28" {...s}>
        <path d="M5 7c3-1 7-1 11 2 4-3 8-3 11-2v18c-3-1-7-1-11 2-4-3-8-3-11-2V7z"/>
        <path d="M16 9v18"/>
      </svg>
    )
    default: return null
  }
}

const tiles = [
  { label: 'SCHEDULE',  icon: 'cal',    route: '/schedule' },
  { label: 'MEALS',     icon: 'dish',   route: '/meals' },
  { label: 'COMMUNITY', icon: 'people', route: '/community' },
  { label: 'PACKING',   icon: 'bag',    route: '/packing' },
  { label: 'PLACES',    icon: 'pin',    route: '/places' },
  { label: 'LIBRARY',   icon: 'book',   route: '/library' },
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

export default function HomeView({ familyId, session }) {
  const navigate = useNavigate()
  const { events } = useSchedule(familyId)
  const { children } = useChildren(familyId)
  const { items } = useGrocery(familyId)

  const rawName = session?.user?.email?.split('@')[0] || 'there'
  const firstName = rawName.split(/[._]/)[0].charAt(0).toUpperCase() + rawName.split(/[._]/)[0].slice(1)

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayEvents = events
    .filter(e => e.date === todayStr)
    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
  const nextEvent = todayEvents[0]
  const groceryCount = items.filter(i => !i.checked).length

  return (
    <div className="view-enter">
      <div style={{ paddingTop: 52, paddingBottom: 4, textAlign: 'center' }}>
        <div style={{ fontFamily: C.serif, fontSize: 11, letterSpacing: '0.32em', color: C.primary, opacity: 0.7 }}>THE</div>
        <div style={{ fontFamily: C.serif, fontSize: 22, letterSpacing: '0.18em', color: C.primary, fontWeight: 700 }}>DAILY TROT</div>
      </div>

      {/* Greeting */}
      <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontFamily: C.serif, fontSize: 21, color: C.ink, fontWeight: 600, textAlign: 'center' }}>
          {getGreeting()}, {firstName}.
        </div>
        <div style={{ marginTop: 6 }}><Divider width={50}/></div>
      </div>

      {/* TODAY */}
      <SectionHeader>TODAY</SectionHeader>
      <div
        className="card"
        style={{ margin: '0 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        onClick={() => navigate('/today')}
      >
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: C.bgLight,
          border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <TileIcon kind="cal"/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: C.serif, fontSize: 15, color: C.ink, fontWeight: 600 }}>
            {todayEvents.length > 0 ? `${todayEvents.length} ${todayEvents.length === 1 ? 'event' : 'events'} today` : 'Nothing scheduled'}
          </div>
          {nextEvent && (
            <div style={{ fontFamily: C.sans, fontSize: 11, color: C.inkMuted, marginTop: 2 }}>
              {nextEvent.title}{nextEvent.start_time ? ` · ${formatTime12(nextEvent.start_time)}` : ''}
            </div>
          )}
        </div>
        <Chevron/>
      </div>

      {/* GROCERY */}
      <SectionHeader>GROCERY</SectionHeader>
      <div
        className="card"
        style={{ margin: '0 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        onClick={() => navigate('/grocery')}
      >
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: C.bgLight,
          border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={C.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 4h2l2 12h11l2-8H6"/><circle cx="9" cy="20" r="1.3" fill={C.primary}/><circle cx="17" cy="20" r="1.3" fill={C.primary}/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: C.serif, fontSize: 15, color: C.ink, fontWeight: 600 }}>
            {groceryCount > 0 ? `${groceryCount} ${groceryCount === 1 ? 'item' : 'items'} to get` : 'List is empty'}
          </div>
        </div>
        <Chevron/>
      </div>

      {/* KIDS */}
      <SectionHeader>KIDS</SectionHeader>
      <div
        style={{ padding: '0 18px', display: 'flex', gap: 12, overflowX: 'auto', cursor: 'pointer' }}
        onClick={() => navigate('/kids')}
      >
        {children.length === 0 ? (
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/kids') }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              border: `1.5px dashed ${C.inkMuted}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.inkMuted,
            }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <div style={{ fontFamily: C.sans, fontSize: 10, color: C.inkMuted, fontWeight: 600 }}>Add</div>
          </button>
        ) : (
          children.map(child => {
            const initial = (child.name || '?').charAt(0).toUpperCase()
            return (
              <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: child.color || C.gold,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontFamily: C.serif, fontSize: 22, fontWeight: 700, color: C.white,
                }}>
                  {initial}
                </div>
                <div style={{ fontFamily: C.sans, fontSize: 10, color: C.ink, fontWeight: 500, maxWidth: 60, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {child.name}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* MORE */}
      <SectionHeader>MORE</SectionHeader>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
        padding: '0 18px 8px',
      }}>
        {tiles.map((tile, i) => (
          <button
            key={tile.label}
            className="list-item"
            style={{
              aspectRatio: '1 / 1.1',
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 6, padding: '8px 4px',
              cursor: 'pointer', animationDelay: `${i * 0.04}s`,
            }}
            onClick={() => navigate(tile.route)}
          >
            <TileIcon kind={tile.icon}/>
            <div style={{
              fontFamily: C.sans, fontSize: 8, letterSpacing: '0.16em',
              color: C.primary, fontWeight: 600,
            }}>{tile.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
