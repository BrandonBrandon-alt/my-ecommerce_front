// hooks/useAnimatedAlert.ts
import { useState, useCallback } from 'react'

export function useAnimatedAlert() {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [message, setMessage] = useState('')

  const show = useCallback((msg: string) => {
    setMessage(msg)
    setIsVisible(true)
    setIsExiting(false)
  }, [])

  const hide = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      setIsExiting(false)
      setMessage('')
    }, 300) // Debe coincidir con la duración de la animación
  }, [])

  return {
    isVisible,
    isExiting,
    message,
    show,
    hide,
  }
}