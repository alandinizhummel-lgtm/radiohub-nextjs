'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { SPECS, type SpecKey } from '@/lib/specs'
import MascaraEditor from '@/components/MascaraEditor'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import ToastContainer, { toast } from '@/components/Toast'
import type { ContentItem } from '@/lib/types'
import { invalidateCache } from '@/lib/cached-fetch'
import { processNotionExport } from '@/lib/markdown-utils'

export default function AdminEditor() {
  const params = useParams()
  const router = useRouter()
  const tipo = params.tipo as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mdFileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [items, setItems] = useState<ContentItem[]>([])
  const [selectedSpec, setSelectedSpec] = useState('neuro')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<'editor' | 'split' | 'preview'>('editor')
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)

  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [subarea, setSubarea] = useState('')
  const [autor, setAutor] = useState('Dr. Alan')

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Search
  const [searchTerm, setSearchTerm] = useState('')

  const isMascara = tipo === 'mascaras'

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/content/${tipo}/${selectedSpec}/items?subarea=all&page=${page}&limit=20`)
      const data = await response.json()
      setItems(data.items || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch {
      toast('Erro ao carregar itens', 'error')
    } finally {
      setLoading(false)
    }
  }, [tipo, selectedSpec, page])

  useEffect(() => {
    setPage(1)
  }, [selectedSpec])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleSave = async () => {
    if (!titulo || !conteudo) {
      toast('Preencha título e conteúdo!', 'error')
      return
    }

    setLoading(true)
    try {
      const payload = {
        titulo,
        conteudo,
        subarea,
        autor,
        dataAtualizacao: new Date().toISOString().split('T')[0],
      }

      const url = editingItem
        ? `/api/admin/content/${tipo}/${selectedSpec}/${editingItem.id}`
        : `/api/admin/content/${tipo}/${selectedSpec}`

      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        invalidateCache()
        toast(editingItem ? 'Item atualizado com sucesso!' : 'Item criado com sucesso!', 'success')
        resetForm()
        fetchItems()
      } else {
        const data = await response.json().catch(() => ({}))
        toast(data.error || 'Erro ao salvar', 'error')
      }
    } catch {
      toast('Erro ao salvar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este item?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/content/${tipo}/${selectedSpec}/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        invalidateCache()
        toast('Item deletado com sucesso!', 'success')
        fetchItems()
      } else {
        toast('Erro ao deletar', 'error')
      }
    } catch {
      toast('Erro ao deletar', 'error')
    } finally {
      setLoading(false)
    }
  }

  // --- Import .md file ---
  const handleImportMd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      if (!text) return
      const cleaned = processNotionExport(text, titulo || undefined)
      setConteudo(cleaned)
      toast('Arquivo .md importado!', 'success')
    }
    reader.readAsText(file)
    if (mdFileInputRef.current) mdFileInputRef.current.value = ''
  }

  // --- Markdown toolbar insertion ---
  const insertMarkdown = (before: string, after: string = '') => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = conteudo.slice(start, end)
    const replacement = `${before}${selected || 'texto'}${after}`
    const newContent = conteudo.slice(0, start) + replacement + conteudo.slice(end)
    setConteudo(newContent)
    // Restore focus and selection after React re-renders
    requestAnimationFrame(() => {
      ta.focus()
      const cursorPos = start + before.length + (selected || 'texto').length + after.length
      ta.setSelectionRange(cursorPos, cursorPos)
    })
  }

  // Convert legacy @@/## markup to HTML for the WYSIWYG editor
  const convertLegacyToHtml = (text: string): string => {
    if (/<[a-z][\s\S]*>/i.test(text)) return text // already HTML
    return text
      .split('\n')
      .map(line => {
        const t = line.trim()
        if (!t) return '<p><br></p>'
        if (t.startsWith('@@')) return `<h2 style="text-align:center">${t.slice(2).trim()}</h2>`
        if (t.startsWith('## ')) return `<h3>${t.slice(3).trim()}</h3>`
        if (t === '---') return '<hr>'
        if (t.startsWith('- ') || t.startsWith('• ')) return `<p>${t}</p>`
        const withBold = t.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        return `<p>${withBold}</p>`
      })
      .join('')
  }

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item)
    setTitulo(item.titulo)
    setConteudo(isMascara ? convertLegacyToHtml(item.conteudo) : item.conteudo)
    setSubarea(item.subarea || '')
    setAutor(item.autor || 'Dr. Alan')
    setShowForm(true)
    setViewMode('editor')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingItem(null)
    setTitulo('')
    setConteudo('')
    setSubarea('')
    setAutor('Dr. Alan')
    setShowForm(false)
    setViewMode('editor')
  }

  const getSectionIcon = () => {
    const icons: Record<string, string> = {
      resumos: '📚',
      artigos: '📄',
      mascaras: '📝',
      frases: '💬',
      checklists: '✅',
      tutoriais: '🎓',
      videos: '🎬'
    }
    return icons[tipo] || '📄'
  }

  // --- CSV Export ---
  const handleExportCsv = () => {
    if (items.length === 0) {
      toast('Nenhum item para exportar', 'error')
      return
    }
    const escape = (s: string) => `"${(s || '').replace(/"/g, '""')}"`
    const header = 'titulo,conteudo,subarea,autor,dataAtualizacao'
    const rows = items.map(item =>
      [item.titulo, item.conteudo, item.subarea || '', item.autor || '', item.dataAtualizacao || ''].map(escape).join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tipo}_${selectedSpec}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast('CSV exportado!', 'success')
  }

  // --- CSV Import ---
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const text = ev.target?.result as string
      if (!text) return
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) {
        toast('CSV vazio ou sem dados', 'error')
        return
      }

      // Parse CSV (skip header)
      let imported = 0
      let errors = 0
      for (let i = 1; i < lines.length; i++) {
        try {
          const cols = parseCsvLine(lines[i])
          if (cols.length < 2 || !cols[0].trim() || !cols[1].trim()) {
            errors++
            continue
          }
          const payload = {
            titulo: cols[0].trim(),
            conteudo: cols[1].trim(),
            subarea: (cols[2] || '').trim(),
            autor: (cols[3] || 'Dr. Alan').trim(),
            dataAtualizacao: (cols[4] || new Date().toISOString().split('T')[0]).trim(),
          }
          const resp = await fetch(`/api/admin/content/${tipo}/${selectedSpec}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (resp.ok) imported++
          else errors++
        } catch {
          errors++
        }
      }
      invalidateCache()
      toast(`Importados: ${imported}${errors > 0 ? `, Erros: ${errors}` : ''}`, imported > 0 ? 'success' : 'error')
      fetchItems()
    }
    reader.readAsText(file)
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Simple CSV line parser respecting quoted fields
  const parseCsvLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (inQuotes) {
        if (c === '"' && line[i + 1] === '"') {
          current += '"'
          i++
        } else if (c === '"') {
          inQuotes = false
        } else {
          current += c
        }
      } else {
        if (c === '"') {
          inQuotes = true
        } else if (c === ',') {
          result.push(current)
          current = ''
        } else {
          current += c
        }
      }
    }
    result.push(current)
    return result
  }

  // Filter items by search term
  const filteredItems = searchTerm
    ? items.filter(item =>
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.subarea || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items

  return (
    <div className="min-h-screen bg-bg">
      <ToastContainer />
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-accent hover:text-accent2 transition-colors text-sm"
              aria-label="Voltar ao dashboard"
            >
              ← Voltar
            </button>
            <h1 className="text-base sm:text-xl font-bold text-text">
              <span aria-hidden="true">{getSectionIcon()}</span> Gerenciar {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(!showForm); setViewMode('editor') }}
              className="px-3 sm:px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent2 transition-all font-semibold text-xs sm:text-sm"
            >
              {showForm ? 'Lista' : '+ Novo'}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <label htmlFor="spec-select" className="block text-sm font-semibold text-text mb-2">Especialidade:</label>
          <select
            id="spec-select"
            value={selectedSpec}
            onChange={(e) => {
              setSelectedSpec(e.target.value)
              setSubarea('')
            }}
            className="px-4 py-2 bg-surface2 border border-border rounded-lg text-text focus:border-accent focus:outline-none"
          >
            {Object.entries(SPECS).map(([key, spec]) => (
              <option key={key} value={key}>{spec.label}</option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-text">
                {editingItem ? 'Editar Item' : 'Adicionar Novo Item'}
              </h2>
              <div className="flex items-center gap-2">
                {!isMascara && (
                  <>
                    <label className="px-3 py-1.5 bg-surface2 text-text3 border border-border rounded-lg hover:border-accent/50 hover:text-text transition-all text-xs font-semibold cursor-pointer">
                      Importar .md
                      <input
                        ref={mdFileInputRef}
                        type="file"
                        accept=".md,.markdown,.txt"
                        onChange={handleImportMd}
                        className="hidden"
                      />
                    </label>
                    <div className="flex bg-surface2 rounded-lg border border-border overflow-hidden">
                      {(['editor', 'split', 'preview'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode)}
                          className={`px-3 py-1.5 text-xs font-semibold transition-all ${viewMode === mode ? 'bg-accent text-white' : 'text-text3 hover:text-text'}`}
                        >
                          {mode === 'editor' ? 'Editor' : mode === 'split' ? 'Split' : 'Preview'}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {isMascara && (
                  <button
                    onClick={() => setViewMode(viewMode === 'preview' ? 'editor' : 'preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'preview' ? 'bg-accent text-white' : 'bg-surface2 text-text3 hover:text-text hover:bg-border'}`}
                  >
                    {viewMode === 'preview' ? 'Editor' : 'Preview'}
                  </button>
                )}
              </div>
            </div>

            {/* Preview-only mode */}
            {viewMode === 'preview' && (
              <div className="bg-bg2 border border-border rounded-lg p-4 sm:p-6 mb-4">
                <h3 className="text-lg font-bold text-text mb-2">{titulo || '(sem titulo)'}</h3>
                {subarea && <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs rounded-full mb-3">{subarea}</span>}
                {isMascara ? (
                  <div className="prose prose-sm max-w-none mascara-content text-text text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: conteudo }} />
                ) : (
                  <MarkdownRenderer content={conteudo} />
                )}
                {autor && <div className="mt-4 pt-3 border-t border-border text-xs text-text3"><span aria-hidden="true">✍️</span> {autor}</div>}
              </div>
            )}

            {/* Editor-only or Split mode */}
            {viewMode !== 'preview' && (
              <div className={viewMode === 'split' && !isMascara ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : ''}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="titulo-input" className="block text-sm font-semibold text-text mb-2">Titulo *</label>
                    <input
                      id="titulo-input"
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      className="w-full px-4 py-2 bg-surface2 border border-border rounded-lg text-text focus:border-accent focus:outline-none"
                      placeholder="Ex: AVC Isquemico - Protocolo de Imagem"
                    />
                  </div>

                  <div>
                    <label htmlFor="conteudo-input" className="block text-sm font-semibold text-text mb-2">Conteudo *</label>

                    {isMascara ? (
                      <MascaraEditor value={conteudo} onChange={setConteudo} />
                    ) : (
                      <>
                        {/* Markdown Toolbar */}
                        <div className="flex flex-wrap gap-1 mb-2 p-2 bg-surface2 border border-border rounded-lg">
                          <button type="button" onClick={() => insertMarkdown('**', '**')} className="px-2 py-1 text-xs font-bold text-text3 hover:text-text hover:bg-border rounded transition-all" title="Negrito">B</button>
                          <button type="button" onClick={() => insertMarkdown('*', '*')} className="px-2 py-1 text-xs italic text-text3 hover:text-text hover:bg-border rounded transition-all" title="Italico">I</button>
                          <button type="button" onClick={() => insertMarkdown('\n## ', '\n')} className="px-2 py-1 text-xs font-bold text-text3 hover:text-text hover:bg-border rounded transition-all" title="Titulo H2">H2</button>
                          <button type="button" onClick={() => insertMarkdown('\n### ', '\n')} className="px-2 py-1 text-xs font-bold text-text3 hover:text-text hover:bg-border rounded transition-all" title="Titulo H3">H3</button>
                          <span className="w-px h-6 bg-border mx-1" />
                          <button type="button" onClick={() => insertMarkdown('\n- ', '')} className="px-2 py-1 text-xs text-text3 hover:text-text hover:bg-border rounded transition-all" title="Lista">Lista</button>
                          <button type="button" onClick={() => insertMarkdown('\n1. ', '')} className="px-2 py-1 text-xs text-text3 hover:text-text hover:bg-border rounded transition-all" title="Lista numerada">1.</button>
                          <button type="button" onClick={() => insertMarkdown('\n- [ ] ', '')} className="px-2 py-1 text-xs text-text3 hover:text-text hover:bg-border rounded transition-all" title="Checklist">Check</button>
                          <span className="w-px h-6 bg-border mx-1" />
                          <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="px-2 py-1 text-xs text-text3 hover:text-text hover:bg-border rounded transition-all" title="Link">Link</button>
                          <button type="button" onClick={() => insertMarkdown('![alt](', ')')} className="px-2 py-1 text-xs text-text3 hover:text-text hover:bg-border rounded transition-all" title="Imagem">Img</button>
                          <button type="button" onClick={() => insertMarkdown('`', '`')} className="px-2 py-1 text-xs font-mono text-text3 hover:text-text hover:bg-border rounded transition-all" title="Codigo inline">{'<>'}</button>
                          <button type="button" onClick={() => insertMarkdown('\n```\n', '\n```\n')} className="px-2 py-1 text-xs font-mono text-text3 hover:text-text hover:bg-border rounded transition-all" title="Bloco de codigo">Code</button>
                          <span className="w-px h-6 bg-border mx-1" />
                          <button type="button" onClick={() => insertMarkdown('\n> ', '')} className="px-2 py-1 text-xs text-text3 hover:text-text hover:bg-border rounded transition-all" title="Citacao">Citar</button>
                          <button type="button" onClick={() => insertMarkdown('\n| Col 1 | Col 2 | Col 3 |\n|-------|-------|-------|\n| ', ' |  |  |\n')} className="px-2 py-1 text-xs text-text3 hover:text-text hover:bg-border rounded transition-all" title="Tabela">Tabela</button>
                          <button type="button" onClick={() => insertMarkdown('\n---\n', '')} className="px-2 py-1 text-xs text-text3 hover:text-text hover:bg-border rounded transition-all" title="Linha horizontal">HR</button>
                        </div>

                        <textarea
                          ref={textareaRef}
                          id="conteudo-input"
                          value={conteudo}
                          onChange={(e) => setConteudo(e.target.value)}
                          rows={viewMode === 'split' ? 20 : 12}
                          className="w-full px-4 py-2 bg-surface2 border border-border rounded-lg text-text focus:border-accent focus:outline-none resize-y font-mono text-sm"
                          placeholder="Escreva em Markdown... Use **negrito**, # titulos, - listas, > citacoes"
                        />
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="subarea-select" className="block text-sm font-semibold text-text mb-2">Sub-area *</label>
                      <select
                        id="subarea-select"
                        value={subarea}
                        onChange={(e) => setSubarea(e.target.value)}
                        className="w-full px-4 py-2 bg-surface2 border border-border rounded-lg text-text focus:border-accent focus:outline-none"
                      >
                        <option value="">Selecione uma sub-area</option>
                        {SPECS[selectedSpec as keyof typeof SPECS].subs.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="autor-input" className="block text-sm font-semibold text-text mb-2">Autor</label>
                      <input
                        id="autor-input"
                        type="text"
                        value={autor}
                        onChange={(e) => setAutor(e.target.value)}
                        className="w-full px-4 py-2 bg-surface2 border border-border rounded-lg text-text focus:border-accent focus:outline-none"
                        placeholder="Ex: Dr. Alan"
                      />
                    </div>
                  </div>
                </div>

                {/* Split mode: preview panel */}
                {viewMode === 'split' && !isMascara && (
                  <div className="bg-bg2 border border-border rounded-lg p-4 overflow-y-auto max-h-[600px]">
                    <div className="text-xs text-text3 mb-3 font-semibold uppercase tracking-wider">Preview</div>
                    <h3 className="text-lg font-bold text-text mb-2">{titulo || '(sem titulo)'}</h3>
                    {subarea && <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs rounded-full mb-3">{subarea}</span>}
                    <MarkdownRenderer content={conteudo} />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent2 transition-all font-semibold disabled:opacity-50"
              >
                {loading ? 'Salvando...' : editingItem ? 'Atualizar' : 'Salvar'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-2 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {!showForm && (
          <div className="bg-surface border border-border rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-text">
                Itens Cadastrados ({total})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 bg-surface2 text-text3 border border-border rounded-lg hover:border-accent/50 hover:text-text transition-all text-xs font-semibold"
                >
                  Exportar CSV
                </button>
                <label className="px-3 py-1.5 bg-surface2 text-text3 border border-border rounded-lg hover:border-accent/50 hover:text-text transition-all text-xs font-semibold cursor-pointer">
                  Importar CSV
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleImportCsv}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4">
              <label htmlFor="admin-search" className="sr-only">Buscar itens</label>
              <input
                id="admin-search"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título ou sub-área..."
                className="w-full px-4 py-2 bg-surface2 border border-border rounded-lg text-text text-sm focus:border-accent focus:outline-none"
              />
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-surface2 border border-border rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-border rounded w-2/3 mb-2" />
                    <div className="h-3 bg-border rounded w-full mb-2" />
                    <div className="h-3 bg-border rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-text3">
                {searchTerm ? 'Nenhum item encontrado para esta busca.' : 'Nenhum item cadastrado ainda.'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface2 border border-border rounded-lg p-4 hover:border-accent/50 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-text mb-1 truncate">{item.titulo}</h3>
                        <p className="text-sm text-text3 mb-2 line-clamp-2">
                          {isMascara ? item.conteudo.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : item.conteudo}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-text3">
                          {item.subarea && <span><span aria-hidden="true">🏷️</span> {item.subarea}</span>}
                          {item.autor && <span><span aria-hidden="true">✍️</span> {item.autor}</span>}
                          {item.dataAtualizacao && <span><span aria-hidden="true">📅</span> {item.dataAtualizacao}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-accent/10 text-accent rounded hover:bg-accent/20 transition-all text-sm font-semibold"
                          aria-label={`Editar ${item.titulo}`}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 bg-red/10 text-red rounded hover:bg-red/20 transition-all text-sm font-semibold"
                          aria-label={`Deletar ${item.titulo}`}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Página anterior"
                >
                  ←
                </button>
                <span className="px-4 py-2 text-sm text-text2">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Próxima página"
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
