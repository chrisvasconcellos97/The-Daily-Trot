import { useState } from 'react'
import ScallopHeader from '../components/ScallopHeader'
import Modal from '../components/Modal'
import { useChildren } from '../hooks/useChildren'
import C from '../colors'

const COLOR_SWATCHES = [
  { label: 'Gold', value: '#C4A265' },
  { label: 'Green', value: '#1E3D2F' },
  { label: 'Sage', value: '#7A9E7E' },
  { label: 'Blush', value: '#E8A598' },
  { label: 'Sky', value: '#7EB5D6' },
]

function calcAge(birthdateStr) {
  if (!birthdateStr) return ''
  const birth = new Date(birthdateStr)
  const now = new Date('2026-05-26')
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (months < 0) { years--; months += 12 }
  if (now.getDate() < birth.getDate()) { months-- }
  if (months < 0) { years--; months += 11 }
  if (years < 1) return `${months} month${months !== 1 ? 's' : ''} old`
  return `${years} year${years !== 1 ? 's' : ''} old`
}

const emptyForm = { name: '', birthdate: '', color: '#C4A265' }

export default function KidsView({ familyId, toast }) {
  const { children, addChild, updateChild, deleteChild } = useChildren(familyId)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editChild, setEditChild] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)

  const openAdd = () => { setForm(emptyForm); setShowAddModal(true) }
  const openEdit = (child) => { setEditChild(child); setForm({ name: child.name, birthdate: child.birthdate || '', color: child.color || '#C4A265' }) }
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
      <ScallopHeader title="MY KIDS" />
      <div style={{ padding: '32px 20px' }}>
        {children.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 40 }}>👶</div>
            <p>No kids added yet.</p>
          </div>
        ) : (
          children.map((child, i) => (
            <div key={child.id} className="card list-item" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, animationDelay: `${i * 0.05}s` }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: child.color || C.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 700,
                color: C.white,
                flexShrink: 0,
              }}>
                {child.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: C.textDark }}>{child.name}</div>
                {child.birthdate && (
                  <div style={{ fontSize: 13, color: C.textDark, opacity: 0.5 }}>{calcAge(child.birthdate)}</div>
                )}
              </div>
              <button
                className="btn-ghost"
                style={{ padding: '6px 10px' }}
                onClick={() => setMenuOpen(menuOpen === child.id ? null : child.id)}
                aria-label="Options"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={C.textDark} stroke="none">
                  <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
                </svg>
              </button>
              {menuOpen === child.id && (
                <div style={{
                  position: 'absolute',
                  right: 36,
                  background: C.card,
                  borderRadius: 10,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  zIndex: 10,
                  minWidth: 120,
                  overflow: 'hidden',
                }}>
                  <button
                    style={{ display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, textAlign: 'left', color: C.textDark }}
                    onClick={() => { openEdit(child); setMenuOpen(null) }}
                  >Edit</button>
                  <button
                    style={{ display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, textAlign: 'left', color: C.error }}
                    onClick={() => { setConfirmDelete(child.id); setMenuOpen(null) }}
                  >Delete</button>
                </div>
              )}
            </div>
          ))
        )}

        <button className="btn-outline" style={{ marginTop: 16 }} onClick={openAdd}>
          + Add Child
        </button>
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
          <p style={{ fontSize: 14, color: C.textDark, opacity: 0.7 }}>This will remove them from your family profile.</p>
          <button className="btn-primary" style={{ background: C.error }} onClick={handleDelete}>Yes, Remove</button>
          <button className="btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
