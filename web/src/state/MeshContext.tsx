import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { mcpClient } from '../services/mcpClient'

export interface SceneObject {
  id: string
  type: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: number
}

export type MeshState = {
  meshLabel: string
  setMeshLabel: (label: string) => void
  sceneObjects: SceneObject[]
  setSceneObjects: (objects: SceneObject[]) => void
  addSceneObject: (object: SceneObject) => void
  removeSceneObject: (id: string) => void
  clearScene: () => void
}

const MeshContext = createContext<MeshState | undefined>(undefined)

export function MeshProvider({ children }: { children: ReactNode }) {
  const [meshLabel, setMeshLabel] = useState<string>('Hello World')
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>([])

  // Listen for MCP updates
  useEffect(() => {
    const unsubscribe = mcpClient.onMessage((data) => {
      console.log('MCP message received:', data)
      
      if (data.action === 'object.create' && data.object) {
        // Ensure position, rotation, scale are arrays
        const ensureArray = (value: any, defaultValue: [number, number, number]): [number, number, number] => {
          if (Array.isArray(value) && value.length >= 3) {
            return [value[0] || 0, value[1] || 0, value[2] || 0]
          }
          return defaultValue
        }

        const newObject: SceneObject = {
          id: data.object.id || `obj_${Date.now()}`,
          type: data.object.type || 'BoxGeometry',
          position: ensureArray(data.object.position, [0, 0, 0]),
          rotation: ensureArray(data.object.rotation, [0, 0, 0]),
          scale: ensureArray(data.object.scale, [1, 1, 1]),
          color: typeof data.object.color === 'number' ? data.object.color : 0xff0000
        }
        
        console.log('Adding scene object:', newObject)
        setSceneObjects(prev => [...prev, newObject])
      } else if (data.action === 'scene.clear') {
        setSceneObjects([])
      } else if (data.action === 'object.delete') {
        // Handle individual object deletion if needed
      }
    })

    return unsubscribe
  }, [])

  const addSceneObject = useMemo(() => (object: SceneObject) => {
    setSceneObjects(prev => [...prev, object])
  }, [])

  const removeSceneObject = useMemo(() => (id: string) => {
    setSceneObjects(prev => prev.filter(obj => obj.id !== id))
  }, [])

  const clearScene = useMemo(() => () => {
    setSceneObjects([])
  }, [])

  const value = useMemo<MeshState>(() => ({
    meshLabel,
    setMeshLabel,
    sceneObjects,
    setSceneObjects,
    addSceneObject,
    removeSceneObject,
    clearScene
  }), [meshLabel, sceneObjects, addSceneObject, removeSceneObject, clearScene])

  return <MeshContext.Provider value={value}>{children}</MeshContext.Provider>
}

export function useMeshState(): MeshState {
  const ctx = useContext(MeshContext)
  if (!ctx) throw new Error('useMeshState must be used within MeshProvider')
  return ctx
} 