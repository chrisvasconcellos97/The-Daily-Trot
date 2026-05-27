export default function SceneVignette({ width = 240 }) {
  return (
    <img
      src="/scene-vignette.png"
      alt=""
      style={{
        position: 'fixed',
        bottom: 78,
        left: '50%',
        transform: 'translateX(-50%)',
        width,
        maxWidth: '56%',
        pointerEvents: 'none',
        zIndex: 0,
        display: 'block',
      }}
    />
  )
}
