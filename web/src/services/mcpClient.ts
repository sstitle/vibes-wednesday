export interface MCPCommand {
  action: string
  payload?: any
}

export interface MCPResponse {
  success: boolean
  data?: any
  error?: string
}

export interface SceneObject {
  id: string
  type: string
  properties: {
    position?: { x: number; y: number; z: number }
    rotation?: { x: number; y: number; z: number }
    scale?: { x: number; y: number; z: number }
    materialOptions?: { color?: number; [key: string]: any }
  }
}

export class MCPClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, (data: any) => void> = new Map()
  
  constructor(url = 'ws://localhost:3000') {
    this.url = url
  }

  async connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)
        
        this.ws.onopen = () => {
          console.log('Connected to Three.js MCP server')
          this.reconnectAttempts = 0
          resolve(true)
        }
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (error) {
            console.error('Failed to parse MCP message:', error)
          }
        }
        
        this.ws.onclose = () => {
          console.log('Disconnected from MCP server')
          this.attemptReconnect()
        }
        
        this.ws.onerror = (error) => {
          console.error('MCP WebSocket error:', error)
          reject(error)
        }
        
        // Timeout after 5 seconds
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('Connection timeout'))
          }
        }, 5000)
        
      } catch (error) {
        reject(error)
      }
    })
  }

  private handleMessage(data: any) {
    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        console.error('Error in MCP message listener:', error)
      }
    })
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error)
        })
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  send(command: string, payload?: any): Promise<MCPResponse> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('MCP client not connected'))
        return
      }

      try {
        const message = {
          command,
          payload,
          id: Date.now().toString()
        }
        
        this.ws.send(JSON.stringify(message))
        
        // For now, assume success (we can enhance this with response handling later)
        resolve({ success: true, data: payload })
      } catch (error) {
        reject(error)
      }
    })
  }

  // Scene management methods
  async createScene(id: string): Promise<MCPResponse> {
    return this.send('scene.create', { id })
  }

  async clearScene(): Promise<MCPResponse> {
    return this.send('scene.clear')
  }

  async createObject(object: SceneObject): Promise<MCPResponse> {
    return this.send('object.create', object)
  }

  async updateObject(id: string, properties: Partial<SceneObject['properties']>): Promise<MCPResponse> {
    return this.send('object.update', { id, properties })
  }

  async deleteObject(id: string): Promise<MCPResponse> {
    return this.send('object.delete', { id })
  }

  async updateCamera(properties: any): Promise<MCPResponse> {
    return this.send('camera.update', properties)
  }

  async render(): Promise<MCPResponse> {
    return this.send('render')
  }

  // Connection management
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  // Event listeners
  onMessage(callback: (data: any) => void): () => void {
    const id = Math.random().toString(36)
    this.listeners.set(id, callback)
    return () => this.listeners.delete(id)
  }
}

// Singleton instance
export const mcpClient = new MCPClient() 