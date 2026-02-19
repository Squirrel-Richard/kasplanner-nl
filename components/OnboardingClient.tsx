// @ts-nocheck
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OrbBackground } from './OrbBackground'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle, Loader2, Building2, Link2, TrendingUp } from 'lucide-react'

const steps = [
  { id: 'bedrijf', label: 'Bedrijf', icon: Building2 },
  { id: 'integratie', label: 'Koppeling', icon: Link2 },
  { id: 'drempel', label: 'Alert', icon: TrendingUp },
]

export function OnboardingClient() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [bedrijf, setBedrijf] = useState({ naam: '', kvk: '', email: '' })
  const [integratie, setIntegratie] = useState('geen')
  const [drempel, setDrempel] = useState('10000')

  async function finish() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Sign in anonymous or redirect
      const { error: signError } = await supabase.auth.signInAnonymously()
      if (signError) {
        setError('Account aanmaken mislukt. Probeer opnieuw.')
        setLoading(false)
        return
      }
    }

    const { data: freshUser } = await supabase.auth.getUser()

    const { error: companyError } = await supabase.from('companies').insert({
      user_id: freshUser.user?.id,
      naam: bedrijf.naam,
      kvk: bedrijf.kvk || null,
      email: bedrijf.email || null,
      cashflow_drempel: parseFloat(drempel) || 10000,
    })

    if (companyError) {
      setError('Bedrijf opslaan mislukt. Probeer opnieuw.')
      setLoading(false)
      return
    }

    // Create free subscription
    const { data: company } = await supabase.from('companies')
      .select('id').eq('user_id', freshUser.user?.id).single()

    if (company) {
      await supabase.from('subscriptions').insert({
        company_id: company.id,
        plan: 'gratis',
      })
    }

    router.push(integratie === 'geen' ? '/dashboard' : '/integraties')
  }

  const canProceed = [
    bedrijf.naam.trim().length > 0,
    true,
    true,
  ][step]

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <OrbBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" as const }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 mb-4"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center pulse-glow"
              style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }}
            >
              <span className="text-white font-bold">K</span>
            </div>
            <span className="text-xl font-bold text-white">KasPlanner</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welkom! Laten we beginnen.</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Setup in 2 minuten — geen creditcard nodig
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all"
                style={{
                  background: i <= step ? 'linear-gradient(135deg, #6366f1, #22d3ee)' : 'rgba(255,255,255,0.08)',
                  color: i <= step ? 'white' : 'rgba(255,255,255,0.4)',
                }}
              >
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className="w-12 h-0.5 transition-all"
                  style={{ background: i < step ? '#6366f1' : 'rgba(255,255,255,0.1)' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="bedrijf"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Jouw bedrijf</h2>
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Bedrijfsnaam *
                  </label>
                  <input
                    className="glass-input"
                    placeholder="AIOW BV"
                    value={bedrijf.naam}
                    onChange={e => setBedrijf(p => ({ ...p, naam: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    KvK nummer (optioneel)
                  </label>
                  <input
                    className="glass-input"
                    placeholder="12345678"
                    value={bedrijf.kvk}
                    onChange={e => setBedrijf(p => ({ ...p, kvk: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    E-mailadres voor alerts
                  </label>
                  <input
                    className="glass-input"
                    type="email"
                    placeholder="jij@bedrijf.nl"
                    value={bedrijf.email}
                    onChange={e => setBedrijf(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="integratie"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-white mb-4">Welk boekhoudpakket gebruik je?</h2>
                <div className="space-y-3">
                  {[
                    { id: 'moneybird', label: 'Moneybird', kleur: '#00adef' },
                    { id: 'eboekhouden', label: 'e-Boekhouden', kleur: '#f97316' },
                    { id: 'geen', label: 'Geen / anders — ik voer handmatig in', kleur: '#6366f1' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setIntegratie(opt.id)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left"
                      style={{
                        background: integratie === opt.id ? `${opt.kleur}15` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${integratie === opt.id ? opt.kleur + '40' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{ background: `${opt.kleur}20`, color: opt.kleur }}
                      >
                        {opt.label[0]}
                      </div>
                      <span className="text-sm text-white">{opt.label}</span>
                      {integratie === opt.id && (
                        <CheckCircle size={16} className="ml-auto" style={{ color: opt.kleur }} />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="drempel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-white mb-2">Cashflow drempelwaarde</h2>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Je ontvangt een alert als je cashflow hieronder zakt. Je kunt dit later aanpassen.
                </p>
                <label className="text-xs mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Minimale cashflow (€)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    €
                  </span>
                  <input
                    className="glass-input pl-8"
                    type="number"
                    min="0"
                    value={drempel}
                    onChange={e => setDrempel(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  {['5000', '10000', '25000', '50000'].map(v => (
                    <button
                      key={v}
                      onClick={() => setDrempel(v)}
                      className="flex-1 py-2 rounded-lg text-xs transition-all"
                      style={{
                        background: drempel === v ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${drempel === v ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                        color: drempel === v ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      €{parseInt(v) >= 1000 ? `${parseInt(v)/1000}k` : v}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p className="text-sm text-red-400 mt-4">{error}</p>
          )}

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep(p => p - 1)}
                className="px-6 py-3 rounded-xl text-sm transition-all"
                style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Terug
              </button>
            )}
            <button
              onClick={step < steps.length - 1 ? () => setStep(p => p + 1) : finish}
              disabled={!canProceed || loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: canProceed ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.06)',
                color: canProceed ? 'white' : 'rgba(255,255,255,0.3)',
                boxShadow: canProceed ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Bezig...</>
              ) : step < steps.length - 1 ? (
                <>Volgende <ArrowRight size={16} /></>
              ) : (
                <>Starten <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
