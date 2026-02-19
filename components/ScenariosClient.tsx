// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { generateForecast, formatEuro } from '@/lib/cashflow'
import { CashflowEntry, Scenario, ScenarioAanpassing } from '@/lib/types'
import { DashboardLayout } from './dashboard/DashboardLayout'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { Plus, Trash2, AlertCircle, TrendingUp } from 'lucide-react'

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
}

export function ScenariosClient() {
  const [entries, setEntries] = useState<CashflowEntry[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null)
  const [newScenarioNaam, setNewScenarioNaam] = useState('')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: company } = await supabase
      .from('companies').select('id').eq('user_id', user.id).single()
    if (!company) { setLoading(false); return }

    setCompanyId(company.id)

    const [{ data: entriesData }, { data: scenariosData }] = await Promise.all([
      supabase.from('cashflow_entries').select('*').eq('company_id', company.id).eq('status', 'verwacht'),
      supabase.from('scenarios').select('*').eq('company_id', company.id).order('created_at', { ascending: false }),
    ])

    setEntries(entriesData || [])
    setScenarios(scenariosData || [])
    setLoading(false)
  }

  async function createScenario() {
    if (!newScenarioNaam.trim() || !companyId) return
    const supabase = createClient()
    const { data } = await supabase.from('scenarios').insert({
      company_id: companyId,
      naam: newScenarioNaam,
      aanpassingen: [],
    }).select().single()
    if (data) {
      setScenarios(prev => [data, ...prev])
      setActiveScenario(data)
      setNewScenarioNaam('')
    }
  }

  async function deleteScenario(id: string) {
    const supabase = createClient()
    await supabase.from('scenarios').delete().eq('id', id)
    setScenarios(prev => prev.filter(s => s.id !== id))
    if (activeScenario?.id === id) setActiveScenario(null)
  }

  async function addAanpassing(entryId: string, type: 'vertraging', waarde: number) {
    if (!activeScenario) return
    const nieuw: ScenarioAanpassing = { entry_id: entryId, type, waarde }
    const aanpassingen = [...(activeScenario.aanpassingen || []), nieuw]
    const supabase = createClient()
    await supabase.from('scenarios').update({ aanpassingen }).eq('id', activeScenario.id)
    setActiveScenario(prev => prev ? { ...prev, aanpassingen } : null)
    setScenarios(prev => prev.map(s => s.id === activeScenario.id ? { ...s, aanpassingen } : s))
  }

  const baselineForecast = generateForecast(entries, 90)
  const scenarioForecast = activeScenario
    ? generateForecast(entries, 90, activeScenario.aanpassingen)
    : baselineForecast

  // Weekly for chart
  const toWeekly = (forecast: typeof baselineForecast) =>
    forecast.reduce((acc, day, i) => {
      const wi = Math.floor(i / 7)
      if (!acc[wi]) acc[wi] = { week: `W${wi + 1}`, cumulatief: 0 }
      acc[wi].cumulatief = day.cumulatief
      return acc
    }, [] as { week: string; cumulatief: number }[])

  const baseWeekly = toWeekly(baselineForecast)
  const scenarioWeekly = toWeekly(scenarioForecast)

  const chartData = baseWeekly.map((d, i) => ({
    week: d.week,
    basis: d.cumulatief,
    scenario: scenarioWeekly[i]?.cumulatief ?? d.cumulatief,
  }))

  const inkomstEntries = entries.filter(e => e.type === 'inkomst').slice(0, 10)

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20 md:pb-0">
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-2xl font-bold text-white">Scenario planning</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Simuleer "wat als" situaties en zie de impact op je cashflow
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scenario lijst */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="space-y-4">
            <div className="glass-card p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Nieuw scenario</h2>
              <input
                className="glass-input mb-3"
                placeholder="Naam (bijv. 'Klant X betaalt laat')"
                value={newScenarioNaam}
                onChange={e => setNewScenarioNaam(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createScenario()}
              />
              <button onClick={createScenario} className="glow-button w-full text-sm py-2 flex items-center justify-center gap-2">
                <Plus size={14} />
                Aanmaken
              </button>
            </div>

            {scenarios.length === 0 && (
              <div className="glass-card p-6 text-center">
                <TrendingUp size={32} className="mx-auto mb-3 text-indigo-400 opacity-50" />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Nog geen scenario's
                </p>
              </div>
            )}

            {scenarios.map((s, i) => (
              <motion.div
                key={s.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i}
                className="glass-card p-4 cursor-pointer"
                onClick={() => setActiveScenario(s)}
                style={{
                  border: activeScenario?.id === s.id
                    ? '1px solid rgba(99,102,241,0.4)'
                    : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white text-sm">{s.naam}</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {(s.aanpassingen || []).length} aanpassing{(s.aanpassingen || []).length !== 1 ? 'en' : ''}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteScenario(s.id) }}
                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main chart + editor */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="lg:col-span-2 space-y-6"
          >
            {/* Chart */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Impact visualisatie</h2>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5" style={{ background: '#6366f1' }} />
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Basis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5" style={{ background: '#f59e0b' }} />
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Scenario</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gradBasis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradScenario" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(6,6,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                    formatter={(v: any, n?: any): any => [formatEuro(Number(v)), n === "basis" ? "Basis" : "Scenario"]}
                  />
                  <Area type="monotone" dataKey="basis" stroke="#6366f1" strokeWidth={2} fill="url(#gradBasis)" />
                  <Area type="monotone" dataKey="scenario" stroke="#f59e0b" strokeWidth={2} fill="url(#gradScenario)" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Aanpassingen editor */}
            {activeScenario ? (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Aanpassingen voor "{activeScenario.naam}"
                </h2>
                {inkomstEntries.length === 0 ? (
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Voeg eerst inkomsten toe via Integraties of handmatig invoer.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {inkomstEntries.map(entry => {
                      const aanpassing = activeScenario.aanpassingen?.find(a => a.entry_id === entry.id)
                      return (
                        <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <div className="flex-1">
                            <p className="text-sm text-white">{entry.omschrijving || 'Factuur'}</p>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                              {formatEuro(entry.bedrag)} · {entry.verwacht_op}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>+</span>
                            <input
                              type="number"
                              min={0}
                              max={90}
                              placeholder="0"
                              defaultValue={aanpassing?.type === 'vertraging' ? aanpassing.waarde : 0}
                              className="glass-input w-20 text-center text-sm py-1"
                              onBlur={e => {
                                const val = parseInt(e.target.value)
                                if (val > 0) addAanpassing(entry.id, 'vertraging', val)
                              }}
                            />
                            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>dagen</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                <AlertCircle size={32} className="mx-auto mb-3 text-indigo-400 opacity-50" />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Selecteer of maak een scenario aan om aanpassingen te doen
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
