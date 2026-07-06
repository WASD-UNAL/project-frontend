import { useContext } from 'react'
import { AuthFlowContext } from '../contexts/AuthFlowContext'

export function useAuthFlow() {
  const ctx = useContext(AuthFlowContext)
  if (!ctx) {
    throw new Error('useAuthFlow debe usarse dentro de <AuthFlowProvider>')
  }
  return ctx
}
