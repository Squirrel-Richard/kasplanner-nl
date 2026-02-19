// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { generateForecast, formatEuro } from '@/lib/cashflow'
import { CashflowEntry } from '@/lib/types'
import { AlertTriangle, Bell, CheckCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

export default function AlertsPage() {
  const [entries, setEntries] = useState<CashflowEntry[]>([])
  const [drempel, setDrempel] = useState(10000)
  const [emailAlert, setEmailAlert] = useState(true)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: company } = await supabase.from('companies').select('*').eq('user_id', user.id).single()
    if (company) {
      setCompanyId(company.id)
      setDrempel(company.cashflow_drempel || 10000)
      const { data } = await supabase.from('cashflow_entries').select('*').eq('company_id', company.id).eq('status', 'verwacht')
      setEntries(data || [])
    }
    setLoading(false)
  }

  async function saveDrempel() {
    if (!companyId) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('companies').update({ cashflow_drempel: drempel }).eq('id', companyId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const forecast = generateForecast(entries, 90)
  const alarmDagen = forecast.filter(d => d.cumulatief < drempel)

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-white">Cashflow Alerts</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Ontvang een waarschuwing als je cashflow onder de drempel zakt
        </p>
      </div>

      {/* Drempel instellen */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h2 className="font-semibold text-white mb-4">Drempelwaarde</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Alert wanneer cashflow zakt onder
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>€</span>
              <input
                type="number"
                min="0"
                value={drempel}
                onChange={e => setDrempel(parseFloat(e.target.value))}
                className="glass-input pl-8"
              />
            </div>
          </div>
          <button
            onClick={saveDrempel}
            disabled={saving}
            className="mt-6 glow-button flex items-center gap-2 text-sm py-2.5 px-5"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : null}
            {saved ? 'Opgeslagen!' : 'Opslaan'}
          </button>
        </div>
      </motion.div>

      {/* Alert kanalen */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="font-semibold text-white mb-4">Alert kanalen</h2>
        <div className="space-y-3">
          {[
            { id: 'email', label: 'Email alerts', desc: 'Ontvang een email als cashflow de drempel nadert', plan: 'starter', enabled: emailAlert },
            { id: 'whatsapp', label: 'WhatsApp alerts', desc: 'Direct bericht op je telefoon', plan: 'pro', enabled: false },
          ].map(ch => (
            <div
              key={ch.id}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-3">
                <Bell size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{ch.label}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                      {ch.plan}+
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{ch.desc}</p>
                </div>
              </div>
              <div
                className="w-10 h-6 rounded-full transition-all cursor-pointer relative"
                style={{ background: ch.enabled ? '#6366f1' : 'rgba(255,255,255,0.1)' }}
                onClick={() => ch.id === 'email' && setEmailAlert(!emailAlert)}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                  style={{ left: ch.enabled ? '18px' : '2px' }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Komende alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h2 className="font-semibold text-white mb-4">
          Komende cashflow waarschuwingen
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="breathe w-8 h-8 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }} />
          </div>
        ) : alarmDagen.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle size={18} className="text-green-400" />
            <p className="text-sm text-green-300">
              Cashflow blijft de komende 90 dagen boven {formatEuro(drempel)}. Goed bezig!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {alarmDagen.slice(0, 10).map((dag, i) => (
              <motion.div
                key={dag.datum}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-yellow-400" />
                  <span className="text-sm text-yellow-200">
                    {format(new Date(dag.datum), 'd MMMM yyyy', { locale: nl })}
                  </span>
                </div>
                <span className="text-sm font-semibold" style={{ color: dag.cumulatief < 0 ? '#f87171' : '#fbbf24' }}>
                  {formatEuro(dag.cumulatief)}
                </span>
              </motion.div>
            ))}
            {alarmDagen.length > 10 && (
              <p className="text-xs text-center pt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                + {alarmDagen.length - 10} meer dagen
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
