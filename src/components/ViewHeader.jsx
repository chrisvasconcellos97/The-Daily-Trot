import C from '../colors'

export function IconBtn({ onClick, children, style }) {
  return (
    <button onClick={onClick} style={{
      width: 34, height: 34, borderRadius: '50%',
      background: 'rgba(31,61,43,0.08)', border: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', color: C.primary, flexShrink: 0, ...style,
    }}>
      {children}
    </button>
  )
}

export default function ViewHeader({ title, subtitle, onBack, trailing }) {
  return (
    <div style={{ background: C.bg, paddingTop: 52, paddingBottom: 4, flexShrink: 0 }}>
      {/* top bar: back + trailing */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px 10px' }}>
        <div style={{ width: 34 }}>
          {onBack && (
            <IconBtn onClick={onBack}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </IconBtn>
          )}
        </div>
        <div style={{ width: 34 }}>{trailing ?? <span/>}</div>
      </div>
      {/* editorial title block */}
      <div style={{ padding: '0 20px 16px' }}>
        {subtitle && (
          <div style={{ fontFamily: C.sans, fontSize: 9, letterSpacing: '0.22em', color: C.goldDark, fontWeight: 600, marginBottom: 4 }}>
            {subtitle}
          </div>
        )}
        <div style={{ fontFamily: C.serif, fontSize: 32, fontWeight: 700, color: C.primary, lineHeight: 1.1, letterSpacing: '0.02em' }}>
          {title}
        </div>
        {/* gold accent bar */}
        <div style={{ width: 36, height: 2.5, background: C.gold, borderRadius: 2, marginTop: 10 }}/>
      </div>
    </div>
  )
}
