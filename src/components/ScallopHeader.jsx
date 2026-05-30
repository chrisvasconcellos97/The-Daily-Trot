import C from '../colors'
import { AwningGreen } from './Awning'

function IconBtn({ children, onClick, style, ...rest }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 30, height: 30, borderRadius: '50%',
        border: `1px solid ${C.goldLight}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: C.bgLight,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

export { IconBtn }

export default function ScallopHeader({ title, subtitle, leading, trailing, onBack }) {
  // legacy onBack support — wrap in IconBtn if passed
  const leadingEl = leading ?? (onBack ? (
    <IconBtn>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </IconBtn>
  ) : null)

  return (
    <div style={{ position: 'relative', flexShrink: 0, width: '100%' }}>
      <AwningGreen/>
      <div style={{
        position: 'absolute',
        top: 'calc(34% - 18px)',
        left: 0, right: 0, height: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 22px',
        pointerEvents: 'auto',
      }}>
        <div style={{ width: 32, color: C.bgLight }}>{leadingEl}</div>
        <div style={{
          flex: 1, textAlign: 'center',
          fontFamily: C.serif, color: C.bgLight,
          fontWeight: 600, letterSpacing: '0.18em', lineHeight: 1.1,
        }}>
          {subtitle ? (
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.25em', opacity: 0.7, marginBottom: 2 }}>{subtitle}</div>
              <div style={{ fontSize: 15 }}>{title}</div>
            </div>
          ) : (
            <div style={{ fontSize: 16 }}>{title}</div>
          )}
        </div>
        <div style={{ width: 32, color: C.bgLight, textAlign: 'right' }}>{trailing}</div>
      </div>
    </div>
  )
}
