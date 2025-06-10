import RelogioData from '../components/Ponto/RelogioData'
import BaterPonto from '../components/Ponto/BaterPonto'
import TabelaPonto from '../components/Ponto/TabelaPonto'


function Ponto() {
   return (
      <div className="p-6 space-y-6">
         {/* Header da página */}
         <div className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">
               Controle de Ponto
            </h1>
            <p className="text-gray-300">
               Gerencie seus horários de entrada e saída
            </p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RelogioData />
            <BaterPonto />
         </div>

         <div className="w-full">
           <TabelaPonto />
         </div>
      </div>
   )
}

export default Ponto