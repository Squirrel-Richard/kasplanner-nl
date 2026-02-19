// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Loader2, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function InstellingenPage() {
  const [company, setCompany] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: comp } = await supabase.from('companies').select('*').eq('user_id', user.id).single()
    setCompany(comp)
    if (comp) {
      const { data: sub } = await supabase.from('subscriptions').select('*').eq('company_id', comp.id).single()
      setSubscription(sub)
    }
  }

  async function saveCompany() {
    if (!company) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('companies').update({
      naam: company.naam,
      kvk: company.kvk,
      email: company.email,
      cashflow_drempel: company.cashflow_drempel,
    }).eq('id', company.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!company) return (
    <div className="flex justify-center py-12">
      <div className="breathe w-10 h-10 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }} />
    </div>
  )

  return (
    <div className="space-y-6 pb-20 md:pb-0 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Instellingen</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Beheer je bedrijf en abonnement</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h2 className="font-semibold text-white mb-4">Bedrijfsgegevens</h2>
        <div className="space-y-4">
          {[
            { label: 'Bedrijfsnaam', key: 'naam', type: 'text' },
            { label: 'KvK nummer', key: 'kvk', type: 'text' },
            { label: 'E-mailadres', key: 'email', type: 'email' },
            { label: 'Cashflow drempel (€)', key: 'cashflow_drempel', type: 'number' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>{field.label}</label>
              <input
                className="glass-input"
                type={field.type}
                value={company[field.key] || ''}
                onChange={e => setCompany((p: any) => ({ ...p, [field.key]: e.target.value }))}
              />
            </div>
          ))}
          <button onClick={saveCompany} disabled={saving} className="glow-button flex items-center gap-2 text-sm py-2.5 px-6">
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : null}
            {saved ? 'Opgeslagen!' : 'Opslaan'}
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h2 className="font-semibold text-white mb-4">Abonnement</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-white capitalize">{subscription?.plan || 'Gratis'} plan</p>
            {subscription?.geldig_tot && (
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Geldig tot {new Date(subscription.geldig_tot).toLocaleDateString('nl-NL')}
              </p>
            )}
          </div>
          <Link href="/prijzen" className="text-sm px-4 py-2 rounded-xl" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
            Upgraden
          </Link>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
        <h2 className="font-semibold text-white mb-4">Account</h2>
        <button
          onClick={async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/' }}
          className="flex items-center gap-2 text-sm py-2.5 px-4 rounded-xl transition-all"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <LogOut size={16} />
          Uitloggen
        </button>
      </motion.div>
    </div>
  )
}
