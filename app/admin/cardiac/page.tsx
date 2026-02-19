'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TEMPLATE_VARIABLES, TEMPLATE_BLOCKS, REFERENCE_PARAM_KEYS } from '@/lib/cardiac-types'
import { referencias } from '@/lib/cardiac-references'
import type { CardiacMask, CardiacReferenceTable } from '@/lib/cardiac-types'
import type { RefParam } from '@/lib/cardiac-references'

type Tab = 'masks' | 'references'

const emptyRefParam = (): RefParam => ({
  nome: '', unidade: '', normal: { min: 0, max: 0 }, discreto: { min: 0, max: 0 }, moderado: { min: 0, max: 0 }, acentuado: { min: 0, max: 0 }, tipo: 'aumentado',
})

// ── Organized variable groups for the sidebar ──
const VAR_GROUPS: { label: string; color: string; vars: [string, string][] }[] = [
  {
    label: 'Ventriculo Esquerdo',
    color: 'text-red',
    vars: [
      ['$VEVDF', 'VDF (ml)'],
      ['$VEVSF', 'VSF (ml)'],
      ['$VEVDFI', 'VDF Indexado (ml/m2)'],
      ['$VEVSFI', 'VSF Indexado (ml/m2)'],
      ['$VEVE', 'Vol. Ejetado (ml)'],
      ['$VEVEI', 'Vol. Ejet. Index (ml/m2)'],
      ['$VEFE', 'Fracao Ejecao (%)'],
      ['$VEMASSA', 'Massa (g)'],
      ['$VEMASSAI', 'Massa Index (g/m2)'],
      ['$VEDDF', 'Diam. Diast. Final (cm)'],
      ['$VEESPSEPTO', 'Esp. Septo (cm)'],
      ['$VEESPINFERIOR', 'Esp. Parede Inf. (cm)'],
    ],
  },
  {
    label: 'Ventriculo Direito',
    color: 'text-blue-500',
    vars: [
      ['$VDVDF', 'VDF (ml)'],
      ['$VDVSF', 'VSF (ml)'],
      ['$VDVDFI', 'VDF Indexado (ml/m2)'],
      ['$VDVSFI', 'VSF Indexado (ml/m2)'],
      ['$VDVE', 'Vol. Ejetado (ml)'],
      ['$VDVEI', 'Vol. Ejet. Index (ml/m2)'],
      ['$VDFE', 'Fracao Ejecao (%)'],
      ['$VDMASSA', 'Massa (g)'],
      ['$VDMASSAI', 'Massa Index (g/m2)'],
    ],
  },
  {
    label: 'Atrio Esquerdo',
    color: 'text-purple-500',
    vars: [
      ['$AEVOLINDEX', 'Vol. Index (ml/m2)'],
      ['$AEAREA4CHI', 'Area 4CH Index (cm2/m2)'],
      ['$AEAREA2CHI', 'Area 2CH Index (cm2/m2)'],
      ['$AEDIAMAP', 'Diam. AP (cm)'],
    ],
  },
  {
    label: 'Atrio Direito',
    color: 'text-teal-500',
    vars: [
      ['$ADAREA4CHI', 'Area 4CH Index (cm2/m2)'],
      ['$ADAREA2CHI', 'Area 2CH Index (cm2/m2)'],
    ],
  },
  {
    label: 'Mapas Parametricos',
    color: 'text-orange',
    vars: [
      ['$T1MIOPRE', 'T1 Mio Pre (ms)'],
      ['$T1SANGUEPRE', 'T1 Sangue Pre (ms)'],
      ['$T1MIOPOS', 'T1 Mio Pos (ms)'],
      ['$T1SANGUEPOS', 'T1 Sangue Pos (ms)'],
      ['$ECV', 'ECV (%)'],
      ['$HTSINTETICO', 'HT Sintetico'],
      ['$T2NATIVO', 'T2 Nativo (ms)'],
      ['$T2ESTRELA', 'T2* (ms)'],
      ['$CAMPOMAG', 'Campo Mag. (T)'],
    ],
  },
  {
    label: 'Paciente / Geral',
    color: 'text-text2',
    vars: [
      ['$ASC', 'ASC (m2)'],
      ['$SEXO', 'Sexo'],
      ['$DELTAVEVD', 'Delta VE-VD (ml)'],
    ],
  },
]

