import { useState } from "react"
import Sidebar from "./components/Sidebar"
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import PagePonto from "./pages/PagePonto"
import Rocketcoins from "./pages/PageRocketcoins"
import Login from "./components/Login/Login"
import AreaDiretorSelect from "./pages/PageAreaDiretorSelect"
import GerenciarMembros from "./pages/PageGerenciarMembros"
import GerenciarRocketcoins from "./pages/PageGerenciarRocketcoins"
import { ToastProvider } from "./components/Toast/ToastProvider"

function App() {
  const [sidebarOpen, setSiderbarOpen] = useState(true)

  const toggleSidebar = () => {
    setSiderbarOpen(!sidebarOpen)
  }
  return (
    <Router>
      <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="login" />} />
        <Route path="/*" element={
          <div className="min-h-screen bg-gray-rocket-700 flex">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex-1 overflow-auto">
              <Routes>
                <Route path="/ponto" element={<PagePonto />} />
                <Route path="/rocketcoins" element={<Rocketcoins />} />
                <Route path='/area-diretor' element={<AreaDiretorSelect />}/>
                <Route path='/area-diretor/gerenciar-membros' element={<GerenciarMembros />}/>
                <Route path='/area-diretor/gerenciar-rocketcoins' element={<GerenciarRocketcoins />}/>
              </Routes>
            </div>
          </div>
        } />
      </Routes>
      </ToastProvider>
    </Router>
  )
}

export default App
