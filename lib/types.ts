export interface Company {
  id: string
  user_id: string
  naam: string
  kvk?: string
  email?: string
  moneybird_admin_id?: string
  moneybird_access_token?: string
  eboekhouden_username?: string
  cashflow_drempel: number
  created_at: string
}

export interface CashflowEntry {
  id: string
  company_id: string
  type: 'inkomst' | 'uitgave'
  bron: 'moneybird' | 'eboekhouden' | 'handmatig'
  omschrijving?: string
  bedrag: number
  verwacht_op: string
  status: 'verwacht' | 'ontvangen' | 'betaald'
  factuur_id?: string
  created_at: string
}

export interface Scenario {
  id: string
  company_id: string
  naam: string
  aanpassingen: ScenarioAanpassing[]
  created_at: string
}

export interface ScenarioAanpassing {
  entry_id: string
  type: 'vertraging' | 'bedrag' | 'verwijder'
  waarde: number
}

export interface Subscription {
  id: string
  company_id: string
  plan: 'gratis' | 'starter' | 'pro' | 'business'
  stripe_subscription_id?: string
  geldig_tot?: string
  created_at: string
}

export interface CashflowForecast {
  datum: string
  inkomsten: number
  uitgaven: number
  saldo: number
  cumulatief: number
}

export type PlanName = 'gratis' | 'starter' | 'pro' | 'business'

export interface PricingPlan {
  naam: PlanName
  prijs: number
  features: string[]
  stripePrice?: string
  highlighted?: boolean
}
