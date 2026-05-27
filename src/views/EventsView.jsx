import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import ScallopHeader, { IconBtn } from '../components/ScallopHeader'
import Modal from '../components/Modal'
import { useEvents } from '../hooks/useEvents'
import C from '../colors'

const CATEGORIES = ['All', 'Birthday', 'Pool Party', 'Holiday', 'School', 'Other']

const CAT_COLORS = {
  Birthday: '#A85454',
  'Pool Party': '#4A85A8',
  Holiday: '#4A7C59',
  School: '#7A6E5A',
  Other: '#857F69',
}

const BRING_MAP = {
  Birthday: ['Gift', 'Card', 'Party clothes'],
  'Pool Party': ['Swimsuit', 'Towel', 'Sunscreen', 'Goggles', 'Water shoes'],
  Holiday: ['Family contribution', 'Festive attire'],
  School: ['School supplies', 'Signed forms'],
  Other: [],
}

function CategoryBadge({ category }) {
  return (
    <div style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 10,
      background: CAT_COLORS[category] || CAT_COLORS.Other,
      color: '#fff', fontFamily: C.sans, fontSize: 9, fontWeight: 600, letterSpacing: '0.08em',
    }}>{category}</div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return format(new Date(y, m - 1, d), 'EEEE, MMM d')
}

