'use client'

import { useState } from 'react'

interface ToastOptions {
  title: string
  description?: string
  duration?: number
  id?: string
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastOptions[]>([])

  const toast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9)
    const duration = options.duration || 3000

    const newToast = {
      id,
      ...options,
    }

    setToasts((currentToasts) => [...currentToasts, newToast])

    setTimeout(() => {
      setToasts((currentToasts) => 
        currentToasts.filter((toast) => toast.id !== id)
      )
    }, duration)

    return id
  }

  return { toast, toasts }
}

// Create a simple toast instance for direct imports
let toastQueue: ToastOptions[] = []
const toastListeners: Array<(toasts: ToastOptions[]) => void> = []

// Notify listeners when a new toast is added
function notifyListeners() {
  toastListeners.forEach(listener => listener(toastQueue))
}

export const toast = (options: ToastOptions) => {
  const id = Math.random().toString(36).substring(2, 9)
  const duration = options.duration || 3000
  
  const newToast = {
    id,
    ...options,
  }
  
  toastQueue = [...toastQueue, newToast]
  notifyListeners()
  
  setTimeout(() => {
    toastQueue = toastQueue.filter((toast) => toast.id !== id)
    notifyListeners()
  }, duration)
  
  return id
}
