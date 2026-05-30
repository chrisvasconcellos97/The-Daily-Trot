import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  format, addDays, addWeeks, subWeeks, startOfWeek, isSameDay,
  startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths,
  isSameMonth, getDay,
} from 'date-fns'
import ScallopHeader, { IconBtn } from '../components/ScallopHeader'
import Modal from '../components/Modal'
import { useSchedule } from '../hooks/useSchedule'
import { usePlaces } from '../hooks/usePlaces'
import { useSchoolCalendar } from '../hooks/useSchoolCalendar'
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
  'morning-routine': 'sun', 'school': 'car', 'library': 'book',
  'swim': 'wave', 'errand': 'cart', 'meal': 'fork', 'bedtime': 'moon',
  'activity': 'sun', 'default': 'sun',
}

const SAMPLE_EVENTS = [
  { id: 's1', start_time: '07:00', title: 'Morning Routine', sub: '', icon: 'sun' },
  { id: 's2', start_time: '08:15', title: 'School Drop Off', sub: '', icon: 'car' },
  { id: 's3', start_time: '10:00', title: 'Library Storytime', sub: 'Main Street Library', icon: 'book' },
  { id: 's4', start_time: '12:00', title: 'Lunch with Harper', sub: 'The Meadow Café', icon: 'cup' },
]

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DAY_LETTERS_SUN = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function formatTime12(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function ViewToggle({ view, onChange }) {
  const tabs = ['MONTH', 'WEEK', 'DAY']
  return (
    <div style={{
      display: 'flex', gap: 0,
      background: C.card, borderRadius: 20, padding: 3,
      border: `1px solid ${C.border}`,
    }}>
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t.toLowerCase())}
          style={{
            flex: 1, padding: '5px 0', borderRadius: 17, border: 'none', cursor: 'pointer',
            background: view === t.toLowerCase() ? C.primary : 'transparent',
            color: view === t.toLowerCase() ? C.bgLight : C.inkMuted,
            fontFamily: C.sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
            transition: 'background 0.15s',
          }}
        >{t}</button>
      ))}
    </div>
  )
}

