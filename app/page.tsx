import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'

export const metadata: Metadata = {
  title: 'KasPlanner — Cashflow forecasting voor Nederlands MKB',
  description:
    'Altijd weten hoeveel geld er over 30, 60 en 90 dagen op je rekening staat. Koppel Moneybird of e-Boekhouden en zie direct je cashflow forecast. Speciaal voor Nederlands MKB.',
  alternates: {
    canonical: 'https://kasplanner.nl',
  },
}

export default function Home() {
  return <LandingPage />
}
