import { Metadata } from 'next'
import { PrijzenClient } from '@/components/PrijzenClient'

export const metadata: Metadata = {
  title: 'Prijzen — KasPlanner',
  description: 'Transparante prijzen voor cashflow forecasting. Start gratis, upgrade wanneer je groeit.',
  alternates: { canonical: 'https://kasplanner.nl/prijzen' },
}

export default function PrijzenPage() {
  return <PrijzenClient />
}
