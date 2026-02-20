'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'

export interface Reference {
  text: string
  url?: string
}

export default function CalculatorLayout({
  title,
  subtitle,
  references,
  children,
}: {
  title: string
  subtitle?: string
  references?: Reference[]
  children: ReactNode
}) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
    setTheme(saved)
    document.documentElement.classList.toggle('light-mode', saved === 'light')
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('light-mode', next === 'light')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/#calculadoras" className="text-sm shrink-0 hover:underline" style={{ color: 'var(--accent)' }}>
              &larr; Voltar
            </Link>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold truncate" style={{ color: 'var(--text)' }}>{title}</h1>
              {subtitle && <p className="text-xs truncate" style={{ color: 'var(--text3)' }}>{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-[10px] font-bold px-2 py-1 rounded-md" style={{ backgroundColor: 'rgba(234,179,8,0.15)', color: '#eab308', border: '1px solid rgba(234,179,8,0.3)' }}>
              Não verificado
            </span>
            <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center rounded-lg border text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile badge */}
      <div className="sm:hidden text-center py-1.5" style={{ backgroundColor: 'rgba(234,179,8,0.08)' }}>
        <span className="text-[10px] font-bold" style={{ color: '#eab308' }}>⚠️ Não verificado</span>
      </div>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {children}

        {/* References */}
        {references && references.length > 0 && (
          <div className="mt-8 p-4 sm:p-6 rounded-xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text)' }}>Referências</h3>
            <ol className="list-decimal list-inside space-y-1.5">
              {references.map((ref, i) => (
                <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text3)' }}>
                  {ref.url ? (
                    <a href={ref.url} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--accent)' }}>{ref.text}</a>
                  ) : ref.text}
                </li>
              ))}
            </ol>
          </div>
        )}
      </main>
    </div>
  )
}

/* ── Shared UI helpers (exported for use in calculators) ── */

export const inputCls = "w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none font-mono"
export const selectCls = "w-full px-3 py-2 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--text)] text-sm focus:border-[var(--accent)] focus:outline-none"
export const labelCls = "block text-xs font-semibold mb-1"
export const labelStyle = { color: 'var(--text3)' }
export const cardCls = "rounded-xl border p-4 sm:p-6 mb-4"
export const cardStyle = { backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }

export function ResultBadge({ label, value, color, large }: { label: string; value: string; color?: string; large?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${large ? 'sm:p-6' : ''} text-center`}
      style={{ borderColor: color ? color + '44' : 'var(--border)', backgroundColor: color ? color + '0D' : 'var(--surface)' }}>
      <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text3)' }}>{label}</div>
      <div className={`font-bold ${large ? 'text-2xl sm:text-3xl' : 'text-lg'}`} style={{ color: color || 'var(--accent)' }}>{value}</div>
    </div>
  )
}

export function Section({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border mb-4 overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left">
        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{title}</span>
        <span className="text-xs" style={{ color: 'var(--text3)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>{'\u25BC'}</span>
      </button>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.25s ease' }}>
        <div style={{ overflow: 'hidden' }}>
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function OptionGrid({ options, value, onChange, columns = 2 }: {
  options: { value: string; label: string; description?: string }[]
  value: string
  onChange: (v: string) => void
  columns?: number
}) {
  return (
    <div className={`grid gap-2 ${columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-4'}`}>
      {options.map(opt => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
          className="text-left p-3 rounded-lg border transition-all text-sm"
          style={value === opt.value
            ? { borderColor: 'var(--accent)', backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--text)' }
            : { borderColor: 'var(--border)', backgroundColor: 'transparent', color: 'var(--text3)' }
          }>
          <div className="font-semibold">{opt.label}</div>
          {opt.description && <div className="text-xs mt-0.5 opacity-75">{opt.description}</div>}
        </button>
      ))}
    </div>
  )
}
