import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ScallopHeader from '../components/ScallopHeader'
import C from '../colors'

export default function ProfileView({ familyId, session, toast }) {
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
  }

  return (
    <div className="view-enter">
      <ScallopHeader title="PROFILE" />
      <div style={{ padding: '32px 20px' }}>
        {/* Account email */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textDark, opacity: 0.45, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Account
          </div>
          <div style={{ fontSize: 15, color: C.textDark, fontWeight: 500 }}>
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
            <span style={{ fontSize: 20 }}>👶</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.textDark }}>My Kids</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
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
          <div style={{ fontSize: 12, color: C.textDark, opacity: 0.4, marginBottom: 8 }}>
            The Daily Trot v0.1
          </div>
          <div style={{ fontSize: 24 }}>🐕</div>
        </div>
      </div>
    </div>
  )
}
