import { useEffect, useState } from 'react'
import { AiOutlineBarChart, AiOutlineClockCircle, AiOutlineFileText, AiOutlineTeam } from 'react-icons/ai'
import CardDiretor from '../components/AreaDiretor/CardAreaDiretor'
import { useNavigate } from 'react-router-dom'
import { authService } from '../hooks/useAuth'
import { pontoService } from '../hooks/usePointRecord'
import { FaCoins } from 'react-icons/fa'

interface PontoMembro {
   id: string
   userId: string
   user: {
      id: string
      name: string
      email: string
      role: string
   }
   entryDateHour: string | null
   exitDateHour: string | null
   pointRecordStatus: 'APPROVED' | 'IN_PROGRESS' | 'REJECTED' | 'PENDING'
   description: string
   workingHours: {
      hours: number
      minutes: number
      totalHours: number
   }
   createdAt: string
   updatedAt: string
}

function AreaDiretorSelect() {
   const [membersActive, setMembersActive] = useState(0)
   const [pointsInProgress, setPointsProgress] = useState(0)
   const navigate = useNavigate()

   const handleCardClick = (option: string) => {
      if (option === 'membros') {
         navigate('/area-diretor/gerenciar-membros')
      } else if (option === 'rocketcoins') {
         navigate('/area-diretor/gerenciar-rocketcoins')
      }
   }

   useEffect(() => {
      const fetchMembers = async () => {
         try {
            const response = await authService.buscarMembrosAtivo()
            setMembersActive(response.data.length)
         } catch (error) {
            console.error('Erro ao buscar membros ativos:', error)
         }
      }
      fetchMembers()
   }, [])

   useEffect(() => {
      const fetchPointsInProgress = async () => {
         try {
            const response = await pontoService.buscarPontosMembros({})

            if (response.success && response.data) {
               const pontosEmProgresso = response.data.filter((ponto: PontoMembro) => {
                  return ponto.pointRecordStatus === 'IN_PROGRESS'
               })

               setPointsProgress(pontosEmProgresso.length)
            }
         } catch (error) {
            console.error('Erro ao buscar pontos:', error)
         }
      }

      fetchPointsInProgress()
   }, [])

   const cards = [
      {
         id: 'membros',
         title: 'Gerenciar Membros',
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
         title: 'Gerenciar Rocketcoins',
         description: 'Acesse relatórios detalhados das rocketcoins e gerencie a distribuição das moedas.',
         icon: <FaCoins />,
         iconColor: 'text-yellow-600',
         hoverColor: 'text-yellow-400',
         features: [
            {
               icon: <AiOutlineBarChart />,
               text: 'Gráficos'
            },
            {
               icon: <AiOutlineFileText />,
               text: 'Solicitações'
            }
         ]
      }
   ]

   return (
      <div className="p-6 space-y-6">
         <div className="mb-8 text-center sm:text-left">
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
                  <div className="text-green-400 text-2xl font-bold">{membersActive}</div>
                  <div className="text-green-300 text-sm">Funcionários Ativos</div>
               </div>
               <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <div className="text-yellow-400 text-2xl font-bold">{pointsInProgress}</div>
                  <div className="text-yellow-300 text-sm">Pendências de Pontos</div>
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