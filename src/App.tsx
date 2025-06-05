import { useState } from "react"
import Sidebar from "./components/Sidebar"
import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import PagePonto from "./pages/PagePonto"
import Rocketcoins from "./pages/PageRocketcoins"
import Login from "./components/Login/Login"

function App() {
  const [sidebarOpen, setSiderbarOpen] = useState(true)

  const toggleSidebar = () => {
    setSiderbarOpen(!sidebarOpen)
  }
  return (
    <Router>
      <Routes>
        {/* Rota de login */}
        <Route path="/login" element={<Login />} />

        {/* Rotas protegidas */}
        <Route path="/*" element={
          <div className="min-h-screen bg-gray-rocket-700 flex">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<PagePonto />} />
                <Route path="/ponto" element={<PagePonto />} />
                <Route path="/rocketcoins" element={<Rocketcoins />} />
              </Routes>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
