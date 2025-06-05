import { useEffect, useState } from 'react'
import { AiFillDollarCircle, AiFillRocket, AiOutlineClockCircle, AiOutlineLogout, AiOutlineRocket } from 'react-icons/ai'
import { useLocation, useNavigate } from 'react-router-dom'

interface SidebarProps {
   isOpen: boolean
   toggleSidebar: () => void
}

function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
   const navigate = useNavigate()
   const location = useLocation()

   const getActiveItemFromPath = (path: string) => {
      if (path === '/' || path === '/ponto') {
         return 'ponto'
      } else if (path === '/rocketcoins') {
         return 'rocketcoins'
      }
      return 'ponto' // fallback
   }
   const [activeItem, setActiveItem] = useState(() => getActiveItemFromPath(location.pathname))

   const handleLogout = () => {
      navigate('/login')
   }

   useEffect(() => {
      const currentActive = getActiveItemFromPath(location.pathname)
      setActiveItem(currentActive)
   }, [location.pathname])

   const handleItemClick = (itemName: string) => {
      if (itemName === 'ponto') {
         navigate('/ponto')
      } else if (itemName === 'rocketcoins') {
         navigate('/rocketcoins')
      }
   }

   return (
      <>
         {isOpen && (
            <div
               className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
               onClick={toggleSidebar}
            ></div>
         )}

         <div className={`
         fixed top-0 left-0 h-screen min-h-screen w-64 bg-gray-rocket-700 text-white transform transition-transform duration-300 z-50 flex flex-col shadow-lg shadow-black/20
         ${isOpen ? 'translate-x-0' : '-translate-x-full'}
         lg:translate-x-0 lg:relative lg:z-auto lg:sticky lg:top-0
      `}>
            {/* Header */}
            <div className="flex items-center justify-center p-4 flex-shrink-0">
               <AiOutlineRocket className='text-3xl text-rocket-red-600' />
               <h2 className="text-3xl font-bold">RocketPonto</h2>
            </div>

            {/* User Info */}
            <div className="w-full p-4 flex-shrink-0">
               <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center mr-3">
                     <AiFillRocket className='text-2xl text-rocket-red-600' />
                  </div>
                  <div>
                     <p className="text-sm font-medium">Usuário</p>
                     <p className="text-xs text-gray-400">usuario@email.com</p>
                  </div>
               </div>
            </div>

            {/* Navigation - grows to fill space */}
            <nav className="flex-1 px-4">
               <ul className="space-y-2">
                  <li>
                     <a href="#"
                        className={`flex gap-1 items-center p-2 rounded transition-colors ${activeItem === 'ponto'
                           ? 'bg-rocket-red-600 text-white'
                           : 'hover:bg-rocket-red-600 hover:text-white'
                           }`}
                        onClick={() => handleItemClick('ponto')}>
                        <AiOutlineClockCircle />
                        Ponto
                     </a>
                  </li>
                  <li>
                     <a href="#"
                        className={`flex gap-1 items-center p-2 rounded transition-colors ${activeItem === 'rocketcoins'
                           ? 'bg-rocket-red-600 text-white'
                           : 'hover:bg-rocket-red-600 hover:text-white'
                           }`}
                        onClick={() => handleItemClick('rocketcoins')}>
                        <AiFillDollarCircle />
                        Rocketcoins
                     </a>
                  </li>
               </ul>
            </nav>

            {/* Logout Button - always at bottom */}
            <div className="w-full p-4 border-t border-gray-700 flex-shrink-0">
               <button
                  className="w-full flex items-center justify-center p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 hover:shadow-lg group"
                  onClick={handleLogout}
               >
                  <AiOutlineLogout className="mr-2 text-lg group-hover:rotate-180 transition-transform duration-200" />
                  <span className="font-medium">Sair</span>
               </button>
            </div>
         </div>
      </>
   )
}

export default Sidebar