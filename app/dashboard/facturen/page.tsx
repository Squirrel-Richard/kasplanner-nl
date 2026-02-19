// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { CashflowEntry } from '@/lib/types'
import { formatEuro } from '@/lib/cashflow'
import { Plus, FileText, ArrowUpRight, ArrowDownRight, Loader2, X } from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

// Simple fade animation helper
function getFadeUp(i = 0) {
  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.05, duration: 0.4 },
  }
}

export default function FacturenPage() {
  const [entries, setEntries] = useState<CashflowEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'alle' | 'inkomst' | 'uitgave'>('alle')

  // New entry form
  const [form, setForm] = useState({
    type: 'inkomst' as 'inkomst' | 'uitgave',
    omschrijving: '',
    bedrag: '',
    verwacht_op: new Date().toISOString().split('T')[0],
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: company } = await supabase.from('companies').select('id').eq('user_id', user.id).single()
    if (company) {
      setCompanyId(company.id)
      const { data } = await supabase
        .from('cashflow_entries')
        .select('*')
        .eq('company_id', company.id)
        .order('verwacht_op', { ascending: true })
      setEntries(data || [])
    }
    setLoading(false)
  }

  async function addEntry() {
    if (!companyId || !form.omschrijving || !form.bedrag) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('cashflow_entries').insert({
      company_id: companyId,
      type: form.type,
      bron: 'handmatig',
      omschrijving: form.omschrijving,
      bedrag: parseFloat(form.bedrag),
      verwacht_op: form.verwacht_op,
      status: 'verwacht',
    }).select().single()
    if (data) setEntries(prev => [...prev, data])
    setShowForm(false)
    setForm({ type: 'inkomst', omschrijving: '', bedrag: '', verwacht_op: new Date().toISOString().split('T')[0] })
    setSaving(false)
  }

  async function updateStatus(id: string, status: 'verwacht' | 'ontvangen' | 'betaald') {
    const supabase = createClient()
    await supabase.from('cashflow_entries').update({ status }).eq('id', id)
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status } : e))
  }

  async function deleteEntry(id: string) {
    const supabase = createClient()
    await supabase.from('cashflow_entries').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const filtered = entries.filter(e => filter === 'alle' || e.type === filter)

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Facturen & Betalingen</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Beheer je cashflow entries
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="glow-button flex items-center gap-2 text-sm py-2.5 px-4"
        >
          <Plus size={16} />
          Toevoegen
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['alle', 'inkomst', 'uitgave'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-sm capitalize transition-all"
            style={{
              background: filter === f ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
              color: filter === f ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${filter === f ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            {f === 'alle' ? 'Alle' : f === 'inkomst' ? 'Inkomsten' : 'Uitgaven'}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Nieuwe entry</h2>
            <button onClick={() => setShowForm(false)}>
              <X size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-2">
              {(['inkomst', 'uitgave'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setForm(p => ({ ...p, type: t }))}
                  className="flex-1 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: form.type === t
                      ? t === 'inkomst' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${form.type === t
                      ? t === 'inkomst' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'
                      : 'rgba(255,255,255,0.08)'}`,
                    color: form.type === t
                      ? t === 'inkomst' ? '#34d399' : '#f87171'
                      : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {t === 'inkomst' ? 'Inkomst' : 'Uitgave'}
                </button>
              ))}
            </div>
            <input className="glass-input" placeholder="Omschrijving" value={form.omschrijving} onChange={e => setForm(p => ({ ...p, omschrijving: e.target.value }))} />
            <input className="glass-input" type="number" placeholder="Bedrag (€)" value={form.bedrag} onChange={e => setForm(p => ({ ...p, bedrag: e.target.value }))} />
            <input className="glass-input" type="date" value={form.verwacht_op} onChange={e => setForm(p => ({ ...p, verwacht_op: e.target.value }))} />
          </div>
          <button
            onClick={addEntry}
            disabled={saving}
            className="mt-4 glow-button flex items-center gap-2 text-sm py-2.5 px-6"
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Opslaan...</> : 'Opslaan'}
          </button>
        </motion.div>
      )}

      {/* Entries list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="breathe w-10 h-10 rounded-full" style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'rgba(255,255,255,0.5)' }} />
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Nog geen entries</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="glass-card p-4 flex items-center gap-4"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: entry.type === 'inkomst' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                }}
              >
                {entry.type === 'inkomst'
                  ? <ArrowUpRight size={18} className="text-green-400" />
                  : <ArrowDownRight size={18} className="text-red-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{entry.omschrijving || 'Onbekend'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {format(new Date(entry.verwacht_op), 'd MMM yyyy', { locale: nl })}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                    background: entry.bron === 'moneybird' ? 'rgba(0,173,239,0.15)' : entry.bron === 'eboekhouden' ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.08)',
                    color: entry.bron === 'moneybird' ? '#00adef' : entry.bron === 'eboekhouden' ? '#f97316' : 'rgba(255,255,255,0.5)',
                  }}>
                    {entry.bron}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm" style={{ color: entry.type === 'inkomst' ? '#34d399' : '#f87171' }}>
                  {entry.type === 'inkomst' ? '+' : '-'}{formatEuro(entry.bedrag)}
                </p>
                <select
                  value={entry.status}
                  onChange={e => updateStatus(entry.id, e.target.value as any)}
                  className="text-xs mt-1 rounded-lg px-2 py-0.5 border-none outline-none cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                >
                  <option value="verwacht">Verwacht</option>
                  <option value="ontvangen">Ontvangen</option>
                  <option value="betaald">Betaald</option>
                </select>
              </div>
              <button onClick={() => deleteEntry(entry.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                <X size={14} className="text-red-400 opacity-60 hover:opacity-100" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
