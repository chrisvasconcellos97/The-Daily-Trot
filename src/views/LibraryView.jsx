import { useState } from 'react'
import { format, differenceInDays, parseISO, addWeeks } from 'date-fns'
import ViewHeader, { IconBtn } from '../components/ViewHeader'
import { useLibrary } from '../hooks/useLibrary'
import C from '../colors'

// ─── helpers ──────────────────────────────────────────────────────────────────

function dueStatus(dueDateStr) {
  const days = differenceInDays(parseISO(dueDateStr), new Date())
  if (days < 0)  return { label: 'Overdue',    color: C.error,     bg: C.errorFaint }
  if (days === 0) return { label: 'Due today',  color: '#A05C00',   bg: 'rgba(160,92,0,0.10)' }
  if (days <= 3)  return { label: `${days}d left`, color: '#8B6914', bg: 'rgba(139,105,20,0.10)' }
  return           { label: `${days}d left`,    color: C.primary,   bg: C.primaryFaint }
}

const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

// ─── Add book sheet ────────────────────────────────────────────────────────────

function AddBookSheet({ onSave, onClose }) {
  const [title, setTitle]       = useState('')
  const [author, setAuthor]     = useState('')
  const [checkout, setCheckout] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [weeks, setWeeks]       = useState(3)
  const [saving, setSaving]     = useState(false)

  const dueDate    = addWeeks(parseISO(checkout), weeks)
  const dueDateStr = format(dueDate, 'yyyy-MM-dd')
  const dueFriendly = format(dueDate, 'MMMM d, yyyy')

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        author: author.trim() || null,
        checkout_date: checkout,
        due_date: dueDateStr,
      })
      onClose()
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Add a Book</div>

        <label className="field-label" htmlFor="lib-title">Book Title</label>
        <input
          id="lib-title" className="input-field"
          style={{ marginBottom: 16 }}
          placeholder="e.g. The Very Hungry Caterpillar"
          value={title} onChange={e => setTitle(e.target.value)}
          autoFocus
        />

        <label className="field-label" htmlFor="lib-author">Author (optional)</label>
        <input
          id="lib-author" className="input-field"
          style={{ marginBottom: 16 }}
          placeholder="e.g. Eric Carle"
          value={author} onChange={e => setAuthor(e.target.value)}
        />

        <label className="field-label" htmlFor="lib-checkout">Checked Out On</label>
        <input
          id="lib-checkout" className="input-field" type="date"
          style={{ marginBottom: 16 }}
          value={checkout} onChange={e => setCheckout(e.target.value)}
        />

        <label className="field-label">Loan Period</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[1, 2, 3].map(w => (
            <button
              key={w}
              className={`chip${weeks === w ? ' active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setWeeks(w)}
            >
              {w} {w === 1 ? 'Week' : 'Weeks'}
            </button>
          ))}
        </div>

        {/* Calculated due date preview */}
        <div style={{
          background: C.primaryFaint, borderRadius: 10,
          padding: '10px 14px', marginBottom: 24,
          fontSize: 14, color: C.primary, display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <CalIcon />
          <span>Due back by <strong>{dueFriendly}</strong></span>
        </div>

        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={!title.trim() || saving}
        >
          {saving ? 'Saving…' : 'Add Book'}
        </button>
      </div>
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function LibraryView({ familyId, toast }) {
  const { books, loading, addBook, markReturned, removeBook } = useLibrary(familyId)
  const [showAdd, setShowAdd]       = useState(false)
  const [confirming, setConfirming] = useState(null)   // book id awaiting confirm

  const active   = books.filter(b => !b.returned_at)
  const returned = books.filter(b =>  b.returned_at)

  const handleAdd = async (book) => {
    try {
      await addBook(book)
      toast('Book added!', 'success')
    } catch {
      toast("Couldn't save — check your connection", 'error')
    }
  }

  const handleReturn = async (id) => {
    if (confirming !== id) { setConfirming(id); return }
    try {
      await markReturned(id)
      setConfirming(null)
      toast('Marked as returned!', 'success')
    } catch {
      toast("Couldn't save — check your connection", 'error')
    }
  }

  const handleRemove = async (id) => {
    try {
      await removeBook(id)
    } catch {
      toast("Couldn't delete — check your connection", 'error')
    }
  }

  return (
    <div className="view-enter">
      <ViewHeader title="Library" subtitle="CHECKED OUT" trailing={
        <IconBtn onClick={() => setShowAdd(true)}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
        </IconBtn>
      }/>

      <div style={{ padding: '32px 16px 20px' }}>

        {/* Active books */}
        {loading ? (
          <div className="empty-state">Loading your books…</div>
        ) : active.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
            <div style={{
              fontFamily: C.serif,
              fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 8,
            }}>
              No books checked out
            </div>
            <p>Tap + to log a book and we'll track the return date for you.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {active.map(book => {
              const status = dueStatus(book.due_date)
              const isConfirming = confirming === book.id
              return (
                <div key={book.id} className="card list-item" style={{ padding: '14px 16px' }}>

                  {/* Title + badge row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: C.serif,
                        fontSize: 16, fontWeight: 700, color: C.ink, lineHeight: 1.3,
                      }}>
                        {book.title}
                      </div>
                      {book.author && (
                        <div style={{ fontSize: 13, color: 'rgba(44,24,16,0.5)', marginTop: 2 }}>
                          {book.author}
                        </div>
                      )}
                    </div>
                    <div style={{
                      flexShrink: 0,
                      background: status.bg, color: status.color,
                      fontSize: 11, fontWeight: 700,
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                      padding: '4px 9px', borderRadius: 6,
                    }}>
                      {status.label}
                    </div>
                  </div>

                  {/* Due date line */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    marginTop: 8, fontSize: 13, color: 'rgba(44,24,16,0.5)',
                  }}>
                    <CalIcon />
                    Due {format(parseISO(book.due_date), 'MMMM d')}
                    {book.checkout_date && (
                      <span style={{ marginLeft: 4, opacity: 0.6 }}>
                        · checked out {format(parseISO(book.checkout_date), 'MMM d')}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      className="btn-outline"
                      style={{ flex: 1, padding: '8px 12px', fontSize: 13, fontWeight: 600 }}
                      onClick={() => handleReturn(book.id)}
                    >
                      {isConfirming ? 'Sure?' : '✓ Returned'}
                    </button>
                    <button
                      className="btn-ghost"
                      style={{ padding: '8px 10px', fontSize: 13 }}
                      onClick={() => handleRemove(book.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Returned books */}
        {returned.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{ fontFamily: C.serif, fontSize: 16, fontWeight: 700, color: C.ink }}>
              Returned
            </div>
            <div className="section-accent" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {returned.map(book => (
                <div key={book.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 12,
                  background: C.primaryFaint, opacity: 0.75,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{book.title}</div>
                    {book.author && (
                      <div style={{ fontSize: 12, color: 'rgba(44,24,16,0.45)' }}>{book.author}</div>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(44,24,16,0.45)', flexShrink: 0, marginLeft: 8 }}>
                    Returned {format(parseISO(book.returned_at.slice(0, 10)), 'MMM d')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowAdd(true)} aria-label="Add a book">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white"
          strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {showAdd && <AddBookSheet onSave={handleAdd} onClose={() => setShowAdd(false)} />}
    </div>
  )
}