function formatTime12(t) {
  if (!t) return ''
  const [h, min] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(min).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

const emptyForm = {
  title: '', event_date: '', event_time: '', location: '', host_name: '',
  category: 'Other', rsvp_by: '', notes: '',
}

export default function EventsView({ familyId, toast }) {
  const navigate = useNavigate()
  const { events, loading, addEvent, deleteEvent } = useEvents(familyId)
  const [filter, setFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [scanMode, setScanMode] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const filtered = events.filter(e => filter === 'All' || e.category === filter)

  const handleScan = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    try {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1]
        const res = await fetch('/api/parse-invite', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType: file.type }),
        })
        if (!res.ok) throw new Error('Parse failed')
        const data = await res.json()
        setForm({
          title: data.title || '',
          event_date: data.date || '',
          event_time: data.time || '',
          location: data.location || '',
          host_name: data.host || '',
          category: data.category || 'Other',
          rsvp_by: data.rsvpBy || '',
          notes: data.notes || '',
        })
        setScanMode(false)
        setScanning(false)
      }
      reader.readAsDataURL(file)
    } catch {
      toast('Could not read invite — try manual entry', 'error')
      setScanning(false)
    }
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.event_date) { toast('Title and date are required', 'error'); return }
    setSaving(true)
    try {
      await addEvent({
        title: form.title.trim(),
        event_date: form.event_date,
        event_time: form.event_time || null,
        location: form.location || null,
        host_name: form.host_name || null,
        category: form.category,
        rsvp_by: form.rsvp_by || null,
        notes: form.notes || null,
      })
      toast('Event added!')
      setShowAdd(false)
      setForm(emptyForm)
      setScanMode(false)
    } catch {
      toast('Could not save event', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="view-enter" style={{ paddingBottom: 100 }}>
      <ScallopHeader
        title="EVENTS"
        leading={
          <IconBtn onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </IconBtn>
        }
        trailing={
          <IconBtn onClick={() => { setForm(emptyForm); setScanMode(false); setShowAdd(true) }} style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </IconBtn>
        }
      />

      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                flexShrink: 0, padding: '5px 13px', borderRadius: 20,
                border: `1px solid ${filter === cat ? C.primary : C.border}`,
                background: filter === cat ? C.primary : 'transparent',
                color: filter === cat ? C.bgLight : C.inkSoft,
                fontFamily: C.sans, fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em',
              }}
            >{cat}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 18px' }}>
        {!loading && filtered.length === 0 ? (
          <div className="empty-state">
            <p>No upcoming events — tap + to add one.</p>
          </div>
        ) : (
          filtered.map((event, i) => (
            <div
              key={event.id}
              className="list-item"
              style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: '14px 16px', marginBottom: 10, cursor: 'pointer',
                animationDelay: `${i * 0.04}s`,
              }}
              onClick={() => setDetail(event)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: C.serif, fontSize: 16, color: C.ink, fontWeight: 600 }}>{event.title}</div>
                  <div style={{ fontFamily: C.sans, fontSize: 10, color: C.inkMuted, marginTop: 3 }}>
                    {formatDate(event.event_date)}{event.event_time ? ' · ' + formatTime12(event.event_time) : ''}
                  </div>
                  {event.location && (
                    <div style={{ fontFamily: C.sans, fontSize: 11, color: C.inkSoft, marginTop: 4 }}>{event.location}</div>
                  )}
                  {event.host_name && (
                    <div style={{ fontFamily: C.sans, fontSize: 10, color: C.inkMuted, marginTop: 2 }}>Hosted by {event.host_name}</div>
                  )}
                </div>
                <CategoryBadge category={event.category} />
              </div>
              {event.rsvp_by && (
                <div style={{ marginTop: 8, fontFamily: C.sans, fontSize: 10, color: C.gold }}>
                  RSVP by {formatDate(event.rsvp_by)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setScanMode(false); setForm(emptyForm) }} title="Add Event">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!form.title && !form.event_date ? (
            <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={scanning}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: 10, border: `1px solid ${C.border}`,
                  background: C.bgLight, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.primary} strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill={C.primary}/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                <span style={{ fontFamily: C.sans, fontSize: 12, color: C.primary, fontWeight: 600 }}>
                  {scanning ? 'Reading...' : 'Scan Invite'}
                </span>
              </button>
              <button
                onClick={() => setScanMode(false)}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: 10, border: `1px solid ${C.border}`,
                  background: C.bgLight, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.primary} strokeWidth="1.8">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
                <span style={{ fontFamily: C.sans, fontSize: 12, color: C.primary, fontWeight: 600 }}>Manual Entry</span>
              </button>
            </div>
          ) : null}

          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleScan} />

          <div>
            <label className="field-label" htmlFor="ev-title">Title *</label>
            <input id="ev-title" className="input-field" placeholder="e.g. Mia's Birthday Party" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="field-label" htmlFor="ev-date">Date *</label>
              <input id="ev-date" type="date" className="input-field" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="ev-time">Time</label>
              <input id="ev-time" type="time" className="input-field" value={form.event_time} onChange={e => setForm(f => ({ ...f, event_time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="ev-location">Location</label>
            <input id="ev-location" className="input-field" placeholder="Address or venue" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <div>
            <label className="field-label" htmlFor="ev-host">Host</label>
            <input id="ev-host" className="input-field" placeholder="Host name" value={form.host_name} onChange={e => setForm(f => ({ ...f, host_name: e.target.value }))} />
          </div>
          <div>
            <label className="field-label" htmlFor="ev-cat">Category</label>
            <select id="ev-cat" className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="ev-rsvp">RSVP By</label>
            <input id="ev-rsvp" type="date" className="input-field" value={form.rsvp_by} onChange={e => setForm(f => ({ ...f, rsvp_by: e.target.value }))} />
          </div>
          <div>
            <label className="field-label" htmlFor="ev-notes">Notes</label>
            <input id="ev-notes" className="input-field" placeholder="Optional details" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Add Event'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={detail?.title || ''}>
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <CategoryBadge category={detail.category} />
            </div>
            <div style={{ fontFamily: C.sans, fontSize: 13, color: C.inkSoft }}>
              {formatDate(detail.event_date)}{detail.event_time ? ' at ' + formatTime12(detail.event_time) : ''}
            </div>
            {detail.location && (
              <div style={{ fontFamily: C.sans, fontSize: 13, color: C.inkSoft }}>
                <span style={{ fontWeight: 600 }}>Where: </span>{detail.location}
              </div>
            )}
            {detail.host_name && (
              <div style={{ fontFamily: C.sans, fontSize: 13, color: C.inkSoft }}>
                <span style={{ fontWeight: 600 }}>Hosted by: </span>{detail.host_name}
              </div>
            )}
            {detail.rsvp_by && (
              <div style={{ fontFamily: C.sans, fontSize: 13, color: C.gold, fontWeight: 600 }}>
                RSVP by {formatDate(detail.rsvp_by)}
              </div>
            )}
            {detail.notes && (
              <div style={{ fontFamily: C.sans, fontSize: 13, color: C.inkSoft }}>
                <span style={{ fontWeight: 600 }}>Notes: </span>{detail.notes}
              </div>
            )}
            {BRING_MAP[detail.category]?.length > 0 && (
              <div style={{ background: C.bgLight, borderRadius: 10, padding: '12px 14px', border: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: C.sans, fontSize: 10, letterSpacing: '0.12em', color: C.goldDark, fontWeight: 600, marginBottom: 8 }}>WHAT TO BRING</div>
                {BRING_MAP[detail.category].map(item => (
                  <div key={item} style={{ fontFamily: C.serif, fontSize: 14, color: C.ink, marginBottom: 3 }}>• {item}</div>
                ))}
              </div>
            )}
            <button
              className="btn-ghost"
              style={{ color: C.error, marginTop: 4 }}
              onClick={() => { deleteEvent(detail.id); setDetail(null); toast('Event removed') }}
            >Remove Event</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
