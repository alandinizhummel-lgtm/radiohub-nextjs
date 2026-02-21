'use client'

import { useState, useMemo, useCallback } from 'react'
import CalculatorLayout from '@/app/calculadora/components/calculator-layout'

// ══════════════════════════════════════════════════════════
// Shared UI Helpers (same pattern as neuro-report)
// ══════════════════════════════════════════════════════════

function Card({ id, activeCard, setActiveCard, title, badge, children }: {
  id: string; activeCard: string; setActiveCard: (id: string) => void
  title: string; badge?: string; children: React.ReactNode
}) {
  const open = activeCard === id
  return (
    <div className="rounded-xl border overflow-hidden transition-all" style={{ borderColor: open ? 'var(--accent)' : 'var(--border)' }}>
      <button type="button" onClick={() => setActiveCard(open ? '' : id)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-all"
        style={{ backgroundColor: open ? 'var(--accent)0D' : 'transparent' }}>
        <span className="text-xs font-bold" style={{ color: open ? 'var(--accent)' : 'var(--text2)' }}>{title}</span>
        <div className="flex items-center gap-2">
          {badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'var(--accent)22', color: 'var(--accent)' }}>{badge}</span>}
          <span className="text-[10px] transition-transform" style={{ color: 'var(--text3)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>&#9660;</span>
        </div>
      </button>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.25s ease' }}>
        <div style={{ overflow: 'hidden' }}>
          <div className="px-4 pb-3 pt-1">{children}</div>
        </div>
      </div>
    </div>
  )
}

function GroupHeader({ label, color }: { label: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 pt-3 pb-0.5">
      <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: color || 'var(--text3)' }}>{label}</span>
      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
    </div>
  )
}

function Chk({ checked, onChange, label, indent = 0 }: { checked: boolean; onChange: (v: boolean) => void; label: string; indent?: number }) {
  return (
    <label className="flex items-center gap-2 py-0.5 cursor-pointer select-none" style={{ paddingLeft: indent * 16 }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="accent-[var(--accent)] w-3.5 h-3.5 shrink-0" />
      <span className="text-xs" style={{ color: 'var(--text2)' }}>{label}</span>
    </label>
  )
}

function Radio<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; label?: string }) {
  return (
    <div>
      {label && <span className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text3)' }}>{label}</span>}
      <div className="flex flex-wrap gap-1">
        {options.map(o => (
          <button key={o.v} type="button" onClick={() => onChange(o.v)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all"
            style={value === o.v
              ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }
              : { backgroundColor: 'transparent', borderColor: 'var(--border)', color: 'var(--text3)' }
            }>{o.l}</button>
        ))}
      </div>
    </div>
  )
}

function Txt({ value, onChange, placeholder, rows = 1 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  if (rows > 1) return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full px-3 py-1.5 rounded-lg text-xs border font-mono resize-y"
      style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
  )
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-1.5 rounded-lg text-xs border font-mono"
      style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
  )
}