const BLOCK_LIST_GROUPS: { label: string; color: string; blocks: [string, string][] }[] = [
  {
    label: 'Camaras e Funcao',
    color: 'text-accent',
    blocks: [
      ['#ventrículoesquerdo', 'Texto auto VE (dimensoes, funcao, segmentar)'],
      ['#ventrículodireito', 'Texto auto VD'],
      ['#átrios', 'Texto auto Atrios (AE+AD combinados)'],
      ['#átrioesquerdo', 'Texto auto AE'],
      ['#átriodireito', 'Texto auto AD'],
      ['#mapasparamétricos', 'Texto auto mapas T1/T2/ECV'],
      ['#conclusão', 'Conclusao automatica completa'],
    ],
  },
  {
    label: 'Achados Adicionais',
    color: 'text-green',
    blocks: [
      ['#perfusao', 'Perfusao miocardica (sem isquemia)'],
      ['#realcetardio', 'Realce tardio (ausente)'],
      ['#anmiocardio', 'Analise miocardio (doencas/realce tardio)'],
      ['#valvas', 'Valvas cardiacas (sem alteracoes)'],
      ['#pericardio', 'Pericardio (sem derrame)'],
      ['#aortaepulmonar', 'Aorta e tronco pulmonar (calibre normal)'],
    ],
  },
]

// ── 3 Preset masks (from the hardcoded calculator) ──
const PRESET_MASKS: { nome: string; template: string }[] = [
  {
    nome: 'Mascara 1 - Completa',
    template: `RESSONANCIA MAGNETICA DE CORACAO

Metodo

Realizadas sequencias de cinerressonancia e morfologicas antes da administracao endovenosa do meio de contraste paramagnetico. Apos a sua administracao, foram realizadas sequencias de perfusao miocardica, volumetrica do torax e de realce tardio. Exame realizado em repouso.

Analise

#atrios

#ventrículodireito Volume diastolico final de $VDVDF ml e $VDVDFI ml/m2, volume sistolico final de $VDVSFI ml/m2 e fracao de ejecao estimada em $VDFE%.

Miocardio ventricular direito com espessura e sinal preservados.

#ventrículoesquerdo Diametro diastolico final de $VEDDF cm, volume diastolico final de $VEVDF ml e $VEVDFI ml/m2, volume sistolico final de $VEVSFI ml/m2 e fracao de ejecao estimada em $VEFE%.

Miocardio ventricular esquerdo:
Espessura preservada, medindo ate $VEESPSEPTO cm na parede septal basal (VN <= 1,2 cm);
Massa estimada em $VEMASSA g e $VEMASSAI g/m2;
Espessura relativa: [  ] (<= 0,42);
Indice relativo de massa: [  ] g/ml;

#mapasparametricos

Perfusao miocardica em repouso sem sinais de isquemia.
Nao se identifica realce tardio miocardico.
Valvas cardiacas sem alteracoes evidentes ao metodo.
Nao se observa espessamento ou derrame pericardico.
Aorta toracica e tronco pulmonar com calibre normal.

Comentarios

#conclusao

*Valores de referencia:
1 - Petersen et al. Eur Heart J Cardiovasc Imaging. 2019 Dec 1;20(12):1321-1331.
2 - Kawel-Boehm et al. Journal of Cardiovascular Magnetic Resonance (2020) 22:87.`,
  },
  {
    nome: 'Mascara 2 - Simplificada',
    template: `RESSONANCIA MAGNETICA DE CORACAO

Metodo

Realizadas sequencias de cinerressonancia e morfologicas antes da administracao endovenosa do meio de contraste paramagnetico. Apos a sua administracao, foram realizadas sequencias de perfusao miocardica, volumetrica do torax e de realce tardio. Exame realizado em repouso.

Analise

#atrios

#ventrículodireito
Miocardio ventricular direito com espessura e sinal preservados.

#ventrículoesquerdo
Miocardio ventricular esquerdo com espessura preservada, medindo ate $VEESPSEPTO cm na parede septal basal.

#mapasparametricos

Perfusao miocardica em repouso sem sinais de isquemia.
Nao se identifica realce tardio miocardico.
Valvas cardiacas sem alteracoes evidentes ao metodo.
Nao se observa espessamento ou derrame pericardico.
Aorta toracica e tronco pulmonar com calibre normal.

Comentarios

#conclusao

*Valores de referencia:
1 - Petersen et al. Eur Heart J Cardiovasc Imaging. 2019 Dec 1;20(12):1321-1331.
2 - Kawel-Boehm et al. Journal of Cardiovascular Magnetic Resonance (2020) 22:87.`,
  },
  {
    nome: 'Mascara 3 - Incor',
    template: `RESSONANCIA MAGNETICA DO CORACAO


TECNICAS:
Cine-ressonancia para avaliacao da funcao ventricular global e segmentar.
Angiorressonancia magnetica do torax pos-contraste.
Gradiente-Eco com TR fixo e variacao do TE para calculo do T2* do miocardio.
Mapa T1 pela tecnica Modified Lock-Locker Inversion Recovery (MOLLI).
Mapa T2 pela tecnica SSFP (T2-TRUFI).
Spin echo double IR e triple IR para caracterizacao tecidual.
Sequencia ponderada em T2 FAST Spin Eco 3D para avaliacao linfatica.
CineMR com tagging pela tecnica de modulacao espacial de magnetizacao (SPAMM).
Phase Contrast para analise de fluxos atraves da valva pulmonar/aortica.
Phase Contrast para analise de fluxos atraves do tronco da pulmonar, aorta ascendente, aorta descendente e arterias pulmonares.
Perfusao de primeira passagem com gadolinio.
Perfusao de primeira passagem com gadolinio apos estresse com dipiridamol (0,56mg/kg/4min) e em repouso apos a reversao com aminofilina.
Realce tardio para avaliacao de fibrose / infarto e viabilidade miocardica.


OBSERVACOES:

Atrio direito com dimensoes preservadas / aumentadas (Analise qualitativa).

Ventriculo direito com dimensoes preservadas / aumentadas (IVDFVD= $VDVDFI mL/m2; IVSFVD= $VDVSFI mL/m2).

Funcao sistolica do ventriculo direito preservada (FEVD= $VDFE%).

Atrio esquerdo com dimensoes preservadas / aumentadas (IVAE= $AEVOLINDEX mL/m2).

Ventriculo esquerdo com dimensoes preservadas / aumentadas (IVDFVE= $VEVDFI mL/m2; IVSFVE= $VEVSFI mL/m2).

Funcao sistolica global e segmentar do ventriculo esquerdo preservada (FEVE= $VEFE%).

Espessura miocardica normal.

Ausencia de edema miocardico.

Ausencia de realce tardio miocardico.

Ausencia de derrame pericardico.
Ausencia de trombo intracavitario.

Achados adicionais:


IMPRESSAO DIAGNOSTICA:
Camaras cardiacas com dimensoes preservadas.
Funcao sistolica biventricular preservada.
Ausencia de fibrose/infarto miocardico.`,
  },
]

