import { useContext } from 'react'
import { AdminDataContext } from '../contexts/AdminDataContext'

export function useAdminData() {
  const ctx = useContext(AdminDataContext)
  if (!ctx) {
    throw new Error('useAdminData debe usarse dentro de <AdminDataProvider>')
  }
  return ctx
}
