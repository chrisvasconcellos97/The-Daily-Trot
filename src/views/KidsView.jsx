import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ViewHeader, { IconBtn } from '../components/ViewHeader'
import Modal from '../components/Modal'
import { useChildren } from '../hooks/useChildren'
import C from '../colors'

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

function ChildForm({ form, setForm, handleSave, saving, editChild, setConfirmDelete, closeEdit }) {
  return (
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
}

export default function KidsView({ familyId, toast }) {
  const navigate = useNavigate()
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

  return (
    <div className="view-enter">
      <ViewHeader title="My Kids" onBack={() => navigate(-1)} trailing={
        <IconBtn onClick={openAdd}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
        </IconBtn>
      }/>

      <div style={{ padding: '14px 18px' }}>
        {children.length === 0 ? (
          <div className="empty-state">
            <p>No kids added yet — tap + to add one.</p>
          </div>
        ) : (
          children.map((child, i) => {
            const accentColor = child.color || C.gold
            return (
              <div
                key={child.id}
                className="list-item"
                style={{
                  marginBottom: 12, cursor: 'pointer', animationDelay: `${i * 0.05}s`,
                  background: C.card, borderRadius: 14, overflow: 'hidden',
                  border: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'stretch',
                }}
                onClick={() => openEdit(child)}
              >
                {/* left accent bar */}
                <div style={{ width: 6, background: accentColor, flexShrink: 0 }}/>
                {/* content */}
                <div style={{ flex: 1, padding: '16px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* initial circle */}
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: accentColor, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: C.serif, fontSize: 26, fontWeight: 700, color: '#fff',
                  }}>
                    {(child.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: C.serif, fontSize: 22, color: C.primary, fontWeight: 700, lineHeight: 1 }}>{child.name}</div>
                    {child.birthdate && (
                      <div style={{ fontFamily: C.sans, fontSize: 11, color: C.inkMuted, marginTop: 4 }}>{calcAge(child.birthdate)}</div>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/kids/${child.id}/health`) }}
                      style={{
                        marginTop: 8, background: 'none', border: `1px solid ${C.gold}`,
                        borderRadius: 12, padding: '4px 12px', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke={C.goldDark} strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                      <span style={{ fontFamily: C.sans, fontSize: 10, color: C.goldDark, fontWeight: 600, letterSpacing: '0.08em' }}>HEALTH</span>
                    </button>
                  </div>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={C.border} strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setForm(emptyForm) }} title="Add Child">
        <ChildForm form={form} setForm={setForm} handleSave={handleSave} saving={saving} editChild={editChild} setConfirmDelete={setConfirmDelete} closeEdit={closeEdit} />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editChild} onClose={closeEdit} title="Edit Child">
        <ChildForm form={form} setForm={setForm} handleSave={handleSave} saving={saving} editChild={editChild} setConfirmDelete={setConfirmDelete} closeEdit={closeEdit} />
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
