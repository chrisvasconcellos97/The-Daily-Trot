import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import SimpleHeader, { IconBtn } from '../components/SimpleHeader'
import Modal from '../components/Modal'
import { useChildren } from '../hooks/useChildren'
import C from '../colors'
import Lillie from '../components/Lillie'

function randomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function formatDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${day}`
}

function formatTime12(t) {
  if (!t) return ''
  const [h, min] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(min).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

function calcAvgAge(kidsJson) {
  if (!kidsJson || !Array.isArray(kidsJson) || kidsJson.length === 0) return null
  const ages = kidsJson.filter(k => k.age != null).map(k => Number(k.age))
  if (!ages.length) return null
  return (ages.reduce((s, a) => s + a, 0) / ages.length).toFixed(1)
}

export default function CommunityView({ familyId, toast, session }) {
  const { children } = useChildren(familyId)
  const userId = session?.user?.id

  const [communityId, setCommunityId] = useState(() => localStorage.getItem('tdt_community_id'))
  const [community, setCommunity] = useState(null)
  const [posts, setPosts] = useState([])
  const [rsvps, setRsvps] = useState({})
  const [loading, setLoading] = useState(true)
  const [myRsvps, setMyRsvps] = useState({})

  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [showPost, setShowPost] = useState(false)
  const [showCode, setShowCode] = useState(false)

  const [groupName, setGroupName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [postForm, setPostForm] = useState({ place_name: '', post_date: '', post_time: '', notes: '', kids: [] })
  const [saving, setSaving] = useState(false)

  const loadCommunity = useCallback(async (id) => {
    if (!id) { setLoading(false); return }
    const { data: comm } = await supabase.from('communities').select('*').eq('id', id).single()
    if (!comm) {
      localStorage.removeItem('tdt_community_id')
      setCommunityId(null)
      setLoading(false)
      return
    }
    setCommunity(comm)

    const today = new Date().toISOString().slice(0, 10)
    const { data: postData } = await supabase
      .from('community_posts')
      .select('*')
      .eq('community_id', id)
      .gte('post_date', today)
      .order('post_date', { ascending: true })
    setPosts(postData || [])

    if (postData?.length) {
      const postIds = postData.map(p => p.id)
      const { data: rsvpData } = await supabase
        .from('community_rsvps')
        .select('*')
        .in('post_id', postIds)

      const grouped = {}
      const mine = {}
      ;(rsvpData || []).forEach(r => {
        if (!grouped[r.post_id]) grouped[r.post_id] = []
        grouped[r.post_id].push(r)
        if (r.user_id === userId) mine[r.post_id] = r.status
      })
      setRsvps(grouped)
      setMyRsvps(mine)
    }

    setLoading(false)
  }, [userId])

  useEffect(() => { loadCommunity(communityId) }, [communityId, loadCommunity])

  const handleCreate = async () => {
    if (!groupName.trim()) { toast('Name required', 'error'); return }
    setSaving(true)
    try {
      const code = randomCode()
      const { data: comm, error } = await supabase
        .from('communities')
        .insert({ name: groupName.trim(), invite_code: code, created_by: userId })
        .select()
        .single()
      if (error) throw error

      await supabase.from('community_members').insert({
        community_id: comm.id, user_id: userId, family_id: familyId,
      })

      localStorage.setItem('tdt_community_id', comm.id)
      setCommunityId(comm.id)
      setCommunity(comm)
      setGroupName('')
      setShowCreate(false)
      setShowCode(true)
    } catch {
      toast('Could not create group', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) { toast('Enter a code', 'error'); return }
    setSaving(true)
    try {
      const { data: comm, error } = await supabase
        .from('communities')
        .select('*')
        .eq('invite_code', joinCode.trim().toUpperCase())
        .single()
      if (error || !comm) throw new Error('not found')

      await supabase.from('community_members').upsert({
        community_id: comm.id, user_id: userId, family_id: familyId,
      }, { onConflict: 'community_id,user_id' })

      localStorage.setItem('tdt_community_id', comm.id)
      setCommunityId(comm.id)
      setCommunity(comm)
      setJoinCode('')
      setShowJoin(false)
      toast('Joined!')
    } catch {
      toast('Group not found', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePost = async () => {
    if (!postForm.place_name.trim() || !postForm.post_date) {
      toast('Place and date are required', 'error'); return
    }
    setSaving(true)
    try {
      const kidsGoing = postForm.kids.map(id => {
        const c = children.find(ch => ch.id === id)
        if (!c) return null
        const birth = c.birthdate ? new Date(c.birthdate) : null
        const age = birth ? Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : null
        return { id: c.id, name: c.name, age }
      }).filter(Boolean)

      const { data: row, error } = await supabase
        .from('community_posts')
        .insert({
          community_id: communityId,
          family_id: familyId,
          user_id: userId,
          place_name: postForm.place_name.trim(),
          post_date: postForm.post_date,
          post_time: postForm.post_time || null,
          notes: postForm.notes || null,
          kids_going: kidsGoing,
        })
        .select()
        .single()
      if (error) throw error

      setPosts(prev => [...prev, row].sort((a, b) => a.post_date.localeCompare(b.post_date)))
      setPostForm({ place_name: '', post_date: '', post_time: '', notes: '', kids: [] })
      setShowPost(false)
      toast('Posted!')
    } catch {
      toast('Could not post', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleRsvp = async (postId, status) => {
    const current = myRsvps[postId]
    const newStatus = current === status ? null : status
    try {
      if (newStatus) {
        await supabase.from('community_rsvps').upsert({
          post_id: postId, user_id: userId, family_id: familyId, status: newStatus, updated_at: new Date().toISOString(),
        }, { onConflict: 'post_id,user_id' })
        setMyRsvps(prev => ({ ...prev, [postId]: newStatus }))

        setRsvps(prev => {
          const existing = (prev[postId] || []).filter(r => r.user_id !== userId)
          return { ...prev, [postId]: [...existing, { user_id: userId, family_id: familyId, status: newStatus }] }
        })
      } else {
        await supabase.from('community_rsvps').delete().eq('post_id', postId).eq('user_id', userId)
        setMyRsvps(prev => { const n = { ...prev }; delete n[postId]; return n })
        setRsvps(prev => ({ ...prev, [postId]: (prev[postId] || []).filter(r => r.user_id !== userId) }))
      }
    } catch {
      toast('Could not update RSVP', 'error')
    }
  }

  if (loading) return (
    <div className="view-enter">
      <SimpleHeader title="COMMUNITY" />
      <div className="empty-state"><p>Loading...</p></div>
    </div>
  )

  if (!communityId || !community) {
    return (
      <div className="view-enter">
        <SimpleHeader title="COMMUNITY" />
        <div style={{ padding: '60px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <Lillie size={52} opacity={0.7} />
          <div style={{ fontFamily: C.serif, fontSize: 22, color: C.ink, fontWeight: 600, marginTop: 8 }}>Find your village.</div>
          <div style={{ fontFamily: C.sans, fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>
            Create a group or join one with an invite code.
          </div>
          <button
            className="btn-primary"
            style={{ marginTop: 12, width: '100%', maxWidth: 280 }}
            onClick={() => setShowCreate(true)}
          >Create a Group</button>
          <button
            className="btn-ghost"
            style={{ width: '100%', maxWidth: 280 }}
            onClick={() => setShowJoin(true)}
          >Join with Code</button>
        </div>

        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create a Group">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="field-label" htmlFor="grp-name">Group Name</label>
              <input id="grp-name" className="input-field" placeholder="e.g. Park Crew" value={groupName} onChange={e => setGroupName(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create Group'}</button>
          </div>
        </Modal>

        <Modal isOpen={showJoin} onClose={() => setShowJoin(false)} title="Join a Group">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="field-label" htmlFor="join-code">Invite Code</label>
              <input
                id="join-code" className="input-field"
                placeholder="6-char code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}
              />
            </div>
            <button className="btn-primary" onClick={handleJoin} disabled={saving}>{saving ? 'Joining...' : 'Join Group'}</button>
          </div>
        </Modal>
      </div>
    )
  }

  return (
    <div className="view-enter" style={{ paddingBottom: 100 }}>
      <SimpleHeader
        title="COMMUNITY"
        trailing={
          <IconBtn onClick={() => setShowCode(true)} style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </IconBtn>
        }
      />

      <div style={{ padding: '12px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: C.serif, fontSize: 17, color: C.ink, fontWeight: 600 }}>{community.name}</div>
        <button
          onClick={() => { navigator.clipboard?.writeText(community.invite_code).catch(() => {}); toast('Code copied!') }}
          style={{
            padding: '4px 10px', borderRadius: 10, border: `1px solid ${C.border}`,
            background: C.card, fontFamily: C.sans, fontSize: 11, fontWeight: 700,
            color: C.goldDark, cursor: 'pointer', letterSpacing: '0.1em',
          }}
        >{community.invite_code}</button>
      </div>

      <div style={{ padding: '14px 18px' }}>
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>No upcoming outings — tap + to post one.</p>
          </div>
        ) : (
          posts.map((post, i) => {
            const postRsvps = rsvps[post.id] || []
            const goingCount = postRsvps.filter(r => r.status === 'going').length
            const myStatus = myRsvps[post.id]

            const allKids = [
              ...(post.kids_going || []),
              ...postRsvps.filter(r => r.status === 'going' && r.kids_going?.length).flatMap(r => r.kids_going),
            ]
            const avgAge = calcAvgAge(allKids)

            return (
              <div
                key={post.id}
                className="list-item"
                style={{
                  background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                  padding: '14px 16px', marginBottom: 10, animationDelay: `${i * 0.04}s`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontFamily: C.serif, fontSize: 16, color: C.ink, fontWeight: 600 }}>{post.place_name}</div>
                  {avgAge && (
                    <div style={{
                      padding: '2px 8px', borderRadius: 10, background: C.primary,
                      fontFamily: C.sans, fontSize: 9, color: C.bgLight, fontWeight: 600,
                    }}>Avg {avgAge} yrs</div>
                  )}
                </div>
                <div style={{ fontFamily: C.sans, fontSize: 11, color: C.inkMuted, marginBottom: 4 }}>
                  {formatDate(post.post_date)}{post.post_time ? ' · ' + formatTime12(post.post_time) : ''}
                </div>
                {post.notes && (
                  <div style={{ fontFamily: C.sans, fontSize: 12, color: C.inkSoft, marginBottom: 8 }}>{post.notes}</div>
                )}
                {post.kids_going?.length > 0 && (
                  <div style={{ fontFamily: C.sans, fontSize: 11, color: C.inkMuted, marginBottom: 8 }}>
                    {post.kids_going.map(k => k.name).join(', ')} going
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontFamily: C.sans, fontSize: 11, color: C.inkMuted, marginRight: 4 }}>
                    {goingCount} going
                  </span>
                  {['going', 'maybe', 'not_going'].map(s => (
                    <button
                      key={s}
                      onClick={() => handleRsvp(post.id, s)}
                      style={{
                        padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                        border: `1px solid ${myStatus === s ? C.primary : C.border}`,
                        background: myStatus === s ? C.primary : 'transparent',
                        color: myStatus === s ? C.bgLight : C.inkSoft,
                        fontFamily: C.sans, fontSize: 10, fontWeight: 600,
                      }}
                    >{s === 'going' ? 'Going' : s === 'maybe' ? 'Maybe' : 'Can\'t'}</button>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      <button
        className="fab"
        onClick={() => setShowPost(true)}
        aria-label="Post outing"
        style={{ bottom: 110 }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={C.bgLight} strokeWidth="1.8">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>

      <Modal isOpen={showPost} onClose={() => setShowPost(false)} title="Post Outing">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="field-label" htmlFor="po-place">Place *</label>
            <input id="po-place" className="input-field" placeholder="e.g. Riverside Park" value={postForm.place_name} onChange={e => setPostForm(f => ({ ...f, place_name: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="field-label" htmlFor="po-date">Date *</label>
              <input id="po-date" type="date" className="input-field" value={postForm.post_date} onChange={e => setPostForm(f => ({ ...f, post_date: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="po-time">Time</label>
              <input id="po-time" type="time" className="input-field" value={postForm.post_time} onChange={e => setPostForm(f => ({ ...f, post_time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="po-notes">Notes</label>
            <input id="po-notes" className="input-field" placeholder="Any details..." value={postForm.notes} onChange={e => setPostForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          {children.length > 0 && (
            <div>
              <label className="field-label">Kids going</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setPostForm(f => ({
                      ...f,
                      kids: f.kids.includes(child.id) ? f.kids.filter(id => id !== child.id) : [...f.kids, child.id],
                    }))}
                    style={{
                      padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
                      border: `1px solid ${postForm.kids.includes(child.id) ? C.primary : C.border}`,
                      background: postForm.kids.includes(child.id) ? C.primary : 'transparent',
                      color: postForm.kids.includes(child.id) ? C.bgLight : C.inkSoft,
                      fontFamily: C.sans, fontSize: 11, fontWeight: 600,
                    }}
                  >{child.name}</button>
                ))}
              </div>
            </div>
          )}
          <button className="btn-primary" onClick={handlePost} disabled={saving}>{saving ? 'Posting...' : 'Post Outing'}</button>
        </div>
      </Modal>

      <Modal isOpen={showCode} onClose={() => setShowCode(false)} title="Invite Code">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontFamily: C.sans, fontSize: 13, color: C.inkSoft }}>Share this code with other families to join {community.name}:</div>
          <div style={{
            padding: '16px 28px', background: C.primary, borderRadius: 12,
            fontFamily: 'monospace', fontSize: 28, fontWeight: 700, letterSpacing: '0.15em', color: C.bgLight,
          }}>{community.invite_code}</div>
          <button className="btn-primary" onClick={() => { navigator.clipboard?.writeText(community.invite_code).catch(() => {}); toast('Code copied!'); setShowCode(false) }}>
            Copy Code
          </button>
          <button className="btn-ghost" onClick={() => setShowCode(false)}>Done</button>
        </div>
      </Modal>

      <Modal isOpen={showJoin} onClose={() => setShowJoin(false)} title="Join a Group">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="field-label" htmlFor="j-code">Invite Code</label>
            <input id="j-code" className="input-field" placeholder="6-char code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={6} style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }} />
          </div>
          <button className="btn-primary" onClick={handleJoin} disabled={saving}>{saving ? 'Joining...' : 'Join Group'}</button>
        </div>
      </Modal>
    </div>
  )
}