function NumInput({ value, onChange, placeholder, unit }: { value: string; onChange: (v: string) => void; placeholder?: string; unit?: string }) {
  return (
    <div className="flex items-center gap-1">
      <input type="number" step="0.1" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-20 px-2 py-1 rounded-lg text-xs border font-mono"
        style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
      {unit && <span className="text-[10px]" style={{ color: 'var(--text3)' }}>{unit}</span>}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// Interactive Thyroid SVG
// ══════════════════════════════════════════════════════════

type ThyroidRegion = 'ld_sup' | 'ld_med' | 'ld_inf' | 'le_sup' | 'le_med' | 'le_inf' | 'istmo'

const THYROID_REGIONS: { id: ThyroidRegion; label: string; shortLabel: string }[] = [
  { id: 'ld_sup', label: 'Terço superior do lobo direito', shortLabel: 'LD sup' },
  { id: 'ld_med', label: 'Terço médio do lobo direito', shortLabel: 'LD méd' },
  { id: 'ld_inf', label: 'Terço inferior do lobo direito', shortLabel: 'LD inf' },
  { id: 'le_sup', label: 'Terço superior do lobo esquerdo', shortLabel: 'LE sup' },
  { id: 'le_med', label: 'Terço médio do lobo esquerdo', shortLabel: 'LE méd' },
  { id: 'le_inf', label: 'Terço inferior do lobo esquerdo', shortLabel: 'LE inf' },
  { id: 'istmo', label: 'Istmo', shortLabel: 'Istmo' },
]

function ThyroidSVG({ selected, onSelect }: { selected: ThyroidRegion; onSelect: (r: ThyroidRegion) => void }) {
  const f = (id: ThyroidRegion) => selected === id ? 'rgba(79,142,247,0.45)' : 'rgba(200,200,200,0.15)'
  const s = (id: ThyroidRegion) => selected === id ? '#4f8ef7' : 'rgba(150,150,150,0.5)'
  const sw = (id: ThyroidRegion) => selected === id ? 2 : 1
  const tc = (id: ThyroidRegion) => selected === id ? '#4f8ef7' : '#888'

  return (
    <svg viewBox="0 0 280 220" className="w-full max-w-[260px] mx-auto select-none">
      {/* Trachea */}
      <rect x={126} y={40} width={28} height={170} rx={14} fill="rgba(180,220,255,0.15)" stroke="rgba(150,150,150,0.3)" strokeWidth={1} />
      {[65, 85, 105, 125, 145, 165, 185].map(y => (
        <line key={y} x1={132} y1={y} x2={148} y2={y} stroke="rgba(150,150,150,0.2)" strokeWidth={0.5} />
      ))}

      {/* Right lobe (viewer's left = anatomical right) */}
      {/* Superior */}
      <g onClick={() => onSelect('ld_sup')} style={{ cursor: 'pointer' }}>
        <path d="M155,50 C175,45 195,55 195,75 L155,75 Z" fill={f('ld_sup')} stroke={s('ld_sup')} strokeWidth={sw('ld_sup')} />
        <text x={175} y={65} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight="600" fill={tc('ld_sup')} style={{ pointerEvents: 'none' }}>sup</text>
      </g>
      {/* Middle */}
      <g onClick={() => onSelect('ld_med')} style={{ cursor: 'pointer' }}>
        <path d="M155,75 L195,75 C200,95 200,115 195,135 L155,135 Z" fill={f('ld_med')} stroke={s('ld_med')} strokeWidth={sw('ld_med')} />
        <text x={178} y={105} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight="600" fill={tc('ld_med')} style={{ pointerEvents: 'none' }}>méd</text>
      </g>
      {/* Inferior */}
      <g onClick={() => onSelect('ld_inf')} style={{ cursor: 'pointer' }}>
        <path d="M155,135 L195,135 C195,155 175,165 155,160 Z" fill={f('ld_inf')} stroke={s('ld_inf')} strokeWidth={sw('ld_inf')} />
        <text x={175} y={148} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight="600" fill={tc('ld_inf')} style={{ pointerEvents: 'none' }}>inf</text>
      </g>

      {/* Left lobe (viewer's right = anatomical left) */}
      {/* Superior */}
      <g onClick={() => onSelect('le_sup')} style={{ cursor: 'pointer' }}>
        <path d="M125,50 C105,45 85,55 85,75 L125,75 Z" fill={f('le_sup')} stroke={s('le_sup')} strokeWidth={sw('le_sup')} />
        <text x={105} y={65} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight="600" fill={tc('le_sup')} style={{ pointerEvents: 'none' }}>sup</text>
      </g>
      {/* Middle */}
      <g onClick={() => onSelect('le_med')} style={{ cursor: 'pointer' }}>
        <path d="M125,75 L85,75 C80,95 80,115 85,135 L125,135 Z" fill={f('le_med')} stroke={s('le_med')} strokeWidth={sw('le_med')} />
        <text x={102} y={105} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight="600" fill={tc('le_med')} style={{ pointerEvents: 'none' }}>méd</text>
      </g>
      {/* Inferior */}
      <g onClick={() => onSelect('le_inf')} style={{ cursor: 'pointer' }}>
        <path d="M125,135 L85,135 C85,155 105,165 125,160 Z" fill={f('le_inf')} stroke={s('le_inf')} strokeWidth={sw('le_inf')} />
        <text x={105} y={148} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight="600" fill={tc('le_inf')} style={{ pointerEvents: 'none' }}>inf</text>
      </g>

      {/* Isthmus */}
      <g onClick={() => onSelect('istmo')} style={{ cursor: 'pointer' }}>
        <rect x={125} y={90} width={30} height={30} rx={4} fill={f('istmo')} stroke={s('istmo')} strokeWidth={sw('istmo')} />
        <text x={140} y={105} textAnchor="middle" dominantBaseline="central" fontSize={8} fontWeight="600" fill={tc('istmo')} style={{ pointerEvents: 'none' }}>istmo</text>
      </g>

      {/* Labels */}
      <text x={178} y={35} textAnchor="middle" fontSize={10} fontWeight="700" fill="#aaa" style={{ pointerEvents: 'none' }}>LD</text>
      <text x={102} y={35} textAnchor="middle" fontSize={10} fontWeight="700" fill="#aaa" style={{ pointerEvents: 'none' }}>LE</text>
      <text x={140} y={195} textAnchor="middle" fontSize={8} fill="#bbb" style={{ pointerEvents: 'none' }}>traqueia</text>
    </svg>
  )
}

// ══════════════════════════════════════════════════════════
// Types & Constants
// ══════════════════════════════════════════════════════════

interface NoduleState {
  local: ThyroidRegion
  dim1: string; dim2: string; dim3: string
  composicao: string
  ecogenicidade: string
  forma: string
  margens: string
  focos: string
  chammas: string
  comentario: string
}

const emptyNodule = (): NoduleState => ({
  local: 'ld_med', dim1: '', dim2: '', dim3: '',
  composicao: '', ecogenicidade: '', forma: '', margens: '', focos: '',
  chammas: '', comentario: '',
})

const COMPOSICAO = [
  { v: '0a', l: 'Cística', pts: 0 },
  { v: '0b', l: 'Espongiforme', pts: 0 },
  { v: '1', l: 'Mista', pts: 1 },
  { v: '2', l: 'Sólida', pts: 2 },
]

const ECOGENICIDADE = [
  { v: '1a', l: 'Anecóica', pts: 1 },
  { v: '1b', l: 'Hiper/isoecoico', pts: 1 },
  { v: '2', l: 'Hipoecoico', pts: 2 },
  { v: '3', l: 'Muito hipoecoico', pts: 3 },
]

const FORMA = [
  { v: '0', l: 'Mais largo que alto', pts: 0 },
  { v: '3', l: 'Mais alto que largo', pts: 3 },
]

const MARGENS = [
  { v: '0a', l: 'Lisa', pts: 0 },
  { v: '0b', l: 'Mal definida', pts: 0 },
  { v: '2', l: 'Lobulada/irregular', pts: 2 },
  { v: '3', l: 'Extensão extratireoidiana', pts: 3 },
]

const FOCOS = [
  { v: '0', l: 'Nenhum/cauda de cometa', pts: 0 },
  { v: '1', l: 'Macrocalcificações', pts: 1 },
  { v: '2', l: 'Periféricas (rim)', pts: 2 },
  { v: '3', l: 'Puntiformes', pts: 3 },
]

const CHAMMAS = [
  { v: 'I', l: 'I - Ausente' },
  { v: 'II', l: 'II - Perinodular' },
  { v: 'III', l: 'III - Peri ≥ intra' },
  { v: 'IV', l: 'IV - Intra > peri' },
  { v: 'V', l: 'V - Intranodular' },
]

function getPts(v: string, list: { v: string; pts: number }[]): number {
  return list.find(o => o.v === v)?.pts ?? 0
}

function getTR(total: number): { tr: string; label: string; color: string } {
  if (total === 0) return { tr: 'TR1', label: 'Benigno', color: '#16a34a' }
  if (total <= 2) return { tr: 'TR2', label: 'Não suspeito', color: '#16a34a' }
  if (total === 3) return { tr: 'TR3', label: 'Levemente suspeito', color: '#eab308' }
  if (total <= 6) return { tr: 'TR4', label: 'Moderadamente suspeito', color: '#f59e0b' }
  return { tr: 'TR5', label: 'Altamente suspeito', color: '#dc2626' }
}

function getPAAF(tr: string, sizeMm: number | null): string {
  if (tr === 'TR1' || tr === 'TR2') return 'Não há indicação de PAAF ou seguimento.'
  if (tr === 'TR3') {
    if (sizeMm !== null && sizeMm >= 25) return 'PAAF recomendada (nódulo >= 2,5 cm).'
    if (sizeMm !== null && sizeMm >= 15) return 'Seguimento recomendado (nódulo >= 1,5 cm).'
    if (sizeMm !== null) return 'Sem indicação de PAAF ou seguimento para este tamanho.'
    return 'PAAF se >= 2,5 cm; seguimento se >= 1,5 cm.'
  }
  if (tr === 'TR4') {
    if (sizeMm !== null && sizeMm >= 15) return 'PAAF recomendada (nódulo >= 1,5 cm).'
    if (sizeMm !== null && sizeMm >= 10) return 'Seguimento recomendado (nódulo >= 1,0 cm).'
    if (sizeMm !== null) return 'Sem indicação de PAAF ou seguimento para este tamanho.'
    return 'PAAF se >= 1,5 cm; seguimento se >= 1,0 cm.'
  }
  // TR5
  if (sizeMm !== null && sizeMm >= 10) return 'PAAF recomendada (nódulo >= 1,0 cm).'
  if (sizeMm !== null && sizeMm >= 5) return 'Seguimento recomendado (nódulo >= 0,5 cm).'
  if (sizeMm !== null) return 'Sem indicação de PAAF ou seguimento para este tamanho.'
  return 'PAAF se >= 1,0 cm; seguimento se >= 0,5 cm.'
}

function getLocalLabel(r: ThyroidRegion): string {
  const m: Record<ThyroidRegion, string> = {
    ld_sup: 'terço superior do lobo direito', ld_med: 'terço médio do lobo direito', ld_inf: 'terço inferior do lobo direito',
    le_sup: 'terço superior do lobo esquerdo', le_med: 'terço médio do lobo esquerdo', le_inf: 'terço inferior do lobo esquerdo',
    istmo: 'istmo',
  }
  return m[r]
}

function calcVolume(ap: string, t: string, l: string): number | null {
  const a = parseFloat(ap), tv = parseFloat(t), lv = parseFloat(l)
  if (isNaN(a) || isNaN(tv) || isNaN(lv) || a <= 0 || tv <= 0 || lv <= 0) return null
  return (Math.PI / 6) * (a / 10) * (tv / 10) * (lv / 10) // mm → cm, result in cm³
}

// ══════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════

export default function TiradsReport() {
  const [activeCard, setActiveCard] = useState('dimensoes')

  // ── Dimensões da tireoide ──
  const [ldAP, setLdAP] = useState(''); const [ldT, setLdT] = useState(''); const [ldL, setLdL] = useState('')
  const [leAP, setLeAP] = useState(''); const [leT, setLeT] = useState(''); const [leL, setLeL] = useState('')
  const [istmo, setIstmo] = useState('')
  const [textura, setTextura] = useState<'' | 'homogenea' | 'heterogenea' | 'heterogenea_difusa'>('')
  const [contornos, setContornos] = useState<'' | 'regulares' | 'lobulados' | 'irregulares'>('')

  // ── Nódulos ──
  const [nodulos, setNodulos] = useState<NoduleState[]>([])

  // ── Linfonodos ──
  const [linfonodos, setLinfonodos] = useState<'' | 'normais' | 'reacionais' | 'suspeitos'>('')
  const [linfLocal, setLinfLocal] = useState('')
  const [linfComentario, setLinfComentario] = useState('')

  // ── Comentário ──
  const [comentario, setComentario] = useState('')

  // ── Copy state ──
  const [copied, setCopied] = useState('')

  // ── Nodule management ──
  const addNodule = () => setNodulos(p => [...p, emptyNodule()])
  const removeNodule = (i: number) => setNodulos(p => p.filter((_, j) => j !== i))
  const updateNodule = (i: number, updates: Partial<NoduleState>) =>
    setNodulos(p => p.map((n, j) => j === i ? { ...n, ...updates } : n))

  // ── Volumes ──
  const volLD = useMemo(() => calcVolume(ldAP, ldT, ldL), [ldAP, ldT, ldL])
  const volLE = useMemo(() => calcVolume(leAP, leT, leL), [leAP, leT, leL])
  const volTotal = useMemo(() => {
    if (volLD !== null && volLE !== null) return volLD + volLE
    return null
  }, [volLD, volLE])

  // ── Nodule scores ──
  const noduleScores = useMemo(() => {
    return nodulos.map(n => {
      const filled = n.composicao && n.ecogenicidade && n.forma && n.margens && n.focos
      if (!filled) return null
      const total = getPts(n.composicao, COMPOSICAO) + getPts(n.ecogenicidade, ECOGENICIDADE) +
        getPts(n.forma, FORMA) + getPts(n.margens, MARGENS) + getPts(n.focos, FOCOS)
      const tr = getTR(total)
      const maxDim = Math.max(parseFloat(n.dim1) || 0, parseFloat(n.dim2) || 0, parseFloat(n.dim3) || 0)
      const paaf = getPAAF(tr.tr, maxDim > 0 ? maxDim : null)
      return { total, ...tr, paaf }
    })
  }, [nodulos])

  // ══════════════════════════════════════════════════════════
  // TEXT GENERATION
  // ══════════════════════════════════════════════════════════

  const textoAchados = useMemo(() => {
    const parts: string[] = []

    // Dimensões
    const dimParts: string[] = []
    if (ldAP && ldT && ldL) {
      let s = `Lobo direito medindo ${ldAP} x ${ldT} x ${ldL} mm`
      if (volLD !== null) s += ` (volume estimado: ${volLD.toFixed(1)} cm³)`
      dimParts.push(s + '.')
    }
    if (leAP && leT && leL) {
      let s = `Lobo esquerdo medindo ${leAP} x ${leT} x ${leL} mm`
      if (volLE !== null) s += ` (volume estimado: ${volLE.toFixed(1)} cm³)`
      dimParts.push(s + '.')
    }
    if (istmo) dimParts.push(`Istmo com espessura de ${istmo} mm.`)
    if (volTotal !== null) dimParts.push(`Volume tireoidiano total estimado em ${volTotal.toFixed(1)} cm³.`)

    if (textura === 'homogenea') dimParts.push('Parênquima tireoidiano de textura homogênea e ecogenicidade habitual.')
    else if (textura === 'heterogenea') dimParts.push('Parênquima tireoidiano de textura heterogênea.')
    else if (textura === 'heterogenea_difusa') dimParts.push('Parênquima tireoidiano de textura difusamente heterogênea, com ecogenicidade reduzida, podendo estar relacionado a tireoidopatia difusa (correlacionar com dados clínico-laboratoriais).')

    if (contornos === 'lobulados') dimParts.push('Contornos lobulados.')
    else if (contornos === 'irregulares') dimParts.push('Contornos irregulares.')

    if (dimParts.length > 0) parts.push(dimParts.join('\n'))

    // Nódulos
    if (nodulos.length === 0 && parts.length > 0) {
      parts.push('Não foram identificados nódulos tireoidianos.')
    }

    nodulos.forEach((n, i) => {
      const np: string[] = []
      const label = nodulos.length > 1 ? `Nódulo ${i + 1}` : 'Nódulo'
      let desc = `${label} no ${getLocalLabel(n.local)}`
      if (n.dim1 && n.dim2 && n.dim3) desc += `, medindo ${n.dim1} x ${n.dim2} x ${n.dim3} mm`
      else if (n.dim1 && n.dim2) desc += `, medindo ${n.dim1} x ${n.dim2} mm`
      else if (n.dim1) desc += `, medindo ${n.dim1} mm`

      // TIRADS descriptors
      const descParts: string[] = []
      const compMap: Record<string, string> = { '0a': 'cístico', '0b': 'espongiforme', '1': 'misto (cístico e sólido)', '2': 'sólido' }
      const ecoMap: Record<string, string> = { '1a': 'anecóico', '1b': 'hiperecóico/isoecoico', '2': 'hipoecoico', '3': 'muito hipoecoico' }
      const formaMap: Record<string, string> = { '0': 'mais largo que alto', '3': 'mais alto que largo' }
      const margMap: Record<string, string> = { '0a': 'margens lisas', '0b': 'margens mal definidas', '2': 'margens lobuladas/irregulares', '3': 'com extensão extratireoidiana' }
      const focoMap: Record<string, string> = { '0': 'sem focos ecogênicos suspeitos', '1': 'com macrocalcificações', '2': 'com calcificações periféricas', '3': 'com focos ecogênicos puntiformes' }

      if (n.composicao && compMap[n.composicao]) descParts.push(compMap[n.composicao])
      if (n.ecogenicidade && ecoMap[n.ecogenicidade]) descParts.push(ecoMap[n.ecogenicidade])
      if (n.forma && formaMap[n.forma]) descParts.push(formaMap[n.forma])
      if (n.margens && margMap[n.margens]) descParts.push(margMap[n.margens])
      if (n.focos && focoMap[n.focos]) descParts.push(focoMap[n.focos])

      if (descParts.length > 0) desc += ', ' + descParts.join(', ')
      np.push(desc + '.')

      // Chammas
      const chammasMap: Record<string, string> = {
        'I': 'Padrão vascular ao Doppler Chammas I (sem vascularização).',
        'II': 'Padrão vascular ao Doppler Chammas II (vascularização predominantemente perinodular).',
        'III': 'Padrão vascular ao Doppler Chammas III (vascularização perinodular igual ou maior que intranodular).',
        'IV': 'Padrão vascular ao Doppler Chammas IV (vascularização predominantemente intranodular).',
        'V': 'Padrão vascular ao Doppler Chammas V (vascularização exclusivamente intranodular).',
      }
      if (n.chammas && chammasMap[n.chammas]) np.push(chammasMap[n.chammas])

      // TIRADS score
      const score = noduleScores[i]
      if (score) {
        np.push(`ACR TI-RADS: ${score.tr} (${score.total} pontos) - ${score.label}.`)
      }

      if (n.comentario.trim()) np.push(n.comentario.trim())

      parts.push(np.join('\n'))
    })

    // Linfonodos
    if (linfonodos === 'normais') parts.push('Linfonodos cervicais de aspecto habitual.')
    else if (linfonodos === 'reacionais') {
      let s = 'Linfonodos cervicais de aspecto reacional'
      if (linfLocal.trim()) s += ` nos níveis ${linfLocal.trim()}`
      parts.push(s + '.')
    } else if (linfonodos === 'suspeitos') {
      let s = 'Linfonodos cervicais de aspecto suspeito'
      if (linfLocal.trim()) s += ` nos níveis ${linfLocal.trim()}`
      parts.push(s + '.')
      if (linfComentario.trim()) parts.push(linfComentario.trim())
    }

    if (comentario.trim()) parts.push(comentario.trim())

    return parts.join('\n\n')
  }, [ldAP, ldT, ldL, leAP, leT, leL, istmo, textura, contornos, volLD, volLE, volTotal, nodulos, noduleScores, linfonodos, linfLocal, linfComentario, comentario])

  const textoConclusao = useMemo(() => {
    const conc: string[] = []

    // Volume
    if (volTotal !== null) {
      if (volTotal > 20) conc.push(`Tireoide de dimensões aumentadas (volume total: ${volTotal.toFixed(1)} cm³).`)
      else conc.push(`Tireoide de dimensões normais (volume total: ${volTotal.toFixed(1)} cm³).`)
    }

    // Textura
    if (textura === 'heterogenea' || textura === 'heterogenea_difusa') {
      conc.push('Parênquima tireoidiano de textura heterogênea (correlacionar com dados clínico-laboratoriais).')
    }

    // Nódulos
    if (nodulos.length === 0 && (ldAP || leAP)) {
      conc.push('Ausência de nódulos tireoidianos.')
    }

    nodulos.forEach((n, i) => {
      const score = noduleScores[i]
      if (!score) return
      const label = nodulos.length > 1 ? `Nódulo ${i + 1}` : 'Nódulo'
      const maxDim = Math.max(parseFloat(n.dim1) || 0, parseFloat(n.dim2) || 0, parseFloat(n.dim3) || 0)
      let s = `${label} no ${getLocalLabel(n.local)}`
      if (maxDim > 0) s += ` (${maxDim} mm)`
      s += ` - ACR TI-RADS ${score.tr} (${score.label}). ${score.paaf}`
      conc.push(s)
    })

    // Linfonodos
    if (linfonodos === 'suspeitos') conc.push('Linfonodos cervicais de aspecto suspeito (investigar).')
    else if (linfonodos === 'reacionais') conc.push('Linfonodos cervicais de aspecto reacional.')

    if (conc.length === 0) conc.push('Exame dentro dos limites da normalidade.')

    return conc.join('\n')
  }, [volTotal, textura, nodulos, noduleScores, linfonodos, ldAP, leAP])

  const titulo = 'ULTRASSONOGRAFIA DA TIREOIDE'
  const textoTecnica = 'Exame realizado com transdutor linear de alta frequência.'
  const fullText = `${titulo}\n\nTÉCNICA:\n${textoTecnica}\n\nACHADOS:\n${textoAchados}\n\nCONCLUSÃO:\n${textoConclusao}`

  // ── Copy ──
  const copyRich = useCallback(async (text: string, label: string) => {
    const lines = text.split('\n')
    const htmlLines = lines.map(l => {
      if (!l.trim()) return '<br>'
      if (l === l.toUpperCase() && l.length > 3 && !l.startsWith('-')) {
        return `<p style="margin:0 0 4pt 0;"><b>${l}</b></p>`
      }
      return `<p style="margin:0 0 2pt 0;">${l}</p>`
    }).join('')
    const styledHtml = `<div style="font-family:'Calibri','Arial',sans-serif;font-size:11pt;line-height:1.4;color:#000;">${htmlLines}</div>`

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([styledHtml], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        })
      ])
    } catch {
      await navigator.clipboard.writeText(text)
    }
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }, [])

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════

  return (
    <CalculatorLayout
      title="Descritor de US Tireoide"
      subtitle="ACR TI-RADS, dimensões, Chammas, linfonodos — relatório estruturado"
      references={[
        { text: 'Tessler FN, Middleton WD, Grant EG, et al. ACR TI-RADS. Thyroid. 2017;27(11):1341-1346.', url: 'https://pubmed.ncbi.nlm.nih.gov/29091573/' },
        { text: 'Chammas MC, et al. Thyroid nodules: evaluation with power Doppler. Radiology. 2005;234(3):899-906.', url: 'https://pubmed.ncbi.nlm.nih.gov/15665224/' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,440px] gap-6 items-start">
        {/* LEFT — Input sections */}
        <div className="space-y-2">

          {/* Dimensões da tireoide */}
          <Card id="dimensoes" activeCard={activeCard} setActiveCard={setActiveCard} title="Dimensões da Tireoide"
            badge={volTotal !== null ? `${volTotal.toFixed(1)} cm³` : undefined}>
            <div className="space-y-3">
              {/* Lobo Direito */}
              <div>
                <span className="text-[11px] font-bold" style={{ color: 'var(--text2)' }}>Lobo Direito</span>
                <div className="flex items-center gap-2 mt-1">
                  <NumInput value={ldAP} onChange={setLdAP} placeholder="AP" unit="×" />
                  <NumInput value={ldT} onChange={setLdT} placeholder="T" unit="×" />
                  <NumInput value={ldL} onChange={setLdL} placeholder="L" unit="mm" />
                  {volLD !== null && <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color: 'var(--accent)' }}>= {volLD.toFixed(1)} cm³</span>}
                </div>
              </div>
              {/* Lobo Esquerdo */}
              <div>
                <span className="text-[11px] font-bold" style={{ color: 'var(--text2)' }}>Lobo Esquerdo</span>
                <div className="flex items-center gap-2 mt-1">
                  <NumInput value={leAP} onChange={setLeAP} placeholder="AP" unit="×" />
                  <NumInput value={leT} onChange={setLeT} placeholder="T" unit="×" />
                  <NumInput value={leL} onChange={setLeL} placeholder="L" unit="mm" />
                  {volLE !== null && <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color: 'var(--accent)' }}>= {volLE.toFixed(1)} cm³</span>}
                </div>
              </div>
              {/* Istmo */}
              <div>
                <span className="text-[11px] font-bold" style={{ color: 'var(--text2)' }}>Istmo</span>
                <div className="flex items-center gap-2 mt-1">
                  <NumInput value={istmo} onChange={setIstmo} placeholder="Espessura" unit="mm" />
                </div>
              </div>
              {/* Textura */}
              <Radio value={textura} onChange={setTextura} label="Textura"
                options={[{ v: '' as any, l: 'Não descrita' }, { v: 'homogenea', l: 'Homogênea' }, { v: 'heterogenea', l: 'Heterogênea' }, { v: 'heterogenea_difusa', l: 'Difusamente heterogênea' }]} />
              {/* Contornos */}
              <Radio value={contornos} onChange={setContornos} label="Contornos"
                options={[{ v: '' as any, l: 'Não descritos' }, { v: 'regulares', l: 'Regulares' }, { v: 'lobulados', l: 'Lobulados' }, { v: 'irregulares', l: 'Irregulares' }]} />
            </div>
          </Card>

          <GroupHeader label="Nódulos" color="var(--accent)" />

          {/* Nódulos */}
          {nodulos.map((n, i) => {
            const score = noduleScores[i]
            return (
              <Card key={i} id={`nod${i}`} activeCard={activeCard} setActiveCard={setActiveCard}
                title={`Nódulo ${i + 1} — ${THYROID_REGIONS.find(r => r.id === n.local)?.shortLabel || ''}`}
                badge={score ? score.tr : undefined}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>Localização</span>
                    <button type="button" onClick={() => removeNodule(i)} className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}>Remover</button>
                  </div>

                  {/* Thyroid SVG */}
                  <ThyroidSVG selected={n.local} onSelect={r => updateNodule(i, { local: r })} />

                  {/* Dimensões */}
                  <div>
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--text3)' }}>Dimensões</span>
                    <div className="flex items-center gap-2 mt-1">
                      <NumInput value={n.dim1} onChange={v => updateNodule(i, { dim1: v })} placeholder="D1" unit="×" />
                      <NumInput value={n.dim2} onChange={v => updateNodule(i, { dim2: v })} placeholder="D2" unit="×" />
                      <NumInput value={n.dim3} onChange={v => updateNodule(i, { dim3: v })} placeholder="D3" unit="mm" />
                    </div>
                  </div>

                  {/* TIRADS */}
                  <div className="space-y-2 rounded-lg border p-2" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-[11px] font-bold" style={{ color: 'var(--text2)' }}>ACR TI-RADS</span>
                    <Radio value={n.composicao} onChange={v => updateNodule(i, { composicao: v })} label="Composição"
                      options={COMPOSICAO.map(o => ({ v: o.v, l: `${o.l} (${o.pts}pt${o.pts !== 1 ? 's' : ''})` }))} />
                    <Radio value={n.ecogenicidade} onChange={v => updateNodule(i, { ecogenicidade: v })} label="Ecogenicidade"
                      options={ECOGENICIDADE.map(o => ({ v: o.v, l: `${o.l} (${o.pts}pt${o.pts !== 1 ? 's' : ''})` }))} />
                    <Radio value={n.forma} onChange={v => updateNodule(i, { forma: v })} label="Forma"
                      options={FORMA.map(o => ({ v: o.v, l: `${o.l} (${o.pts}pt${o.pts !== 1 ? 's' : ''})` }))} />
                    <Radio value={n.margens} onChange={v => updateNodule(i, { margens: v })} label="Margens"
                      options={MARGENS.map(o => ({ v: o.v, l: `${o.l} (${o.pts}pt${o.pts !== 1 ? 's' : ''})` }))} />
                    <Radio value={n.focos} onChange={v => updateNodule(i, { focos: v })} label="Focos ecogênicos"
                      options={FOCOS.map(o => ({ v: o.v, l: `${o.l} (${o.pts}pt${o.pts !== 1 ? 's' : ''})` }))} />

                    {/* Score display */}
                    {score && (
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{ backgroundColor: score.color + '22', color: score.color }}>{score.tr}</span>
                        <span className="text-xs font-semibold" style={{ color: score.color }}>{score.total} pts — {score.label}</span>
                      </div>
                    )}
                  </div>

                  {/* Chammas */}
                  <Radio value={n.chammas} onChange={v => updateNodule(i, { chammas: v })} label="Chammas (Doppler)"
                    options={CHAMMAS.map(o => ({ v: o.v, l: o.l }))} />

                  {/* PAAF recommendation */}
                  {score && (
                    <div className="rounded-lg p-2 text-[11px] font-semibold" style={{
                      backgroundColor: score.paaf.includes('PAAF recomendada') ? 'rgba(220,38,38,0.08)' : score.paaf.includes('Seguimento') ? 'rgba(245,158,11,0.08)' : 'rgba(22,163,74,0.08)',
                      color: score.paaf.includes('PAAF recomendada') ? '#dc2626' : score.paaf.includes('Seguimento') ? '#f59e0b' : '#16a34a',
                    }}>
                      {score.paaf}
                    </div>
                  )}

                  <Txt value={n.comentario} onChange={v => updateNodule(i, { comentario: v })} placeholder="Comentário nódulo..." />
                </div>
              </Card>
            )
          })}

          <button type="button" onClick={addNodule} className="w-full py-2.5 rounded-xl text-xs font-bold border-2 border-dashed transition-all"
            style={{ borderColor: 'var(--accent)44', color: 'var(--accent)' }}>
            + Adicionar Nódulo
          </button>

          <GroupHeader label="Outros" />

          {/* Linfonodos */}
          <Card id="linfonodos" activeCard={activeCard} setActiveCard={setActiveCard} title="Linfonodos Cervicais">
            <div className="space-y-2">
              <Radio value={linfonodos} onChange={setLinfonodos} label="Aspecto"
                options={[{ v: '' as any, l: 'Não descrever' }, { v: 'normais', l: 'Habituais' }, { v: 'reacionais', l: 'Reacionais' }, { v: 'suspeitos', l: 'Suspeitos' }]} />
              {(linfonodos === 'reacionais' || linfonodos === 'suspeitos') && (
                <Txt value={linfLocal} onChange={setLinfLocal} placeholder="Localização (ex: I, II, III, IV, V, VI)" />
              )}
              {linfonodos === 'suspeitos' && (
                <Txt value={linfComentario} onChange={setLinfComentario} placeholder="Características (ausência de hilo, calcificações, etc.)" rows={2} />
              )}
            </div>
          </Card>

          {/* Comentário */}
          <Card id="comentario" activeCard={activeCard} setActiveCard={setActiveCard} title="Comentário Adicional">
            <Txt value={comentario} onChange={setComentario} placeholder="Texto livre..." rows={2} />
          </Card>
        </div>

        {/* RIGHT — Document-style output panel */}
        <div className="lg:sticky lg:top-20 space-y-3">
          {/* Action buttons */}
          <div className="flex gap-2">
            <button type="button" onClick={() => copyRich(fullText, 'tudo')}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ backgroundColor: copied === 'tudo' ? 'var(--green)' : 'var(--accent)', color: '#fff' }}>
              {copied === 'tudo' ? 'Copiado!' : 'Copiar Laudo Completo'}
            </button>
            <button type="button" onClick={() => copyRich(textoAchados, 'achados')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all"
              style={{ borderColor: 'var(--border)', color: copied === 'achados' ? 'var(--green)' : 'var(--text2)' }}>
              {copied === 'achados' ? 'Copiado!' : 'Achados'}
            </button>
            <button type="button" onClick={() => copyRich(textoConclusao, 'conclusao')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all"
              style={{ borderColor: 'var(--border)', color: copied === 'conclusao' ? 'var(--green)' : 'var(--text2)' }}>
              {copied === 'conclusao' ? 'Copiado!' : 'Conclusão'}
            </button>
          </div>

          {/* Document preview */}
          <div className="rounded-xl border shadow-lg overflow-hidden" style={{ backgroundColor: '#fff' }}>
            <div className="px-8 py-8 sm:px-10 sm:py-10"
              style={{ fontFamily: "'Calibri', 'Arial', sans-serif", fontSize: '11pt', lineHeight: 1.5, color: '#1a1a1a' }}>
              {/* Title */}
              <p style={{ fontWeight: 700, fontSize: '12pt', textAlign: 'center', marginBottom: '16pt', letterSpacing: '0.5px' }}>
                {titulo}
              </p>

              {/* Técnica */}
              <p style={{ fontWeight: 700, fontSize: '11pt', marginBottom: '4pt', color: '#333' }}>TÉCNICA:</p>
              <p style={{ marginBottom: '4pt', textAlign: 'justify' }}>{textoTecnica}</p>

              <div style={{ height: '10pt' }} />

              {/* Achados */}
              <p style={{ fontWeight: 700, fontSize: '11pt', marginBottom: '4pt', color: '#333' }}>ACHADOS:</p>
              {textoAchados ? textoAchados.split('\n').map((line, i) => {
                if (!line.trim()) return <div key={i} style={{ height: '6pt' }} />
                return <p key={i} style={{ marginBottom: '4pt', textAlign: 'justify' }}>{line}</p>
              }) : (
                <p style={{ color: '#999', fontStyle: 'italic' }}>Preencha os campos ao lado...</p>
              )}

              <div style={{ height: '10pt' }} />

              {/* Conclusão */}
              <p style={{ fontWeight: 700, fontSize: '11pt', marginBottom: '4pt', color: '#333' }}>CONCLUSÃO:</p>
              {textoConclusao ? textoConclusao.split('\n').map((line, i) => {
                if (!line.trim()) return <div key={i} style={{ height: '6pt' }} />
                // Color-code TIRADS lines
                const isTR5 = line.includes('TR5')
                const isTR4 = line.includes('TR4')
                const isTR3 = line.includes('TR3')
                const trColor = isTR5 ? '#dc2626' : isTR4 ? '#f59e0b' : isTR3 ? '#eab308' : undefined
                return <p key={i} style={{ marginBottom: '4pt', textAlign: 'justify', color: trColor }}>{line}</p>
              }) : (
                <p style={{ color: '#999', fontStyle: 'italic' }}>A conclusão será gerada automaticamente...</p>
              )}
            </div>
          </div>

          {/* TI-RADS reference table */}
          <div className="rounded-lg border p-3" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)' }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--text2)' }}>Tabela ACR TI-RADS</p>
            <p className="text-[10px]" style={{ color: '#16a34a' }}>TR1 (0 pts): Benigno — sem PAAF</p>
            <p className="text-[10px]" style={{ color: '#16a34a' }}>TR2 (2 pts): Não suspeito — sem PAAF</p>
            <p className="text-[10px]" style={{ color: '#eab308' }}>TR3 (3 pts): Levemente suspeito — PAAF se &ge; 2,5 cm</p>
            <p className="text-[10px]" style={{ color: '#f59e0b' }}>TR4 (4-6 pts): Moderadamente suspeito — PAAF se &ge; 1,5 cm</p>
            <p className="text-[10px]" style={{ color: '#dc2626' }}>TR5 (&ge;7 pts): Altamente suspeito — PAAF se &ge; 1,0 cm</p>
          </div>

          <div className="rounded-lg p-2 text-center" style={{ backgroundColor: 'var(--surface2)' }}>
            <span className="text-[10px]" style={{ color: 'var(--text3)' }}>
              Laudo copiado em formato rico (Calibri 11pt) compatível com Word e Google Docs
            </span>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  )
}
