import C from '../colors'

export default function Awning() {
  return (
    <img
      src="/awning-green.png"
      alt=""
      style={{
        display: 'block', width: '100%', height: 'auto',
        filter: 'drop-shadow(0 8px 10px rgba(40,30,15,0.18)) drop-shadow(0 2px 3px rgba(40,30,15,0.12))',
        flexShrink: 0,
      }}
    />
  )
}
