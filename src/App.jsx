import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useToast } from './hooks/useToast'
import { useFamily } from './hooks/useFamily'
import Toast from './components/Toast'
import BottomNav from './components/BottomNav'
import SceneVignette from './components/SceneVignette'
import SplashView from './views/SplashView'
import AuthView from './views/AuthView'
import HomeView from './views/HomeView'
import TodayView from './views/TodayView'
import ScheduleView from './views/ScheduleView'
import PackingListsView from './views/PackingListsView'
import PlacesView from './views/PlacesView'
import CommunityView from './views/CommunityView'
import ProfileView from './views/ProfileView'
import KidsView from './views/KidsView'
import LibraryView from './views/LibraryView'
import LillieView from './views/LillieView'

function AppShell({ session }) {
  const { familyId, loading } = useFamily(session.user.id)
  const { toasts, toast } = useToast()
  const [lillieOpen, setLillieOpen] = useState(false)

  if (loading) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🐕</div>
          <div style={{ color: 'rgba(44,24,16,0.4)', fontSize: 14 }}>Loading your family...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toast toasts={toasts} />
      <div className="app-shell">
        <div className="view">
          <Routes>
            <Route path="/" element={<HomeView familyId={familyId} session={session} toast={toast} />} />
            <Route path="/today" element={<TodayView familyId={familyId} toast={toast} />} />
            <Route path="/schedule" element={<ScheduleView familyId={familyId} toast={toast} />} />
            <Route path="/packing" element={<PackingListsView familyId={familyId} toast={toast} />} />
            <Route path="/places" element={<PlacesView familyId={familyId} toast={toast} />} />
            <Route path="/community" element={<CommunityView familyId={familyId} toast={toast} session={session} />} />
            <Route path="/profile" element={<ProfileView familyId={familyId} session={session} toast={toast} />} />
            <Route path="/kids" element={<KidsView familyId={familyId} toast={toast} />} />
            <Route path="/library" element={<LibraryView familyId={familyId} toast={toast} />} />
          </Routes>
        </div>
        <SceneVignette />
        <BottomNav onLillie={() => setLillieOpen(true)} familyId={familyId} />
      </div>

      {lillieOpen && (
        <LillieView
          familyId={familyId}
          session={session}
          onClose={() => setLillieOpen(false)}
        />
      )}
    </>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)
  const [splashDone, setSplashDone] = useState(localStorage.getItem('tdt_splash') === '1')
  const [authMode, setAuthMode] = useState('login')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Still loading session
  if (session === undefined) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: 40 }}>🐕</div>
      </div>
    )
  }

  // Logged in — show the full app
  if (session) {
    return (
      <BrowserRouter>
        <AppShell session={session} />
      </BrowserRouter>
    )
  }

  // Not logged in — show splash or auth
  if (!splashDone) {
    return (
      <SplashView
        onDone={(mode) => {
          setSplashDone(true)
          setAuthMode(mode)
        }}
      />
    )
  }

  return <AuthView initialMode={authMode} />
}
