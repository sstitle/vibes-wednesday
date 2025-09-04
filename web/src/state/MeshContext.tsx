import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type MeshState = {
  meshLabel: string
  setMeshLabel: (label: string) => void
}

const MeshContext = createContext<MeshState | undefined>(undefined)

export function MeshProvider({ children }: { children: ReactNode }) {
  const [meshLabel, setMeshLabel] = useState<string>('Hello World')

  const value = useMemo<MeshState>(() => ({ meshLabel, setMeshLabel }), [meshLabel])

  return <MeshContext.Provider value={value}>{children}</MeshContext.Provider>
}

export function useMeshState(): MeshState {
  const ctx = useContext(MeshContext)
  if (!ctx) throw new Error('useMeshState must be used within MeshProvider')
  return ctx
} 