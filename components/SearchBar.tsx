'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { SPECS, VALID_CONTENT_TYPES, TYPE_LABELS } from '@/lib/specs'
import { cachedFetch } from '@/lib/cached-fetch'

interface SearchResult {
  id: string
  tipo: string
  especialidade: string
  titulo: string
  subarea?: string
  autor?: string
  dataAtualizacao?: string
}

interface SearchBarProps {
  onSelectResult: (result: SearchResult) => void
}

export default function SearchBar({ onSelectResult }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [focusIndex, setFocusIndex] = useState(-1)
  const [filterTipo, setFilterTipo] = useState('')
  const [filterSpec, setFilterSpec] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const timeout = useRef<NodeJS.Timeout | null>(null)

  const doSearch = useCallback((q: string, tipo?: string, spec?: string) => {
    setQuery(q)
    setFocusIndex(-1)
    if (timeout.current) clearTimeout(timeout.current)
    if (!q || q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const ft = tipo ?? filterTipo
    const fs = spec ?? filterSpec
    timeout.current = setTimeout(async () => { // 200ms debounce
      try {
        let url = `/api/search?q=${encodeURIComponent(q)}`
        if (ft) url += `&tipo=${ft}`
        if (fs) url += `&especialidade=${fs}`
        const data = await cachedFetch(url)
        setResults(data.items || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)
  }, [filterTipo, filterSpec])

  const handleSelect = (r: SearchResult) => {
    onSelectResult(r)
    setShowResults(false)
    setQuery('')
    setResults([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && focusIndex >= 0) {
      e.preventDefault()
      handleSelect(results[focusIndex])
    } else if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    if (showResults) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [showResults])

  return (
    <div ref={ref} className="relative">
      <label htmlFor="search-input" className="sr-only">Buscar conteúdo</label>
      <input
        id="search-input"
        type="search"
        value={query}
        onChange={(e) => doSearch(e.target.value)}
        onFocus={() => setShowResults(true)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar..."
        className="w-28 sm:w-40 focus:w-48 lg:focus:w-64 px-3 py-1.5 bg-surface2 border border-border rounded-lg text-sm text-text placeholder-text3 focus:border-accent focus:outline-none transition-all"
        role="combobox"
        aria-expanded={showResults && query.length >= 2}
        aria-controls="search-results"
        aria-activedescendant={focusIndex >= 0 ? `search-result-${focusIndex}` : undefined}
      />
      {showResults && query.length >= 2 && (
        <div
          id="search-results"
          className="absolute top-full right-0 mt-2 w-72 sm:w-80 lg:w-96 bg-surface border border-border rounded-xl shadow-2xl max-h-96 overflow-y-auto z-[60]"
        >
          <div className="flex gap-1.5 p-2 border-b border-border">
            <select
              value={filterTipo}
              onChange={(e) => { setFilterTipo(e.target.value); doSearch(query, e.target.value, undefined) }}
              className="flex-1 px-2 py-1 bg-surface2 border border-border rounded text-xs text-text focus:outline-none"
              aria-label="Filtrar por tipo"
            >
              <option value="">Todos os tipos</option>
              {VALID_CONTENT_TYPES.map(t => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
            <select
              value={filterSpec}
              onChange={(e) => { setFilterSpec(e.target.value); doSearch(query, undefined, e.target.value) }}
              className="flex-1 px-2 py-1 bg-surface2 border border-border rounded text-xs text-text focus:outline-none"
              aria-label="Filtrar por especialidade"
            >
              <option value="">Todas as espec.</option>
              {Object.entries(SPECS).map(([key, spec]) => (
                <option key={key} value={key}>{spec.label}</option>
              ))}
            </select>
          </div>
          <div role="listbox">
            {loading ? (
              <div className="p-4 text-center text-text3 text-sm">Buscando...</div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-text3 text-sm">Nenhum resultado encontrado</div>
            ) : (
              results.map((r, i) => (
                <button
                  key={`${r.tipo}-${r.especialidade}-${r.id}-${i}`}
                  id={`search-result-${i}`}
                  role="option"
                  aria-selected={focusIndex === i}
                  onClick={() => handleSelect(r)}
                  className={`w-full text-left px-4 py-3 transition-colors border-b border-border last:border-0 ${
                    focusIndex === i ? 'bg-accent/20' : 'hover:bg-accent/10'
                  }`}
                >
                  <div className="text-sm font-semibold text-text line-clamp-1">{r.titulo}</div>
                  <div className="text-xs text-text3 mt-0.5">
                    {TYPE_LABELS[r.tipo as keyof typeof TYPE_LABELS] || r.tipo} • {r.subarea || r.especialidade}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
