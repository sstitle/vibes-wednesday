import './App.css'
import { ChatPane } from './components/ChatPane'
import { SceneCanvas } from './components/SceneCanvas'

function App() {
  return (
    <div className="app-container">
      <ChatPane />
      <div className="view-pane">
        <SceneCanvas />
      </div>
    </div>
  )
}

export default App
