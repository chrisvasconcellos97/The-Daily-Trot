import { useState } from 'react'
import ScallopHeader, { IconBtn } from '../components/ScallopHeader'
import Modal from '../components/Modal'
import { usePackingLists } from '../hooks/usePackingLists'
import C from '../colors'

// Sample items from design spec
const SAMPLE_ITEMS = [
  { id: 's1', label: 'Swimsuit', done: true },
  { id: 's2', label: 'Towel', done: true },
  { id: 's3', label: 'Goggles', done: true },
  { id: 's4', label: 'Water bottle', done: true },
  { id: 's5', label: 'Change of clothes', done: false },
  { id: 's6', label: 'Swim cap', done: false },
]

export default function PackingListsView({ familyId, toast }) {
  const { lists, addList, deleteList, addItem, toggleItem, loading } = usePackingLists(familyId)
  const [selectedList, setSelectedList] = useState(null)
  const [showNewListModal, setShowNewListModal] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newItemLabel, setNewItemLabel] = useState('')
  const [confirmDeleteList, setConfirmDeleteList] = useState(false)
  const [saving, setSaving] = useState(false)

  const currentList = selectedList ? lists.find(l => l.id === selectedList.id) || null : null

  const handleAddList = async () => {
    if (!newListName.trim()) { toast('Name required', 'error'); return }
    setSaving(true)
    try {
      await addList({ name: newListName })
      toast('List created!')
      setNewListName('')
      setShowNewListModal(false)
    } catch {
      toast('Could not create list', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAddItem = async () => {
    if (!newItemLabel.trim()) return
    try {
      await addItem(currentList.id, newItemLabel)
      setNewItemLabel('')
    } catch {
      toast('Could not add item', 'error')
    }
  }

  const handleDeleteList = async () => {
    try {
      await deleteList(currentList.id)
      setSelectedList(null)
      setConfirmDeleteList(false)
      toast('List deleted')
    } catch {
      toast('Could not delete list', 'error')
    }
  }

  // ── List index ──
  if (!currentList) {
    // Show design spec sample if no lists
    const showSample = !loading && lists.length === 0

    if (showSample) {
      return (
        <div className="view-enter">
          <ScallopHeader
            title="PACKING LIST"
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

          {/* Current bag card */}
          <div style={{
            margin: '16px 18px 0',
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke={C.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 12h20l-2 14H8L6 12z"/>
                <path d="M11 12V9a5 5 0 0110 0v3"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: C.serif, fontSize: 15, color: C.primary, fontWeight: 600 }}>Swim Class Bag</div>
              <div style={{ fontFamily: C.sans, fontSize: 9.5, color: C.inkMuted, marginTop: 2 }}>Today at 2:30 PM</div>
            </div>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={C.goldDark} strokeWidth="1.8"><path d="M9 6l6 6-6 6"/></svg>
          </div>

          {/* ITEMS eyebrow */}
          <div style={{
            margin: '18px 0 0 26px',
            fontFamily: C.sans, fontSize: 9, letterSpacing: '0.2em',
            color: C.inkMuted, fontWeight: 600,
          }}>ITEMS</div>

          {/* Checklist */}
          <div style={{ padding: '10px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {SAMPLE_ITEMS.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: `1.5px solid ${item.done ? C.primary : C.border}`,
                  background: item.done ? C.primary : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {item.done && <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke={C.bgLight} strokeWidth="3"><path d="M5 12l5 5 9-10"/></svg>}
                </div>
                <div style={{
                  fontFamily: C.serif, fontSize: 14, color: C.primary, fontWeight: 500,
                  textDecoration: item.done ? 'line-through' : 'none',
                  textDecorationColor: 'rgba(31,61,43,0.35)',
                }}>{item.label}</div>
              </div>
            ))}
            {/* Add item row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `1.5px dashed ${C.inkMuted}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.inkMuted, flexShrink: 0,
              }}>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              </div>
              <div style={{ fontFamily: C.serif, fontSize: 14, color: C.inkMuted, fontStyle: 'italic' }}>Add item</div>
            </div>
          </div>

          <button className="fab" onClick={() => setShowNewListModal(true)} aria-label="New packing list" style={{ bottom: 110 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.bgLight} strokeWidth="1.8">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
          <Modal isOpen={showNewListModal} onClose={() => setShowNewListModal(false)} title="New Packing List">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="field-label" htmlFor="list-name">List Name</label>
                <input id="list-name" className="input-field" placeholder="e.g. Beach Trip" value={newListName} onChange={e => setNewListName(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={handleAddList} disabled={saving}>
                {saving ? 'Creating...' : 'Create List'}
              </button>
            </div>
          </Modal>
        </div>
      )
    }

    return (
      <div className="view-enter">
        <ScallopHeader
          title="PACKING LISTS"
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
        <div style={{ padding: '20px 18px' }}>
          {loading ? (
            <div className="empty-state"><p>Loading...</p></div>
          ) : (
            lists.map((list, i) => {
              const total = list.items?.length || 0
              const checked = list.items?.filter(it => it.is_checked).length || 0
              return (
                <div
                  key={list.id}
                  className="list-item"
                  style={{
                    marginBottom: 12, cursor: 'pointer', animationDelay: `${i * 0.05}s`,
                    background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
                    padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12,
                  }}
                  onClick={() => setSelectedList(list)}
                >
                  <div style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke={C.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 12h20l-2 14H8L6 12z"/>
                      <path d="M11 12V9a5 5 0 0110 0v3"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: C.serif, fontSize: 15, color: C.primary, fontWeight: 600 }}>{list.name}</div>
                    <div style={{ fontFamily: C.sans, fontSize: 9.5, color: C.inkMuted, marginTop: 2 }}>{checked}/{total} packed</div>
                  </div>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={C.goldDark} strokeWidth="1.8"><path d="M9 6l6 6-6 6"/></svg>
                </div>
              )
            })
          )}
        </div>

        <button className="fab" onClick={() => setShowNewListModal(true)} aria-label="New packing list" style={{ bottom: 110 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.bgLight} strokeWidth="1.8">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>

        <Modal isOpen={showNewListModal} onClose={() => setShowNewListModal(false)} title="New Packing List">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="field-label" htmlFor="list-name">List Name</label>
              <input id="list-name" className="input-field" placeholder="e.g. Beach Trip" value={newListName} onChange={e => setNewListName(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={handleAddList} disabled={saving}>
              {saving ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </Modal>
      </div>
    )
  }

  // ── Checklist view ──
  return (
    <div className="view-enter">
      <ScallopHeader
        title={currentList.name.toUpperCase()}
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

      {/* Current bag card */}
      <div style={{
        margin: '16px 18px 0',
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
        padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke={C.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 12h20l-2 14H8L6 12z"/>
            <path d="M11 12V9a5 5 0 0110 0v3"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: C.serif, fontSize: 15, color: C.primary, fontWeight: 600 }}>{currentList.name}</div>
          <div style={{ fontFamily: C.sans, fontSize: 9.5, color: C.inkMuted, marginTop: 2 }}>
            {currentList.items?.filter(i => i.is_checked).length || 0} of {currentList.items?.length || 0} packed
          </div>
        </div>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.error, fontFamily: C.sans, fontSize: 11 }}
          onClick={() => setConfirmDeleteList(true)}
        >Delete</button>
      </div>

      {/* ITEMS eyebrow */}
      <div style={{
        margin: '18px 0 0 26px',
        fontFamily: C.sans, fontSize: 9, letterSpacing: '0.2em',
        color: C.inkMuted, fontWeight: 600,
      }}>ITEMS</div>

      {/* Checklist */}
      <div style={{ padding: '10px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {currentList.items?.map((item, i) => (
          <div
            key={item.id}
            className="list-item"
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', animationDelay: `${i * 0.04}s` }}
            onClick={() => toggleItem(currentList.id, item.id, item.is_checked)}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              border: `1.5px solid ${item.is_checked ? C.primary : C.border}`,
              background: item.is_checked ? C.primary : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {item.is_checked && <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke={C.bgLight} strokeWidth="3"><path d="M5 12l5 5 9-10"/></svg>}
            </div>
            <div style={{
              fontFamily: C.serif, fontSize: 14, color: C.primary, fontWeight: 500,
              textDecoration: item.is_checked ? 'line-through' : 'none',
              textDecorationColor: 'rgba(31,61,43,0.35)',
            }}>{item.label}</div>
          </div>
        ))}
        {/* Add item row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            border: `1.5px dashed ${C.inkMuted}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.inkMuted, flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <input
            style={{
              fontFamily: C.serif, fontSize: 14, color: C.inkMuted, fontStyle: 'italic',
              background: 'none', border: 'none', outline: 'none', flex: 1,
            }}
            placeholder="Add item"
            value={newItemLabel}
            onChange={e => setNewItemLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddItem() }}
          />
        </div>
      </div>

      {/* Delete confirm modal */}
      <Modal isOpen={confirmDeleteList} onClose={() => setConfirmDeleteList(false)} title="Delete this list?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 14, color: C.ink, opacity: 0.7 }}>This will permanently delete "{currentList.name}" and all its items.</p>
          <button className="btn-primary" style={{ background: C.error }} onClick={handleDeleteList}>Yes, Delete</button>
          <button className="btn-ghost" onClick={() => setConfirmDeleteList(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
