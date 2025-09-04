import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import { useMeshState, type SceneObject } from '../state/MeshContext'
import * as THREE from 'three'

function HelloText() {
  const { meshLabel, sceneObjects } = useMeshState()
  
  // Only show hello text if no objects in scene
  if (sceneObjects.length > 0) return null
  
  return (
    <Text fontSize={0.8} color="white" anchorX="center" anchorY="middle">
      {meshLabel}
    </Text>
  )
}

function SceneObject({ object }: { object: SceneObject }) {
  const geometry = useMemo(() => {
    switch (object.type) {
      case 'BoxGeometry':
        return <boxGeometry args={[1, 1, 1]} />
      case 'SphereGeometry':
        return <sphereGeometry args={[0.5, 32, 32]} />
      case 'CylinderGeometry':
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
      case 'ConeGeometry':
        return <coneGeometry args={[0.5, 1, 32]} />
      case 'PlaneGeometry':
        return <planeGeometry args={[1, 1]} />
      case 'TorusGeometry':
        return <torusGeometry args={[0.5, 0.2, 16, 100]} />
      default:
        return <boxGeometry args={[1, 1, 1]} />
    }
  }, [object.type])

  const color = useMemo(() => new THREE.Color(object.color), [object.color])

  // Ensure position, rotation, scale are proper arrays
  const position = useMemo(() => {
    const pos = object.position || [0, 0, 0]
    return Array.isArray(pos) ? pos as [number, number, number] : [0, 0, 0] as [number, number, number]
  }, [object.position])

  const rotation = useMemo(() => {
    const rot = object.rotation || [0, 0, 0]
    return Array.isArray(rot) ? rot as [number, number, number] : [0, 0, 0] as [number, number, number]
  }, [object.rotation])

  const scale = useMemo(() => {
    const scl = object.scale || [1, 1, 1]
    return Array.isArray(scl) ? scl as [number, number, number] : [1, 1, 1] as [number, number, number]
  }, [object.scale])

  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {geometry}
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function SceneObjects() {
  const { sceneObjects } = useMeshState()
  
  return (
    <>
      {sceneObjects.map(object => (
        <SceneObject key={object.id} object={object} />
      ))}
    </>
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
          <SceneObjects />
        </Suspense>
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  )
}

export default SceneCanvas 