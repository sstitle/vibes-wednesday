import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import { useMeshState } from '../state/MeshContext'

function HelloText() {
  const { meshLabel } = useMeshState()
  return (
    <Text fontSize={0.8} color="white" anchorX="center" anchorY="middle">
      {meshLabel}
    </Text>
  )
}

export function SceneCanvas() {
  const cameraPosition = useMemo(() => [3, 2, 5] as [number, number, number], [])

  return (
    <div className="scene-root">
      <Canvas camera={{ position: cameraPosition, fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <Suspense fallback={null}>
          <HelloText />
        </Suspense>
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  )
}

export default SceneCanvas 