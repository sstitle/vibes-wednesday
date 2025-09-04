import '@testing-library/jest-dom'

// Stub WebGL context in JSDOM for @react-three/fiber / three
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({
    canvas: {},
  }),
})

// Polyfill ResizeObserver for react-use-measure used by @react-three/fiber
class ResizeObserverPolyfill {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const g = globalThis as unknown as { ResizeObserver?: typeof ResizeObserver }
if (!g.ResizeObserver) {
  g.ResizeObserver = ResizeObserverPolyfill as unknown as typeof ResizeObserver
} 