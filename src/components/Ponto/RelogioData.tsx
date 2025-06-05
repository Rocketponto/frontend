import { useState, useEffect } from 'react'
import { AiOutlineClockCircle } from 'react-icons/ai'

function RelogioData() {
   const [dataHora, setDataHora] = useState({
      hora: '',
      data: '',
      diaSemana: '',
      periodo: '',
      diaData: '',
      mes: '',
      ano: ''
   })

   const formatarDataHora = () => {
      const agora = new Date()

      const horas = agora.getHours().toString().padStart(2, '0')
      const minutos = agora.getMinutes().toString().padStart(2, '0')
      const segundos = agora.getSeconds().toString().padStart(2, '0')
      const hora = `${horas}:${minutos}:${segundos}`

      const dia = agora.getDate().toString().padStart(2, '0')
      const mes = (agora.getMonth() + 1).toString().padStart(2, '0')
      const ano = agora.getFullYear().toString()
      const data = `${dia}/${mes}/${ano}`

      const diasSemana = [
         'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
         'Quinta-feira', 'Sexta-feira', 'Sábado'
      ]
      const diaSemana = diasSemana[agora.getDay()]

      const periodo = agora.getHours() < 12 ? 'Bom dia' :
         agora.getHours() < 18 ? 'Boa tarde' : 'Boa noite'

      return { hora, data, diaSemana, periodo, diaData: dia, mes, ano }
   }

   useEffect(() => {
      setDataHora(formatarDataHora())

      const intervalo = setInterval(() => {
         setDataHora(formatarDataHora())
      }, 1000)

      return () => clearInterval(intervalo)
   }, [])

   return (
      <div className="bg-transparent rounded-lg p-6 shadow-xl border border-zinc-950">
         <div className="text-left">
            <div className="flex items-center justify-between mb-2">
               <h2 className="text-lg text-gray-300 flex items-center">
                  {dataHora.periodo}!
                  <span className="ml-2">👋</span>
               </h2>
               <AiOutlineClockCircle className="text-white text-2xl" />
            </div>

            <div className="mb-4">
               <div className="text-5xl font-bold text-rocket-red-600 font-mono">
                  {dataHora.hora}
               </div>
            </div>

            <div className="space-y-1">
               <div className="flex items-center space-x-2">
                  <div className="text-xl font-semibold text-white">
                     {`${dataHora.diaSemana}, ${dataHora.diaData} de ${dataHora.mes} de ${dataHora.ano}`}
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default RelogioData