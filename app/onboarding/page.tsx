import { Metadata } from 'next'
import { OnboardingClient } from '@/components/OnboardingClient'

export const metadata: Metadata = {
  title: 'Aan de slag — KasPlanner',
  robots: { index: false },
}

export default function OnboardingPage() {
  return <OnboardingClient />
}
