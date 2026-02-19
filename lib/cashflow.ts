import { CashflowEntry, CashflowForecast, ScenarioAanpassing } from './types'
import { addDays, format, parseISO, startOfDay } from 'date-fns'

export function generateForecast(
  entries: CashflowEntry[],
  dagen: number = 90,
  aanpassingen: ScenarioAanpassing[] = []
): CashflowForecast[] {
  const vandaag = startOfDay(new Date())
  const forecast: CashflowForecast[] = []

  // Apply scenario adjustments
  const aangepaste = entries.map(entry => {
    const aanpassing = aanpassingen.find(a => a.entry_id === entry.id)
    if (!aanpassing) return entry

    let aangepast = { ...entry }
    if (aanpassing.type === 'vertraging') {
      const nieuweDatum = addDays(parseISO(entry.verwacht_op), aanpassing.waarde)
      aangepast.verwacht_op = format(nieuweDatum, 'yyyy-MM-dd')
    } else if (aanpassing.type === 'bedrag') {
      aangepast.bedrag = aanpassing.waarde
    } else if (aanpassing.type === 'verwijder') {
      return null
    }
    return aangepast
  }).filter(Boolean) as CashflowEntry[]

  // Build daily map
  const dagMap: Record<string, { inkomsten: number; uitgaven: number }> = {}
  
  for (let i = 0; i < dagen; i++) {
    const datum = format(addDays(vandaag, i), 'yyyy-MM-dd')
    dagMap[datum] = { inkomsten: 0, uitgaven: 0 }
  }

  // Fill in entries
  aangepaste.forEach(entry => {
    if (dagMap[entry.verwacht_op]) {
      if (entry.type === 'inkomst') {
        dagMap[entry.verwacht_op].inkomsten += entry.bedrag
      } else {
        dagMap[entry.verwacht_op].uitgaven += entry.bedrag
      }
    }
  })

  // Calculate cumulative
  let cumulatief = 0
  Object.entries(dagMap).forEach(([datum, { inkomsten, uitgaven }]) => {
    const saldo = inkomsten - uitgaven
    cumulatief += saldo
    forecast.push({ datum, inkomsten, uitgaven, saldo, cumulatief })
  })

  return forecast
}

export function berekenCashflowSamenvatting(forecast: CashflowForecast[]) {
  const over30 = forecast.slice(0, 30)
  const over60 = forecast.slice(0, 60)
  const over90 = forecast

  const totalInkomsten = (data: CashflowForecast[]) =>
    data.reduce((sum, d) => sum + d.inkomsten, 0)
  const totalUitgaven = (data: CashflowForecast[]) =>
    data.reduce((sum, d) => sum + d.uitgaven, 0)

  return {
    over30: {
      inkomsten: totalInkomsten(over30),
      uitgaven: totalUitgaven(over30),
      netto: totalInkomsten(over30) - totalUitgaven(over30),
    },
    over60: {
      inkomsten: totalInkomsten(over60),
      uitgaven: totalUitgaven(over60),
      netto: totalInkomsten(over60) - totalUitgaven(over60),
    },
    over90: {
      inkomsten: totalInkomsten(over90),
      uitgaven: totalUitgaven(over90),
      netto: totalInkomsten(over90) - totalUitgaven(over90),
    },
  }
}

export function formatEuro(bedrag: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(bedrag)
}
