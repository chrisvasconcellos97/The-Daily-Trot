import { useState, useRef, useEffect } from 'react'
import ScallopHeader, { IconBtn } from '../components/ScallopHeader'
import C from '../colors'
import Lillie from '../components/Lillie'

function PromptIcon({ kind }) {
  const s = { fill: 'none', stroke: C.primary, strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (kind) {
    case 'cal': return <svg viewBox="0 0 24 24" width="16" height="16" {...s}><rect x="3" y="6" width="18" height="15" rx="1.5"/><path d="M3 10h18M8 4v4M16 4v4"/></svg>
    case 'list': return <svg viewBox="0 0 24 24" width="16" height="16" {...s}><rect x="6" y="3" width="13" height="18" rx="1.5"/><path d="M9 8h7M9 12h7M9 16h5"/></svg>
    case 'book': return <svg viewBox="0 0 24 24" width="16" height="16" {...s}><path d="M4 5c2-.5 5-.5 8 1 3-1.5 6-1.5 8-1v14c-2-.5-5-.5-8 1-3-1.5-6-1.5-8-1V5z"/><path d="M12 6v14"/></svg>
    case 'fork': return <svg viewBox="0 0 24 24" width="16" height="16" {...s}><path d="M8 3v6a2 2 0 002 2v9M8 3v3M11 3v3"/><path d="M15 3c-1 2-1 6 0 8h1v9"/></svg>
    default: return null
  }
}

const PROMPT_CARDS = [
  { text: "What's on our schedule?", icon: 'cal' },
  { text: 'Remind me what we need for the park.', icon: 'list' },
  { text: 'Find library storytime this week.', icon: 'book' },
  { text: "What's for dinner tonight?", icon: 'fork' },
]

export default function LillieView({ familyId, session, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const rawName = session?.user?.email?.split('@')[0] || 'there'
  const firstName = rawName.split(/[._]/)[0].charAt(0).toUpperCase() + rawName.split(/[._]/)[0].slice(1)

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
      setMessages(m => [...m, { role: 'assistant', content: "Lillie's having trouble — try again in a sec." }])
    } finally {
      setLoading(false)
    }
  }

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
      <ScallopHeader
        title="LILLIE"
        leading={
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            aria-label="Close Lillie"
          >
            <IconBtn>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </IconBtn>
          </button>
        }
        trailing={
          <IconBtn>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="6" cy="12" r="1.2" fill="currentColor"/>
              <circle cx="12" cy="12" r="1.2" fill="currentColor"/>
              <circle cx="18" cy="12" r="1.2" fill="currentColor"/>
            </svg>
          </IconBtn>
        }
      />

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Idle/welcome state */}
        {messages.length === 0 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, paddingBottom: 8 }}>
              <div style={{
                width: 76, height: 76, borderRadius: '50%',
                border: `1.5px solid ${C.gold}`,
                background: C.bgLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Lillie size={54} />
              </div>
              <div style={{ fontFamily: C.serif, fontSize: 18, color: C.ink, fontWeight: 600, marginTop: 14 }}>Hi {firstName}!</div>
              <div style={{ fontFamily: C.serif, fontSize: 13, color: C.inkSoft, marginTop: 2 }}>How can I help you today?</div>
            </div>

            {/* Prompt cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {PROMPT_CARDS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(p.text)}
                  style={{
                    background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
                    padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <PromptIcon kind={p.icon}/>
                  <div style={{ fontFamily: C.serif, fontSize: 12.5, color: C.ink }}>{p.text}</div>
                </button>
              ))}
            </div>
          </>
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
            {msg.role === 'assistant' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: C.bgLight, border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Lillie size={20} />
              </div>
            )}
            <div
              style={{
                maxWidth: '78%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? C.primary : C.card,
                border: msg.role === 'assistant' ? `1px solid ${C.border}` : 'none',
                color: msg.role === 'user' ? C.bgLight : C.ink,
                fontFamily: C.serif,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: C.bgLight, border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Lillie size={20} />
            </div>
            <div style={{
              padding: '12px 16px',
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: '16px 16px 16px 4px',
            }}>
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input bar — 38px pill */}
      <div style={{
        padding: '12px 18px',
        borderTop: `1px solid ${C.border}`,
        background: C.bg,
      }}>
        <div style={{
          height: 38, borderRadius: 19,
          background: C.bgLight, border: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', padding: '0 14px',
          gap: 8,
        }}>
          <input
            style={{
              flex: 1, fontFamily: C.serif, fontSize: 12, color: C.inkMuted, fontStyle: 'italic',
              background: 'none', border: 'none', outline: 'none',
            }}
            placeholder="Ask Lillie anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !loading) sendMessage(input) }}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading}
            style={{ background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, padding: 0, display: 'flex', alignItems: 'center' }}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.primary} strokeWidth="1.6">
              <path d="M3 12l18-9-7 18-3-7-8-2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
