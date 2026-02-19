import { Metadata } from 'next'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Jouw cashflow overzicht voor de komende 30, 60 en 90 dagen.',
  robots: { index: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
