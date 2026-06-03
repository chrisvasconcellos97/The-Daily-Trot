import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SimpleHeader from '../components/SimpleHeader'
import Lillie from '../components/Lillie'
import C from '../colors'

function makeCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function ProfileView({ familyId, session, toast }) {
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const [inviteCode, setInviteCode] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
  }

  const handleGenerate = async () => {
    if (!familyId) { toast('No family found', 'error'); return }
    setGenerating(true)
    try {
      const code = makeCode()
      const { error } = await supabase.from('family_invites').insert({
        family_id: familyId,
        code,
        created_by: session.user.id,
      })
      if (error) throw error
      setInviteCode(code)
      toast('Invite code created!')
    } catch {
      toast("Couldn't create code — check your connection", 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!inviteCode) return
    try {
      await navigator.clipboard.writeText(inviteCode)
      toast('Code copied!')
    } catch {
      toast("Couldn't copy", 'error')
    }
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) { toast('Enter a code', 'error'); return }
    setJoining(true)
    try {
      const { data: invite } = await supabase
        .from('family_invites')
        .select('*')
        .eq('code', joinCode.trim().toUpperCase())
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (!invite) { toast('Invalid or expired code', 'error'); return }

      const { error: updateErr } = await supabase
        .from('family_members')
        .update({ family_id: invite.family_id })
        .eq('user_id', session.user.id)

      if (updateErr) throw updateErr

      await supabase.from('family_invites')
        .update({ used_at: new Date().toISOString(), used_by: session.user.id })
        .eq('id', invite.id)

      toast('Joined family!')
      window.location.reload()
    } catch {
      toast("Couldn't join — check your connection", 'error')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="view-enter">
      <SimpleHeader title="PROFILE" />
      <div style={{ padding: '32px 20px' }}>
        {/* Account email */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.ink, opacity: 0.45, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Account
          </div>
          <div style={{ fontSize: 15, color: C.ink, fontWeight: 500 }}>
            {session?.user?.email}
          </div>
        </div>

        {/* My Kids shortcut */}
        <button
          className="card"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', border: 'none', marginBottom: 12, textAlign: 'left' }}
          onClick={() => navigate('/kids')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="7" r="3.2"/>
              <path d="M5.5 21c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>My Kids</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Family Sharing */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: C.serif, fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
            Share Family
          </div>
          <div style={{ fontFamily: C.sans, fontSize: 12, color: C.inkMuted, marginBottom: 14, lineHeight: 1.4 }}>
            Invite another parent or caregiver to join your family.
          </div>

          {inviteCode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{
                background: C.bgLight, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: '14px 12px', textAlign: 'center',
                fontFamily: C.sans, fontSize: 26, fontWeight: 700,
                letterSpacing: '0.28em', color: C.primary,
              }}>
                {inviteCode}
              </div>
              <button className="btn-outline" onClick={handleCopy} style={{ fontSize: 13, fontWeight: 600 }}>
                Copy Code
              </button>
              <div style={{ fontFamily: C.sans, fontSize: 11, color: C.inkMuted, textAlign: 'center' }}>
                Expires in 7 days
              </div>
            </div>
          ) : (
            <button className="btn-primary" onClick={handleGenerate} disabled={generating} style={{ fontSize: 14 }}>
              {generating ? 'Generating…' : 'Generate Invite Code'}
            </button>
          )}

          <div className="divider" style={{ margin: '18px 0 14px' }} />

          <div style={{ fontFamily: C.sans, fontSize: 9, letterSpacing: '0.18em', color: C.goldDark, fontWeight: 600, marginBottom: 10 }}>
            JOIN A FAMILY
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input-field"
              style={{ flex: 1, marginBottom: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              placeholder="Enter code"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              maxLength={6}
            />
            <button
              className="btn-primary"
              onClick={handleJoin}
              disabled={joining}
              style={{ width: 'auto', padding: '0 20px', fontSize: 13, fontWeight: 600 }}
            >
              {joining ? '…' : 'Join'}
            </button>
          </div>
        </div>

        {/* Privacy & Data */}
        <button
          className="card"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', border: 'none', marginBottom: 12, textAlign: 'left' }}
          onClick={() => navigate('/privacy')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2"/>
              <path d="M8 11V7a4 4 0 018 0v4"/>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>Privacy & Data</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <div className="divider" style={{ margin: '20px 0' }} />

        {/* Sign out */}
        <button
          className="btn-outline"
          onClick={handleSignOut}
          disabled={signingOut}
          style={{ color: C.error, borderColor: C.error }}
        >
          {signingOut ? 'Signing out...' : 'Sign Out'}
        </button>

        {/* Version */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <div style={{ fontSize: 12, color: C.ink, opacity: 0.4, marginBottom: 8 }}>
            The Daily Trot v0.1
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Lillie size={28} />
          </div>
        </div>
      </div>
    </div>
  )
}
