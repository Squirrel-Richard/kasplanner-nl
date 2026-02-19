import { Metadata } from 'next'
import { ScenariosClient } from '@/components/ScenariosClient'

export const metadata: Metadata = {
  title: "Scenario's — KasPlanner",
  description: "Wat als een klant later betaalt? Simuleer scenario's en zie direct de impact op je cashflow.",
  robots: { index: false },
}

export default function ScenariosPage() {
  return <ScenariosClient />
}
