import { useState } from 'react'
import ScallopHeader, { IconBtn } from '../components/ScallopHeader'
import Modal from '../components/Modal'
import { usePlaces } from '../hooks/usePlaces'
import C from '../colors'

function CatIcon({ kind }) {
  const s = { fill: 'none', stroke: C.primary, strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (kind) {
    case 'book': return <svg viewBox="0 0 24 24" width="20" height="20" {...s}><path d="M4 5c2-.5 5-.5 8 1 3-1.5 6-1.5 8-1v14c-2-.5-5-.5-8 1-3-1.5-6-1.5-8-1V5z"/><path d="M12 6v14"/></svg>
    case 'gym': return <svg viewBox="0 0 24 24" width="20" height="20" {...s}><circle cx="12" cy="7" r="2"/><path d="M12 9v4M9 13l3 0 3 0M9 13l-2 6M15 13l2 6"/></svg>
    case 'art': return <svg viewBox="0 0 24 24" width="20" height="20" {...s}><path d="M12 4c-5 0-9 3-9 8 0 3 2 5 5 5 1 0 1-1 1-2s1-2 2-2c3 0 6-2 6-5s-2-4-5-4z"/><circle cx="7" cy="9" r="1" fill={C.primary}/><circle cx="11" cy="6" r="1" fill={C.primary}/><circle cx="16" cy="8" r="1" fill={C.primary}/></svg>
    case 'music': return <svg viewBox="0 0 24 24" width="20" height="20" {...s}><path d="M9 17V5l10-2v12"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="15" r="2"/></svg>
    case 'park': return <svg viewBox="0 0 24 24" width="20" height="20" {...s}><path d="M12 14c-3 0-5-2-5-5s2-5 5-5 5 2 5 5-2 5-5 5z"/><path d="M12 14v6M9 20h6"/></svg>
    default: return null
  }
}

function PlaceIcon({ kind }) {
  const s = { fill: 'none', stroke: C.primary, strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (kind === 'pool') return (
    <svg viewBox="0 0 32 32" width="30" height="30" {...s}>
      <path d="M4 8l12-3 12 3"/>
      <path d="M10 12v8M22 12v8"/>
      <path d="M4 24c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" {...s}>
      <path d="M6 28V14l10-7 10 7v14"/>
      <path d="M10 28v-8h12v8"/>
      <path d="M13 14h6"/>
    </svg>
  )
}

const CATEGORIES = [
  { label: 'Library', icon: 'book', key: 'library' },
  { label: 'Gymnastics', icon: 'gym', key: 'gymnastics' },
  { label: 'Art', icon: 'art', key: 'art' },
  { label: 'Music', icon: 'music', key: 'music' },
  { label: 'Parks', icon: 'park', key: 'park' },
]

// Sample favorites from design spec
const SAMPLE_FAVORITES = [
  { id: 's1', name: 'Main Street Library', dist: '1.2 mi away', icon: 'building' },
  { id: 's2', name: 'AquaKids Swim School', dist: '2.7 mi away', icon: 'pool' },
  { id: 's3', name: 'The Little Gym', dist: '3.1 mi away', icon: 'building' },
]

const ALL_CATS = ['all', 'library', 'gymnastics', 'art', 'music', 'park', 'other']

export default function PlacesView({ familyId, toast }) {
  const { places, addPlace, toggleFavorite } = usePlaces(familyId)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'other', address: '', website_url: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const filtered = places
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => activeCategory === 'all' || p.category === activeCategory)

  const favorites = filtered.filter(p => p.is_favorite)
  const rest = filtered.filter(p => !p.is_favorite)

  const handleAddPlace = async () => {
    if (!form.name.trim()) { toast('Name is required', 'error'); return }
    setSaving(true)
    try {
      await addPlace({ ...form, is_favorite: false })
      toast('Place added!')
      setShowAddModal(false)
      setForm({ name: '', category: 'other', address: '', website_url: '', notes: '' })
    } catch {
      toast('Could not add place', 'error')
    } finally {
      setSaving(false)
    }
  }

  const showSample = places.length === 0 && !search

  return (
    <div className="view-enter">
      <ScallopHeader
        title="PLACES"
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

      {/* Search bar */}
      <div style={{
        margin: '16px 18px 0',
        height: 36, borderRadius: 18,
        background: C.card, border: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px',
      }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={C.inkMuted} strokeWidth="2"><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></svg>
        <input
          style={{
            flex: 1, fontFamily: C.serif, fontSize: 12, color: C.inkMuted, fontStyle: 'italic',
            background: 'none', border: 'none', outline: 'none',
          }}
          placeholder="Search places, classes, activities"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category circles */}
      <div style={{
        margin: '16px 18px 0',
        display: 'flex', justifyContent: 'space-between',
      }}>
        {CATEGORIES.map((c) => (
          <div
            key={c.key}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 50, cursor: 'pointer' }}
            onClick={() => setActiveCategory(activeCategory === c.key ? 'all' : c.key)}
          >
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: activeCategory === c.key ? C.primary : C.card,
              border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {activeCategory === c.key
                ? <CatIcon kind={c.icon} color={C.bgLight} />
                : <CatIcon kind={c.icon} />
              }
            </div>
            <div style={{ fontFamily: C.sans, fontSize: 8.5, color: C.primary, letterSpacing: '0.05em', fontWeight: 500, textAlign: 'center' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* FAVORITES eyebrow */}
      <div style={{
        margin: '18px 0 0 26px',
        fontFamily: C.sans, fontSize: 9, letterSpacing: '0.2em',
        color: C.inkMuted, fontWeight: 600,
      }}>FAVORITES</div>

      {/* Favorites list */}
      <div style={{ padding: '10px 18px', display: 'flex', flexDirection: 'column' }}>
        {(showSample ? SAMPLE_FAVORITES : favorites).map((f, i) => {
          const isLast = i === (showSample ? SAMPLE_FAVORITES : favorites).length - 1
          return (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              paddingBottom: isLast ? 0 : 12,
              borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
              marginBottom: isLast ? 0 : 12,
            }}>
              <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlaceIcon kind={f.icon || (f.category === 'swim' ? 'pool' : 'building')}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: C.serif, fontSize: 13, color: C.primary, fontWeight: 600 }}>{f.name}</div>
                <div style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted, marginTop: 2 }}>{f.dist || f.address || ''}</div>
              </div>
              {!showSample && (
                <button
                  onClick={() => toggleFavorite(f.id, f.is_favorite).catch(() => toast('Could not update', 'error'))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.gold} strokeWidth="1.5">
                    <path d="M12 3l2.6 6 6.4.6-4.8 4.4 1.4 6.4L12 17l-5.6 3.4L7.8 14 3 9.6 9.4 9z"/>
                  </svg>
                </button>
              )}
              {showSample && (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.gold} strokeWidth="1.5">
                  <path d="M12 3l2.6 6 6.4.6-4.8 4.4 1.4 6.4L12 17l-5.6 3.4L7.8 14 3 9.6 9.4 9z"/>
                </svg>
              )}
            </div>
          )
        })}

        {/* Non-favorites */}
        {!showSample && rest.map((p, i) => (
          <div key={p.id} className="list-item" style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
            animationDelay: `${i * 0.04}s`,
          }}>
            <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlaceIcon kind="building"/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: C.serif, fontSize: 13, color: C.primary, fontWeight: 600 }}>{p.name}</div>
              {p.address && <div style={{ fontFamily: C.sans, fontSize: 9, color: C.inkMuted, marginTop: 2 }}>{p.address}</div>}
            </div>
            <button
              onClick={() => toggleFavorite(p.id, p.is_favorite).catch(() => toast('Could not update', 'error'))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.gold} strokeWidth="1.5" opacity={0.35}>
                <path d="M12 3l2.6 6 6.4.6-4.8 4.4 1.4 6.4L12 17l-5.6 3.4L7.8 14 3 9.6 9.4 9z"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button className="fab" onClick={() => setShowAddModal(true)} aria-label="Add place" style={{ bottom: 110 }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.bgLight} strokeWidth="1.8">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Place">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label" htmlFor="place-name">Name *</label>
            <input id="place-name" className="input-field" placeholder="Place name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="field-label" htmlFor="place-cat">Category</label>
            <select id="place-cat" className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {ALL_CATS.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="place-addr">Address</label>
            <input id="place-addr" className="input-field" placeholder="123 Main St" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div>
            <label className="field-label" htmlFor="place-url">Website URL</label>
            <input id="place-url" className="input-field" placeholder="https://..." value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} />
          </div>
          <div>
            <label className="field-label" htmlFor="place-notes">Notes</label>
            <input id="place-notes" className="input-field" placeholder="Optional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <button className="btn-primary" onClick={handleAddPlace} disabled={saving}>
            {saving ? 'Saving...' : 'Save Place'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
