import { useState } from 'react'
import { AiOutlineBarChart, AiOutlineClockCircle, AiOutlineFileText, AiOutlineTeam } from 'react-icons/ai'
import CardDiretor from '../components/AreaDiretor/CardAreaDiretor'
import { useNavigate } from 'react-router-dom'

function AreaDiretorSelect() {
   const [selectedOption, setSelectedOption] = useState<string | null>(null)
   const navigate = useNavigate()

   const handleCardClick = (option: string) => {
      setSelectedOption(option)
      console.log(`Selecionado: ${option}`)

      if (option === 'membros') {
         navigate('/area-diretor/gerenciar-membros')
      }
   }

   const cards = [
      {
         id: 'membros',
         title: 'Gerenciar Funcionários',
         description: 'Visualize, edite e gerencie os dados dos funcionários. Controle permissões e monitore atividades.',
         icon: <AiOutlineTeam />,
         iconColor: 'text-rocket-red-600',
         hoverColor: 'text-rocket-red-400',
         features: [
            {
               icon: <AiOutlineClockCircle />,
               text: 'Horários'
            },
            {
               icon: <AiOutlineFileText />,
               text: 'Relatórios'
            }
         ]
      },
      {
         id: 'rocketcoins',
         title: 'Relatórios e Análises',
         description: 'Acesse relatórios detalhados de ponto, produtividade e análises de desempenho da equipe.',
         icon: <AiOutlineBarChart />,
         iconColor: 'text-blue-600',
         hoverColor: 'text-blue-400',
         features: [
            {
               icon: <AiOutlineBarChart />,
               text: 'Gráficos'
            },
            {
               icon: <AiOutlineFileText />,
               text: 'Exportar'
            }
         ]
      }
   ]

   return (
      <div className="p-6 space-y-6">
         <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
               Área do Diretor
            </h1>
            <p className="text-gray-300">
               Escolha uma opção para gerenciar
            </p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {cards.map((card) => (
               <CardDiretor
                  key={card.id}
                  title={card.title}
                  description={card.description}
                  icon={card.icon}
                  iconColor={card.iconColor}
                  hoverColor={card.hoverColor}
                  features={card.features}
                  onClick={() => handleCardClick(card.id)}
               />
            ))}
         </div>

         <div className="mt-12">
            <h3 className="text-xl font-semibold text-white mb-4">
               Ações Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4 text-center">
                  <div className="text-green-400 text-2xl font-bold">24</div>
                  <div className="text-green-300 text-sm">Funcionários Ativos</div>
               </div>
               <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <div className="text-yellow-400 text-2xl font-bold">3</div>
                  <div className="text-yellow-300 text-sm">Pendências Hoje</div>
               </div>
               <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4 text-center">
                  <div className="text-blue-400 text-2xl font-bold">95%</div>
                  <div className="text-blue-300 text-sm">Taxa de Presença</div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default AreaDiretorSelect