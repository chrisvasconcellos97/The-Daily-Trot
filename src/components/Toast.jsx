export default function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.key} className={`toast${t.type === 'error' ? ' error' : ''}`}>
          {t.msg}
        </div>
      ))}
    </div>
  )
}
