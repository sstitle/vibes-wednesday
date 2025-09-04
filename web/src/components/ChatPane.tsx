import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { mcpClient } from '../services/mcpClient'
import { NLPParser } from '../services/nlpParser'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
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
  const [isConnected, setIsConnected] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending])

  // Initialize MCP connection on component mount
  useEffect(() => {
    const initializeMCP = async () => {
      try {
        await mcpClient.connect()
        setIsConnected(true)
        
        // Create initial scene
        await mcpClient.createScene('main-scene')
        
        appendMessage({
          id: generateId(),
          role: 'system',
          text: '🟢 Connected to Three.js MCP server. You can now create 3D objects by typing commands like "create a red cube" or "add a blue sphere".',
          createdAt: Date.now()
        })
      } catch (error) {
        console.error('Failed to connect to MCP server:', error)
        setIsConnected(false)
        appendMessage({
          id: generateId(),
          role: 'system',
          text: '🔴 Failed to connect to MCP server. Make sure the Three.js MCP server is running on localhost:3000.',
          createdAt: Date.now()
        })
      }
    }

    initializeMCP()

    // Cleanup on unmount
    return () => {
      mcpClient.disconnect()
    }
  }, [])

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => [...prev, msg])
  }, [])

  const handleSend = useCallback(async () => {
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

    try {
      // Parse the natural language command
      const parsedCommand = NLPParser.parseMessage(text)
      
      let assistantResponse = ''
      
      if (parsedCommand.type === 'create') {
        const mcpObject = NLPParser.commandToMCPObject(parsedCommand)
        if (mcpObject) {
          await mcpClient.createObject(mcpObject)
          await mcpClient.render()
          assistantResponse = `✅ Created ${parsedCommand.objectType?.replace('Geometry', '').toLowerCase()} with ID: ${mcpObject.id}`
        } else {
          assistantResponse = '❌ Could not create object from that description.'
        }
      } else if (parsedCommand.type === 'delete') {
        if (parsedCommand.objectId === 'all') {
          await mcpClient.clearScene()
          assistantResponse = '✅ Cleared all objects from the scene.'
        } else {
          assistantResponse = '❌ Object deletion by specific ID not yet implemented.'
        }
      } else if (parsedCommand.type === 'query') {
        assistantResponse = '📋 Scene query functionality coming soon. For now, try creating objects with commands like "create a red cube".'
      } else {
        assistantResponse = `🤔 I didn't understand that command. Try: "create a [color] [shape]", "clear all", or "what's in the scene?"`
      }

      // Add assistant response
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        text: assistantResponse,
        createdAt: Date.now(),
      }
      appendMessage(assistantMsg)
      
    } catch (error) {
      console.error('Error processing command:', error)
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        createdAt: Date.now(),
      }
      appendMessage(errorMsg)
    } finally {
      setIsSending(false)
      // Return focus to input
      inputRef.current?.focus()
    }
  }, [appendMessage, input, isSending])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div className="chat-pane">
      <div className="chat-header">
        Chat {isConnected ? '🟢' : '🔴'}
      </div>
      <div className="chat-body">
        {messages.length === 0 ? (
          <div className="chat-empty">
            {isConnected 
              ? 'Start by typing a command like "create a red cube"…' 
              : 'Connecting to MCP server…'
            }
          </div>
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
          placeholder={
            isSending 
              ? 'Processing…' 
              : isConnected 
                ? 'Type a command (e.g., "create a blue sphere")…' 
                : 'Connecting…'
          }
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending || !isConnected}
        />
        <button className="chat-send" onClick={handleSend} disabled={!canSend || !isConnected}>
          {isSending ? '⏳' : '💬'}
        </button>
      </div>
    </div>
  )
}

export default ChatPane 