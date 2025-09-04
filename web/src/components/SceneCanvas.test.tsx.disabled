import { render } from '@testing-library/react'
import { SceneCanvas } from './SceneCanvas'
import { MeshProvider } from '../state/MeshContext'

it('renders a canvas element', () => {
  const { container } = render(
    <MeshProvider>
      <div style={{ width: 400, height: 300 }}>
        <SceneCanvas />
      </div>
    </MeshProvider>
  )

  const canvas = container.querySelector('canvas')
  expect(canvas).toBeInTheDocument()
}) 