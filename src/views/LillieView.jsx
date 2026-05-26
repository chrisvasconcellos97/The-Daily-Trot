import { useState, useRef, useEffect } from 'react'
import C from '../colors'

export default function LillieView({ familyId, session, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const firstName = session?.user?.email
    ? session.user.email.split('@')[0].charAt(0).toUpperCase() + session.user.email.split('@')[0].slice(1)
    : 'there'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const newMessages = [...messages, { role: 'user', content: trimmed }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/lillie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, familyId }),
      })
      const data = await res.json()
      if (data.content) {
        setMessages(m => [...m, { role: 'assistant', content: data.content }])
      } else {
        throw new Error(data.error || 'No response')
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "Lillie's having trouble — try again in a sec. 🐾" }])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    "What's on our schedule?",
    "What do we need for the park?",
    "Find us something to do today.",
    "Help me make a packing list.",
  ]

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 300,
      background: C.bg,
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 430,
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ background: C.primary, padding: '20px 20px 32px', position: 'relative', flexShrink: 0 }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 52,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            padding: 8,
          }}
          aria-label="Close Lillie"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: C.accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          LILLIE
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Your family AI companion</div>
        <svg viewBox="0 0 430 20" style={{ position: 'absolute', bottom: -19, left: 0, width: '100%', display: 'block' }} aria-hidden="true">
          <path d="M0,0 Q10.75,20 21.5,0 Q32.25,20 43,0 Q53.75,20 64.5,0 Q75.25,20 86,0 Q96.75,20 107.5,0 Q118.25,20 129,0 Q139.75,20 150.5,0 Q161.25,20 172,0 Q182.75,20 193.5,0 Q204.25,20 215,0 Q225.75,20 236.5,0 Q247.25,20 258,0 Q268.75,20 279.5,0 Q290.25,20 301,0 Q311.75,20 322.5,0 Q333.25,20 344,0 Q354.75,20 365.5,0 Q376.25,20 387,0 Q397.75,20 408.5,0 Q419.25,20 430,0 Z" fill={C.bg} />
        </svg>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Greeting */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 24, flexShrink: 0 }}>🐕</div>
          <div className="card" style={{ maxWidth: '80%' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: 15, color: C.textDark }}>
              Hi {firstName}! How can I help your family today?
            </div>
          </div>
        </div>

        {/* Quick actions */}
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {quickActions.map(action => (
              <button
                key={action}
                className="btn-outline"
                style={{ textAlign: 'left', padding: '10px 14px', fontSize: 14, fontWeight: 400 }}
                onClick={() => sendMessage(action)}
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}
          >
            {msg.role === 'assistant' && <div style={{ fontSize: 20, flexShrink: 0 }}>🐕</div>}
            <div
              style={{
                maxWidth: '78%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? C.primary : C.card,
                color: msg.role === 'user' ? C.white : C.textDark,
                fontSize: 14,
                lineHeight: 1.5,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ fontSize: 20 }}>🐕</div>
            <div className="card" style={{ padding: '12px 16px' }}>
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}`, background: C.bg, display: 'flex', gap: 10 }}>
        <input
          className="input-field"
          style={{ flex: 1 }}
          placeholder="Ask Lillie anything..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !loading) sendMessage(input) }}
          disabled={loading}
        />
        <button
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: C.primary,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading ? 0.5 : 1,
            flexShrink: 0,
          }}
          onClick={() => sendMessage(input)}
          disabled={loading}
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
