// @ts-nocheck
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { OrbBackground } from './OrbBackground'
import { Navigation } from './Navigation'
import { CheckCircle, ArrowRight, Zap } from 'lucide-react'

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
}

const plannen = [
  {
    naam: 'Gratis',
    prijs: 0,
    periode: '',
    beschrijving: 'Perfect om te starten',
    kleur: '#6366f1',
    highlighted: false,
    features: [
      '1 integratie (Moneybird of e-Boekhouden)',
      '30 dagen cashflow forecast',
      'Handmatige invoer',
      'CSV import',
      '1 bedrijf',
    ],
    cta: 'Gratis starten',
    href: '/dashboard',
    stripePrice: null,
  },
  {
    naam: 'Starter',
    prijs: 19,
    periode: '/maand',
    beschrijving: 'Voor groeiende bedrijven',
    kleur: '#22d3ee',
    highlighted: false,
    features: [
      '2 integraties',
      '90 dagen forecast',
      'Email alerts',
      'Handmatige invoer + CSV',
      '1 bedrijf',
      'Prioriteit support',
    ],
    cta: 'Starter kiezen',
    href: '/dashboard',
    stripePrice: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
  },
  {
    naam: 'Pro',
    prijs: 49,
    periode: '/maand',
    beschrijving: 'Meest populair',
    kleur: '#6366f1',
    highlighted: true,
    features: [
      'Onbeperkte integraties',
      '90 dagen forecast',
      'Email + WhatsApp alerts',
      "Scenario planning",
      'API toegang',
      '2 bedrijven',
      'Prioriteit support',
      'iDEAL betaling',
    ],
    cta: 'Pro kiezen',
    href: '/dashboard',
    stripePrice: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  },
  {
    naam: 'Business',
    prijs: 99,
    periode: '/maand',
    beschrijving: 'Voor grotere organisaties',
    kleur: '#10b981',
    highlighted: false,
    features: [
      'Alles van Pro',
      'Meerdere entiteiten',
      'CFO rapportage',
      'Dedicated support',
      'Custom integraties',
      'SLA garantie',
      'Onboarding begeleiding',
    ],
    cta: 'Business kiezen',
    href: '/dashboard',
    stripePrice: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS,
  },
]

export function PrijzenClient() {
  return (
    <div className="relative min-h-screen">
      <OrbBackground />
      <Navigation />

      <div className="relative z-10 pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center mb-16"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <Zap size={14} className="text-indigo-400" />
              <span className="text-sm text-indigo-300">iDEAL beschikbaar</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Eerlijke, transparante{' '}
              <span className="gradient-text">prijzen</span>
            </h1>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Start gratis. Cancel altijd. Geen verborgen kosten.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plannen.map((plan, i) => (
              <motion.div
                key={plan.naam}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i}
                className="glass-card p-6 flex flex-col"
                style={{
                  border: plan.highlighted
                    ? '1px solid rgba(99,102,241,0.4)'
                    : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: plan.highlighted
                    ? '0 0 40px rgba(99,102,241,0.2)'
                    : undefined,
                }}
              >
                {plan.highlighted && (
                  <div
                    className="text-center text-xs font-semibold py-1 px-3 rounded-full mb-4 -mt-2 mx-auto"
                    style={{ background: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }}
                  >
                    Meest populair
                  </div>
                )}

                <div className="mb-5">
                  <h2 className="text-xl font-bold text-white mb-1">{plan.naam}</h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {plan.beschrijving}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold" style={{ color: plan.kleur }}>
                    {plan.prijs === 0 ? 'Gratis' : `€${plan.prijs}`}
                  </span>
                  {plan.periode && (
                    <span className="text-sm ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {plan.periode}
                    </span>
                  )}
                  {plan.prijs > 0 && (
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      ex. BTW · iDEAL beschikbaar
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <CheckCircle size={14} style={{ color: plan.kleur, flexShrink: 0, marginTop: 2 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={plan.highlighted ? {
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                  } : {
                    background: `${plan.kleur}10`,
                    border: `1px solid ${plan.kleur}20`,
                    color: plan.kleur,
                  }}
                >
                  {plan.cta}
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* FAQ */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={5}
            className="mt-20 glass-card p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Veelgestelde vragen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  v: 'Kan ik altijd opzeggen?',
                  a: 'Ja. Je kunt altijd opzeggen, zonder opzegtermijn. Je houdt toegang tot het einde van je betaalperiode.',
                },
                {
                  v: 'Kan ik betalen via iDEAL?',
                  a: 'Ja. We accepteren iDEAL, creditcard en SEPA machtiging via Stripe.',
                },
                {
                  v: 'Is er een gratis proefperiode?',
                  a: 'Het gratis plan is altijd gratis. Betaalde plannen hebben een 14 dagen gratis proefperiode.',
                },
                {
                  v: 'Hoe veilig is mijn data?',
                  a: 'Data staat in Europa op Supabase. Volledig GDPR-compliant. We verkopen nooit data aan derden.',
                },
                {
                  v: 'Werkt het met Moneybird?',
                  a: 'Ja, via OAuth koppeling. Je autoriseert KasPlanner eenmalig en daarna synct alles automatisch.',
                },
                {
                  v: 'Werkt het met e-Boekhouden?',
                  a: 'Ja, via de REST API. Voer je gebruikersnaam en security code in en we halen alle data op.',
                },
              ].map(faq => (
                <div key={faq.v}>
                  <p className="font-semibold text-white mb-2">{faq.v}</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
