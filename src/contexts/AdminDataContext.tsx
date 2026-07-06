import { createContext, useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getMembers, getPayments } from '../services/adminService'
import type { AdminClient, AdminPayment } from '../types/admin'

interface AdminDataContextValue {
  members: AdminClient[] | null
  membersError: boolean
  refreshMembers: () => Promise<void>
  payments: AdminPayment[] | null
  paymentsError: boolean
  refreshPayments: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AdminDataContext = createContext<AdminDataContextValue | undefined>(undefined)

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<AdminClient[] | null>(null)
  const [membersError, setMembersError] = useState(false)
  const [payments, setPayments] = useState<AdminPayment[] | null>(null)
  const [paymentsError, setPaymentsError] = useState(false)

  const refreshMembers = useCallback(async () => {
    try {
      const data = await getMembers()
      setMembers(data)
      setMembersError(false)
    } catch {
      setMembersError(true)
    }
  }, [])

  const refreshPayments = useCallback(async () => {
    try {
      const data = await getPayments()
      setPayments(data)
      setPaymentsError(false)
    } catch {
      setPaymentsError(true)
    }
  }, [])

  useEffect(() => {
    refreshMembers()
    refreshPayments()
  }, [refreshMembers, refreshPayments])

  return (
    <AdminDataContext.Provider
      value={{
        members,
        membersError,
        refreshMembers,
        payments,
        paymentsError,
        refreshPayments,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  )
}
