import { Metadata } from 'next'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export const metadata: Metadata = {
  title: 'Dashboard — KasPlanner',
  robots: { index: false },
}

export default function DashboardPage() {
  return <DashboardClient />
}
