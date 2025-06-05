import CardCoin from '../components/Rocketcoin/CardCoin'
import HistoricoTransacoes from '../components/Rocketcoin/HistoricoTransacao'
import RegistrarGasto from '../components/Rocketcoin/RegistroGasto'

function Rocketcoins() {
   return (
      <div className="p-6 space-y-6">
         <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
               Rocketcoins
            </h1>
            <p className="text-gray-300">
               Gerencie suas moedinhas da Rocket
            </p>
         </div>

         <div className="w-full mb-6">
            <CardCoin saldoAtual={0} ganhosMes={0} gastosMes={0} />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HistoricoTransacoes />
            <RegistrarGasto />
         </div>
      </div>
   )
}

export default Rocketcoins