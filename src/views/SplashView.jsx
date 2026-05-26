import { useState } from 'react'
import C from '../colors'

const DachshundSVG = () => (
  <svg width="90" height="55" viewBox="0 0 82 50" fill={C.accent} aria-hidden="true">
    {/* Tail curves up from rump */}
    <path d="M14,25 C10,18 8,11 11,8 C14,6 16,10 15,19 Z" />
    {/* Body */}
    <ellipse cx="34" cy="27" rx="21" ry="10" />
    {/* Neck */}
    <ellipse cx="54" cy="22" rx="8" ry="7" />
    {/* Head */}
    <circle cx="65" cy="18" r="9" />
    {/* Snout */}
    <ellipse cx="76" cy="23" rx="8" ry="5" />
    {/* Floppy ear */}
    <ellipse cx="62" cy="28" rx="5" ry="9" />
    {/* Front legs */}
    <rect x="48" y="27" width="5" height="18" rx="2.5" />
    <rect x="56" y="27" width="5" height="18" rx="2.5" />
    {/* Back legs */}
    <rect x="21" y="28" width="5" height="17" rx="2.5" />
    <rect x="29" y="28" width="5" height="17" rx="2.5" />
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const slides = [0, 1, 2]

export default function SplashView({ onDone }) {
  const [slide, setSlide] = useState(0)

  const handleDone = (mode) => {
    localStorage.setItem('tdt_splash', '1')
    onDone(mode)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: C.bg, overflow: 'hidden', position: 'relative', maxWidth: 430, margin: '0 auto' }}>

      {/* Slide 0 */}
      {slide === 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: C.primary, flex: '0 0 42%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <DachshundSVG />
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: C.accent, letterSpacing: '0.1em', textAlign: 'center' }}>
              THE DAILY TROT
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: 12 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, color: C.textDark, textAlign: 'center' }}>
              Your Day. Your Family.
            </div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: 16, color: C.primary, opacity: 0.7, textAlign: 'center' }}>
              We've got the rest.
            </div>
            <div style={{ width: 48, height: 2, background: C.accent, borderRadius: 1, marginTop: 8 }} />
            <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => setSlide(1)}>
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* Slide 1 */}
      {slide === 1 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '52px 24px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 48, lineHeight: 1.2, marginBottom: 16 }}>🧺 🐰 🎨</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: C.textDark }}>
              Simple plans.
            </div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: 16, color: C.primary, marginTop: 4 }}>
              Smoother days.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            {[
              'Schedule & Reminders',
              'Packing Lists',
              'Saved Places',
              'Lillie AI Companion'
            ].map(feat => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.accentFaint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckIcon />
                </div>
                <span style={{ fontSize: 15, color: C.textDark, fontWeight: 500 }}>{feat}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={() => setSlide(2)}>
            NEXT
          </button>
        </div>
      )}

      {/* Slide 2 */}
      {slide === 2 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '52px 24px 32px', gap: 16 }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, color: C.textDark, textAlign: 'center' }}>
            Ready to get started?
          </div>
          <div style={{ fontSize: 15, color: C.textDark, opacity: 0.6, textAlign: 'center', lineHeight: 1.6 }}>
            Plan your family's days, save your favorite spots, and let Lillie help with the rest.
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            <button className="btn-primary" onClick={() => handleDone('signup')}>
              GET STARTED
            </button>
            <button className="btn-outline" onClick={() => handleDone('login')}>
              I ALREADY HAVE AN ACCOUNT
            </button>
          </div>
        </div>
      )}

      {/* Dots */}
      <div className="splash-dots" style={{ paddingBottom: 40 }}>
        {slides.map(i => (
          <div
            key={i}
            className={`splash-dot${slide === i ? ' active' : ''}`}
            onClick={() => setSlide(i)}
            role="button"
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
