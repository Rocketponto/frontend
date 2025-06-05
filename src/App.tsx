import { useState } from "react"
import Sidebar from "./components/Sidebar"
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import PagePonto from "./pages/PagePonto"
import Rocketcoins from "./pages/PageRocketcoins"

function App() {
  const [sidebarOpen, setSiderbarOpen] = useState(true)

  const toggleSidebar = () => {
    setSiderbarOpen(!sidebarOpen)
  }
  return (
    <Router>
      <div className="min-h-screen bg-gray-rocket-700 flex">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Área do conteúdo principal */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'
          }`}>
          <div className="w-full h-full flex justify-center">
            <div className="w-full max-w-7xl">
              <Routes>
                <Route path="/" element={<PagePonto />} />
                <Route path="/ponto" element={<PagePonto />} />
                <Route path="/rocketcoins" element={<Rocketcoins />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
