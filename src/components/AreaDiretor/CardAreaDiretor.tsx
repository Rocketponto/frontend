import { type ReactNode } from 'react'

interface CardDiretorProps {
   title: string
   description: string
   icon: ReactNode
   iconColor: string
   hoverColor: string
   features: Array<{
      icon: ReactNode
      text: string
   }>
   onClick: () => void
}

function CardDiretor({
   title,
   description,
   icon,
   iconColor,
   hoverColor,
   features,
   onClick
}: CardDiretorProps) {
   return (
      <div
         onClick={onClick}
         className="bg-transparent border border-zinc-950 rounded-lg p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
      >
         <div className="text-center">
            <div className="mb-6 flex justify-center">
               <div className={`text-6xl ${iconColor} mx-auto group-hover:${hoverColor} transition-colors`}>
                  {icon}
               </div>
            </div>
            <h2 className={`text-2xl font-bold text-white mb-4 group-hover:${hoverColor} transition-colors`}>
               {title}
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-6">
               {description}
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
               {features.map((feature, index) => (
                  <span key={index} className="flex items-center">
                     <span className="mr-1">{feature.icon}</span>
                     {feature.text}
                  </span>
               ))}
            </div>
         </div>
      </div>
   )
}

export default CardDiretor