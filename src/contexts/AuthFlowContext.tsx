import { createContext, useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type AuthMode = 'login' | 'register'

interface AuthFlowValue {
  modalOpen: boolean
  mode: AuthMode
  pendingPlanId: number | null
  openAuth: (mode: AuthMode, pendingPlanId?: number | null) => void
  setMode: (mode: AuthMode) => void
  closeAuth: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthFlowContext = createContext<AuthFlowValue | undefined>(undefined)

export function AuthFlowProvider({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<AuthMode>('login')
  const [pendingPlanId, setPendingPlanId] = useState<number | null>(null)

  const openAuth = useCallback(
    (nextMode: AuthMode, planId: number | null = null) => {
      setMode(nextMode)
      setPendingPlanId(planId)
      setModalOpen(true)
    },
    [],
  )

  const closeAuth = useCallback(() => setModalOpen(false), [])

  const value = useMemo(
    () => ({ modalOpen, mode, pendingPlanId, openAuth, setMode, closeAuth }),
    [modalOpen, mode, pendingPlanId, openAuth, closeAuth],
  )

  return <AuthFlowContext.Provider value={value}>{children}</AuthFlowContext.Provider>
}
