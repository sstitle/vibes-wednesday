import { useCallback, useMemo, useRef, useState } from 'react'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  createdAt: number
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ChatPane() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending])

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => [...prev, msg])
  }, [])

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || isSending) return

    // Add user message
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      text,
      createdAt: Date.now(),
    }
    appendMessage(userMsg)
    setInput('')
    setIsSending(true)

    // Stubbed assistant echo to show flow
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        text: `Noted: ${text}`,
        createdAt: Date.now(),
      }
      appendMessage(assistantMsg)
      setIsSending(false)
      // Return focus to input
      inputRef.current?.focus()
    }, 300)
  }, [appendMessage, input, isSending])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div className="chat-pane">
      <div className="chat-header">Chat</div>
      <div className="chat-body">
        {messages.length === 0 ? (
          <div className="chat-empty">Start by typing a message…</div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`message ${m.role}`}>
              <div className="bubble">{m.text}</div>
            </div>
          ))
        )}
      </div>
      <div className="chat-footer">
        <input
          ref={inputRef}
          className="chat-input"
          placeholder={isSending ? 'Sending…' : 'Type a message…'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />
        <button className="chat-send" onClick={handleSend} disabled={!canSend}>
          {isSending ? '…' : 'Send'}
        </button>
      </div>
    </div>
  )
}

export default ChatPane 