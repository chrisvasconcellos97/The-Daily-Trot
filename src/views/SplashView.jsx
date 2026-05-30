import C from '../colors'
import { AwningCream } from '../components/Awning'
import Lillie from '../components/Lillie'

function Divider({ width = 100 }) {
  const mid = width / 2
  return (
    <svg width={width} height="12" viewBox={`0 0 ${width} 12`} style={{ display: 'block' }}>
      <line x1="0" y1="6" x2={mid - 8} y2="6" stroke="#B5986A" strokeWidth="0.6"/>
      <line x1={mid + 8} y1="6" x2={width} y2="6" stroke="#B5986A" strokeWidth="0.6"/>
      <g transform={`translate(${mid}, 6) rotate(45)`}>
        <rect x="-3" y="-3" width="6" height="6" fill="none" stroke="#B5986A" strokeWidth="0.7"/>
      </g>
    </svg>
  )
}

export default function SplashView({ onDone }) {
  const handleDone = (mode) => {
    localStorage.setItem('tdt_splash', '1')
    onDone(mode)
  }

  return (
    <div style={{
      height: '100vh',
      background: C.bg,
      overflow: 'hidden',
      position: 'relative',
      maxWidth: 430,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <AwningCream/>

      {/* Content column */}
      <div style={{
        paddingTop: 32,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        flex: 1,
      }}>
        <Lillie size={58} />
        <div style={{
          fontFamily: C.serif, fontSize: 15, letterSpacing: '0.22em',
          color: C.primary, marginTop: 18, fontWeight: 500,
        }}>THE</div>
        <div style={{
          fontFamily: C.serif, fontSize: 32, letterSpacing: '0.08em',
          color: C.primary, fontWeight: 700, marginTop: 2, lineHeight: 1,
        }}>DAILY TROT</div>
        <div style={{ marginTop: 20 }}><Divider width={100}/></div>
        <div style={{
          fontFamily: C.serif, fontSize: 18,
          color: C.primary, marginTop: 18, fontWeight: 500,
        }}>Simple plans.</div>
        <div style={{
          fontFamily: C.serif, fontStyle: 'italic', fontSize: 18,
          color: C.primary, marginTop: 2, fontWeight: 500,
        }}>Smoother days.</div>
        {/* Pagination dots */}
        <div style={{ marginTop: 18, display: 'flex', gap: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.primary }}/>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.primary, opacity: 0.25 }}/>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.primary, opacity: 0.25 }}/>
        </div>
      </div>

      {/* Pill buttons at bottom */}
      <div style={{ padding: '0 26px 50px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={() => handleDone('signup')}
          style={{
            height: 46, borderRadius: 23,
            background: C.primary, border: 'none',
            color: C.bgLight,
            fontFamily: C.sans, fontSize: 11.5, letterSpacing: '0.22em', fontWeight: 600,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          GET STARTED
        </button>
        <button
          onClick={() => handleDone('login')}
          style={{
            height: 46, borderRadius: 23,
            background: 'transparent', border: `1px solid ${C.primary}`,
            color: C.primary,
            fontFamily: C.sans, fontSize: 11.5, letterSpacing: '0.22em', fontWeight: 600,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          I ALREADY HAVE AN ACCOUNT
        </button>
      </div>
    </div>
  )
}
