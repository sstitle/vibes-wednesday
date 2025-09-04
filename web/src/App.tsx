import './App.css'
import { ChatPane } from './components/ChatPane'
import { SceneCanvas } from './components/SceneCanvas'
import { MeshProvider } from './state/MeshContext'

function App() {
  return (
    <MeshProvider>
      <div className="app-container">
        <ChatPane />
        <div className="view-pane">
          <SceneCanvas />
        </div>
      </div>
    </MeshProvider>
  )
}

export default App
