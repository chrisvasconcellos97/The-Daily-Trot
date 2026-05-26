import { useState, useEffect } from 'react'
import ScallopHeader from '../components/ScallopHeader'
import Modal from '../components/Modal'
import { useCommunity } from '../hooks/useCommunity'
import { usePlaces } from '../hooks/usePlaces'
import C from '../colors'

export default function CommunityView({ familyId, toast, session }) {
  const { groups, posts, loading, createGroup, joinGroup, createPost, joinPost, leavePost, fetchPosts } = useCommunity(familyId)
  const { places } = usePlaces(familyId)

  const [activeGroup, setActiveGroup] = useState(null)
  const [showNewPost, setShowNewPost] = useState(false)
  const [showJoinGroup, setShowJoinGroup] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [createdGroup, setCreatedGroup] = useState(null)
  const [localPosts, setLocalPosts] = useState([])
  const [myJoins, setMyJoins] = useState(new Set())

  const [joinedGroupId, setJoinedGroupId] = useState(null)
  const [inviteCode, setInviteCode] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [postForm, setPostForm] = useState({ message: '', activity_date: '', activity_time: '', place_id: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (activeGroup) {
      fetchPosts(activeGroup.id).then(setLocalPosts)
    }
  }, [activeGroup, fetchPosts])

  const handleSelectGroup = (group) => {
    setActiveGroup(group)
    fetchPosts(group.id).then(setLocalPosts)
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) { toast('Group name required', 'error'); return }
    setSaving(true)
    try {
      const group = await createGroup(newGroupName)
      setCreatedGroup(group)
      setNewGroupName('')
    } catch {
      toast('Could not create group', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) { toast('Enter an invite code', 'error'); return }
    setSaving(true)
    try {
      await joinGroup(inviteCode)
      toast('Joined group!')
      setInviteCode('')
      setShowJoinGroup(false)
    } catch {
      toast('Group not found or already joined', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCreatePost = async () => {
    if (!postForm.message.trim()) { toast('Message required', 'error'); return }
    const groupId = activeGroup?.id || (groups.length > 0 ? groups[0].id : null)
    if (!groupId) { toast('Select a group', 'error'); return }
    setSaving(true)
    try {
      await createPost(groupId, {
        message: postForm.message,
        activity_date: postForm.activity_date || null,
        activity_time: postForm.activity_time || null,
        place_id: postForm.place_id || null,
      })
      toast('Post shared!')
      setShowNewPost(false)
      setPostForm({ message: '', activity_date: '', activity_time: '', place_id: '' })
      if (activeGroup) fetchPosts(activeGroup.id).then(setLocalPosts)
    } catch {
      toast('Could not post', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleJoinPost = async (postId) => {
    if (myJoins.has(postId)) {
      // Leave
      try {
        await leavePost(postId)
        setMyJoins(prev => { const s = new Set(prev); s.delete(postId); return s })
        setLocalPosts(prev => prev.map(p => p.id === postId ? { ...p, _joinCount: Math.max(0, (p._joinCount || 0) - 1) } : p))
      } catch {
        toast('Could not update', 'error')
      }
    } else {
      // Join
      try {
        const count = await joinPost(postId)
        setMyJoins(prev => new Set([...prev, postId]))
        setLocalPosts(prev => prev.map(p => p.id === postId ? { ...p, _joinCount: count } : p))
      } catch {
        toast('Could not join', 'error')
      }
    }
  }

  if (loading) return (
    <div className="view-enter">
      <ScallopHeader title="COMMUNITY" />
      <div className="empty-state"><p>Loading...</p></div>
    </div>
  )

  return (
    <div className="view-enter">
      <ScallopHeader title="COMMUNITY" />

      {groups.length === 0 ? (
        <div style={{ padding: '48px 24px', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 48 }}>👨‍👩‍👧‍👦</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: C.textDark, textAlign: 'center' }}>
            Connect with families
          </div>
          <div style={{ fontSize: 14, color: C.textDark, opacity: 0.6, textAlign: 'center', lineHeight: 1.6 }}>
            Create a group or join one to share activities and plans.
          </div>
          <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setShowCreateGroup(true)}>Create a Group</button>
          <button className="btn-outline" onClick={() => setShowJoinGroup(true)}>Join with Code</button>
        </div>
      ) : (
        <>
          {/* Group chips */}
          <div style={{ padding: '16px 20px 0' }}>
            <div className="chip-row">
              {groups.map(g => (
                <button
                  key={g.id}
                  className={`chip${activeGroup?.id === g.id ? ' active' : ''}`}
                  onClick={() => handleSelectGroup(g)}
                >
                  {g.name}
                </button>
              ))}
              <button className="chip" onClick={() => setShowJoinGroup(true)}>+ Join</button>
              <button className="chip" onClick={() => setShowCreateGroup(true)}>+ New</button>
            </div>
          </div>

          {/* Posts */}
          <div style={{ padding: '20px 20px' }}>
            {!activeGroup ? (
              <div className="empty-state"><p>Select a group to see posts.</p></div>
            ) : localPosts.length === 0 ? (
              <div className="empty-state">
                <p>No posts yet — tap + to share something!</p>
              </div>
            ) : (
              localPosts.map((post, i) => {
                const place = places.find(p => p.id === post.place_id)
                const joinCount = post._joinCount ?? (post.post_joins?.[0]?.count ?? 0)
                const joined = myJoins.has(post.id)
                return (
                  <div key={post.id} className="card list-item" style={{ marginBottom: 12, animationDelay: `${i * 0.05}s` }}>
                    <div style={{ fontSize: 14, color: C.textDark, lineHeight: 1.5, marginBottom: 8 }}>
                      {post.message}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      {post.activity_date && (
                        <span style={{ fontSize: 12, color: C.textDark, opacity: 0.6 }}>
                          📅 {post.activity_date}{post.activity_time ? ` at ${post.activity_time}` : ''}
                        </span>
                      )}
                      {place && (
                        <span style={{ fontSize: 12, color: C.textDark, opacity: 0.6 }}>📍 {place.name}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: C.textDark, opacity: 0.5 }}>{joinCount} joining</span>
                      <button
                        onClick={() => handleJoinPost(post.id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 20,
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: 13,
                          background: joined ? C.accent : C.primary,
                          color: C.white,
                          transition: 'background 0.2s ease',
                        }}
                      >
                        {joined ? "You're in ✓" : "I'm in!"}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {activeGroup && (
            <button className="fab" onClick={() => setShowNewPost(true)} aria-label="New post">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
        </>
      )}

      {/* New Post modal */}
      <Modal isOpen={showNewPost} onClose={() => setShowNewPost(false)} title="Share with Group">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label" htmlFor="post-msg">Message *</label>
            <textarea
              id="post-msg"
              className="input-field"
              placeholder="What are you planning?"
              value={postForm.message}
              onChange={e => setPostForm(f => ({ ...f, message: e.target.value }))}
              style={{ minHeight: 80, resize: 'vertical' }}
            />
          </div>
          {groups.length > 1 && !activeGroup && (
            <div>
              <label className="field-label" htmlFor="post-group">Group</label>
              <select id="post-group" className="input-field">
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="field-label" htmlFor="post-date">Date</label>
              <input id="post-date" type="date" className="input-field" value={postForm.activity_date} onChange={e => setPostForm(f => ({ ...f, activity_date: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="post-time">Time</label>
              <input id="post-time" type="time" className="input-field" value={postForm.activity_time} onChange={e => setPostForm(f => ({ ...f, activity_time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="post-place">Place</label>
            <select id="post-place" className="input-field" value={postForm.place_id} onChange={e => setPostForm(f => ({ ...f, place_id: e.target.value }))}>
              <option value="">None</option>
              {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={handleCreatePost} disabled={saving}>
            {saving ? 'Sharing...' : 'Share Post'}
          </button>
        </div>
      </Modal>

      {/* Join Group modal */}
      <Modal isOpen={showJoinGroup} onClose={() => setShowJoinGroup(false)} title="Join a Group">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label" htmlFor="invite-code">Invite Code</label>
            <input
              id="invite-code"
              className="input-field"
              placeholder="6-character code"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              maxLength={6}
              style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}
            />
          </div>
          <button className="btn-primary" onClick={handleJoinGroup} disabled={saving}>
            {saving ? 'Joining...' : 'Join Group'}
          </button>
        </div>
      </Modal>

      {/* Create Group modal */}
      <Modal isOpen={showCreateGroup} onClose={() => { setShowCreateGroup(false); setCreatedGroup(null) }} title="Create a Group">
        {createdGroup ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 40 }}>🎉</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: C.textDark }}>
              {createdGroup.name} created!
            </div>
            <div style={{ fontSize: 14, color: C.textDark, opacity: 0.6 }}>Share this code with others to join:</div>
            <div style={{
              padding: '16px 24px',
              background: C.primary,
              borderRadius: 12,
              fontFamily: 'monospace',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: C.accent,
            }}>
              {createdGroup.invite_code}
            </div>
            <button className="btn-primary" onClick={() => {
              navigator.clipboard?.writeText(createdGroup.invite_code).catch(() => {})
              toast('Code copied!')
            }}>
              Copy Code
            </button>
            <button className="btn-ghost" onClick={() => { setShowCreateGroup(false); setCreatedGroup(null) }}>Done</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="field-label" htmlFor="group-name">Group Name</label>
              <input id="group-name" className="input-field" placeholder="e.g. Park Moms" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={handleCreateGroup} disabled={saving}>
              {saving ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
