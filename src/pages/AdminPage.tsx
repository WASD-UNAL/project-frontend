import { useState } from 'react'
import { AdminDataProvider } from '../contexts/AdminDataContext'
import { AdminShell } from '../components/admin/AdminShell'
import type { AdminSection } from '../components/admin/AdminShell'
import { OverviewSection } from '../components/admin/OverviewSection'
import { StatisticsSection } from '../components/admin/StatisticsSection'
import { MembersSection } from '../components/admin/MembersSection'
import { PaymentsAdminSection } from '../components/admin/PaymentsAdminSection'

export function AdminPage() {
  const [section, setSection] = useState<AdminSection>('overview')

  return (
    <AdminDataProvider>
      <AdminShell active={section} onSelect={setSection}>
        {section === 'overview' && <OverviewSection />}
        {section === 'statistics' && <StatisticsSection />}
        {section === 'members' && <MembersSection />}
        {section === 'payments' && <PaymentsAdminSection />}
      </AdminShell>
    </AdminDataProvider>
  )
}
