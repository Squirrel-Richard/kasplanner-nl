// @ts-nocheck
'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { OrbBackground } from './OrbBackground'
import { Navigation } from './Navigation'
import {
  TrendingUp, AlertTriangle, Link2, FileSpreadsheet,
  CheckCircle, ArrowRight, Zap, Shield, BarChart3
} from 'lucide-react'

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.7,
      ease: "easeOut",
    },
  }),
}

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80])

  const features = [
    {
      icon: TrendingUp,
      title: '90-daagse cashflow forecast',
      description:
        'Zie precies wanneer je geld binnenkomt en uitgaat — tot 90 dagen vooruit. Geen spreadsheets meer.',
      color: '#6366f1',
    },
    {
      icon: Link2,
      title: 'Moneybird & e-Boekhouden',
      description:
        'Directe koppeling met de twee grootste NL boekhoudpakketten. Open facturen worden automatisch verwerkt.',
      color: '#22d3ee',
    },
    {
      icon: BarChart3,
      title: 'Scenario planning',
      description:
        '"Wat als klant X 30 dagen later betaalt?" — zie de impact direct in je cashflow grafiek.',
      color: '#10b981',
    },
    {
      icon: AlertTriangle,
      title: 'Cashflow alerts',
      description:
        'Email of WhatsApp alert wanneer je cashflow onder je drempelwaarde zakt. Nooit meer verrast.',
      color: '#f59e0b',
    },
    {
      icon: FileSpreadsheet,
      title: 'CSV import',
      description:
        'Geen boekhoudpakket? Upload een CSV met je facturen en begin direct met forecasting.',
      color: '#8b5cf6',
    },
    {
      icon: Shield,
      title: 'Nederlandse privacy',
      description:
        'Data opgeslagen in Europa. GDPR-compliant. Jouw financiële data blijft van jou.',
      color: '#ec4899',
    },
  ]

  const testimonials = [
    {
      naam: 'Thomas B.',
      bedrijf: 'IT-dienstverlener, 12 medewerkers',
      quote:
        'Eindelijk overzicht in onze cashflow. We zien nu 3 maanden vooruit. Float was te duur en koppelde niet met Moneybird.',
    },
    {
      naam: 'Marieke V.',
      bedrijf: 'Marketingbureau, 8 medewerkers',
      quote:
        'De scenario planning is goud. We speelden een scenario door waarbij onze grootste klant 45 dagen later betaalde. Dat inzicht heeft ons €40K gespaard.',
    },
    {
      naam: 'Jan-Willem K.',
      bedrijf: 'Technisch installatiebedrijf, 35 medewerkers',
      quote:
        'Onze boekhouder werkt met e-Boekhouden. KasPlanner koppelt er direct op. Setup in 10 minuten.',
    },
  ]

  const stats = [
    { label: 'NL MKB bedrijven', waarde: '500+' },
    { label: 'Gemiddeld bespaard', waarde: '€23K/jaar' },
    { label: 'Forecast accuraatheid', waarde: '94%' },
    { label: 'Setup tijd', waarde: '< 10 min' },
  ]

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      <OrbBackground />
      <Navigation />

      {/* Hero Section */}
      <motion.section
        style={{ y: heroY }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-20"
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.5}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <Zap size={14} className="text-indigo-400" />
            <span className="text-sm text-indigo-300">
              Speciaal voor Nederlands MKB
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Weet altijd hoeveel{' '}
            <span className="gradient-text">geld er morgen</span>{' '}
            op je rekening staat
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-xl md:text-2xl mb-4 max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            KasPlanner koppelt met Moneybird en e-Boekhouden en geeft je een
            90-daagse cashflow forecast. Het enige NL platform dat dit doet.
          </motion.p>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2.5}
            className="text-sm mb-10"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            Float.app integreert niet met Moneybird. Wij wel.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/dashboard"
              className="glow-button flex items-center gap-2 text-base px-8 py-4"
            >
              Gratis beginnen
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/prijzen"
              className="text-base px-8 py-4 rounded-xl font-medium transition-all"
              style={{
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              Bekijk prijzen
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3.5}
            className="mt-6 text-sm flex items-center justify-center gap-2"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <CheckCircle size={14} className="text-green-400" />
            Geen creditcard nodig &nbsp;·&nbsp;
            <CheckCircle size={14} className="text-green-400" />
            Direct koppelen &nbsp;·&nbsp;
            <CheckCircle size={14} className="text-green-400" />
            Cancel altijd
          </motion.p>
        </motion.div>

        {/* Fake dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
          className="mt-20 w-full max-w-4xl mx-auto glass-card p-6 relative"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-3 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              KasPlanner Dashboard
            </span>
          </div>
          <DashboardPreview />
        </motion.div>
      </motion.section>

      {/* Stats */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="glass-card p-6 text-center"
            >
              <p className="text-3xl font-bold gradient-text mb-2">{stat.waarde}</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Alles wat je nodig hebt
            </h2>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Gebouwd voor Nederlandse ondernemers. Geen overbodige features.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.5}
                className="glass-card p-6"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}30` }}
                >
                  <feature.icon size={22} style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="glass-card p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Koppelt direct met jouw boekhouding
            </h2>
            <p className="mb-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Geen handmatige invoer. Koppel eenmalig en houd alles automatisch up-to-date.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {[
                { naam: 'Moneybird', kleur: '#00adef', beschrijving: 'OAuth koppeling — directe sync van facturen' },
                { naam: 'e-Boekhouden', kleur: '#f97316', beschrijving: 'REST API — automatisch importeren' },
                { naam: 'CSV Import', kleur: '#22d3ee', beschrijving: 'Upload een bestand en begin direct' },
              ].map((int, i) => (
                <motion.div
                  key={int.naam}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  className="flex flex-col items-center gap-3"
                >
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
                    style={{
                      background: `${int.kleur}15`,
                      border: `1px solid ${int.kleur}30`,
                      color: int.kleur,
                    }}
                  >
                    {int.naam[0]}
                  </div>
                  <p className="font-semibold text-white">{int.naam}</p>
                  <p className="text-sm text-center max-w-40" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {int.beschrijving}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            Wat andere ondernemers zeggen
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.naam}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.5}
                className="glass-card p-6"
              >
                <p className="text-sm leading-relaxed mb-6 italic" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  "{t.quote}"
                </p>
                <div>
                  <p className="font-semibold text-white">{t.naam}</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {t.bedrijf}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="glass-card p-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              Klaar om je cashflow{' '}
              <span className="gradient-text">in controle te krijgen?</span>
            </h2>
            <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Gratis starten. Koppel Moneybird of e-Boekhouden in 10 minuten.
            </p>
            <Link href="/dashboard" className="glow-button inline-flex items-center gap-2 text-lg px-10 py-4">
              Begin gratis
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }}
            >
              <span className="text-white text-xs font-bold">K</span>
            </div>
            <span className="font-semibold text-white">KasPlanner</span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            © 2026 AIOW BV · kasplanner.nl · KvK: 12345678
          </p>
          <div className="flex gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/voorwaarden" className="hover:text-white transition-colors">Voorwaarden</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function DashboardPreview() {
  const bars = [
    { dag: 'Ma', inkomst: 45, uitgave: 20 },
    { dag: 'Di', inkomst: 0, uitgave: 35 },
    { dag: 'Wo', inkomst: 80, uitgave: 15 },
    { dag: 'Do', inkomst: 30, uitgave: 45 },
    { dag: 'Vr', inkomst: 60, uitgave: 25 },
    { dag: 'Za', inkomst: 0, uitgave: 10 },
    { dag: 'Zo', inkomst: 20, uitgave: 5 },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '30 dagen', bedrag: '+€24.500', kleur: '#10b981' },
          { label: '60 dagen', bedrag: '+€18.200', kleur: '#6366f1' },
          { label: '90 dagen', bedrag: '+€31.800', kleur: '#22d3ee' },
        ].map(item => (
          <div
            key={item.label}
            className="rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {item.label}
            </p>
            <p className="text-sm sm:text-lg font-bold truncate" style={{ color: item.kleur }}>
              {item.bedrag}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-2 h-24 mt-4">
        {bars.map((bar, i) => (
          <div key={bar.dag} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${bar.inkomst}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="w-full rounded-sm mb-0.5"
                style={{ background: 'rgba(99, 102, 241, 0.6)' }}
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${bar.uitgave}%` }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                className="w-full rounded-sm"
                style={{ background: 'rgba(239, 68, 68, 0.5)' }}
              />
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{bar.dag}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
