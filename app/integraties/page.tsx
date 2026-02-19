import { Metadata } from 'next'
import { IntegratiesClient } from '@/components/IntegratiesClient'

export const metadata: Metadata = {
  title: 'Integraties — KasPlanner',
  description: 'Koppel Moneybird of e-Boekhouden aan KasPlanner voor automatische cashflow sync.',
  robots: { index: false },
}

export default function IntegratiesPage() {
  return <IntegratiesClient />
}
