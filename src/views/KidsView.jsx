import { useState } from 'react'
import ScallopHeader, { IconBtn } from '../components/ScallopHeader'
import Modal from '../components/Modal'
import { useChildren } from '../hooks/useChildren'
import C from '../colors'

function Divider({ width = 60 }) {
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

function KidAvatar({ color, name }) {
  const bg = color || '#E8C9A8'
  // Colors matching design spec per name
  const greenDeep = '#16301F'
  const goldDark = '#8A7244'
  return (
    <svg viewBox="0 0 60 60" width="52" height="52" style={{ borderRadius: '50%', display: 'block' }}>
      <rect width="60" height="60" fill={bg}/>
      <circle cx="30" cy="26" r="11" fill="#F4DBC2"/>
      <ellipse cx="30" cy="48" rx="18" ry="14" fill={C.primary}/>
      <circle cx="26" cy="25" r="1.2" fill={greenDeep}/>
      <circle cx="34" cy="25" r="1.2" fill={greenDeep}/>
      <path d="M27 30 Q30 32 33 30" stroke={greenDeep} strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M19 22 Q22 14 30 14 Q38 14 41 22" fill={goldDark} opacity="0.8"/>
    </svg>
  )
}

const COLOR_SWATCHES = [
  { label: 'Warm', value: '#E8C9A8' },
  { label: 'Tan', value: '#D4B894' },
  { label: 'Light', value: '#EAD6B4' },
  { label: 'Sage', value: '#7A9E7E' },
  { label: 'Blush', value: '#E8A598' },
]

function calcAge(birthdateStr) {
  if (!birthdateStr) return ''
  const birth = new Date(birthdateStr)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (months < 0) { years--; months += 12 }
  if (now.getDate() < birth.getDate()) { months-- }
  if (months < 0) { years--; months += 11 }
  if (years < 1) return `${months} month${months !== 1 ? 's' : ''} old`
  return `${years} year${years !== 1 ? 's' : ''} old`
}

const emptyForm = { name: '', birthdate: '', color: '#E8C9A8' }

export default function KidsView({ familyId, toast }) {
  const { children, addChild, updateChild, deleteChild } = useChildren(familyId)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editChild, setEditChild] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const openAdd = () => { setForm(emptyForm); setShowAddModal(true) }
  const openEdit = (child) => { setEditChild(child); setForm({ name: child.name, birthdate: child.birthdate || '', color: child.color || '#E8C9A8' }) }
  const closeEdit = () => { setEditChild(null); setForm(emptyForm) }

  const handleSave = async () => {
    if (!form.name.trim()) { toast('Name is required', 'error'); return }
    setSaving(true)
    try {
      if (editChild) {
        await updateChild(editChild.id, form)
        toast('Updated!')
        closeEdit()
      } else {
        await addChild(form)
        toast('Kid added!')
        setShowAddModal(false)
        setForm(emptyForm)
      }
    } catch {
      toast('Could not save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteChild(confirmDelete)
      toast('Removed')
      setConfirmDelete(null)
      if (editChild?.id === confirmDelete) closeEdit()
    } catch {
      toast('Could not delete', 'error')
    }
  }

  const ChildForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label className="field-label" htmlFor="kid-name">Name *</label>
        <input id="kid-name" className="input-field" placeholder="Child's name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div>
        <label className="field-label" htmlFor="kid-bday">Birthdate</label>
        <input id="kid-bday" type="date" className="input-field" value={form.birthdate} onChange={e => setForm(f => ({ ...f, birthdate: e.target.value }))} />
      </div>
      <div>
        <label className="field-label">Color</label>
        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          {COLOR_SWATCHES.map(s => (
            <button
              key={s.value}
              className={`color-swatch${form.color === s.value ? ' selected' : ''}`}
              style={{ background: s.value, border: form.color === s.value ? `3px solid ${C.primary}` : '3px solid transparent' }}
              onClick={() => setForm(f => ({ ...f, color: s.value }))}
              aria-label={s.label}
            />
          ))}
        </div>
      </div>
      <button className="btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : editChild ? 'Save Changes' : 'Add Child'}
      </button>
      {editChild && (
        <button
          className="btn-ghost"
          style={{ color: C.error }}
          onClick={() => { setConfirmDelete(editChild.id); closeEdit() }}
        >
          Remove Child
        </button>
      )}
    </div>
  )

  return (
    <div className="view-enter">
      <ScallopHeader
        title="MY KIDS"
        leading={
          <IconBtn>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </IconBtn>
        }
        trailing={
          <IconBtn>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </IconBtn>
        }
      />

      {/* Centered divider */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16 }}>
        <Divider width={60}/>
      </div>

      <div style={{ padding: '14px 18px' }}>
        {children.length === 0 ? (
          <div className="empty-state">
            <p>No kids added yet — tap + to add one.</p>
          </div>
        ) : (
          children.map((child, i) => (
            <div
              key={child.id}
              className="list-item"
              style={{
                marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14,
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: '12px 16px', cursor: 'pointer',
                animationDelay: `${i * 0.05}s`,
              }}
              onClick={() => openEdit(child)}
            >
              <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <KidAvatar color={child.color} name={child.name}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: C.serif, fontSize: 16, color: C.primary, fontWeight: 600 }}>{child.name}</div>
                {child.birthdate && (
                  <div style={{ fontFamily: C.sans, fontSize: 10, color: C.inkMuted, marginTop: 3 }}>{calcAge(child.birthdate)}</div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Add Child row */}
        <div
          style={{
            marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 0', cursor: 'pointer',
          }}
          onClick={openAdd}
        >
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            border: `1.5px solid ${C.primary}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary,
          }}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <div style={{ fontFamily: C.serif, fontSize: 14, color: C.primary, fontWeight: 600 }}>Add Child</div>
        </div>
      </div>

      {/* Add modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setForm(emptyForm) }} title="Add Child">
        <ChildForm />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editChild} onClose={closeEdit} title="Edit Child">
        <ChildForm />
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remove this child?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 14, color: C.ink, opacity: 0.7 }}>This will remove them from your family profile.</p>
          <button className="btn-primary" style={{ background: C.error }} onClick={handleDelete}>Yes, Remove</button>
          <button className="btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
