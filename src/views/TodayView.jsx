import { useState } from 'react'
import { format, addDays, subDays } from 'date-fns'
import ScallopHeader, { IconBtn } from '../components/ScallopHeader'
import Modal from '../components/Modal'
import { useSchedule } from '../hooks/useSchedule'
import { usePlaces } from '../hooks/usePlaces'
import C from '../colors'

function EventIcon({ kind }) {
  const s = { fill: 'none', stroke: C.primary, strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (kind) {
    case 'sun': return <svg viewBox="0 0 24 24" width="16" height="16" {...s}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>
    case 'car': return <svg viewBox="0 0 24 24" width="16" height="16" {...s}><path d="M4 14l1.5-5h13L20 14M4 14v4h2v-2h12v2h2v-4M4 14h16"/><circle cx="7" cy="15.5" r="1" fill={C.primary}/><circle cx="17" cy="15.5" r="1" fill={C.primary}/></svg>
    case 'book': return <svg viewBox="0 0 24 24" width="16" height="16" {...s}><path d="M4 5c2-.5 5-.5 8 1 3-1.5 6-1.5 8-1v14c-2-.5-5-.5-8 1-3-1.5-6-1.5-8-1V5z"/><path d="M12 6v14"/></svg>
    case 'cup': return <svg viewBox="0 0 24 24" width="16" height="16" {...s}><path d="M6 8h11v6a4 4 0 01-4 4H10a4 4 0 01-4-4V8z"/><path d="M17 10h2a2 2 0 110 4h-2"/><path d="M9 4v2M12 3v3M15 4v2"/></svg>
    case 'wave': return <svg viewBox="0 0 24 24" width="16" height="16" {...s}><path d="M3 13c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M3 17c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M3 9c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/></svg>
    case 'cart': return <svg viewBox="0 0 24 24" width="16" height="16" {...s}><path d="M3 4h2l2 12h11l2-8H6"/><circle cx="9" cy="20" r="1.3" fill={C.primary}/><circle cx="17" cy="20" r="1.3" fill={C.primary}/></svg>
    case 'fork': return <svg viewBox="0 0 24 24" width="16" height="16" {...s}><path d="M8 3v6a2 2 0 002 2v9M8 3v3M11 3v3"/><path d="M15 3c-1 2-1 6 0 8h1v9"/></svg>
    case 'moon': return <svg viewBox="0 0 24 24" width="16" height="16" {...s}><path d="M20 14a8 8 0 11-10-10 6 6 0 0010 10z"/></svg>
    default: return <svg viewBox="0 0 24 24" width="16" height="16" {...s}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
  }
}

const iconTypeMap = {
  'morning-routine': 'sun',
  'school': 'car',
  'library': 'book',
  'swim': 'wave',
  'errand': 'cart',
  'meal': 'fork',
  'bedtime': 'moon',
  'activity': 'sun',
  'default': 'sun',
}

// Sample events from design spec (shown when DB is empty)
const SAMPLE_EVENTS = [
  { id: 's1', time: '7:00 AM', title: 'Morning Routine', sub: 'Breakfast, vitamins + more', icon: 'sun' },
  { id: 's2', time: '8:15 AM', title: 'School Drop Off', sub: '', icon: 'car' },
  { id: 's3', time: '10:00 AM', title: 'Library Storytime', sub: 'Main Street Library', icon: 'book' },
  { id: 's4', time: '12:00 PM', title: 'Lunch with Harper', sub: 'The Meadow Café', icon: 'cup' },
  { id: 's5', time: '2:30 PM', title: 'Swim Class', sub: 'AquaKids', icon: 'wave' },
  { id: 's6', time: '4:00 PM', title: 'Grocery Pickup', sub: 'Wegmans', icon: 'cart' },
  { id: 's7', time: '6:30 PM', title: 'Family Dinner', sub: 'Chicken tacos', icon: 'fork' },
  { id: 's8', time: '8:30 PM', title: 'Bedtime Routine', sub: 'Stories & snuggles', icon: 'moon' },
]

function formatTime12(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

export default function TodayView({ familyId, toast }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({
    title: '', date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '', end_time: '',
    icon_type: 'activity', place_id: '', notes: ''
  })
  const [saving, setSaving] = useState(false)

  const { events, addEvent, eventsForDate } = useSchedule(familyId)
  const { places } = usePlaces(familyId)

  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const dayEvents = eventsForDate(dateStr).sort((a, b) =>
    (a.start_time || '').localeCompare(b.start_time || '')
  )

  const handleSave = async () => {
    if (!form.title.trim()) { toast('Title is required', 'error'); return }
    setSaving(true)
    try {
      await addEvent({
        title: form.title,
        date: form.date,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        icon_type: form.icon_type,
        place_id: form.place_id || null,
        notes: form.notes || null,
      })
      toast('Event added!')
      setShowAddModal(false)
      setForm({ title: '', date: format(new Date(), 'yyyy-MM-dd'), start_time: '', end_time: '', icon_type: 'activity', place_id: '', notes: '' })
    } catch (err) {
      toast('Could not save event', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="view-enter">
      <ScallopHeader
        title="TODAY"
        leading={
          <IconBtn>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </IconBtn>
        }
        trailing={
          <IconBtn>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="4" y="6" width="16" height="14" rx="1.5"/><path d="M4 10h16M8 4v4M16 4v4"/>
            </svg>
          </IconBtn>
        }
      />

      {/* Date selector */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 22px 10px',
        borderBottom: `1px solid ${C.border}`,
        margin: '0 0',
      }}>
        <button
          onClick={() => setSelectedDate(d => subDays(d, 1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          aria-label="Previous day"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.primary} strokeWidth="1.6"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div style={{ fontFamily: C.serif, fontSize: 18, color: C.primary, fontWeight: 600 }}>
          {format(selectedDate, 'MMMM d, yyyy')}
        </div>
        <button
          onClick={() => setSelectedDate(d => addDays(d, 1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          aria-label="Next day"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.primary} strokeWidth="1.6"><path d="M9 6l6 6-6 6"/></svg>
        </button>
      </div>

      {/* Event list */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {dayEvents.length === 0 ? (
          SAMPLE_EVENTS.map((e) => {
            const place = places.find(p => p.id === e.place_id)
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  fontFamily: C.sans, fontSize: 9.5, color: C.primary, fontWeight: 500,
                  width: 50, textAlign: 'right', flexShrink: 0,
                }}>{e.time}</div>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: C.card, border: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <EventIcon kind={e.icon}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: C.serif, fontSize: 13, color: C.primary, fontWeight: 600, lineHeight: 1.1 }}>{e.title}</div>
                  {e.sub && <div style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted, marginTop: 2 }}>{e.sub}</div>}
                </div>
              </div>
            )
          })
        ) : (
          dayEvents.map((event, i) => {
            const iconKind = iconTypeMap[event.icon_type] || 'sun'
            const place = places.find(p => p.id === event.place_id)
            return (
              <div key={event.id} className="list-item" style={{ display: 'flex', alignItems: 'center', gap: 10, animationDelay: `${i * 0.05}s` }}>
                <div style={{
                  fontFamily: C.sans, fontSize: 9.5, color: C.primary, fontWeight: 500,
                  width: 50, textAlign: 'right', flexShrink: 0,
                }}>{formatTime12(event.start_time)}</div>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: C.card, border: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <EventIcon kind={iconKind}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: C.serif, fontSize: 13, color: C.primary, fontWeight: 600, lineHeight: 1.1 }}>{event.title}</div>
                  {(place || event.notes) && (
                    <div style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted, marginTop: 2 }}>
                      {place ? place.name : event.notes}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* FAB */}
      <button
        className="fab"
        onClick={() => setShowAddModal(true)}
        aria-label="Add event"
        style={{ bottom: 110 }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.bgLight} strokeWidth="1.8">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>

      {/* Add Event Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Event">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label" htmlFor="ev-title">Title</label>
            <input id="ev-title" className="input-field" placeholder="Event name" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="field-label" htmlFor="ev-date">Date</label>
            <input id="ev-date" type="date" className="input-field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="field-label" htmlFor="ev-start">Start Time</label>
              <input id="ev-start" type="time" className="input-field" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="ev-end">End Time</label>
              <input id="ev-end" type="time" className="input-field" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="ev-place">Place</label>
            <select id="ev-place" className="input-field" value={form.place_id} onChange={e => setForm(f => ({ ...f, place_id: e.target.value }))}>
              <option value="">None</option>
              {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="ev-notes">Notes</label>
            <input id="ev-notes" className="input-field" placeholder="Optional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Event'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
