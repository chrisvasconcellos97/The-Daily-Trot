import { useState } from 'react'
import { format, addDays, subDays } from 'date-fns'
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
        subtitle={format(selectedDate, 'EEEE, MMMM d')}
      />

      {/* Date nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 20px 8px' }}>
        <button
          className="btn-ghost"
          onClick={() => setSelectedDate(d => subDays(d, 1))}
          style={{ fontSize: 20, padding: '4px 12px' }}
          aria-label="Previous day"
        >‹</button>
        <div style={{ fontWeight: 600, fontSize: 15, color: C.textDark }}>
          {format(selectedDate, 'MMM d, yyyy')}
        </div>
        <button
          className="btn-ghost"
          onClick={() => setSelectedDate(d => addDays(d, 1))}
          style={{ fontSize: 20, padding: '4px 12px' }}
          aria-label="Next day"
        >›</button>
      </div>

      {/* Timeline */}
      <div style={{ padding: '8px 20px' }}>
        {dayEvents.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 32 }}>📅</div>
            <p>Nothing scheduled — tap + to add your first event.</p>
          </div>
        ) : (
          dayEvents.map((event, i) => {
            const emoji = iconTypeMap[event.icon_type] || iconTypeMap.default
            const place = places.find(p => p.id === event.place_id)
            return (
              <div key={event.id} className="list-item" style={{ display: 'flex', gap: 12, marginBottom: 16, animationDelay: `${i * 0.05}s` }}>
                <div style={{ width: 60, textAlign: 'right', paddingTop: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: C.textDark, opacity: 0.5, fontWeight: 500 }}>
                    {formatTime12(event.start_time)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: C.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    flexShrink: 0,
                  }}>
                    {emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.textDark }}>{event.title}</div>
                    {place && (
                      <div style={{ fontSize: 12, color: C.textDark, opacity: 0.5, marginTop: 2 }}>📍 {place.name}</div>
                    )}
                    {event.notes && (
                      <div style={{ fontSize: 12, color: C.textDark, opacity: 0.5, marginTop: 2 }}>{event.notes}</div>
                    )}
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
            <label className="field-label" htmlFor="ev-icon">Icon Type</label>
            <select id="ev-icon" className="input-field" value={form.icon_type} onChange={e => setForm(f => ({ ...f, icon_type: e.target.value }))}>
              {Object.keys(iconTypeMap).filter(k => k !== 'default').map(k => (
                <option key={k} value={k}>{iconTypeMap[k]} {k.replace('-', ' ')}</option>
              ))}
            </select>
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
