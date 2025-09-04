import type { SceneObject } from './mcpClient'

export interface ParsedCommand {
  type: 'create' | 'update' | 'delete' | 'query' | 'unknown'
  objectType?: string
  objectId?: string
  properties?: {
    position?: { x: number; y: number; z: number }
    rotation?: { x: number; y: number; z: number }
    scale?: { x: number; y: number; z: number }
    materialOptions?: { color?: number; [key: string]: any }
  }
  originalText: string
}

// Color name to hex mapping
const COLOR_MAP: Record<string, number> = {
  red: 0xff0000,
  green: 0x00ff00,
  blue: 0x0000ff,
  yellow: 0xffff00,
  purple: 0xff00ff,
  cyan: 0x00ffff,
  orange: 0xffa500,
  pink: 0xffc0cb,
  white: 0xffffff,
  black: 0x000000,
  gray: 0x808080,
  grey: 0x808080,
}

// Geometry type mapping
const GEOMETRY_MAP: Record<string, string> = {
  cube: 'BoxGeometry',
  box: 'BoxGeometry',
  sphere: 'SphereGeometry',
  ball: 'SphereGeometry',
  cylinder: 'CylinderGeometry',
  cone: 'ConeGeometry',
  plane: 'PlaneGeometry',
  torus: 'TorusGeometry',
  ring: 'RingGeometry',
}

export class NLPParser {
  private static generateObjectId(): string {
    return `obj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }

  private static parseColor(text: string): number | undefined {
    const lowerText = text.toLowerCase()
    
    // Check for color names
    for (const [colorName, colorValue] of Object.entries(COLOR_MAP)) {
      if (lowerText.includes(colorName)) {
        return colorValue
      }
    }
    
    // Check for hex colors (#ff0000, #f00)
    const hexMatch = text.match(/#([0-9a-fA-F]{3,6})/)
    if (hexMatch) {
      return parseInt(hexMatch[1].length === 3 
        ? hexMatch[1].replace(/(.)/g, '$1$1') 
        : hexMatch[1], 16)
    }
    
    return undefined
  }

  private static parsePosition(text: string): { x: number; y: number; z: number } | undefined {
    // Look for patterns like "at (1, 2, 3)" or "position 1 2 3"
    const positionMatch = text.match(/(?:at|position)\s*\(?(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)\)?/i)
    if (positionMatch) {
      return {
        x: parseFloat(positionMatch[1]),
        y: parseFloat(positionMatch[2]),
        z: parseFloat(positionMatch[3])
      }
    }
    return undefined
  }

  private static parseScale(text: string): { x: number; y: number; z: number } | undefined {
    // Look for size descriptors
    if (text.includes('large') || text.includes('big')) {
      return { x: 2, y: 2, z: 2 }
    }
    if (text.includes('small') || text.includes('tiny')) {
      return { x: 0.5, y: 0.5, z: 0.5 }
    }
    
    // Look for explicit scale values
    const scaleMatch = text.match(/(?:scale|size)\s*\(?(-?\d+(?:\.\d+)?)[,\s]*(-?\d+(?:\.\d+)?)?[,\s]*(-?\d+(?:\.\d+)?)?\)?/i)
    if (scaleMatch) {
      const x = parseFloat(scaleMatch[1])
      const y = scaleMatch[2] ? parseFloat(scaleMatch[2]) : x
      const z = scaleMatch[3] ? parseFloat(scaleMatch[3]) : x
      return { x, y, z }
    }
    
    return undefined
  }

  private static parseGeometry(text: string): string | undefined {
    const lowerText = text.toLowerCase()
    
    for (const [shapeName, geometryType] of Object.entries(GEOMETRY_MAP)) {
      if (lowerText.includes(shapeName)) {
        return geometryType
      }
    }
    
    return undefined
  }

  static parseMessage(text: string): ParsedCommand {
    const lowerText = text.toLowerCase()
    
    // Create commands
    if (lowerText.includes('create') || lowerText.includes('add') || lowerText.includes('make')) {
      const objectType = this.parseGeometry(text) || 'BoxGeometry'
      const color = this.parseColor(text)
      const position = this.parsePosition(text) || { x: 0, y: 0, z: 0 }
      const scale = this.parseScale(text)
      
      const properties: ParsedCommand['properties'] = {
        position,
        rotation: { x: 0, y: 0, z: 0 }
      }
      
      if (scale) {
        properties.scale = scale
      }
      
      if (color !== undefined) {
        properties.materialOptions = { color }
      }
      
      return {
        type: 'create',
        objectType,
        properties,
        originalText: text
      }
    }
    
    // Delete/remove commands
    if (lowerText.includes('delete') || lowerText.includes('remove') || lowerText.includes('clear')) {
      if (lowerText.includes('all') || lowerText.includes('everything')) {
        return {
          type: 'delete',
          objectId: 'all',
          originalText: text
        }
      }
      
      // Try to extract object reference (this could be enhanced)
      return {
        type: 'delete',
        originalText: text
      }
    }
    
    // Query commands
    if (lowerText.includes('what') || lowerText.includes('show') || lowerText.includes('list')) {
      return {
        type: 'query',
        originalText: text
      }
    }
    
    // Default to unknown
    return {
      type: 'unknown',
      originalText: text
    }
  }

  static commandToMCPObject(command: ParsedCommand): SceneObject | null {
    if (command.type !== 'create' || !command.objectType) {
      return null
    }

    return {
      id: this.generateObjectId(),
      type: command.objectType,
      properties: command.properties || {}
    }
  }
} 