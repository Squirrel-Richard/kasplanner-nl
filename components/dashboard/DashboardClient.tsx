// @ts-nocheck
'use client'

import { motion, type Variants } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { generateForecast, formatEuro } from '@/lib/cashflow'
import { CashflowEntry } from '@/lib/types'
import { TrendingUp, TrendingDown, AlertTriangle, Plus, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
}

type ForecastPeriod = 30 | 60 | 90

export function DashboardClient() {
  const [period, setPeriod] = useState<ForecastPeriod>(90)
  const [entries, setEntries] = useState<CashflowEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [drempel, setDrempel] = useState(10000)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (company) {
      setCompanyId(company.id)
      setDrempel(company.cashflow_drempel || 10000)

      const { data: cashflowData } = await supabase
        .from('cashflow_entries')
        .select('*')
        .eq('company_id', company.id)
        .eq('status', 'verwacht')

      setEntries(cashflowData || [])
    }
    setLoading(false)
  }

  const forecast = generateForecast(entries, period)

  // Weekly aggregation for chart
  const weeklyData = forecast.reduce((acc, day, i) => {
    const weekIdx = Math.floor(i / 7)
    if (!acc[weekIdx]) {
      acc[weekIdx] = {
        week: `W${weekIdx + 1}`,
        inkomsten: 0,
        uitgaven: 0,
        cumulatief: 0,
      }
    }
    acc[weekIdx].inkomsten += day.inkomsten
    acc[weekIdx].uitgaven += day.uitgaven
    acc[weekIdx].cumulatief = day.cumulatief
    return acc
  }, [] as { week: string; inkomsten: number; uitgaven: number; cumulatief: number }[])

  const totaalInkomsten = forecast.reduce((s, d) => s + d.inkomsten, 0)
  const totaalUitgaven = forecast.reduce((s, d) => s + d.uitgaven, 0)
  const netto = totaalInkomsten - totaalUitgaven
  const laagstePunt = Math.min(...forecast.map(d => d.cumulatief), 0)

  const alarmDagen = forecast.filter(d => d.cumulatief < drempel).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="breathe w-12 h-12 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }} />
      </div>
    )
  }

  if (!companyId) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Cashflow overzicht</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Forecast voor de komende {period} dagen
          </p>
        </div>
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          {([30, 60, 90] as ForecastPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: period === p ? 'rgba(99,102,241,0.3)' : 'transparent',
                color: period === p ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
              }}
            >
              {p}d
            </button>
          ))}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: `Inkomsten (${period}d)`,
            waarde: formatEuro(totaalInkomsten),
            icon: TrendingUp,
            kleur: '#10b981',
            i: 0,
          },
          {
            label: `Uitgaven (${period}d)`,
            waarde: formatEuro(totaalUitgaven),
            icon: TrendingDown,
            kleur: '#ef4444',
            i: 1,
          },
          {
            label: 'Netto cashflow',
            waarde: formatEuro(netto),
            icon: netto >= 0 ? TrendingUp : AlertTriangle,
            kleur: netto >= 0 ? '#6366f1' : '#f59e0b',
            i: 2,
          },
        ].map(card => (
          <motion.div
            key={card.label}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={card.i}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {card.label}
              </p>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${card.kleur}20` }}
              >
                <card.icon size={16} style={{ color: card.kleur }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: card.kleur }}>
              {card.waarde}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Alert banner */}
      {alarmDagen > 0 && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-300">
            Je cashflow zakt op <strong>{alarmDagen} dag{alarmDagen > 1 ? 'en' : ''}</strong> onder je drempelwaarde van{' '}
            <strong>{formatEuro(drempel)}</strong>. Check je facturen.
          </p>
        </motion.div>
      )}

      {/* Chart */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={4}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-6">Cumulatieve cashflow</h2>
        {weeklyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="gradCumulatief" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="week"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `€${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(6,6,15,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white',
                }}
                formatter={(value: number | undefined) => [formatEuro(value ?? 0), 'Cumulatief']}
              />
              <Area
                type="monotone"
                dataKey="cumulatief"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#gradCumulatief)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </motion.div>

      {/* Weekly bars */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={5}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-6">Inkomsten vs. Uitgaven per week</h2>
        {weeklyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="week"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `€${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(6,6,15,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white',
                }}
                formatter={(value: number | undefined, name: string | undefined) => [
                  formatEuro(value ?? 0),
                  (name ?? '') === 'inkomsten' ? 'Inkomsten' : 'Uitgaven',
                ]}
              />
              <Bar dataKey="inkomsten" fill="rgba(99,102,241,0.7)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="uitgaven" fill="rgba(239,68,68,0.6)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={6}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <Link href="/integraties" className="glass-card p-5 flex items-center gap-4 group cursor-pointer">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(34,211,238,0.15)' }}
          >
            <FileText size={18} className="text-cyan-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">Koppel je boekhouding</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Moneybird of e-Boekhouden verbinden
            </p>
          </div>
          <ArrowRight size={16} className="text-white/40 group-hover:text-white transition-colors" />
        </Link>

        <button
          className="glass-card p-5 flex items-center gap-4 group cursor-pointer text-left w-full"
          onClick={() => {/* TODO: open add entry modal */}}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)' }}
          >
            <Plus size={18} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">Entry toevoegen</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Handmatig een factuur of betaling invoeren
            </p>
          </div>
          <ArrowRight size={16} className="text-white/40 group-hover:text-white transition-colors" />
        </button>
      </motion.div>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-[60vh] text-center"
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 breathe"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,211,238,0.1))' }}
      >
        <TrendingUp size={36} className="text-indigo-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Begin met KasPlanner</h2>
      <p className="text-sm mb-8 max-w-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
        Maak eerst een account aan en stel je bedrijf in om je cashflow te bekijken.
      </p>
      <Link href="/onboarding" className="glow-button flex items-center gap-2">
        Bedrijf instellen
        <ArrowRight size={16} />
      </Link>
    </motion.div>
  )
}

function EmptyChart() {
  return (
    <div
      className="flex items-center justify-center h-40 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
    >
      <div className="text-center">
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Nog geen data — koppel je boekhouding om te beginnen
        </p>
        <Link href="/integraties" className="text-xs text-indigo-400 mt-2 block">
          Koppeling instellen →
        </Link>
      </div>
    </div>
  )
}
