import { useState } from 'react'
import ScallopHeader from '../components/ScallopHeader'
import Modal from '../components/Modal'
import { usePackingLists } from '../hooks/usePackingLists'
import C from '../colors'

export default function PackingListsView({ familyId, toast }) {
  const { lists, addList, deleteList, addItem, toggleItem, loading } = usePackingLists(familyId)
  const [selectedList, setSelectedList] = useState(null)
  const [showNewListModal, setShowNewListModal] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newItemLabel, setNewItemLabel] = useState('')
  const [confirmDeleteList, setConfirmDeleteList] = useState(false)
  const [saving, setSaving] = useState(false)

  // Refresh selectedList when lists update
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

  // List index view
  if (!currentList) {
    return (
      <div className="view-enter">
        <ScallopHeader title="PACKING LISTS" />
        <div style={{ padding: '32px 20px' }}>
          {loading ? (
            <div className="empty-state"><p>Loading...</p></div>
          ) : lists.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40 }}>🧳</div>
              <p>No packing lists yet — tap + to create one.</p>
            </div>
          ) : (
            lists.map((list, i) => {
              const total = list.items?.length || 0
              const checked = list.items?.filter(it => it.is_checked).length || 0
              const progress = total > 0 ? checked / total : 0
              return (
                <div
                  key={list.id}
                  className="card list-item"
                  style={{ marginBottom: 12, cursor: 'pointer', animationDelay: `${i * 0.05}s` }}
                  onClick={() => setSelectedList(list)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: C.textDark }}>
                      {list.name}
                    </div>
                    <div style={{ fontSize: 12, color: C.textDark, opacity: 0.5 }}>{checked}/{total} packed</div>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(30,61,47,0.1)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, background: C.accent, width: `${progress * 100}%`, transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              )
            })
          )}
        </div>

        <button className="fab" onClick={() => setShowNewListModal(true)} aria-label="New packing list">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
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

  // Checklist view
  return (
    <div className="view-enter">
      <ScallopHeader
        title={currentList.name}
        onBack={() => setSelectedList(null)}
      />
      <div style={{ padding: '32px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: C.textDark, opacity: 0.5 }}>
              {currentList.items?.filter(i => i.is_checked).length || 0} of {currentList.items?.length || 0} packed
            </div>
          </div>
          <button
            className="btn-ghost"
            style={{ color: C.error, fontSize: 13 }}
            onClick={() => setConfirmDeleteList(true)}
          >
            Delete List
          </button>
        </div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {currentList.items?.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <p>No items yet — add some below.</p>
            </div>
          ) : (
            currentList.items?.map((item, i) => (
              <div
                key={item.id}
                className="list-item"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', animationDelay: `${i * 0.04}s`, cursor: 'pointer' }}
                onClick={() => toggleItem(currentList.id, item.id, item.is_checked)}
              >
                <div className={`custom-check${item.is_checked ? ' checked' : ''}`}>
                  {item.is_checked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: 15, color: C.textDark, textDecoration: item.is_checked ? 'line-through' : 'none', opacity: item.is_checked ? 0.4 : 1, flex: 1 }}>
                  {item.label}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Add item */}
        <div className="divider" />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <input
            className="input-field"
            placeholder="Add item..."
            value={newItemLabel}
            onChange={e => setNewItemLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddItem() }}
            style={{ flex: 1 }}
          />
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '12px 20px' }}
            onClick={handleAddItem}
          >
            Add
          </button>
        </div>
      </div>

      {/* Delete confirm modal */}
      <Modal isOpen={confirmDeleteList} onClose={() => setConfirmDeleteList(false)} title="Delete this list?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 14, color: C.textDark, opacity: 0.7 }}>This will permanently delete "{currentList.name}" and all its items.</p>
          <button className="btn-primary" style={{ background: C.error }} onClick={handleDeleteList}>Yes, Delete</button>
          <button className="btn-ghost" onClick={() => setConfirmDeleteList(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
