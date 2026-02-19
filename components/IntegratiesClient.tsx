// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from './dashboard/DashboardLayout'
import { Link2, CheckCircle, AlertCircle, Upload, ArrowRight, Loader2 } from 'lucide-react'

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
}

export function IntegratiesClient() {
  const [company, setCompany] = useState<any>(null)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [syncResult, setSyncResult] = useState<{ type: string; success: boolean; message: string } | null>(null)

  useEffect(() => {
    loadCompany()
  }, [])

  async function loadCompany() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('companies').select('*').eq('user_id', user.id).single()
    setCompany(data)
  }

  function connectMoneybird() {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_MONEYBIRD_CLIENT_ID || '',
      redirect_uri: process.env.NEXT_PUBLIC_MONEYBIRD_REDIRECT_URI || 'https://kasplanner.nl/api/auth/moneybird/callback',
      response_type: 'code',
      scope: 'sales_invoices estimates documents settings',
    })
    window.location.href = `https://moneybird.com/oauth/authorize?${params}`
  }

  async function syncMoneybird() {
    setSyncing('moneybird')
    try {
      const res = await fetch('/api/sync/moneybird', { method: 'POST' })
      const data = await res.json()
      setSyncResult({ type: 'moneybird', success: res.ok, message: data.message || (res.ok ? 'Sync gelukt!' : 'Sync mislukt') })
    } catch {
      setSyncResult({ type: 'moneybird', success: false, message: 'Verbindingsfout' })
    }
    setSyncing(null)
  }

  async function syncEboekhouden() {
    setSyncing('eboekhouden')
    try {
      const res = await fetch('/api/sync/eboekhouden', { method: 'POST' })
      const data = await res.json()
      setSyncResult({ type: 'eboekhouden', success: res.ok, message: data.message || (res.ok ? 'Sync gelukt!' : 'Sync mislukt') })
    } catch {
      setSyncResult({ type: 'eboekhouden', success: false, message: 'Verbindingsfout' })
    }
    setSyncing(null)
  }

  async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !company) return

    const text = await file.text()
    const lines = text.split('\n').slice(1).filter(Boolean)
    const supabase = createClient()

    let imported = 0
    for (const line of lines) {
      const [omschrijving, bedragStr, datum, typeStr] = line.split(',').map(s => s.trim().replace(/"/g, ''))
      const bedrag = parseFloat(bedragStr)
      if (isNaN(bedrag) || !datum) continue

      await supabase.from('cashflow_entries').insert({
        company_id: company.id,
        type: typeStr?.toLowerCase().includes('uitgave') ? 'uitgave' : 'inkomst',
        bron: 'handmatig',
        omschrijving,
        bedrag: Math.abs(bedrag),
        verwacht_op: datum,
        status: 'verwacht',
      })
      imported++
    }

    setSyncResult({ type: 'csv', success: true, message: `${imported} regels geïmporteerd uit CSV` })
  }

  const moneybirdConnected = !!company?.moneybird_access_token
  const eboekhoudenConnected = !!company?.eboekhouden_username

  const integraties = [
    {
      id: 'moneybird',
      naam: 'Moneybird',
      beschrijving: 'Koppel via OAuth. Haal automatisch openstaande debiteuren en crediteuren op.',
      kleur: '#00adef',
      connected: moneybirdConnected,
      onConnect: connectMoneybird,
      onSync: syncMoneybird,
      features: ['Openstaande facturen', 'Inkoopfacturen', 'Automatische sync', 'OAuth beveiliging'],
    },
    {
      id: 'eboekhouden',
      naam: 'e-Boekhouden',
      beschrijving: 'REST API koppeling. Voer je gebruikersnaam en security code in.',
      kleur: '#f97316',
      connected: eboekhoudenConnected,
      onConnect: () => {},
      onSync: syncEboekhouden,
      showForm: !eboekhoudenConnected,
      features: ['Openstaande posten', 'Bankboek', 'Dagboeken', 'REST API'],
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20 md:pb-0">
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="text-2xl font-bold text-white">Integraties</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Koppel je boekhoudpakket voor automatische cashflow data
          </p>
        </motion.div>

        {syncResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{
              background: syncResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${syncResult.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          >
            {syncResult.success ? (
              <CheckCircle size={16} className="text-green-400" />
            ) : (
              <AlertCircle size={16} className="text-red-400" />
            )}
            <p className="text-sm" style={{ color: syncResult.success ? '#34d399' : '#f87171' }}>
              {syncResult.message}
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integraties.map((int, i) => (
            <motion.div
              key={int.id}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
              className="glass-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                    style={{ background: `${int.kleur}15`, color: int.kleur }}
                  >
                    {int.naam[0]}
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">{int.naam}</h2>
                    {int.connected ? (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle size={12} className="text-green-400" />
                        <span className="text-xs text-green-400">Gekoppeld</span>
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Niet gekoppeld</span>
                    )}
                  </div>
                </div>
                <Link2 size={18} style={{ color: int.connected ? int.kleur : 'rgba(255,255,255,0.3)' }} />
              </div>

              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {int.beschrijving}
              </p>

              <ul className="space-y-1.5 mb-5">
                {int.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: int.kleur }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* e-Boekhouden form */}
              {int.id === 'eboekhouden' && !eboekhoudenConnected && (
                <EBoekhoudenForm companyId={company?.id} onSuccess={loadCompany} kleur={int.kleur} />
              )}

              <div className="flex gap-3 mt-4">
                {!int.connected ? (
                  <button
                    onClick={int.onConnect}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: `${int.kleur}15`,
                      border: `1px solid ${int.kleur}30`,
                      color: int.kleur,
                    }}
                  >
                    {int.id === 'moneybird' ? (
                      <>Koppelen via OAuth <ArrowRight size={14} /></>
                    ) : null}
                  </button>
                ) : (
                  <button
                    onClick={int.onSync}
                    disabled={syncing === int.id}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: `${int.kleur}15`,
                      border: `1px solid ${int.kleur}30`,
                      color: int.kleur,
                    }}
                  >
                    {syncing === int.id ? (
                      <><Loader2 size={14} className="animate-spin" /> Synchroniseren...</>
                    ) : (
                      <>Sync nu <ArrowRight size={14} /></>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CSV Upload */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,211,238,0.1)' }}>
              <Upload size={20} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">CSV Import</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Geen koppeling? Upload handmatig
              </p>
            </div>
          </div>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Upload een CSV bestand met kolommen: omschrijving, bedrag, datum (YYYY-MM-DD), type (inkomst/uitgave)
          </p>
          <label
            className="flex items-center justify-center gap-3 py-8 rounded-xl cursor-pointer transition-all"
            style={{
              border: '2px dashed rgba(34,211,238,0.2)',
              background: 'rgba(34,211,238,0.03)',
            }}
          >
            <Upload size={20} className="text-cyan-400" />
            <span className="text-sm text-cyan-400">CSV bestand kiezen</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
          </label>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

function EBoekhoudenForm({ companyId, onSuccess, kleur }: {
  companyId: string
  onSuccess: () => void
  kleur: string
}) {
  const [username, setUsername] = useState('')
  const [securityCode, setSecurityCode] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!username || !securityCode || !companyId) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('companies').update({
      eboekhouden_username: username,
      eboekhouden_security_code: securityCode,
    }).eq('id', companyId)
    setSaving(false)
    onSuccess()
  }

  return (
    <div className="space-y-3 mb-4">
      <input
        className="glass-input"
        placeholder="e-Boekhouden gebruikersnaam"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        className="glass-input"
        type="password"
        placeholder="Security code"
        value={securityCode}
        onChange={e => setSecurityCode(e.target.value)}
      />
      <button
        onClick={save}
        disabled={saving}
        className="w-full py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
        style={{ background: `${kleur}15`, border: `1px solid ${kleur}30`, color: kleur }}
      >
        {saving ? <><Loader2 size={14} className="animate-spin" /> Opslaan...</> : 'Opslaan'}
      </button>
    </div>
  )
}
