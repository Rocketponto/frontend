import { useState } from 'react'
import { AiOutlineCheck, AiOutlineClose, AiOutlineClockCircle, AiOutlineCalendar } from 'react-icons/ai'

interface RegistroPonto {
   id: string
   data: string
   entrada: string | null
   saida: string | null
   total: string
   status: 'completo' | 'pendente' | 'ausente'
}

function TabelaPonto() {
   // Dados de exemplo
   const [registros] = useState<RegistroPonto[]>([
      {
         id: '1',
         data: '05/06/2025',
         entrada: '08:00:00',
         saida: '17:00:00',
         total: '08:00:00',
         status: 'completo'
      },
      {
         id: '2',
         data: '04/06/2025',
         entrada: '08:15:00',
         saida: '17:30:00',
         total: '08:15:00',
         status: 'completo'
      },
      {
         id: '3',
         data: '03/06/2025',
         entrada: '08:00:00',
         saida: null,
         total: '--:--:--',
         status: 'pendente'
      },
      {
         id: '4',
         data: '02/06/2025',
         entrada: null,
         saida: null,
         total: '--:--:--',
         status: 'ausente'
      },
      {
         id: '5',
         data: '01/06/2025',
         entrada: '09:00:00',
         saida: '18:00:00',
         total: '08:00:00',
         status: 'completo'
      }
   ])

   const getStatusIcon = (status: string) => {
      switch (status) {
         case 'completo':
            return <AiOutlineCheck className="text-green-500" />
         case 'pendente':
            return <AiOutlineClockCircle className="text-yellow-500" />
         case 'ausente':
            return <AiOutlineClose className="text-red-500" />
         default:
            return <AiOutlineClockCircle className="text-gray-500" />
      }
   }

   const getStatusText = (status: string) => {
      switch (status) {
         case 'completo':
            return 'Completo'
         case 'pendente':
            return 'Pendente'
         case 'ausente':
            return 'Ausente'
         default:
            return 'Indefinido'
      }
   }

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'completo':
            return 'text-green-500 bg-green-500/10'
         case 'pendente':
            return 'text-yellow-500 bg-yellow-500/10'
         case 'ausente':
            return 'text-red-500 bg-red-500/10'
         default:
            return 'text-gray-500 bg-gray-500/10'
      }
   }

   return (
      <div className="bg-transparent rounded-lg p-6 shadow-xl border border-zinc-950">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
               Histórico de Registros
               <AiOutlineCalendar className="ml-2 text-white" />
            </h3>
            <span className="text-sm text-gray-400">
               {registros.length} registros
            </span>
         </div>

         {/* Tabela */}
         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="border-b border-gray-700">
                     <th className="text-left py-3 px-4 font-medium text-gray-300">Data</th>
                     <th className="text-left py-3 px-4 font-medium text-gray-300">Entrada</th>
                     <th className="text-left py-3 px-4 font-medium text-gray-300">Saída</th>
                     <th className="text-left py-3 px-4 font-medium text-gray-300">Total</th>
                     <th className="text-left py-3 px-4 font-medium text-gray-300">Status</th>
                  </tr>
               </thead>
               <tbody>
                  {registros.map((registro) => (
                     <tr
                        key={registro.id}
                        className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                     >
                        <td className="py-4 px-4">
                           <span className="text-white font-medium">
                              {registro.data}
                           </span>
                        </td>
                        <td className="py-4 px-4">
                           <span className={`font-mono ${registro.entrada ? 'text-green-400' : 'text-gray-500'
                              }`}>
                              {registro.entrada || '--:--:--'}
                           </span>
                        </td>
                        <td className="py-4 px-4">
                           <span className={`font-mono ${registro.saida ? 'text-red-400' : 'text-gray-500'
                              }`}>
                              {registro.saida || '--:--:--'}
                           </span>
                        </td>
                        <td className="py-4 px-4">
                           <span className={`font-mono font-bold ${registro.status === 'completo' ? 'text-white' : 'text-gray-500'
                              }`}>
                              {registro.total}
                           </span>
                        </td>
                        <td className="py-4 px-4">
                           <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${getStatusColor(registro.status)}`}>
                              {getStatusIcon(registro.status)}
                              <span className="font-medium">
                                 {getStatusText(registro.status)}
                              </span>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Resumo */}
         <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
               <div className="text-green-400 text-sm font-medium">Dias Completos</div>
               <div className="text-2xl font-bold text-white">
                  {registros.filter(r => r.status === 'completo').length}
               </div>
            </div>
            <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
               <div className="text-yellow-400 text-sm font-medium">Pendentes</div>
               <div className="text-2xl font-bold text-white">
                  {registros.filter(r => r.status === 'pendente').length}
               </div>
            </div>
            <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4">
               <div className="text-red-400 text-sm font-medium">Ausências</div>
               <div className="text-2xl font-bold text-white">
                  {registros.filter(r => r.status === 'ausente').length}
               </div>
            </div>
         </div>
      </div>
   )
}

export default TabelaPonto