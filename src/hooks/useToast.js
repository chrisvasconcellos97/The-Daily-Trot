import { useState, useCallback } from 'react'
let id = 0
export function useToast() {
  const [toasts, setToasts] = useState([])
  const toast = useCallback((msg, type = 'success') => {
    const key = ++id
    setToasts(t => [...t, { key, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.key !== key)), 3000)
  }, [])
  return { toasts, toast }
}
