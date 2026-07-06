import { useState } from 'react'
import { DashboardShell } from '../components/dashboard/DashboardShell'
import type { DashboardSection } from '../components/dashboard/DashboardShell'
import { PaymentsSection } from '../components/dashboard/PaymentsSection'
import { AttendanceSection } from '../components/dashboard/AttendanceSection'

export function DashboardPage() {
  const [section, setSection] = useState<DashboardSection>('payments')

  return (
    <DashboardShell active={section} onSelect={setSection}>
      {section === 'payments' && <PaymentsSection />}
      {section === 'attendance' && <AttendanceSection />}
    </DashboardShell>
  )
}
