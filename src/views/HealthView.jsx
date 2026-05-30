import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SimpleHeader, { IconBtn } from '../components/SimpleHeader'
import Modal from '../components/Modal'
import { useHealth } from '../hooks/useHealth'
import { useChildren } from '../hooks/useChildren'
import C from '../colors'

const STD_VACCINES = [
  'Hep B', 'DTaP', 'Hib', 'IPV', 'PCV', 'RV', 'MMR', 'Varicella', 'Hep A', 'Flu', 'MenACWY', 'HPV',
]

function PctBadge({ value }) {
  if (value == null) return null
  const color = value >= 50 ? '#4A7C59' : value >= 25 ? '#B5986A' : '#A85454'
  return (
    <div style={{
      display: 'inline-block', padding: '2px 7px', borderRadius: 10,
      background: color, color: '#fff', fontFamily: C.sans, fontSize: 9, fontWeight: 700,
    }}>{value}%</div>
  )
}

function formatDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${day}, ${y}`
}

const emptyVisit = {
  visit_date: '', doctor: '', height_cm: '', weight_kg: '', head_cm: '',
  height_pct: '', weight_pct: '', head_pct: '', notes: '',
}

export default function HealthView({ familyId, toast }) {
  const { childId } = useParams()
  const navigate = useNavigate()
  const { children } = useChildren(familyId)
  const child = children.find(c => c.id === childId)
  const { visits, vaccines, addVisit, addVaccine, updateVaccine, deleteVaccine } = useHealth(childId)

  const [tab, setTab] = useState('visits')
  const [showAddVisit, setShowAddVisit] = useState(false)
  const [visitForm, setVisitForm] = useState(emptyVisit)
  const [scanMode, setScanMode] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddVaccine, setShowAddVaccine] = useState(false)
  const [vaccineForm, setVaccineForm] = useState({ vaccine_name: '', date_given: '', next_due: '' })
  const fileRef = useRef()

  const latest = visits[0]

  const handleScanVisit = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    try {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1]
        const res = await fetch('/api/parse-visit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType: file.type }),
        })
        if (!res.ok) throw new Error('Parse failed')
        const data = await res.json()
        setVisitForm({
          visit_date: data.date || '',
          doctor: data.doctor || '',
          height_cm: data.height_cm ?? '',
          weight_kg: data.weight_kg ?? '',
          head_cm: data.head_cm ?? '',
          height_pct: data.height_pct ?? '',
          weight_pct: data.weight_pct ?? '',
          head_pct: data.head_pct ?? '',
          notes: data.notes || '',
        })
        setScanMode(false)
        setScanning(false)
      }
      reader.readAsDataURL(file)
    } catch {
      toast('Could not read document — try manual entry', 'error')
      setScanning(false)
    }
  }

  const handleSaveVisit = async () => {
    if (!visitForm.visit_date) { toast('Date is required', 'error'); return }
    setSaving(true)
    try {
      const payload = {
        visit_date: visitForm.visit_date,
        doctor: visitForm.doctor || null,
        height_cm: visitForm.height_cm !== '' ? Number(visitForm.height_cm) : null,
        weight_kg: visitForm.weight_kg !== '' ? Number(visitForm.weight_kg) : null,
        head_cm: visitForm.head_cm !== '' ? Number(visitForm.head_cm) : null,
        height_pct: visitForm.height_pct !== '' ? Number(visitForm.height_pct) : null,
        weight_pct: visitForm.weight_pct !== '' ? Number(visitForm.weight_pct) : null,
        head_pct: visitForm.head_pct !== '' ? Number(visitForm.head_pct) : null,
        notes: visitForm.notes || null,
      }
      await addVisit(payload)
      toast('Visit saved!')
      setShowAddVisit(false)
      setVisitForm(emptyVisit)
      setScanMode(false)
    } catch {
      toast('Could not save visit', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveVaccine = async () => {
    if (!vaccineForm.vaccine_name.trim()) { toast('Vaccine name required', 'error'); return }
    setSaving(true)
    try {
      await addVaccine({
        vaccine_name: vaccineForm.vaccine_name,
        date_given: vaccineForm.date_given || null,
        next_due: vaccineForm.next_due || null,
      })
      toast('Vaccine saved!')
      setShowAddVaccine(false)
      setVaccineForm({ vaccine_name: '', date_given: '', next_due: '' })
    } catch {
      toast('Could not save vaccine', 'error')
    } finally {
      setSaving(false)
    }
  }

  const stdVaccineMap = {}
  STD_VACCINES.forEach(v => { stdVaccineMap[v] = null })
  vaccines.forEach(v => { if (stdVaccineMap[v.vaccine_name] !== undefined) stdVaccineMap[v.vaccine_name] = v })

  const customVaccines = vaccines.filter(v => !STD_VACCINES.includes(v.vaccine_name))

  return (
    <div className="view-enter" style={{ paddingBottom: 100 }}>
      <SimpleHeader
        subtitle={child?.name?.toUpperCase() || 'CHILD'}
        title="HEALTH"
        leading={
          <IconBtn onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </IconBtn>
        }
      />

      <div style={{ padding: '12px 18px 0' }}>
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}` }}>
          {['visits', 'vaccines'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '10px 0', border: 'none', background: 'transparent',
                fontFamily: C.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
                color: tab === t ? C.primary : C.inkMuted,
                borderBottom: tab === t ? `2px solid ${C.primary}` : '2px solid transparent',
                cursor: 'pointer',
              }}
            >{t.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {tab === 'visits' && (
        <div style={{ padding: '14px 18px' }}>
          {latest && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontFamily: C.sans, fontSize: 9, letterSpacing: '0.14em', color: C.goldDark, fontWeight: 600, marginBottom: 8 }}>LATEST MEASUREMENTS</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {latest.height_cm && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: C.serif, fontSize: 18, color: C.ink, fontWeight: 600 }}>{latest.height_cm} cm</div>
                    <div style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted, marginTop: 2, marginBottom: 4 }}>Height</div>
                    <PctBadge value={latest.height_pct} />
                  </div>
                )}
                {latest.weight_kg && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: C.serif, fontSize: 18, color: C.ink, fontWeight: 600 }}>{latest.weight_kg} kg</div>
                    <div style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted, marginTop: 2, marginBottom: 4 }}>Weight</div>
                    <PctBadge value={latest.weight_pct} />
                  </div>
                )}
                {latest.head_cm && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: C.serif, fontSize: 18, color: C.ink, fontWeight: 600 }}>{latest.head_cm} cm</div>
                    <div style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted, marginTop: 2, marginBottom: 4 }}>Head</div>
                    <PctBadge value={latest.head_pct} />
                  </div>
                )}
              </div>
            </div>
          )}

          {visits.map((v, i) => (
            <div
              key={v.id}
              className="list-item"
              style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: '12px 14px', marginBottom: 8, animationDelay: `${i * 0.04}s`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: C.serif, fontSize: 14, color: C.ink, fontWeight: 600 }}>{formatDate(v.visit_date)}</div>
                  {v.doctor && <div style={{ fontFamily: C.sans, fontSize: 11, color: C.inkMuted, marginTop: 2 }}>{v.doctor}</div>}
                  {v.notes && <div style={{ fontFamily: C.sans, fontSize: 11, color: C.inkSoft, marginTop: 4 }}>{v.notes}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {v.height_cm && <div style={{ fontFamily: C.sans, fontSize: 10, color: C.inkMuted }}>{v.height_cm}cm</div>}
                  {v.weight_kg && <div style={{ fontFamily: C.sans, fontSize: 10, color: C.inkMuted }}>{v.weight_kg}kg</div>}
                </div>
              </div>
            </div>
          ))}

          {visits.length === 0 && (
            <div className="empty-state"><p>No visits recorded yet — tap + to add one.</p></div>
          )}

          <button
            className="fab"
            onClick={() => { setVisitForm(emptyVisit); setScanMode(true); setShowAddVisit(true) }}
            aria-label="Add visit"
            style={{ bottom: 110 }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.bgLight} strokeWidth="1.8">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      )}

      {tab === 'vaccines' && (
        <div style={{ padding: '14px 18px' }}>
          {STD_VACCINES.map((name) => {
            const rec = stdVaccineMap[name]
            return (
              <VaccineRow
                key={name}
                name={name}
                record={rec}
                onToggle={async (given, date) => {
                  if (rec) {
                    await updateVaccine(rec.id, { date_given: given ? (date || new Date().toISOString().slice(0, 10)) : null })
                  } else {
                    await addVaccine({ vaccine_name: name, date_given: given ? (date || new Date().toISOString().slice(0, 10)) : null })
                  }
                }}
                onUpdate={async (field, val) => {
                  if (rec) await updateVaccine(rec.id, { [field]: val || null })
                }}
              />
            )
          })}

          {customVaccines.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontFamily: C.sans, fontSize: 9, letterSpacing: '0.14em', color: C.inkMuted, fontWeight: 600, marginBottom: 8 }}>ADDITIONAL</div>
              {customVaccines.map(v => (
                <VaccineRow
                  key={v.id}
                  name={v.vaccine_name}
                  record={v}
                  onToggle={async (given, date) => {
                    await updateVaccine(v.id, { date_given: given ? (date || new Date().toISOString().slice(0, 10)) : null })
                  }}
                  onUpdate={async (field, val) => {
                    await updateVaccine(v.id, { [field]: val || null })
                  }}
                  onDelete={() => deleteVaccine(v.id)}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => { setVaccineForm({ vaccine_name: '', date_given: '', next_due: '' }); setShowAddVaccine(true) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginTop: 8,
              background: 'transparent', border: `1px dashed ${C.border}`, borderRadius: 10,
              cursor: 'pointer', width: '100%',
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${C.primary}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary,
            }}>
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <span style={{ fontFamily: C.serif, fontSize: 14, color: C.inkMuted }}>Add vaccine</span>
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleScanVisit} />

      <Modal isOpen={showAddVisit} onClose={() => { setShowAddVisit(false); setScanMode(false); setVisitForm(emptyVisit) }} title="Add Visit">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {scanMode && !visitForm.visit_date && (
            <>
              <div style={{ fontFamily: C.sans, fontSize: 11, color: C.inkMuted, textAlign: 'center' }}>
                Photo sent to Claude for reading — never stored
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
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
                    {scanning ? 'Reading...' : 'Scan Visit Sheet'}
                  </span>
                </button>
                <button
                  onClick={() => setScanMode(false)}
                  style={{
                    flex: 1, padding: '12px 8px', borderRadius: 10, border: `1px solid ${C.border}`,
                    background: C.bgLight, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <span style={{ fontFamily: C.sans, fontSize: 12, color: C.primary, fontWeight: 600 }}>Manual Entry</span>
                </button>
              </div>
              <div style={{ borderTop: `1px solid ${C.border}` }} />
            </>
          )}
          <div>
            <label className="field-label" htmlFor="v-date">Date *</label>
            <input id="v-date" type="date" className="input-field" value={visitForm.visit_date} onChange={e => setVisitForm(f => ({ ...f, visit_date: e.target.value }))} />
          </div>
          <div>
            <label className="field-label" htmlFor="v-doc">Doctor</label>
            <input id="v-doc" className="input-field" placeholder="Doctor name" value={visitForm.doctor} onChange={e => setVisitForm(f => ({ ...f, doctor: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div>
              <label className="field-label" htmlFor="v-h">Height (cm)</label>
              <input id="v-h" type="number" className="input-field" placeholder="0" value={visitForm.height_cm} onChange={e => setVisitForm(f => ({ ...f, height_cm: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="v-w">Weight (kg)</label>
              <input id="v-w" type="number" className="input-field" placeholder="0" value={visitForm.weight_kg} onChange={e => setVisitForm(f => ({ ...f, weight_kg: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="v-hd">Head (cm)</label>
              <input id="v-hd" type="number" className="input-field" placeholder="0" value={visitForm.head_cm} onChange={e => setVisitForm(f => ({ ...f, head_cm: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div>
              <label className="field-label" htmlFor="v-hp">Height %</label>
              <input id="v-hp" type="number" className="input-field" placeholder="0–100" value={visitForm.height_pct} onChange={e => setVisitForm(f => ({ ...f, height_pct: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="v-wp">Weight %</label>
              <input id="v-wp" type="number" className="input-field" placeholder="0–100" value={visitForm.weight_pct} onChange={e => setVisitForm(f => ({ ...f, weight_pct: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="v-hdp">Head %</label>
              <input id="v-hdp" type="number" className="input-field" placeholder="0–100" value={visitForm.head_pct} onChange={e => setVisitForm(f => ({ ...f, head_pct: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="v-notes">Notes</label>
            <input id="v-notes" className="input-field" placeholder="Optional notes" value={visitForm.notes} onChange={e => setVisitForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <button className="btn-primary" onClick={handleSaveVisit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Visit'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={showAddVaccine} onClose={() => setShowAddVaccine(false)} title="Add Vaccine">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="field-label" htmlFor="vac-name">Vaccine Name *</label>
            <input id="vac-name" className="input-field" placeholder="e.g. Flu (custom date)" value={vaccineForm.vaccine_name} onChange={e => setVaccineForm(f => ({ ...f, vaccine_name: e.target.value }))} />
          </div>
          <div>
            <label className="field-label" htmlFor="vac-given">Date Given</label>
            <input id="vac-given" type="date" className="input-field" value={vaccineForm.date_given} onChange={e => setVaccineForm(f => ({ ...f, date_given: e.target.value }))} />
          </div>
          <div>
            <label className="field-label" htmlFor="vac-due">Next Due</label>
            <input id="vac-due" type="date" className="input-field" value={vaccineForm.next_due} onChange={e => setVaccineForm(f => ({ ...f, next_due: e.target.value }))} />
          </div>
          <button className="btn-primary" onClick={handleSaveVaccine} disabled={saving}>
            {saving ? 'Saving...' : 'Save Vaccine'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function VaccineRow({ name, record, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const given = !!record?.date_given

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
        <button
          onClick={() => onToggle(!given, record?.date_given)}
          style={{
            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
            border: `1.5px solid ${given ? C.primary : C.border}`,
            background: given ? C.primary : 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {given && (
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke={C.bgLight} strokeWidth="2.5">
              <path d="M5 12l5 5 9-9"/>
            </svg>
          )}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: C.serif, fontSize: 14, color: given ? C.inkMuted : C.ink }}>{name}</div>
          {given && record?.date_given && (
            <div style={{ fontFamily: C.sans, fontSize: 10, color: C.inkMuted, marginTop: 1 }}>
              Given {record.date_given}
              {record.next_due ? ` · Next ${record.next_due}` : ''}
            </div>
          )}
        </div>
        {given && (
          <button
            onClick={() => setEditing(e => !e)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={C.inkMuted} strokeWidth="1.8">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4z"/>
            </svg>
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.inkMuted, fontSize: 16 }}>×</button>
        )}
      </div>
      {editing && (
        <div style={{ padding: '0 14px 10px', display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted, marginBottom: 3 }}>DATE GIVEN</div>
            <input
              type="date"
              defaultValue={record?.date_given || ''}
              style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 8px', fontFamily: C.sans, fontSize: 11, background: C.bgLight }}
              onBlur={e => onUpdate('date_given', e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted, marginBottom: 3 }}>NEXT DUE</div>
            <input
              type="date"
              defaultValue={record?.next_due || ''}
              style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 8px', fontFamily: C.sans, fontSize: 11, background: C.bgLight }}
              onBlur={e => onUpdate('next_due', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
