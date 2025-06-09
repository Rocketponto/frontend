// src/components/Toast/Toast.tsx
import { useEffect } from 'react'
import {
  AiOutlineClose,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineInfoCircle,
  AiOutlineWarning
} from 'react-icons/ai'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: AiOutlineCheckCircle,
          bgColor: 'bg-green-600/90',
          borderColor: 'border-green-500',
          iconColor: 'text-green-300',
          progressColor: 'bg-green-400'
        }
      case 'error':
        return {
          icon: AiOutlineCloseCircle,
          bgColor: 'bg-red-600/90',
          borderColor: 'border-red-500',
          iconColor: 'text-red-300',
          progressColor: 'bg-red-400'
        }
      case 'warning':
        return {
          icon: AiOutlineWarning,
          bgColor: 'bg-yellow-600/90',
          borderColor: 'border-yellow-500',
          iconColor: 'text-yellow-300',
          progressColor: 'bg-yellow-400'
        }
      case 'info':
      default:
        return {
          icon: AiOutlineInfoCircle,
          bgColor: 'bg-blue-600/90',
          borderColor: 'border-blue-500',
          iconColor: 'text-blue-300',
          progressColor: 'bg-blue-400'
        }
    }
  }

  const config = getToastConfig()
  const IconComponent = config.icon

  return (
    <div className={`
      ${config.bgColor} ${config.borderColor}
      border rounded-lg shadow-lg backdrop-blur-sm
      p-4 min-w-80 max-w-96
      transform transition-all duration-300 ease-in-out
      animate-slide-in-right
      relative overflow-hidden
    `}>
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-gray-700/50 w-full">
          <div
            className={`h-full ${config.progressColor} animate-progress`}
            style={{
              animationDuration: `${duration}ms`,
              animationTimingFunction: 'linear'
            }}
          />
        </div>
      )}

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm mb-1">
            {title}
          </h4>
          {message && (
            <p className="text-gray-200 text-xs leading-relaxed">
              {message}
            </p>
          )}
        </div>

        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 text-gray-300 hover:text-white transition-colors p-1 rounded"
        >
          <AiOutlineClose className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Toast