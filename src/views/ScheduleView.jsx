import { useState } from 'react'
import { format, addDays, addWeeks, subWeeks, startOfWeek, isSameDay } from 'date-fns'
import ScallopHeader from '../components/ScallopHeader'
import Modal from '../components/Modal'
import { useSchedule } from '../hooks/useSchedule'
import { usePlaces } from '../hooks/usePlaces'
import C from '../colors'

const iconTypeMap = {
  'morning-routine': '☀️',
  'school': '🏫',
  'library': '📚',
  'swim': '🏊',
  'errand': '🛒',
  'meal': '🍽️',
  'bedtime': '🌙',
  'activity': '⭐',
  'default': '📅',
}

function formatTime12(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const period = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function ScheduleView({ familyId, toast }) {
  const today = new Date()
  const [weekStart, setWeekStart] = useState(startOfWeek(today, { weekStartsOn: 1 }))
  const [selectedDate, setSelectedDate] = useState(today)
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({
    title: '', date: format(today, 'yyyy-MM-dd'),
    start_time: '', end_time: '',
    icon_type: 'activity', place_id: '', notes: ''
  })
  const [saving, setSaving] = useState(false)

  const { events, addEvent, eventsForDate } = useSchedule(familyId)
  const { places } = usePlaces(familyId)

  const weekEnd = addDays(weekStart, 6)
  const weekLabel = `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`

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
      setForm({ title: '', date: format(today, 'yyyy-MM-dd'), start_time: '', end_time: '', icon_type: 'activity', place_id: '', notes: '' })
    } catch {
      toast('Could not save event', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="view-enter">
      <ScallopHeader title="SCHEDULE" />

      {/* Week navigator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 20px 12px' }}>
        <button className="btn-ghost" onClick={() => setWeekStart(w => subWeeks(w, 1))} aria-label="Previous week">‹</button>
        <div style={{ fontWeight: 600, fontSize: 14, color: C.textDark }}>{weekLabel}</div>
        <button className="btn-ghost" onClick={() => setWeekStart(w => addWeeks(w, 1))} aria-label="Next week">›</button>
      </div>

      {/* Day strip */}
      <div style={{ display: 'flex', padding: '0 16px 16px', gap: 4 }}>
        {Array.from({ length: 7 }, (_, i) => {
          const day = addDays(weekStart, i)
          const dayStr = format(day, 'yyyy-MM-dd')
          const isSelected = isSameDay(day, selectedDate)
          const hasEvents = events.some(e => e.date === dayStr)
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(day)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 4px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: isSelected ? C.primary : 'transparent',
                transition: 'background 0.15s ease',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 600, color: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(44,24,16,0.4)', textTransform: 'uppercase' }}>
                {DAY_LETTERS[i]}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: isSelected ? C.white : C.textDark }}>
                {format(day, 'd')}
              </span>
              {hasEvents && (
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? C.accent : C.accent }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Day events */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: C.textDark, marginBottom: 4 }}>
          {format(selectedDate, 'EEEE, MMMM d')}
        </div>
        <div className="section-accent" />
        {dayEvents.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: 24 }}>
            <p>Nothing scheduled for this day.</p>
          </div>
        ) : (
          dayEvents.map((event, i) => {
            const emoji = iconTypeMap[event.icon_type] || iconTypeMap.default
            const place = places.find(p => p.id === event.place_id)
            return (
              <div key={event.id} className="list-item" style={{ display: 'flex', gap: 12, marginBottom: 16, animationDelay: `${i * 0.05}s` }}>
                <div style={{ width: 55, textAlign: 'right', paddingTop: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: C.textDark, opacity: 0.5 }}>{formatTime12(event.start_time)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                    {emoji}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark }}>{event.title}</div>
                    {place && <div style={{ fontSize: 12, color: C.textDark, opacity: 0.5, marginTop: 2 }}>📍 {place.name}</div>}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowAddModal(true)} aria-label="Add event">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Event">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label" htmlFor="sch-title">Title</label>
            <input id="sch-title" className="input-field" placeholder="Event name" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="field-label" htmlFor="sch-date">Date</label>
            <input id="sch-date" type="date" className="input-field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="field-label" htmlFor="sch-start">Start</label>
              <input id="sch-start" type="time" className="input-field" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="sch-end">End</label>
              <input id="sch-end" type="time" className="input-field" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="sch-icon">Type</label>
            <select id="sch-icon" className="input-field" value={form.icon_type} onChange={e => setForm(f => ({ ...f, icon_type: e.target.value }))}>
              {Object.keys(iconTypeMap).filter(k => k !== 'default').map(k => (
                <option key={k} value={k}>{iconTypeMap[k]} {k.replace('-', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="sch-place">Place</label>
            <select id="sch-place" className="input-field" value={form.place_id} onChange={e => setForm(f => ({ ...f, place_id: e.target.value }))}>
              <option value="">None</option>
              {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="sch-notes">Notes</label>
            <input id="sch-notes" className="input-field" placeholder="Optional..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Event'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