function EventRow({ event, places, animDelay = 0 }) {
  const iconKind = iconTypeMap[event.icon_type] || 'sun'
  const place = places.find(p => p.id === event.place_id)
  return (
    <div className="list-item" style={{ display: 'flex', alignItems: 'center', gap: 10, animationDelay: `${animDelay}s` }}>
      <div style={{ fontFamily: C.sans, fontSize: 9.5, color: C.inkMuted, fontWeight: 500, width: 50, textAlign: 'right', flexShrink: 0 }}>
        {formatTime12(event.start_time)}
      </div>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.card, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
}

function NoSchoolBanner({ closures }) {
  const isNoSchool = closures.some(c => c.closure_type === 'No School' || c.closure_type === 'Holiday')
  const isEarly = closures.some(c => c.closure_type === 'Early Dismissal')
  if (!isNoSchool && !isEarly) return null
  return (
    <div style={{
      background: isNoSchool ? '#A85454' : C.gold,
      borderRadius: 10, padding: '8px 14px',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="1.8">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      <div style={{ fontFamily: C.sans, fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.08em' }}>
        {isNoSchool ? 'NO SCHOOL' : 'EARLY DISMISSAL'} — {closures[0]?.name}
      </div>
    </div>
  )
}

export default function ScheduleView({ familyId, toast }) {
  const navigate = useNavigate()
  const today = new Date()
  const [viewMode, setViewMode] = useState('week')
  const [monthDate, setMonthDate] = useState(today)
  const [weekStart, setWeekStart] = useState(startOfWeek(today, { weekStartsOn: 1 }))
  const [selectedDate, setSelectedDate] = useState(today)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addMode, setAddMode] = useState('event')
  const [form, setForm] = useState({
    title: '', date: format(today, 'yyyy-MM-dd'),
    start_time: '', end_time: '', icon_type: 'activity', place_id: '', notes: ''
  })
  const [closureForm, setClosureForm] = useState({ name: '', start_date: '', end_date: '', closure_type: 'No School' })
  const [scanMode, setScanMode] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [pendingClosures, setPendingClosures] = useState([])
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const { events, addEvent, eventsForDate } = useSchedule(familyId)
  const { places } = usePlaces(familyId)
  const { closures, addClosure, getClosuresForDate } = useSchoolCalendar(familyId)

  const handleViewChange = (v) => {
    setViewMode(v)
    if (v === 'week') setWeekStart(startOfWeek(selectedDate, { weekStartsOn: 1 }))
    if (v === 'month') setMonthDate(selectedDate)
  }

  const selectDay = (day, switchToDay = false) => {
    setSelectedDate(day)
    if (switchToDay) setViewMode('day')
    if (viewMode === 'week' || switchToDay) setWeekStart(startOfWeek(day, { weekStartsOn: 1 }))
  }

  const handleSave = async () => {
    if (!form.title.trim()) { toast('Title is required', 'error'); return }
    setSaving(true)
    try {
      await addEvent({
        title: form.title, date: form.date,
        start_time: form.start_time || null, end_time: form.end_time || null,
        icon_type: form.icon_type, place_id: form.place_id || null, notes: form.notes || null,
      })
      toast('Event added!')
      setShowAddModal(false)
      setForm({ title: '', date: format(today, 'yyyy-MM-dd'), start_time: '', end_time: '', icon_type: 'activity', place_id: '', notes: '' })
    } catch { toast('Could not save event', 'error') }
    finally { setSaving(false) }
  }

  const handleSaveClosure = async () => {
    if (!closureForm.name.trim() || !closureForm.start_date) { toast('Name and start date required', 'error'); return }
    setSaving(true)
    try {
      await addClosure({ name: closureForm.name.trim(), start_date: closureForm.start_date, end_date: closureForm.end_date || null, closure_type: closureForm.closure_type })
      toast('School closure added!')
      setShowAddModal(false)
      setClosureForm({ name: '', start_date: '', end_date: '', closure_type: 'No School' })
    } catch { toast('Could not save', 'error') }
    finally { setSaving(false) }
  }

  const handleScanCal = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    try {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1]
        const res = await fetch('/api/parse-school-cal', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType: file.type }),
        })
        if (!res.ok) throw new Error('Parse failed')
        const data = await res.json()
        setPendingClosures(Array.isArray(data) ? data : [])
        setScanMode(false)
        setScanning(false)
      }
      reader.readAsDataURL(file)
    } catch { toast('Could not read calendar', 'error'); setScanning(false) }
  }

  const confirmPendingClosures = async () => {
    setSaving(true)
    try {
      for (const c of pendingClosures) {
        await addClosure({ name: c.name, start_date: c.start_date, end_date: c.end_date || null, closure_type: c.type || 'No School' })
      }
      toast(`${pendingClosures.length} closures added!`)
      setPendingClosures([])
      setShowAddModal(false)
    } catch { toast('Could not save all closures', 'error') }
    finally { setSaving(false) }
  }

  const openAdd = (mode) => {
    setAddMode(mode); setScanMode(mode === 'closure'); setPendingClosures([]); setShowAddModal(true)
  }

  // ── Month view ────────────────────────────────────────────────────────────
  function MonthView() {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    // pad start: Mon=0 offset. getDay returns Sun=0, Mon=1... convert to Mon-first offset
    const startPad = (getDay(monthStart) + 6) % 7
    const cells = [...Array(startPad).fill(null), ...days]
    // pad end to complete last row
    while (cells.length % 7 !== 0) cells.push(null)

    return (
      <div style={{ padding: '14px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button onClick={() => setMonthDate(d => subMonths(d, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={C.primary} strokeWidth="1.6"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{ fontFamily: C.serif, fontSize: 17, color: C.primary, fontWeight: 600 }}>
            {format(monthDate, 'MMMM yyyy')}
          </div>
          <button onClick={() => setMonthDate(d => addMonths(d, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={C.primary} strokeWidth="1.6"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>

        {/* Day letter headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', marginBottom: 6 }}>
          {DAY_LETTERS.map((d, i) => (
            <div key={i} style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted, letterSpacing: '0.12em', paddingBottom: 4 }}>{d}</div>
          ))}
        </div>

        {/* Date grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px 0' }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i}/>
            const dayStr = format(day, 'yyyy-MM-dd')
            const isToday = isSameDay(day, today)
            const isSelected = isSameDay(day, selectedDate)
            const isCurrentMonth = isSameMonth(day, monthDate)
            const dayEvts = eventsForDate(dayStr)
            const dayClosure = getClosuresForDate(dayStr)
            const hasNoSchool = dayClosure.some(c => c.closure_type === 'No School' || c.closure_type === 'Holiday')
            const hasEarly = dayClosure.some(c => c.closure_type === 'Early Dismissal')

            return (
              <div
                key={i}
                onClick={() => selectDay(day, true)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  cursor: 'pointer', padding: '3px 0',
                  opacity: isCurrentMonth ? 1 : 0.3,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: isSelected ? C.primary : isToday ? C.card : 'transparent',
                  border: isToday && !isSelected ? `1.5px solid ${C.primary}` :
                          hasNoSchool && !isSelected ? `1.5px solid #A85454` :
                          hasEarly && !isSelected ? `1.5px solid ${C.gold}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: C.serif, fontSize: 12, fontWeight: 600,
                  color: isSelected ? C.bgLight : C.primary,
                }}>
                  {format(day, 'd')}
                </div>
                {/* Event dots */}
                <div style={{ display: 'flex', gap: 2, marginTop: 2, height: 4 }}>
                  {dayEvts.slice(0, 3).map((_, j) => (
                    <div key={j} style={{ width: 3, height: 3, borderRadius: '50%', background: C.gold }}/>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected day preview */}
        <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
          <div style={{ fontFamily: C.serif, fontSize: 14, color: C.primary, fontWeight: 600, marginBottom: 10 }}>
            {format(selectedDate, 'EEEE, MMMM d')}
          </div>
          <NoSchoolBanner closures={getClosuresForDate(format(selectedDate, 'yyyy-MM-dd'))}/>
          {eventsForDate(format(selectedDate, 'yyyy-MM-dd'))
            .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
            .map((e, i) => <EventRow key={e.id} event={e} places={places} animDelay={i * 0.05}/>)
          }
          {eventsForDate(format(selectedDate, 'yyyy-MM-dd')).length === 0 && (
            <div style={{ fontFamily: C.sans, fontSize: 11, color: C.inkMuted, textAlign: 'center', padding: '12px 0' }}>
              Nothing scheduled
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Week view ─────────────────────────────────────────────────────────────
  function WeekView() {
    const weekEnd = addDays(weekStart, 6)
    const weekLabel = `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    return (
      <div style={{ padding: '14px 14px 0' }}>
        {/* Week nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button onClick={() => setWeekStart(w => subWeeks(w, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={C.primary} strokeWidth="1.6"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{ fontFamily: C.serif, fontSize: 15, color: C.primary, fontWeight: 600 }}>{weekLabel}</div>
          <button onClick={() => setWeekStart(w => addWeeks(w, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={C.primary} strokeWidth="1.6"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>

        {/* Day columns header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', marginBottom: 8, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today)
            const isSelected = isSameDay(day, selectedDate)
            const dayClosure = getClosuresForDate(format(day, 'yyyy-MM-dd'))
            const hasNoSchool = dayClosure.some(c => c.closure_type === 'No School' || c.closure_type === 'Holiday')
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted, letterSpacing: '0.1em' }}>
                  {DAY_LETTERS[i]}
                </div>
                <button
                  onClick={() => selectDay(day)}
                  style={{
                    width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: isSelected ? C.primary : 'transparent',
                    outline: isToday && !isSelected ? `1.5px solid ${C.primary}` :
                             hasNoSchool && !isSelected ? `1.5px solid #A85454` : 'none',
                    outlineOffset: -1,
                    fontFamily: C.serif, fontSize: 12, fontWeight: 600,
                    color: isSelected ? C.bgLight : C.primary,
                  }}
                >{format(day, 'd')}</button>
              </div>
            )
          })}
        </div>

        {/* Each day's events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {weekDays.map((day, di) => {
            const dayStr = format(day, 'yyyy-MM-dd')
            const dayEvts = eventsForDate(dayStr).sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
            const dayClosure = getClosuresForDate(dayStr)
            const hasNoSchool = dayClosure.some(c => c.closure_type === 'No School' || c.closure_type === 'Holiday')
            const hasEarly = dayClosure.some(c => c.closure_type === 'Early Dismissal')
            const isToday = isSameDay(day, today)

            if (dayEvts.length === 0 && !hasNoSchool && !hasEarly) return null

            return (
              <div key={di} style={{
                borderBottom: `1px solid ${C.border}`, paddingBottom: 10, marginBottom: 10,
              }}>
                <div style={{
                  fontFamily: C.serif, fontSize: 12, color: isToday ? C.primary : C.inkSoft,
                  fontWeight: isToday ? 700 : 500, marginBottom: 6,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {format(day, 'EEE, MMM d')}
                  {isToday && (
                    <span style={{ fontFamily: C.sans, fontSize: 8, letterSpacing: '0.12em', color: C.bgLight, background: C.primary, borderRadius: 4, padding: '1px 5px' }}>TODAY</span>
                  )}
                </div>
                {(hasNoSchool || hasEarly) && (
                  <div style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 6,
                    background: hasNoSchool ? '#A85454' : C.gold,
                    fontFamily: C.sans, fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '0.08em',
                    marginBottom: 6,
                  }}>
                    {hasNoSchool ? 'NO SCHOOL' : 'EARLY DISMISSAL'}
                  </div>
                )}
                {dayEvts.map(e => {
                  const iconKind = iconTypeMap[e.icon_type] || 'sun'
                  const place = places.find(p => p.id === e.place_id)
                  return (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted, width: 44, textAlign: 'right', flexShrink: 0 }}>
                        {formatTime12(e.start_time)}
                      </div>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.card, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <EventIcon kind={iconKind}/>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: C.serif, fontSize: 12, color: C.primary, fontWeight: 600, lineHeight: 1.1 }}>{e.title}</div>
                        {(place || e.notes) && (
                          <div style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted }}>{place ? place.name : e.notes}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
          {weekDays.every(d => eventsForDate(format(d, 'yyyy-MM-dd')).length === 0) && (
            <div style={{ textAlign: 'center', padding: '24px 0', fontFamily: C.sans, fontSize: 11, color: C.inkMuted }}>
              No events this week
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Day view ──────────────────────────────────────────────────────────────
  function DayView() {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const dayEvents = eventsForDate(dateStr).sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
    const dayClosure = getClosuresForDate(dateStr)

    return (
      <div style={{ padding: '14px 14px 0' }}>
        {/* Day navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={() => setSelectedDate(d => addDays(d, -1))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={C.primary} strokeWidth="1.6"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: C.serif, fontSize: 17, color: C.primary, fontWeight: 600 }}>
              {format(selectedDate, 'EEEE')}
            </div>
            <div style={{ fontFamily: C.sans, fontSize: 10, color: C.inkMuted, marginTop: 1 }}>
              {format(selectedDate, 'MMMM d, yyyy')}
            </div>
          </div>
          <button onClick={() => setSelectedDate(d => addDays(d, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={C.primary} strokeWidth="1.6"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>

        <NoSchoolBanner closures={dayClosure}/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: dayClosure.length ? 10 : 0 }}>
          {dayEvents.length === 0 && dayClosure.length === 0 ? (
            SAMPLE_EVENTS.map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.4 }}>
                <div style={{ fontFamily: C.sans, fontSize: 9.5, color: C.primary, fontWeight: 500, width: 50, textAlign: 'right', flexShrink: 0 }}>{formatTime12(e.start_time)}</div>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.card, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <EventIcon kind={e.icon}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: C.serif, fontSize: 13, color: C.primary, fontWeight: 600 }}>{e.title}</div>
                  {e.sub && <div style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted, marginTop: 2 }}>{e.sub}</div>}
                </div>
              </div>
            ))
          ) : (
            dayEvents.map((e, i) => <EventRow key={e.id} event={e} places={places} animDelay={i * 0.05}/>)
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="view-enter">
      <ScallopHeader
        title="SCHEDULE"
        leading={
          <IconBtn onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </IconBtn>
        }
        trailing={
          <IconBtn onClick={() => openAdd('event')} style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </IconBtn>
        }
      />

      {/* View toggle */}
      <div style={{ padding: '12px 18px 0' }}>
        <ViewToggle view={viewMode} onChange={handleViewChange}/>
      </div>

      {viewMode === 'month' && <MonthView/>}
      {viewMode === 'week' && <WeekView/>}
      {viewMode === 'day' && <DayView/>}

      {/* School closure chip */}
      {viewMode !== 'month' && (
        <div style={{ padding: '10px 14px 0', display: 'flex', gap: 7 }}>
          <button
            onClick={() => openAdd('closure')}
            style={{
              padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
              border: `1px solid ${C.border}`, background: 'transparent',
              color: C.inkSoft, fontFamily: C.sans, fontSize: 10, fontWeight: 600,
            }}
          >+ School Closure</button>
        </div>
      )}

      <button className="fab" onClick={() => openAdd('event')} aria-label="Add event" style={{ bottom: 110 }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.bgLight} strokeWidth="1.8">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>

      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setScanMode(false); setPendingClosures([]) }} title={addMode === 'closure' ? 'School Closure' : 'Add Event'}>
        {addMode === 'event' ? (
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
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Event'}</button>
            <button className="btn-ghost" onClick={() => { setAddMode('closure'); setScanMode(true) }}>Add School Closure Instead</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pendingClosures.length > 0 ? (
              <>
                <div style={{ fontFamily: C.sans, fontSize: 12, color: C.inkSoft }}>Review {pendingClosures.length} closures found:</div>
                {pendingClosures.map((c, i) => (
                  <div key={i} style={{ background: C.bgLight, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontFamily: C.serif, fontSize: 14, color: C.ink, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontFamily: C.sans, fontSize: 11, color: C.inkMuted, marginTop: 2 }}>
                      {c.start_date}{c.end_date ? ` – ${c.end_date}` : ''} · {c.type}
                    </div>
                  </div>
                ))}
                <button className="btn-primary" onClick={confirmPendingClosures} disabled={saving}>{saving ? 'Saving...' : 'Add All Closures'}</button>
                <button className="btn-ghost" onClick={() => setPendingClosures([])}>Back</button>
              </>
            ) : scanMode ? (
              <>
                <div style={{ fontFamily: C.sans, fontSize: 11, color: C.inkMuted, textAlign: 'center' }}>Scan a school calendar image to extract dates automatically.</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => fileRef.current?.click()} disabled={scanning} style={{ flex: 1, padding: '12px 8px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgLight, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.primary} strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill={C.primary}/><path d="M21 15l-5-5L5 21"/></svg>
                    <span style={{ fontFamily: C.sans, fontSize: 12, color: C.primary, fontWeight: 600 }}>{scanning ? 'Reading...' : 'Scan Calendar'}</span>
                  </button>
                  <button onClick={() => setScanMode(false)} style={{ flex: 1, padding: '12px 8px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgLight, cursor: 'pointer', fontFamily: C.sans, fontSize: 12, color: C.primary, fontWeight: 600 }}>
                    Manual Entry
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleScanCal} />
              </>
            ) : (
              <>
                <div>
                  <label className="field-label" htmlFor="cl-name">Name</label>
                  <input id="cl-name" className="input-field" placeholder="e.g. Spring Break" value={closureForm.name} onChange={e => setClosureForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="field-label" htmlFor="cl-start">Start *</label>
                    <input id="cl-start" type="date" className="input-field" value={closureForm.start_date} onChange={e => setClosureForm(f => ({ ...f, start_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="cl-end">End</label>
                    <input id="cl-end" type="date" className="input-field" value={closureForm.end_date} onChange={e => setClosureForm(f => ({ ...f, end_date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="field-label" htmlFor="cl-type">Type</label>
                  <select id="cl-type" className="input-field" value={closureForm.closure_type} onChange={e => setClosureForm(f => ({ ...f, closure_type: e.target.value }))}>
                    <option value="No School">No School</option>
                    <option value="Early Dismissal">Early Dismissal</option>
                    <option value="Holiday">Holiday</option>
                  </select>
                </div>
                <button className="btn-primary" onClick={handleSaveClosure} disabled={saving}>{saving ? 'Saving...' : 'Save Closure'}</button>
                <button className="btn-ghost" onClick={() => setScanMode(true)}>Scan Calendar Instead</button>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