export default function AdminCardiac() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('masks')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Masks state ──
  const [masks, setMasks] = useState<CardiacMask[]>([])
  const [editingMask, setEditingMask] = useState<CardiacMask | null>(null)
  const [showMaskForm, setShowMaskForm] = useState(false)
  const [maskNome, setMaskNome] = useState('')
  const [maskInstituicao, setMaskInstituicao] = useState('')
  const [maskTemplate, setMaskTemplate] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState<Record<string, boolean>>({})

  // ── References state ──
  const [refs, setRefs] = useState<CardiacReferenceTable[]>([])
  const [editingRef, setEditingRef] = useState<CardiacReferenceTable | null>(null)
  const [showRefForm, setShowRefForm] = useState(false)
  const [refNome, setRefNome] = useState('')
  const [refDescricao, setRefDescricao] = useState('')
  const [refHasAgeRange, setRefHasAgeRange] = useState(false)
  const [refAgeMin, setRefAgeMin] = useState('')
  const [refAgeMax, setRefAgeMax] = useState('')
  const [refParamsM, setRefParamsM] = useState<Record<string, RefParam>>({})
  const [refParamsF, setRefParamsF] = useState<Record<string, RefParam>>({})
  const [refCollapsed, setRefCollapsed] = useState<Record<string, boolean>>({ VE: true, VD: true, AE: true, AD: true })

  const flash = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  // Insert text at cursor position in textarea
  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current
    if (!ta) {
      setMaskTemplate(prev => prev + text)
      return
    }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = maskTemplate.slice(0, start)
    const after = maskTemplate.slice(end)
    setMaskTemplate(before + text + after)
    requestAnimationFrame(() => {
      ta.focus()
      const pos = start + text.length
      ta.setSelectionRange(pos, pos)
    })
  }

  // ── Fetch ──
  const fetchMasks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/cardiac/masks')
      const data = await res.json()
      setMasks(data.masks || [])
    } catch { /* ignore */ }
  }, [])

  const fetchRefs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/cardiac/references')
      const data = await res.json()
      setRefs(data.references || [])
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    fetchMasks()
    fetchRefs()
  }, [fetchMasks, fetchRefs])

  // ── Mask CRUD ──
  const resetMaskForm = () => {
    setEditingMask(null)
    setMaskNome('')
    setMaskInstituicao('')
    setMaskTemplate('')
    setShowMaskForm(false)
  }

  const handleEditMask = async (mask: CardiacMask) => {
    try {
      const res = await fetch(`/api/admin/cardiac/masks/${mask.id}`)
      const data = await res.json()
      setEditingMask(data)
      setMaskNome(data.nome || '')
      setMaskInstituicao(data.instituicao || '')
      setMaskTemplate(data.template || '')
      setShowMaskForm(true)
    } catch {
      flash('Erro ao carregar mascara', 'error')
    }
  }

  const handleSaveMask = async () => {
    if (!maskNome || !maskTemplate) {
      flash('Preencha nome e template!', 'error')
      return
    }
    setLoading(true)
    try {
      const url = editingMask
        ? `/api/admin/cardiac/masks/${editingMask.id}`
        : '/api/admin/cardiac/masks'
      const res = await fetch(url, {
        method: editingMask ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: maskNome, instituicao: maskInstituicao, template: maskTemplate }),
      })
      if (res.ok) {
        flash(editingMask ? 'Mascara atualizada!' : 'Mascara criada!', 'success')
        resetMaskForm()
        fetchMasks()
      } else {
        const data = await res.json().catch(() => ({}))
        flash(data.error || 'Erro ao salvar', 'error')
      }
    } catch {
      flash('Erro ao salvar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMask = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta mascara?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/cardiac/masks/${id}`, { method: 'DELETE' })
      if (res.ok) {
        flash('Mascara deletada!', 'success')
        fetchMasks()
      } else {
        flash('Erro ao deletar', 'error')
      }
    } catch {
      flash('Erro ao deletar', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Reference CRUD ──
  const initRefParams = (): Record<string, RefParam> => {
    const params: Record<string, RefParam> = {}
    for (const keys of Object.values(REFERENCE_PARAM_KEYS)) {
      for (const key of keys) {
        params[key] = emptyRefParam()
      }
    }
    return params
  }

  const resetRefForm = () => {
    setEditingRef(null)
    setRefNome('')
    setRefDescricao('')
    setRefHasAgeRange(false)
    setRefAgeMin('')
    setRefAgeMax('')
    setRefParamsM(initRefParams())
    setRefParamsF(initRefParams())
    setShowRefForm(false)
  }

  const handleCloneESC = () => {
    const escM = referencias.ESC.Masculino
    const escF = referencias.ESC.Feminino
    const cloneParams = (src: Record<string, RefParam>): Record<string, RefParam> => {
      const result: Record<string, RefParam> = {}
      for (const keys of Object.values(REFERENCE_PARAM_KEYS)) {
        for (const key of keys) {
          result[key] = src[key] ? { ...src[key], normal: src[key].normal ? { ...src[key].normal } : null, discreto: src[key].discreto ? { ...src[key].discreto } : null, moderado: src[key].moderado ? { ...src[key].moderado } : null, acentuado: src[key].acentuado ? { ...src[key].acentuado } : null } : emptyRefParam()
        }
      }
      return result
    }
    setRefParamsM(cloneParams(escM))
    setRefParamsF(cloneParams(escF))
    setRefNome('ESC 2020 - Copia')
    flash('Valores ESC 2020 carregados!', 'success')
  }

  const handleEditRef = async (ref: CardiacReferenceTable) => {
    try {
      const res = await fetch(`/api/admin/cardiac/references/${ref.id}`)
      const data = await res.json()
      setEditingRef(data)
      setRefNome(data.nome || '')
      setRefDescricao(data.descricao || '')
      if (data.ageRange) {
        setRefHasAgeRange(true)
        setRefAgeMin(String(data.ageRange.min || ''))
        setRefAgeMax(String(data.ageRange.max || ''))
      } else {
        setRefHasAgeRange(false)
        setRefAgeMin('')
        setRefAgeMax('')
      }
      setRefParamsM(data.parametros?.M || initRefParams())
      setRefParamsF(data.parametros?.F || initRefParams())
      setShowRefForm(true)
    } catch {
      flash('Erro ao carregar referencia', 'error')
    }
  }

  const handleSaveRef = async () => {
    if (!refNome) {
      flash('Preencha o nome!', 'error')
      return
    }
    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        nome: refNome,
        descricao: refDescricao,
        parametros: { M: refParamsM, F: refParamsF },
      }
      if (refHasAgeRange) {
        payload.ageRange = { min: parseInt(refAgeMin) || 0, max: parseInt(refAgeMax) || 100 }
      }
      const url = editingRef
        ? `/api/admin/cardiac/references/${editingRef.id}`
        : '/api/admin/cardiac/references'
      const res = await fetch(url, {
        method: editingRef ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        flash(editingRef ? 'Referencia atualizada!' : 'Referencia criada!', 'success')
        resetRefForm()
        fetchRefs()
      } else {
        const data = await res.json().catch(() => ({}))
        flash(data.error || 'Erro ao salvar', 'error')
      }
    } catch {
      flash('Erro ao salvar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRef = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta referencia?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/cardiac/references/${id}`, { method: 'DELETE' })
      if (res.ok) {
        flash('Referencia deletada!', 'success')
        fetchRefs()
      } else {
        flash('Erro ao deletar', 'error')
      }
    } catch {
      flash('Erro ao deletar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const updateRefParam = (sex: 'M' | 'F', key: string, field: string, subfield: string | null, value: string) => {
    const setter = sex === 'M' ? setRefParamsM : setRefParamsF
    setter(prev => {
      const param = prev[key] ? { ...prev[key] } : emptyRefParam()
      if (field === 'tipo') {
        param.tipo = value as 'aumentado' | 'reduzido'
      } else if (field === 'nome') {
        param.nome = value
      } else if (field === 'unidade') {
        param.unidade = value
      } else if (subfield && (field === 'normal' || field === 'discreto' || field === 'moderado' || field === 'acentuado')) {
        const range = param[field] ? { ...param[field]! } : { min: 0, max: 0 }
        ;(range as Record<string, number>)[subfield] = parseFloat(value) || 0
        param[field] = range
      }
      return { ...prev, [key]: param }
    })
  }

  const inputCls = "w-full px-3 py-2 bg-surface2 border border-border rounded-lg text-text text-sm focus:border-accent focus:outline-none"
  const btnPrimary = "px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent2 transition-all font-semibold text-sm disabled:opacity-50"
  const btnSecondary = "px-4 py-2 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all font-semibold text-sm"

  // ── Sidebar variable chip ──
  const VarChip = ({ code, desc }: { code: string; desc: string }) => (
    <button
      type="button"
      onClick={() => insertAtCursor(code)}
      className="group flex items-center gap-1.5 w-full text-left px-2 py-1 rounded hover:bg-accent/10 transition-colors"
      title={`Clique para inserir ${code}`}
    >
      <code className="text-[11px] font-mono font-bold text-accent shrink-0">{code}</code>
      <span className="text-[10px] text-text3 truncate group-hover:text-text transition-colors">{desc}</span>
    </button>
  )

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin/dashboard')} className="text-accent hover:text-accent2 transition-colors text-sm">
              &larr; Voltar
            </button>
            <h1 className="text-lg font-bold text-text">Calculadora Cardiaca</h1>
          </div>
        </div>
      </header>

      {/* Flash message */}
      {message && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-pulse ${message.type === 'success' ? 'bg-green/20 text-green border border-green/30' : 'bg-red/20 text-red border border-red/30'}`}>
          {message.text}
        </div>
      )}

      <main className="container mx-auto px-4 sm:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('masks')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${tab === 'masks' ? 'bg-accent text-white shadow-md' : 'bg-surface2 text-text3 border border-border hover:text-text'}`}
          >
            Mascaras de Laudo
          </button>
          <button
            onClick={() => setTab('references')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${tab === 'references' ? 'bg-accent text-white shadow-md' : 'bg-surface2 text-text3 border border-border hover:text-text'}`}
          >
            Tabelas de Referencia
          </button>
        </div>

        {/* ═══ MASKS TAB ═══ */}
        {tab === 'masks' && (
          <div>
            {!showMaskForm ? (
              <div className="bg-surface border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-text">Mascaras ({masks.length})</h2>
                  <button onClick={() => { resetMaskForm(); setShowMaskForm(true) }} className={btnPrimary}>+ Nova Mascara</button>
                </div>
                {masks.length === 0 ? (
                  <p className="text-text3 text-center py-8">Nenhuma mascara cadastrada. Crie uma nova ou carregue um template padrao.</p>
                ) : (
                  <div className="space-y-3">
                    {masks.map(mask => (
                      <div key={mask.id} className="bg-surface2 border border-border rounded-lg p-4 hover:border-accent/50 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="font-bold text-text">{mask.nome}</h3>
                            <p className="text-sm text-text3">{mask.instituicao || 'Sem instituicao'}</p>
                            {mask.updatedAt && <p className="text-xs text-text3 mt-1">Atualizado: {mask.updatedAt.split('T')[0]}</p>}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => handleEditMask(mask)} className="px-3 py-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 text-sm font-semibold transition-colors">Editar</button>
                            <button onClick={() => handleDeleteMask(mask.id)} className="px-3 py-1.5 bg-red/10 text-red rounded-lg hover:bg-red/20 text-sm font-semibold transition-colors">Excluir</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ═══ MASK EDITOR ═══ */
              <div>
                {/* Top bar */}
                <div className="bg-surface border border-border rounded-xl p-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-lg font-bold text-text">{editingMask ? 'Editar Mascara' : 'Nova Mascara'}</h2>
                    <div className="flex flex-wrap gap-2">
                      {/* Load preset buttons */}
                      {PRESET_MASKS.map((preset, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (maskTemplate && !confirm('Substituir template atual?')) return
                            setMaskTemplate(preset.template)
                            if (!maskNome) setMaskNome(preset.nome)
                            flash(`Template "${preset.nome}" carregado!`, 'success')
                          }}
                          className="px-3 py-1.5 bg-surface2 text-text3 border border-border rounded-lg hover:border-accent/50 hover:text-accent text-xs font-semibold transition-all"
                        >
                          {preset.nome}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="block text-xs font-semibold text-text3 mb-1">Nome *</label>
                      <input type="text" className={inputCls} value={maskNome} onChange={e => setMaskNome(e.target.value)} placeholder="Ex: Hospital X - Padrao" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text3 mb-1">Instituicao</label>
                      <input type="text" className={inputCls} value={maskInstituicao} onChange={e => setMaskInstituicao(e.target.value)} placeholder="Ex: Hospital X" />
                    </div>
                  </div>
                </div>

                {/* Editor + Sidebar layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
                  {/* Main editor */}
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <label className="block text-xs font-semibold text-text3 mb-2">Template do Laudo *</label>
                    <textarea
                      ref={textareaRef}
                      className="w-full px-4 py-3 bg-bg2 border border-border rounded-lg text-text text-sm font-mono focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 resize-y leading-relaxed"
                      rows={28}
                      value={maskTemplate}
                      onChange={e => setMaskTemplate(e.target.value)}
                      placeholder="Escreva o template aqui...&#10;&#10;Use $VARIAVEL para valores calculados&#10;Use #bloco para texto gerado automaticamente&#10;&#10;Clique nas variaveis ao lado para inseri-las aqui."
                      spellCheck={false}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-text3">{maskTemplate.length} caracteres</span>
                      <div className="flex gap-3">
                        <button onClick={handleSaveMask} disabled={loading} className={btnPrimary}>
                          {loading ? 'Salvando...' : editingMask ? 'Atualizar' : 'Salvar'}
                        </button>
                        <button onClick={resetMaskForm} className={btnSecondary}>Cancelar</button>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar: Variables + Blocks */}
                  <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-surface2 border-b border-border">
                      <h3 className="text-sm font-bold text-text">Variaveis e Blocos</h3>
                      <p className="text-[10px] text-text3 mt-0.5">Clique para inserir no template</p>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                      {/* Block groups */}
                      {BLOCK_LIST_GROUPS.map(group => (
                        <div key={group.label} className="border-b border-border">
                          <button
                            type="button"
                            onClick={() => setSidebarCollapsed(prev => ({ ...prev, [`blk_${group.label}`]: !prev[`blk_${group.label}`] }))}
                            className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-surface2 transition-colors"
                          >
                            <span className={`text-xs font-bold uppercase tracking-wider ${group.color}`}>{group.label}</span>
                            <span className="text-text3 text-[10px]">{sidebarCollapsed[`blk_${group.label}`] ? '\u25B6' : '\u25BC'}</span>
                          </button>
                          {!sidebarCollapsed[`blk_${group.label}`] && (
                            <div className="px-2 pb-2 space-y-0.5">
                              {group.blocks.map(([code, desc]) => (
                                <button
                                  key={code}
                                  type="button"
                                  onClick={() => insertAtCursor(code)}
                                  className="group flex items-start gap-1.5 w-full text-left px-2 py-1.5 rounded hover:bg-accent2/10 transition-colors"
                                  title={`Clique para inserir ${code}`}
                                >
                                  <code className="text-[11px] font-mono font-bold text-accent2 shrink-0">{code}</code>
                                  <span className="text-[10px] text-text3 group-hover:text-text transition-colors leading-tight">{desc}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Variable groups */}
                      {VAR_GROUPS.map(group => (
                        <div key={group.label} className="border-b border-border last:border-b-0">
                          <button
                            type="button"
                            onClick={() => setSidebarCollapsed(prev => ({ ...prev, [group.label]: !prev[group.label] }))}
                            className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-surface2 transition-colors"
                          >
                            <span className={`text-xs font-bold uppercase tracking-wider ${group.color}`}>{group.label}</span>
                            <span className="text-text3 text-[10px]">{sidebarCollapsed[group.label] ? '\u25B6' : '\u25BC'}</span>
                          </button>
                          {!sidebarCollapsed[group.label] && (
                            <div className="px-2 pb-2 space-y-0">
                              {group.vars.map(([code, desc]) => (
                                <VarChip key={code} code={code} desc={desc} />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ REFERENCES TAB ═══ */}
        {tab === 'references' && (
          <div>
            {!showRefForm ? (
              <div className="bg-surface border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-text">Tabelas de Referencia ({refs.length})</h2>
                  <button onClick={() => { resetRefForm(); setShowRefForm(true) }} className={btnPrimary}>+ Nova Tabela</button>
                </div>
                {refs.length === 0 ? (
                  <p className="text-text3 text-center py-8">Nenhuma tabela de referencia cadastrada. A calculadora usa ESC 2020 como padrao.</p>
                ) : (
                  <div className="space-y-3">
                    {refs.map(ref => (
                      <div key={ref.id} className="bg-surface2 border border-border rounded-lg p-4 hover:border-accent/50 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-text">{ref.nome}</h3>
                            {ref.descricao && <p className="text-sm text-text3">{ref.descricao}</p>}
                            {ref.ageRange && <p className="text-xs text-text3 mt-1">Faixa etaria: {ref.ageRange.min}-{ref.ageRange.max} anos</p>}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => handleEditRef(ref)} className="px-3 py-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 text-sm font-semibold transition-colors">Editar</button>
                            <button onClick={() => handleDeleteRef(ref.id)} className="px-3 py-1.5 bg-red/10 text-red rounded-lg hover:bg-red/20 text-sm font-semibold transition-colors">Excluir</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-text">{editingRef ? 'Editar Referencia' : 'Nova Tabela de Referencia'}</h2>
                  <button onClick={handleCloneESC} className={btnSecondary}>Clonar ESC 2020</button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text3 mb-1">Nome *</label>
                      <input type="text" className={inputCls} value={refNome} onChange={e => setRefNome(e.target.value)} placeholder="Ex: ESC 2020 Ajustado" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text3 mb-1">Descricao</label>
                      <input type="text" className={inputCls} value={refDescricao} onChange={e => setRefDescricao(e.target.value)} placeholder="Opcional" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={refHasAgeRange} onChange={e => setRefHasAgeRange(e.target.checked)} className="w-4 h-4 accent-accent" />
                      <span className="text-sm font-medium text-text">Faixa etaria</span>
                    </label>
                    {refHasAgeRange && (
                      <div className="flex items-center gap-2">
                        <input type="number" className={`${inputCls} w-20`} value={refAgeMin} onChange={e => setRefAgeMin(e.target.value)} placeholder="Min" />
                        <span className="text-text3">-</span>
                        <input type="number" className={`${inputCls} w-20`} value={refAgeMax} onChange={e => setRefAgeMax(e.target.value)} placeholder="Max" />
                        <span className="text-xs text-text3">anos</span>
                      </div>
                    )}
                  </div>

                  {(Object.entries(REFERENCE_PARAM_KEYS) as [string, readonly string[]][]).map(([group, keys]) => (
                    <div key={group} className="bg-bg2 border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setRefCollapsed(prev => ({ ...prev, [group]: !prev[group] }))}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface2 transition-colors"
                      >
                        <span className="font-bold text-text">{group === 'VE' ? 'Ventriculo Esquerdo' : group === 'VD' ? 'Ventriculo Direito' : group === 'AE' ? 'Atrio Esquerdo' : 'Atrio Direito'}</span>
                        <span className="text-text3">{refCollapsed[group] ? '\u25B6' : '\u25BC'}</span>
                      </button>
                      {!refCollapsed[group] && (
                        <div className="p-4 border-t border-border space-y-4">
                          {(['M', 'F'] as const).map(sex => (
                            <div key={sex}>
                              <h4 className="text-sm font-bold text-text mb-3">{sex === 'M' ? 'Masculino' : 'Feminino'}</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b border-border">
                                      <th className="text-left py-2 px-1 text-text3 font-semibold">Parametro</th>
                                      <th className="text-left py-2 px-1 text-text3 font-semibold">Tipo</th>
                                      <th className="text-center py-2 px-1 text-green font-semibold" colSpan={2}>Normal</th>
                                      <th className="text-center py-2 px-1 text-amber-600 font-semibold" colSpan={2}>Discreto</th>
                                      <th className="text-center py-2 px-1 text-orange-600 font-semibold" colSpan={2}>Moderado</th>
                                      <th className="text-center py-2 px-1 text-red font-semibold" colSpan={2}>Acentuado</th>
                                    </tr>
                                    <tr className="border-b border-border text-text3">
                                      <th></th><th></th>
                                      <th className="px-1 py-1">Min</th><th className="px-1 py-1">Max</th>
                                      <th className="px-1 py-1">Min</th><th className="px-1 py-1">Max</th>
                                      <th className="px-1 py-1">Min</th><th className="px-1 py-1">Max</th>
                                      <th className="px-1 py-1">Min</th><th className="px-1 py-1">Max</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {keys.map(key => {
                                      const params = sex === 'M' ? refParamsM : refParamsF
                                      const p = params[key] || emptyRefParam()
                                      return (
                                        <tr key={key} className="border-b border-border">
                                          <td className="py-1 px-1 font-mono text-accent">{key}</td>
                                          <td className="py-1 px-1">
                                            <select
                                              className="bg-surface2 border border-border rounded px-1 py-0.5 text-text text-xs"
                                              value={p.tipo}
                                              onChange={e => updateRefParam(sex, key, 'tipo', null, e.target.value)}
                                            >
                                              <option value="aumentado">Aum.</option>
                                              <option value="reduzido">Red.</option>
                                            </select>
                                          </td>
                                          {(['normal', 'discreto', 'moderado', 'acentuado'] as const).map(level => (
                                            ['min', 'max'].map(sub => (
                                              <td key={`${level}-${sub}`} className="py-1 px-0.5">
                                                <input
                                                  type="number"
                                                  step="0.1"
                                                  className="w-16 px-1 py-0.5 bg-surface2 border border-border rounded text-text text-xs text-center font-mono"
                                                  value={p[level]?.[sub as 'min' | 'max'] ?? 0}
                                                  onChange={e => updateRefParam(sex, key, level, sub, e.target.value)}
                                                />
                                              </td>
                                            ))
                                          )).flat()}
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSaveRef} disabled={loading} className={btnPrimary}>
                      {loading ? 'Salvando...' : editingRef ? 'Atualizar' : 'Salvar'}
                    </button>
                    <button onClick={resetRefForm} className={btnSecondary}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
