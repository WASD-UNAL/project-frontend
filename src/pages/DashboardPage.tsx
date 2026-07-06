import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DashboardShell } from '../components/dashboard/DashboardShell'
import type { DashboardSection } from '../components/dashboard/DashboardShell'
import { PaymentsSection } from '../components/dashboard/PaymentsSection'
import { AttendanceSection } from '../components/dashboard/AttendanceSection'

export function DashboardPage() {
  const { role, profileLoaded } = useAuth()
  const [section, setSection] = useState<DashboardSection>('payments')

  if (!profileLoaded) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-bg">
        <span className="font-mono text-xs tracking-[0.25em] text-muted uppercase">
          Cargando…
        </span>
      </div>
    )
  }

  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  return (
    <DashboardShell active={section} onSelect={setSection}>
      {section === 'payments' && <PaymentsSection />}
      {section === 'attendance' && <AttendanceSection />}
    </DashboardShell>
  )
}
