import { useState } from 'react'
import ScallopHeader from '../components/ScallopHeader'
import Modal from '../components/Modal'
import { usePlaces } from '../hooks/usePlaces'
import C from '../colors'

const CATEGORIES = ['all', 'library', 'gymnastics', 'art', 'music', 'park', 'other']

const categoryColors = {
  library: '#7EB5D6',
  gymnastics: '#E8A598',
  art: '#C4A265',
  music: '#7A9E7E',
  park: '#1E3D2F',
  other: '#8A8A8A',
}

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

  const PlaceCard = ({ place, i }) => (
    <div className="card list-item" style={{ marginBottom: 12, animationDelay: `${i * 0.04}s` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.textDark, marginBottom: 4 }}>{place.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: place.address ? 4 : 0 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 10,
              background: categoryColors[place.category] ? `${categoryColors[place.category]}22` : 'rgba(0,0,0,0.05)',
              color: categoryColors[place.category] || C.textDark,
              textTransform: 'capitalize',
            }}>
              {place.category}
            </span>
          </div>
          {place.address && (
            <div style={{ fontSize: 12, color: C.textDark, opacity: 0.5 }}>{place.address}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
          {place.website_url && (
            <a
              href={place.website_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 18, textDecoration: 'none', lineHeight: 1 }}
              onClick={e => e.stopPropagation()}
              aria-label="Open website"
            >
              🌐
            </a>
          )}
          <button
            onClick={() => toggleFavorite(place.id, place.is_favorite).catch(() => toast('Could not update', 'error'))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}
            aria-label={place.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span style={{ color: place.is_favorite ? C.accent : 'rgba(44,24,16,0.2)' }}>★</span>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="view-enter">
      <ScallopHeader title="PLACES" />

      <div style={{ padding: '24px 20px 8px' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input
            className="input-field"
            style={{ paddingLeft: 36 }}
            placeholder="Search places..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category chips */}
        <div className="chip-row" style={{ marginBottom: 20 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`chip${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Favorites */}
        {favorites.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: C.textDark, marginBottom: 4 }}>
              Favorites
            </div>
            <div className="section-accent" />
            {favorites.map((p, i) => <PlaceCard key={p.id} place={p} i={i} />)}
          </div>
        )}

        {/* All places */}
        {rest.length > 0 && (
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: C.textDark, marginBottom: 4 }}>
              {favorites.length > 0 ? 'All Places' : 'Places'}
            </div>
            <div className="section-accent" />
            {rest.map((p, i) => <PlaceCard key={p.id} place={p} i={i} />)}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: 40 }}>📍</div>
            <p>{search ? 'No places match your search.' : 'No places yet — tap + to add one.'}</p>
          </div>
        )}
      </div>

      <button className="fab" onClick={() => setShowAddModal(true)} aria-label="Add place">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
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
              {CATEGORIES.filter(c => c !== 'all').map(c => (
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
