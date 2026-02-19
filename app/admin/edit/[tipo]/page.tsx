'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

const SPECS = {
  neuro: {
    label: 'Neurorradiologia',
    subs: ['Encéfalo', 'AVC/Isquemia', 'Neoplasias Intracranianas', 'Infecção/Inflamação', 'Trauma Craniano', 'Malformações Vasculares', 'Coluna Cervical', 'Coluna Torácica', 'Coluna Lombossacra', 'Vascular Cerebral', 'Nervos Cranianos', 'Pediatria Neuro']
  },
  cn: {
    label: 'Cabeça e Pescoço',
    subs: ['Tireoide/Paratireoide', 'Laringe/Faringe', 'Cavidade Oral/Mandíbula', 'Órbita/Globo Ocular', 'Ouvido/Mastoide', 'Glândulas Salivares', 'Espaços Cervicais', 'Linfonodos Cervicais']
  },
  torax: {
    label: 'Tórax',
    subs: ['Parênquima Pulmonar', 'Nódulo/Massa Pulmonar', 'Infecção/Pneumonia', 'Interstício/Fibrose', 'DPOC/Enfisema', 'Derrame Pleural/Empiema', 'Mediastino', 'Pleura', 'Trauma Torácico', 'Pediatria Tórax']
  },
  cardio: {
    label: 'Cardiovascular',
    subs: ['Aorta Torácica', 'Aorta Abdominal', 'Cardíaco/Coração', 'Coronárias', 'Artérias Periféricas', 'Veias/TEP', 'Dissecção Aórtica', 'Aneurismas', 'Malformações Vasculares']
  },
  gi: {
    label: 'Abdome · Digestivo',
    subs: ['Fígado', 'Vias Biliares/Vesícula', 'Pâncreas', 'Baço', 'Estômago/Esôfago', 'Intestino Delgado', 'Cólon/Reto', 'Peritônio/Mesentério', 'Abdome Agudo']
  },
  gu: {
    label: 'Abdome · Geniturinário',
    subs: ['Rins', 'Adrenal', 'Bexiga', 'Ureter/Pelve Renal', 'Próstata', 'Testículo/Epidídimo', 'Pênis', 'Útero/Ovários', 'Retroperitônio']
  },
  msk: {
    label: 'Músculo-Esquelética',
    subs: ['Ombro', 'Cotovelo', 'Punho/Mão', 'Quadril', 'Joelho', 'Tornozelo/Pé', 'Coluna MSK', 'Partes Moles/Músculo', 'Tumores Ósseos/Partes Moles']
  },
  mama: {
    label: 'Mamária',
    subs: ['Mamografia', 'US Mama', 'RM Mama', 'BI-RADS', 'Mama Masculina', 'Intervenção/Biópsia Mama']
  },
  us: {
    label: 'Ultrassonografia',
    subs: ['Abdome Geral', 'Cervical/Tireoide', 'Ginecologia', 'Obstetrícia', 'Doppler', 'Músculo-esquelético US', 'Rins/Vias/Próstata', 'Testículo/Pênis', 'Tórax US', 'Globo Ocular', 'Transfontanelar', 'Procedimentos US', 'Pediatria US']
  },
  interv: {
    label: 'Intervenção',
    subs: ['Embolização', 'Drenagem/Biópsia', 'Intervenção Vascular Arterial', 'Intervenção Vascular Venosa', 'Neuro Intervenção', 'Procedimentos Oncológicos', 'Acesso Vascular']
  },
  contraste: {
    label: 'Contraste',
    subs: ['Iodado', 'Gadolínio', 'Reações/Profilaxia']
  }
}

interface ContentItem {
  id: string
  titulo: string
  conteudo: string
  subarea?: string
  autor?: string
  dataAtualizacao?: string
}

