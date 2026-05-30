import C from '../colors'

export { IconBtn } from './ScallopHeader'

export default function SimpleHeader({ title, subtitle, leading, trailing }) {
  return (
    <div style={{
      background: C.bg,
      paddingTop: 52,
      paddingBottom: 12,
      paddingLeft: 18,
      paddingRight: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ width: 32 }}>{leading ?? <span/>}</div>
      <div style={{ flex: 1, textAlign: 'center' }}>
        {subtitle && (
          <div style={{ fontFamily: C.serif, fontSize: 10, letterSpacing: '0.28em', color: C.primary, opacity: 0.65, marginBottom: 1 }}>{subtitle}</div>
        )}
        <div style={{ fontFamily: C.serif, fontSize: 16, letterSpacing: '0.18em', color: C.primary, fontWeight: 700 }}>{title}</div>
      </div>
      <div style={{ width: 32, display: 'flex', justifyContent: 'flex-end' }}>{trailing ?? <span/>}</div>
    </div>
  )
}
