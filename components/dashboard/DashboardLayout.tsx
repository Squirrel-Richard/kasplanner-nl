// @ts-nocheck
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { OrbBackground } from '../OrbBackground'
import {
  LayoutDashboard,
  TrendingUp,
  Link2,
  Bell,
  Settings,
  LogOut,
  FileText,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overzicht' },
  { href: '/scenarios', icon: TrendingUp, label: "Scenario's" },
  { href: '/integraties', icon: Link2, label: 'Integraties' },
  { href: '/dashboard/facturen', icon: FileText, label: 'Facturen' },
  { href: '/dashboard/alerts', icon: Bell, label: 'Alerts' },
  { href: '/dashboard/instellingen', icon: Settings, label: 'Instellingen' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="relative min-h-screen flex">
      <OrbBackground />

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed left-0 top-0 bottom-0 w-64 z-40 p-4 hidden md:flex flex-col"
        style={{
          background: 'rgba(6, 6, 15, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 px-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center pulse-glow"
            style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }}
          >
            <span className="text-white text-sm font-bold">K</span>
          </div>
          <span className="font-semibold text-white">KasPlanner</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: active ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                  border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                }}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Upgrade CTA */}
        <div
          className="mx-2 mb-4 p-4 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.1))',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <p className="text-xs font-medium text-indigo-300 mb-1">Gratis plan</p>
          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            30 dagen forecast · 1 integratie
          </p>
          <Link
            href="/prijzen"
            className="block text-center text-xs py-2 rounded-lg font-medium"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white',
            }}
          >
            Upgraden →
          </Link>
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl transition-all"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <LogOut size={16} />
          Uitloggen
        </button>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 min-h-screen relative z-10">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-around py-2 px-4"
        style={{
          background: 'rgba(6, 6, 15, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {navItems.slice(0, 5).map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-2"
              style={{ color: active ? '#a5b4fc' : 'rgba(255,255,255,0.4)' }}
            >
              <item.icon size={20} />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