export default function AdminEditor() {
  const params = useParams()
  const router = useRouter()
  const tipo = params.tipo as string

  const [items, setItems] = useState<ContentItem[]>([])
  const [selectedSpec, setSelectedSpec] = useState('neuro')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)

  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [subarea, setSubarea] = useState('')
  const [autor, setAutor] = useState('Dr. Alan')

  useEffect(() => {
    fetchItems()
  }, [selectedSpec])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/content/${tipo}/${selectedSpec}/all`)
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!titulo || !conteudo) {
      alert('Preencha título e conteúdo!')
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
        alert(editingItem ? '✅ Item atualizado com sucesso!' : '✅ Item criado com sucesso!')
        resetForm()
        fetchItems()
      } else {
        alert('❌ Erro ao salvar!')
      }
    } catch (error) {
      alert('❌ Erro ao salvar!')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('⚠️ Tem certeza que deseja deletar este item?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/content/${tipo}/${selectedSpec}/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('✅ Item deletado com sucesso!')
        fetchItems()
      } else {
        alert('❌ Erro ao deletar!')
      }
    } catch (error) {
      alert('❌ Erro ao deletar!')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item)
    setTitulo(item.titulo)
    setConteudo(item.conteudo)
    setSubarea(item.subarea || '')
    setAutor(item.autor || 'Dr. Alan')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingItem(null)
    setTitulo('')
    setConteudo('')
    setSubarea('')
    setAutor('Dr. Alan')
    setShowForm(false)
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

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-accent hover:text-accent2 transition-colors"
            >
              ← Voltar
            </button>
            <h1 className="text-xl font-bold text-text">
              {getSectionIcon()} Gerenciar {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent2 transition-all font-semibold text-sm"
          >
            {showForm ? '📋 Ver Lista' : '➕ Adicionar Novo'}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-8 py-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-text mb-2">Especialidade:</label>
          <select
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
          <div className="bg-surface border border-border rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-6 text-text">
              {editingItem ? '✏️ Editar Item' : '➕ Adicionar Novo Item'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Título *</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-4 py-2 bg-surface2 border border-border rounded-lg text-text focus:border-accent focus:outline-none"
                  placeholder="Ex: AVC Isquêmico - Protocolo de Imagem"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">Conteúdo *</label>
                <textarea
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-2 bg-surface2 border border-border rounded-lg text-text focus:border-accent focus:outline-none resize-y font-mono text-sm"
                  placeholder="Digite o conteúdo completo... Use ** para negrito, # para títulos, • para bullets"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Sub-área *</label>
                  <select
                    value={subarea}
                    onChange={(e) => setSubarea(e.target.value)}
                    className="w-full px-4 py-2 bg-surface2 border border-border rounded-lg text-text focus:border-accent focus:outline-none"
                  >
                    <option value="">Selecione uma sub-área</option>
                    {SPECS[selectedSpec as keyof typeof SPECS].subs.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Autor</label>
                  <input
                    type="text"
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    className="w-full px-4 py-2 bg-surface2 border border-border rounded-lg text-text focus:border-accent focus:outline-none"
                    placeholder="Ex: Dr. Alan"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent2 transition-all font-semibold disabled:opacity-50"
                >
                  {loading ? '⏳ Salvando...' : editingItem ? '💾 Atualizar' : '💾 Salvar'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-2 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all font-semibold"
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {!showForm && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6 text-text">
              📋 Itens Cadastrados ({items.length})
            </h2>

            {loading ? (
              <div className="text-center py-12 text-text3">Carregando...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-text3">
                Nenhum item cadastrado ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface2 border border-border rounded-lg p-4 hover:border-accent/50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-text mb-1">{item.titulo}</h3>
                        <p className="text-sm text-text3 mb-2 line-clamp-2">{item.conteudo}</p>
                        <div className="flex items-center gap-3 text-xs text-text3">
                          {item.subarea && <span>🏷️ {item.subarea}</span>}
                          {item.autor && <span>✍️ {item.autor}</span>}
                          {item.dataAtualizacao && <span>📅 {item.dataAtualizacao}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-accent/10 text-accent rounded hover:bg-accent/20 transition-all text-sm font-semibold"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 bg-red/10 text-red rounded hover:bg-red/20 transition-all text-sm font-semibold"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
