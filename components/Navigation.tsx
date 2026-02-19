// @ts-nocheck
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'

export function Navigation() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/prijzen', label: 'Prijzen' },
    { href: '/dashboard', label: 'Dashboard' },
  ]

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div
        className="mx-4 mt-4 px-6 py-3 rounded-2xl"
        style={{
          background: 'rgba(6, 6, 15, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center pulse-glow"
              style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }}
            >
              <span className="text-white text-sm font-bold">K</span>
            </div>
            <span className="font-semibold text-white">KasPlanner</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm transition-colors"
                style={{
                  color: pathname === link.href
                    ? 'white'
                    : 'rgba(255,255,255,0.6)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden md:block text-sm px-4 py-2 rounded-xl font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
              }}
            >
              Gratis starten
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <div className="w-5 h-0.5 bg-white mb-1" />
              <div className="w-5 h-0.5 bg-white mb-1" />
              <div className="w-5 h-0.5 bg-white" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden mt-4 pt-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm"
                style={{ color: 'rgba(255,255,255,0.7)' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="block mt-3 text-sm px-4 py-2 rounded-xl font-medium text-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
              }}
              onClick={() => setMobileOpen(false)}
            >
              Gratis starten
            </Link>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
