import { DashboardShell } from '../components/dashboard/DashboardShell'
import { PaymentsSection } from '../components/dashboard/PaymentsSection'

export function DashboardPage() {
  return (
    <DashboardShell>
      <PaymentsSection />
    </DashboardShell>
  )
}
