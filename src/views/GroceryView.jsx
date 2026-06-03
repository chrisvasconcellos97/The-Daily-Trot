import { useState, useMemo, useEffect } from 'react'
import ViewHeader from '../components/ViewHeader'
import { useGrocery } from '../hooks/useGrocery'
import { useCleanScore } from '../hooks/useCleanScore'
import C from '../colors'

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Other']

const CAT_COLORS = {
  Produce: '#4A7C59',
  Dairy: '#5B8BB0',
  Meat: '#A85454',
  Bakery: '#B5986A',
  Pantry: '#7A6E5A',
  Other: '#857F69',
}

function CategoryDot({ category }) {
  return (
    <div style={{
      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
      background: CAT_COLORS[category] || CAT_COLORS.Other,
    }} />
  )
}

export default function GroceryView({ familyId, toast }) {
  const { items, loading, addItem, toggleItem, deleteItem, clearChecked } = useGrocery(familyId)
  const { approvedSuggestions, fetchSuggestions } = useCleanScore(familyId)
  const [filter, setFilter] = useState('All')
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCat, setNewCat] = useState('Other')
  const [saving, setSaving] = useState(false)
  const [approvedSource, setApprovedSource] = useState(false)

  useEffect(() => {
    if (adding && newName.length >= 2) {
      fetchSuggestions(newName)
    }
  }, [newName, adding, fetchSuggestions])

  const unchecked = useMemo(() =>
    items.filter(i => !i.checked && (filter === 'All' || i.category === filter)),
    [items, filter]
  )
  const checked = useMemo(() =>
    items.filter(i => i.checked && (filter === 'All' || i.category === filter)),
    [items, filter]
  )

  const handleAdd = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      await addItem({ name: newName.trim(), category: newCat, approved_source: approvedSource })
      setNewName('')
      setNewCat('Other')
      setApprovedSource(false)
      setAdding(false)
    } catch {
      toast('Could not add item', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSuggestionPick = (suggestion) => {
    setNewName(suggestion.product_name || '')
    setApprovedSource(true)
  }

  const handleCopy = () => {
    const grouped = {}
    items.filter(i => !i.checked).forEach(i => {
      const cat = i.category || 'Other'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(i.name)
    })
    const text = Object.entries(grouped)
      .map(([cat, names]) => `${cat}:\n${names.map(n => `  - ${n}`).join('\n')}`)
      .join('\n\n')
    navigator.clipboard?.writeText(text).catch(() => {})
    toast('Copied!')
  }

  return (
    <div className="view-enter" style={{ paddingBottom: 120 }}>
      <ViewHeader title="Grocery" subtitle="SHOPPING LIST" />

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
                fontFamily: C.sans, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', letterSpacing: '0.05em',
              }}
            >{cat}</button>
          ))}
        </div>
      </div>

      {items.length > 0 && (
        <div style={{ padding: '10px 18px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <div style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted, letterSpacing: '0.1em' }}>
              {items.filter(i => i.checked).length} OF {items.length} DONE
            </div>
            <div style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted, letterSpacing: '0.1em' }}>
              {Math.round(items.filter(i => i.checked).length / items.length * 100)}%
            </div>
          </div>
          <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: C.primary, borderRadius: 2,
              width: `${items.filter(i => i.checked).length / items.length * 100}%`,
              transition: 'width 0.3s ease',
            }}/>
          </div>
        </div>
      )}

      <div style={{ padding: '14px 18px 0' }}>
        {unchecked.map((item, i) => (
          <div
            key={item.id}
            className="list-item"
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
              marginBottom: 8, animationDelay: `${i * 0.03}s`,
            }}
          >
            <button
              onClick={() => toggleItem(item.id, true)}
              style={{
                width: 20, height: 20, borderRadius: '50%',
                border: `1.5px solid ${C.border}`, background: 'transparent',
                cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            />
            <div style={{ flex: 1, fontFamily: C.serif, fontSize: 15, color: C.ink }}>{item.name}</div>
            <CategoryDot category={item.category} />
            <button
              onClick={() => deleteItem(item.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.inkMuted, fontSize: 16, lineHeight: 1 }}
            >×</button>
          </div>
        ))}

        {adding ? (
          <div style={{ marginBottom: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              background: C.bgLight, border: `1px solid ${C.primary}`, borderRadius: approvedSuggestions.length > 0 ? '10px 10px 0 0' : 10,
            }}>
              <input
                autoFocus
                value={newName}
                onChange={e => { setNewName(e.target.value); setApprovedSource(false) }}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
                placeholder="Item name..."
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  fontFamily: C.serif, fontSize: 15, color: C.ink,
                }}
              />
              {approvedSource && (
                <span style={{ background: '#4A7C59', color: '#fff', fontFamily: C.sans, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6, letterSpacing: '0.08em', flexShrink: 0 }}>
                  APPROVED
                </span>
              )}
              <select
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                style={{
                  border: `1px solid ${C.border}`, background: C.card, borderRadius: 8,
                  fontFamily: C.sans, fontSize: 11, color: C.inkSoft, padding: '3px 6px',
                }}
              >
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                onClick={handleAdd}
                disabled={saving}
                style={{
                  background: C.primary, color: C.bgLight, border: 'none', borderRadius: 8,
                  padding: '4px 12px', fontFamily: C.sans, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >Add</button>
              <button
                onClick={() => setAdding(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.inkMuted, fontSize: 18 }}
              >×</button>
            </div>
            {approvedSuggestions.length > 0 && (
              <div style={{
                background: C.card, border: `1px solid ${C.primary}`, borderTop: 'none',
                borderRadius: '0 0 10px 10px', overflow: 'hidden',
              }}>
                {approvedSuggestions.map((s, i) => (
                  <button
                    key={s.barcode || i}
                    onClick={() => handleSuggestionPick(s)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 14px', background: 'transparent', border: 'none',
                      borderTop: i > 0 ? `1px solid ${C.border}` : 'none',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: C.serif, fontSize: 13, color: C.ink }}>{s.product_name}</div>
                      {s.brand && <div style={{ fontFamily: C.sans, fontSize: 10, color: C.inkMuted }}>{s.brand}</div>}
                    </div>
                    {s.score != null && (
                      <span style={{
                        background: s.score >= 7 ? '#4A7C59' : s.score >= 4 ? '#B5986A' : '#C0392B',
                        color: '#fff', fontFamily: C.sans, fontSize: 11, fontWeight: 700,
                        padding: '2px 7px', borderRadius: 10, flexShrink: 0,
                      }}>{s.score.toFixed(1)}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: 'transparent', border: `1px dashed ${C.border}`, borderRadius: 10,
              cursor: 'pointer', width: '100%', marginBottom: 8,
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${C.primary}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.primary,
            }}>
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <span style={{ fontFamily: C.serif, fontSize: 14, color: C.inkMuted }}>Add item...</span>
          </button>
        )}

        {checked.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: C.sans, fontSize: 10, letterSpacing: '0.14em', color: C.inkMuted, fontWeight: 600 }}>
                COMPLETED ({checked.length})
              </div>
              <button
                onClick={clearChecked}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: C.sans, fontSize: 10, color: C.inkMuted }}
              >Clear</button>
            </div>
            {checked.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px',
                  background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 6,
                  opacity: 0.5,
                }}
              >
                <button
                  onClick={() => toggleItem(item.id, false)}
                  style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: `1.5px solid ${C.primary}`, background: C.primary,
                    cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke={C.bgLight} strokeWidth="2.5">
                    <path d="M5 12l5 5 9-9"/>
                  </svg>
                </button>
                <div style={{ flex: 1, fontFamily: C.serif, fontSize: 14, color: C.ink, textDecoration: 'line-through' }}>{item.name}</div>
                <CategoryDot category={item.category} />
              </div>
            ))}
          </div>
        )}
      </div>

      {items.filter(i => !i.checked).length > 0 && (
        <div style={{ padding: '16px 18px 0' }}>
          <button
            onClick={handleCopy}
            style={{
              width: '100%', padding: '13px', borderRadius: 23,
              background: C.primary, color: C.bgLight, border: 'none',
              fontFamily: C.sans, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              letterSpacing: '0.06em',
            }}
          >Copy List</button>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <p>Your list is empty — tap + to add your first item.</p>
        </div>
      )}
    </div>
  )
}
