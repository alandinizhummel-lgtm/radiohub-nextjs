'use client'

import { useState, useEffect, useCallback } from 'react'

interface ToastMessage {
  id: number
  text: string
  type: 'success' | 'error' | 'info'
}

let addToastFn: ((text: string, type: 'success' | 'error' | 'info') => void) | null = null

export function toast(text: string, type: 'success' | 'error' | 'info' = 'info') {
  addToastFn?.(text, type)
}

export default function ToastContainer() {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now()
    setMessages(prev => [...prev, { id, text, type }])
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== id))
    }, 3000)
  }, [])

  useEffect(() => {
    addToastFn = addToast
    return () => { addToastFn = null }
  }, [addToast])

  if (messages.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" role="status" aria-live="polite">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`px-4 py-3 rounded-lg shadow-xl text-sm font-semibold animate-slide-in ${
            msg.type === 'success' ? 'bg-green text-white' :
            msg.type === 'error' ? 'bg-red text-white' :
            'bg-accent text-white'
          }`}
        >
          {msg.type === 'success' ? '✓ ' : msg.type === 'error' ? '✕ ' : ''}{msg.text}
        </div>
      ))}
    </div>
  )
}
