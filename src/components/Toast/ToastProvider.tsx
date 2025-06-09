// src/contexts/ToastContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import Toast, { type ToastType } from '../Toast/Toast'
import type { ToastProps } from '../Toast/Toast'

interface ToastContextType {
  showToast: (options: Omit<ToastProps, 'id' | 'onClose'>) => void
  showSuccess: (title: string, message?: string, duration?: number) => void
  showError: (title: string, message?: string, duration?: number) => void
  showInfo: (title: string, message?: string, duration?: number) => void
  showWarning: (title: string, message?: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showToast = (options: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      ...options,
      id,
      onClose: removeToast
    }

    setToasts(prev => [...prev, newToast])
  }

  const showSuccess = (title: string, message?: string, duration = 5000) => {
    showToast({ type: 'success', title, message, duration })
  }

  const showError = (title: string, message?: string, duration = 7000) => {
    showToast({ type: 'error', title, message, duration })
  }

  const showInfo = (title: string, message?: string, duration = 5000) => {
    showToast({ type: 'info', title, message, duration })
  }

  const showWarning = (title: string, message?: string, duration = 6000) => {
    showToast({ type: 'warning', title, message, duration })
  }

  return (
    <ToastContext.Provider value={{
      showToast,
      showSuccess,
      showError,
      showInfo,
      showWarning
    }}>
      {children}

      <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}