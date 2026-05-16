'use client'

import { useEffect } from 'react'

interface Props {
  message: string
  variant?: 'success' | 'error'
  onClose: () => void
  /** Auto-dismiss delay in ms. Default 3000. */
  duration?: number
}

export default function Toast({
  message,
  variant = 'success',
  onClose,
  duration = 3000,
}: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
        variant === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      {message}
    </div>
  )
}
