'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import CalculatorLayout from '@/app/calculadora/components/calculator-layout'

// Accordion Card — only one open at a time
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

// Group header for visual section organization
function GroupHeader({ label, color }: { label: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 pt-3 pb-0.5">
      <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: color || 'var(--text3)' }}>{label}</span>
      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════

type Exame = 'tc' | 'rm'
type Contraste = 'sem' | 'ev' | 'dinamico'

interface SPNSide {
  espessamento: boolean
  espessamentoDiscreto: boolean
  contornosLob: boolean
  paredesEsp: boolean
  calcMucosas: boolean
  secrecaoPeqQtd: boolean
  secrecaoOblit: boolean
  bolhasAereas: boolean
  nivelLiquido: boolean
  compHiperdenso: boolean
}

const emptySPNSide = (): SPNSide => ({
  espessamento: false, espessamentoDiscreto: false, contornosLob: false,
  paredesEsp: false, calcMucosas: false, secrecaoPeqQtd: false,
  secrecaoOblit: false, bolhasAereas: false, nivelLiquido: false,
  compHiperdenso: false,
})

interface SPNSeio { dir: SPNSide; esq: SPNSide }
const emptySPNSeio = (): SPNSeio => ({ dir: emptySPNSide(), esq: emptySPNSide() })

interface VasoState {
  vaso: string
  lado: '' | 'direita' | 'esquerda'
  trajeto: '' | 'normal' | 'discr_along' | 'along_tort'
  acotovelamento: boolean
  alcaVasc: boolean
  segmento: '' | 'inicial' | 'medio' | 'distal'
  fluxoDistal: '' | 'preservado' | 'ausente'
  parede: '' | 'esp_difuso' | 'placas_irreg' | 'placas_mult'
  placa1Tipo: '' | 'calcificada' | 'parc_calc' | 'nao_calc'
  placa1Seg: '' | 'inicial' | 'medio' | 'distal'
  placa1Estenose: '' | 'sem' | 'discreta' | 'moderada' | 'acentuada'
  placa1Ulc: boolean
  placa2Tipo: '' | 'calcificada' | 'parc_calc' | 'nao_calc'
  placa2Seg: '' | 'inicial' | 'medio' | 'distal'
  placa2Estenose: '' | 'sem' | 'discreta' | 'moderada' | 'acentuada'
  placa2Ulc: boolean
  aneurisma: '' | 'sacular' | 'fusiforme'
  aneurismaSeg: '' | 'inicial' | 'medio' | 'distal'
  aneurismaDiam: string
  aneurismaColo: string
  aneurismaOrient: string
  dilatInfund: boolean
  disseccao: '' | 'flap' | 'red_lum'
  disseccaoSeg: '' | 'inicial' | 'medio' | 'distal'
  disseccaoEst: '' | 'leve' | 'moderada' | 'acentuada'
  disseccaoFluxo: '' | 'preservado' | 'ausente'
  obstrucao: boolean
  obstrucaoSeg: '' | 'origem' | 'medio' | 'distal'
  displasia: boolean
  comentario: string
}

const emptyVaso = (): VasoState => ({
  vaso: '', lado: '', trajeto: '', acotovelamento: false, alcaVasc: false,
  segmento: '', fluxoDistal: '', parede: '',
  placa1Tipo: '', placa1Seg: '', placa1Estenose: '', placa1Ulc: false,
  placa2Tipo: '', placa2Seg: '', placa2Estenose: '', placa2Ulc: false,
  aneurisma: '', aneurismaSeg: '', aneurismaDiam: '', aneurismaColo: '', aneurismaOrient: '', dilatInfund: false,
  disseccao: '', disseccaoSeg: '', disseccaoEst: '', disseccaoFluxo: '',
  obstrucao: false, obstrucaoSeg: '', displasia: false, comentario: '',
})

// ══════════════════════════════════════════════════════════
// Shared UI Helpers
// ══════════════════════════════════════════════════════════

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

function Num({ value, onChange, placeholder, unit }: { value: string; onChange: (v: string) => void; placeholder?: string; unit?: string }) {
  return (
    <div className="flex items-center gap-1">
      <input type="number" step="0.1" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-20 px-2 py-1 rounded-lg text-xs border font-mono"
        style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
      {unit && <span className="text-[10px]" style={{ color: 'var(--text3)' }}>{unit}</span>}
    </div>
  )
}

const SEIOS = [
  { id: 'maxilar', label: 'Seio maxilar', labelSg: 'seio maxilar', labelPl: 'seios maxilares', labelArtigoSg: 'do seio maxilar', labelArtigoPl: 'dos seios maxilares', labelOblitSg: 'o seio maxilar', labelOblitPl: 'os seios maxilares' },
  { id: 'frontal', label: 'Seio frontal', labelSg: 'seio frontal', labelPl: 'seios frontais', labelArtigoSg: 'do seio frontal', labelArtigoPl: 'dos seios frontais', labelOblitSg: 'o seio frontal', labelOblitPl: 'os seios frontais' },
  { id: 'esfenoidal', label: 'Seio esfenoidal', labelSg: 'seio esfenoidal', labelPl: 'seios esfenoidais', labelArtigoSg: 'do seio esfenoidal', labelArtigoPl: 'dos seios esfenoidais', labelOblitSg: 'o seio esfenoidal', labelOblitPl: 'os seios esfenoidais' },
  { id: 'etmoidal', label: 'Células etmoidais', labelSg: 'células etmoidais', labelPl: 'células etmoidais', labelArtigoSg: 'das células etmoidais', labelArtigoPl: 'das células etmoidais', labelOblitSg: 'células etmoidais', labelOblitPl: 'as células etmoidais' },
] as const

const VASOS_CERVICAIS = [
  'Arco aórtico', 'Tronco braquicefálico', 'Artéria subclávia',
  'Artéria carótida comum', 'Bulbo carotídeo', 'Artéria carótida interna',
  'Artéria carótida externa', 'Artéria vertebral',
]

const VASOS_INTRACRANIANOS = [
  'Artéria carótida interna', 'Artéria cerebral anterior',
  'Complexo da artéria comunicante anterior', 'Artéria cerebral média',
  'Artéria comunicante posterior', 'Artéria vertebral',
  'Artéria basilar', 'Artéria cerebral posterior',
]

// ══════════════════════════════════════════════════════════
// Text Generation: Técnica
// ══════════════════════════════════════════════════════════

function gerarTecnica(exame: Exame, contraste: Contraste, temCranio: boolean, angioCervical: boolean, angioIntracraniana: boolean, angioVenosa: boolean): string {
  const parts: string[] = []

  if (exame === 'tc') {
    // TC Crânio
    if (temCranio) {
      if (contraste === 'sem') parts.push('Aquisições helicoidais de imagens axiais com 0,5 mm de colimação, sem a utilização de contraste iodado. Realizadas reconstruções de imagens axiais com 2,0; 3,0 e 5,0 mm de espessura.')
      else if (contraste === 'ev') parts.push('Aquisições helicoidais de imagens axiais com 0,5 mm de colimação, antes e após a utilização de contraste iodado. Realizadas reconstruções de imagens axiais com 2,0; 3,0 e 5,0 mm de espessura.')
      else parts.push('Aquisições helicoidais de imagens axiais com 0,5 mm de colimação, antes, durante e após a injeção de contraste iodado. Realizadas reconstruções de imagens axiais com 2,0; 3,0 e 5,0 mm de espessura.')
    }
    // Angio arterial TC
    if (angioCervical || angioIntracraniana) {
      const reg = angioCervical && angioIntracraniana ? 'cervical e intracraniano' : angioCervical ? 'cervical' : 'intracraniano'
      parts.push(`Adquirida sequência angiográfica com contraste iodado endovenoso para avaliação do território arterial ${reg}. Realizadas reformatações multiplanares e segundo intensidade máxima (MIP).`)
    }
    // Angio venosa TC
    if (angioVenosa) {
      parts.push('Adquirida sequência angiográfica venosa com contraste iodado endovenoso para avaliação dos seios venosos intracranianos. Realizadas reformatações multiplanares e segundo intensidade máxima (MIP).')
    }
  } else {
    // RM
    if (temCranio && (angioCervical || angioIntracraniana)) {
      if (contraste === 'sem') {
        parts.push('Aquisições multiplanares de imagens do encéfalo enfatizadas em T1, T2 com supressão do sinal do tecido adiposo e técnica FLAIR, suscetibilidade magnética e difusão. Adquiridas sequências angiográficas com técnica TOF e/ou contraste-fase sem a utilização do meio de contraste paramagnético endovenoso. Realizadas reformatações multiplanares segundo intensidade máxima.')
      } else {
        parts.push('Aquisições multiplanares de imagens do encéfalo enfatizadas em T1, T2 com supressão do sinal do tecido adiposo e técnica FLAIR, suscetibilidade magnética e difusão. Após a injeção EV do meio de contraste paramagnético, obtidas aquisições 3D e 2D em T1, com e sem supressão do sinal do tecido adiposo. Adquiridas sequências angiográficas com técnica TOF e/ou contraste-fase sem e GE-SPGR com a utilização do meio de contraste paramagnético endovenoso. Realizadas reformatações multiplanares segundo intensidade máxima.')
      }
    } else if (temCranio) {
      if (contraste === 'sem') parts.push('Aquisições multiplanares de imagens do encéfalo enfatizadas em T1, T2 com supressão do sinal do tecido adiposo e técnica FLAIR, suscetibilidade magnética e difusão.')
      else parts.push('Aquisições multiplanares de imagens do encéfalo enfatizadas em T1, T2 com supressão do sinal do tecido adiposo e técnica FLAIR, suscetibilidade magnética e difusão. Após a injeção EV do meio de contraste paramagnético, obtidas aquisições 3D e 2D em T1, com e sem supressão do sinal do tecido adiposo.')
    } else if (angioCervical || angioIntracraniana) {
      if (contraste === 'sem') parts.push('Adquiridas sequências angiográficas com técnica TOF sem a utilização de contraste endovenoso. Realizadas projeções multiplanares segundo intensidade máxima.')
      else parts.push('Adquiridas sequências angiográficas com técnica TOF e/ou contraste-fase sem e GE-SPGR com a utilização do meio de contraste paramagnético endovenoso. Realizadas projeções multiplanares segundo intensidade máxima.')
    }
    if (angioVenosa) {
      parts.push('Adquirida sequência angiográfica venosa por técnica de contraste de fase para avaliação dos seios venosos intracranianos.')
    }
  }

  return parts.join('\n')
}

// ══════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════

export default function NeuroReport() {
  // ── Exam type — now supports combined exams ──
  const [exame, setExame] = useState<Exame>('tc')
  const [contraste, setContraste] = useState<Contraste>('sem')
  const [temCranio, setTemCranio] = useState(true)
  const [angioCervical, setAngioCervical] = useState(false)
  const [angioIntra, setAngioIntra] = useState(false)
  const [angioVen, setAngioVen] = useState(false)

  // ── Accordion state ──
  const [activeCard, setActiveCard] = useState('tecnica')

  // ── Artefatos ──
  const [artMovimento, setArtMovimento] = useState(false)
  const [artSuscep, setArtSuscep] = useState(false)

  // ── Espaços liquóricos ──
  const [sulcos, setSulcos] = useState('')
  const [ventriculos, setVentriculos] = useState('')
  const [fossaPost, setFossaPost] = useState(false)
  const [atrofia, setAtrofia] = useState(false)
  const [hpn, setHpn] = useState(false)
  const [assimVL, setAssimVL] = useState('')
  const [coaptDir, setCoaptDir] = useState(false)
  const [coaptEsq, setCoaptEsq] = useState(false)
  const [cavoPelucido, setCavoPelucido] = useState(false)
  const [cavoVerga, setCavoVerga] = useState(false)
  const [cavoVeu, setCavoVeu] = useState(false)
  const [demaisSulcosNorm, setDemaisSulcosNorm] = useState(false)
  const [restanteSVNorm, setRestanteSVNorm] = useState(false)
  const [cistoAracnoide, setCistoAracnoide] = useState(false)

  // ── Substância branca ──
  const [sbMode, setSbMode] = useState<'pronto' | 'construir'>('pronto')
  const [sbPronto, setSbPronto] = useState('')
  const [sbIntensidade, setSbIntensidade] = useState('')
  const [sbConfluentes, setSbConfluentes] = useState(false)
  const [sbDifusas, setSbDifusas] = useState(false)
  const [sbCornAnt, setSbCornAnt] = useState(false)
  const [sbAtrios, setSbAtrios] = useState(false)
  const [sbCentrosSO, setSbCentrosSO] = useState(false)
  const [sbEsparsas, setSbEsparsas] = useState(false)
  const [sbCorRad, setSbCorRad] = useState(false)
  const [sbSubcort, setSbSubcort] = useState(false)
  const [sbMaisRaras, setSbMaisRaras] = useState(false)
  const [sbRegFP, setSbRegFP] = useState(false)
  const [sbSubins, setSbSubins] = useState(false)

  // ── Lacunas / EPVA ──
  const [epvaQtd, setEpvaQtd] = useState('')
  const [epvaCentrosSO, setEpvaCentrosSO] = useState(false)
  const [epvaNLent, setEpvaNLent] = useState(false)
  const [epvaCauD, setEpvaCauD] = useState(false)
  const [epvaCauE, setEpvaCauE] = useState(false)
  const [epvaCapIntD, setEpvaCapIntD] = useState(false)
  const [epvaCapIntE, setEpvaCapIntE] = useState(false)
  const [epvaTalD, setEpvaTalD] = useState(false)
  const [epvaTalE, setEpvaTalE] = useState(false)
  const [epvaInfPut, setEpvaInfPut] = useState(false)
  const [epvaSubins, setEpvaSubins] = useState(false)
  const [epvaMesenc, setEpvaMesenc] = useState(false)
  const [epvaPont, setEpvaPont] = useState(false)
  const [lacunas, setLacunas] = useState(false)

  // ── Cerebelo ──
  const [cerebelo, setCerebelo] = useState('')

  // ── Hipocampos ──
  const [hipocampos, setHipocampos] = useState('')

  // ── Calcificações ──
  const [calcPalidais, setCalcPalidais] = useState(false)
  const [sbstParamag, setSbstParamag] = useState(false)

  // ── Hiperostose ──
  const [hipFrontal, setHipFrontal] = useState(false)
  const [hipParietal, setHipParietal] = useState(false)

  // ── Sela túrcica ──
  const [selaVazia, setSelaVazia] = useState(false)
  const [selaPacIdoso, setSelaPacIdoso] = useState(false)
  const [nervosOpt, setNervosOpt] = useState(false)
  const [seiosVenAfilados, setSeiosVenAfilados] = useState(false)
  const [cavosMeckel, setCavosMeckel] = useState(false)
  const [iiiVentrFenda, setIiiVentrFenda] = useState(false)
  const [hicBenigna, setHicBenigna] = useState(false)

  // ── SPN ──
  const [spn, setSpn] = useState({
    maxilar: emptySPNSeio(), frontal: emptySPNSeio(),
    esfenoidal: emptySPNSeio(), etmoidal: emptySPNSeio(),
  })
  const [spnNormal, setSpnNormal] = useState(false)

  // ── Mastoides ──
  const [mastoidesNormal, setMastoidesNormal] = useState(false)
  const [mastHipopneuBilat, setMastHipopneuBilat] = useState(false)
  const [mastHipopneuDir, setMastHipopneuDir] = useState(false)
  const [mastHipopneuEsq, setMastHipopneuEsq] = useState(false)
  const [mastEburneo, setMastEburneo] = useState(false)
  const [mastApiceDir, setMastApiceDir] = useState(false)
  const [mastApiceEsq, setMastApiceEsq] = useState(false)
  const [mastOblit, setMastOblit] = useState(false)
  const [mastDelineamento, setMastDelineamento] = useState(false)
  const [mastDelineDir, setMastDelineDir] = useState(false)
  const [mastDelineEsq, setMastDelineEsq] = useState(false)
  const [mastNivelLiq, setMastNivelLiq] = useState(false)

  // ── Ossos ──
  const [lesaoOssea, setLesaoOssea] = useState('')

  // ── Achados adicionais ──
  const [facectomia, setFacectomia] = useState('')
  const [comentario1, setComentario1] = useState('')
  const [comentario2, setComentario2] = useState('')
  const [comentario3, setComentario3] = useState('')

  // ── Angio arterial ──
  const [angioGeral, setAngioGeral] = useState<'' | 'normal' | 'tortuoso' | 'leve_tort' | 'esp_par'>('')
  const [vasos, setVasos] = useState<VasoState[]>([])
  const [vertDom, setVertDom] = useState('')
  const [circFetal, setCircFetal] = useState('')
  const [a1Hipoplasia, setA1Hipoplasia] = useState('')
  const [fenestBasilar, setFenestBasilar] = useState(false)
  const [artTrigeminal, setArtTrigeminal] = useState(false)
  const [azigus, setAzigus] = useState(false)

  // ── Hemorragia ──
  const [hipHem, setHipHem] = useState(false)
  const [hipHemFase, setHipHemFase] = useState<'' | 'aguda' | 'subaguda'>('')
  const [hipHemLocal, setHipHemLocal] = useState('')
  const [hipHemLado, setHipHemLado] = useState<'' | 'direita' | 'esquerda'>('')
  const [hipHemDim, setHipHemDim] = useState('')
  const [hipHemEdema, setHipHemEdema] = useState(false)
  const [hipHemEfeitoMassa, setHipHemEfeitoMassa] = useState(false)
  const [hipHemInundacao, setHipHemInundacao] = useState(false)
  const [hipHemNivel, setHipHemNivel] = useState(false)

  const [hsa, setHsa] = useState(false)
  const [hsaFisher, setHsaFisher] = useState('')
  const [hsaSulcos, setHsaSulcos] = useState(false)
  const [hsaCisternas, setHsaCisternas] = useState(false)
  const [hsaSylviana, setHsaSylviana] = useState(false)

  const [subdural, setSubdural] = useState(false)
  const [subduralFase, setSubduralFase] = useState<'' | 'agudo' | 'subagudo' | 'cronico'>('')
  const [subduralLado, setSubduralLado] = useState<'' | 'direita' | 'esquerda' | 'bilateral'>('')
  const [subduralEsp, setSubduralEsp] = useState('')
  const [subduralMembrana, setSubduralMembrana] = useState(false)

  const [epidural, setEpidural] = useState(false)
  const [epiduralLado, setEpiduralLado] = useState<'' | 'direita' | 'esquerda'>('')
  const [epiduralLocal, setEpiduralLocal] = useState('')
  const [epiduralEsp, setEpiduralEsp] = useState('')

  const [hiv, setHiv] = useState(false)
  const [hemComentario, setHemComentario] = useState('')

  // ── AVC Isquêmico ──
  const [avcAgudo, setAvcAgudo] = useState(false)
  const [avcTerritorio, setAvcTerritorio] = useState('')
  const [avcLado, setAvcLado] = useState<'' | 'direita' | 'esquerda'>('')
  const [avcRestricao, setAvcRestricao] = useState(false)
  const [avcTransfHem, setAvcTransfHem] = useState(false)
  const [avcComentario, setAvcComentario] = useState('')

  const [sequelaIsq, setSequelaIsq] = useState(false)
  const [sequelaLocal, setSequelaLocal] = useState('')
  const [sequelaLado, setSequelaLado] = useState<'' | 'direita' | 'esquerda' | 'bilateral'>('')

  // ── Lesão Expansiva ──
  const [lesaoExp, setLesaoExp] = useState(false)
  const [lesaoExpTipo, setLesaoExpTipo] = useState<'' | 'intra' | 'extra'>('')
  const [lesaoExpLocal, setLesaoExpLocal] = useState('')
  const [lesaoExpLado, setLesaoExpLado] = useState<'' | 'direita' | 'esquerda' | 'mediana'>('')
  const [lesaoExpDim, setLesaoExpDim] = useState('')
  const [lesaoExpRealce, setLesaoExpRealce] = useState<'' | 'homogeneo' | 'heterogeneo' | 'anelar' | 'ausente'>('')
  const [lesaoExpEdema, setLesaoExpEdema] = useState(false)
  const [lesaoExpEfeitoMassa, setLesaoExpEfeitoMassa] = useState(false)
  const [lesaoExpRestricao, setLesaoExpRestricao] = useState(false)
  const [lesaoExpComentario, setLesaoExpComentario] = useState('')

  // ── Linha Média / Efeito de massa ──
  const [desvioLM, setDesvioLM] = useState<'' | 'direita' | 'esquerda'>('')
  const [desvioLMmm, setDesvioLMmm] = useState('')
  const [hernSubfalc, setHernSubfalc] = useState(false)
  const [hernTranstent, setHernTranstent] = useState<'' | 'desc' | 'asc'>('')
  const [hernTonsilar, setHernTonsilar] = useState(false)
  const [apagCisternas, setApagCisternas] = useState(false)

  // ── Realce pós-contraste ──
  const [realceMeningeo, setRealceMeningeo] = useState<'' | 'paquimeningeo' | 'leptomeningeo'>('')
  const [realceComentario, setRealceComentario] = useState('')

  // ── Angio venosa ──
  const [venNormal, setVenNormal] = useState(false)
  const [venAssimTransvDir, setVenAssimTransvDir] = useState(false)
  const [venAssimTransvEsq, setVenAssimTransvEsq] = useState(false)
  const [venTrombose, setVenTrombose] = useState(false)
  const [venTromboseLocal, setVenTromboseLocal] = useState('')
  const [venComentario, setVenComentario] = useState('')

  // ══════════════════════════════════════════════════════════
  // Detect if user has made any cranio selections
  // ══════════════════════════════════════════════════════════

  const temAngioArterial = angioCervical || angioIntra

  const hasCranioSelections = useMemo(() => {
    return artMovimento || artSuscep || comentario1.trim() !== '' ||
      // Hemorragia
      hipHem || hsa || subdural || epidural || hiv || hemComentario.trim() !== '' ||
      // AVC
      avcAgudo || sequelaIsq ||
      // Lesão expansiva
      lesaoExp ||
      // Linha média
      desvioLM !== '' || hernSubfalc || hernTranstent !== '' || hernTonsilar || apagCisternas ||
      // Realce
      realceMeningeo !== '' || realceComentario.trim() !== '' ||
      // Espaços liquóricos
      sulcos !== '' || ventriculos !== '' || fossaPost || atrofia || hpn || assimVL !== '' ||
      coaptDir || coaptEsq || cavoPelucido || cavoVerga || cavoVeu || demaisSulcosNorm || restanteSVNorm || cistoAracnoide ||
      (sbMode === 'pronto' && sbPronto !== '') ||
      (sbMode === 'construir' && (sbConfluentes || sbDifusas || sbCornAnt || sbAtrios || sbCentrosSO || sbEsparsas || sbCorRad || sbSubcort || sbMaisRaras || sbRegFP || sbSubins)) ||
      epvaQtd !== '' || lacunas || cerebelo !== '' || hipocampos !== '' ||
      comentario2.trim() !== '' || comentario3.trim() !== '' ||
      calcPalidais || sbstParamag || hipFrontal || hipParietal ||
      selaVazia || nervosOpt || seiosVenAfilados || cavosMeckel || iiiVentrFenda || hicBenigna ||
      lesaoOssea.trim() !== '' || facectomia !== '' ||
      !spnNormal && Object.values(spn).some(s => Object.values(s.dir).some(Boolean) || Object.values(s.esq).some(Boolean)) ||
      mastoidesNormal || mastHipopneuBilat || mastHipopneuDir || mastHipopneuEsq || mastEburneo || mastApiceDir || mastApiceEsq || mastOblit || mastDelineamento
  }, [artMovimento, artSuscep, comentario1, hipHem, hsa, subdural, epidural, hiv, hemComentario, avcAgudo, sequelaIsq, lesaoExp, desvioLM, hernSubfalc, hernTranstent, hernTonsilar, apagCisternas, realceMeningeo, realceComentario, sulcos, ventriculos, fossaPost, atrofia, hpn, assimVL, coaptDir, coaptEsq, cavoPelucido, cavoVerga, cavoVeu, demaisSulcosNorm, restanteSVNorm, cistoAracnoide, sbMode, sbPronto, sbConfluentes, sbDifusas, sbCornAnt, sbAtrios, sbCentrosSO, sbEsparsas, sbCorRad, sbSubcort, sbMaisRaras, sbRegFP, sbSubins, epvaQtd, lacunas, cerebelo, hipocampos, comentario2, comentario3, calcPalidais, sbstParamag, hipFrontal, hipParietal, selaVazia, nervosOpt, seiosVenAfilados, cavosMeckel, iiiVentrFenda, hicBenigna, lesaoOssea, facectomia, spnNormal, spn, mastoidesNormal, mastHipopneuBilat, mastHipopneuDir, mastHipopneuEsq, mastEburneo, mastApiceDir, mastApiceEsq, mastOblit, mastDelineamento])

  // ══════════════════════════════════════════════════════════
  // TEXT GENERATION
  // ══════════════════════════════════════════════════════════

  const titulo = useMemo(() => {
    const parts: string[] = []
    const prefix = exame === 'tc' ? 'TOMOGRAFIA COMPUTADORIZADA' : 'RESSONÂNCIA MAGNÉTICA'
    const angioPrefix = exame === 'tc' ? 'ANGIOTOMOGRAFIA' : 'ANGIORESSONÂNCIA'

    if (temCranio) parts.push(`${prefix} ${exame === 'tc' ? 'DA CABEÇA' : 'DO ENCÉFALO'}`)

    const angioRegs: string[] = []
    if (angioCervical) angioRegs.push('CERVICAIS')
    if (angioIntra) angioRegs.push('INTRACRANIANAS')
    if (angioRegs.length > 0) parts.push(`${angioPrefix} DAS ARTÉRIAS ${angioRegs.join(' E ')}`)

    if (angioVen) parts.push(`${angioPrefix} DOS SEIOS VENOSOS INTRACRANIANOS`)

    if (parts.length === 0) return `${prefix} ${exame === 'tc' ? 'DA CABEÇA' : 'DO ENCÉFALO'}`
    return parts.join('\n')
  }, [exame, temCranio, angioCervical, angioIntra, angioVen])

  const textoTecnica = useMemo(() => gerarTecnica(exame, contraste, temCranio, angioCervical, angioIntra, angioVen), [exame, contraste, temCranio, angioCervical, angioIntra, angioVen])

  // Build achados text
  const textoAchados = useMemo(() => {
    const parts: string[] = []
    const isRM = exame === 'rm'
    const hipoDensidade = isRM ? 'hipersinal em T2/FLAIR' : 'hipodensidades'

    // ── CRÂNIO ──
    if (temCranio) {
      // If nothing is selected, generate normal mask
      if (!hasCranioSelections) {
        const normalParts: string[] = []
        if (isRM) {
          normalParts.push('Parênquima encefálico com posições, morfologia e características de sinal normais.')
          normalParts.push('Sulcos corticais e fissuras encefálicas com amplitude normal.')
          normalParts.push('Sistema ventricular com dimensões normais.')
          normalParts.push('Não foram identificadas áreas de contrastação patológica ou de restrição à difusão.')
          normalParts.push('Formações hipocampais simétricas, com características de sinal e dimensões conservadas.')
          normalParts.push('Cavidades paranasais de conformação e aeração normais.')
          normalParts.push('Mastoides aeradas.')
          normalParts.push('Ossos da calota craniana sem evidências de anormalidades focais.')
        } else {
          normalParts.push('Parênquima encefálico com morfologia e densidades normais.')
          normalParts.push('Sulcos corticais e fissuras encefálicas com amplitude normal.')
          normalParts.push('Sistema ventricular com dimensões normais.')
          normalParts.push('Formações hipocampais com atenuação e dimensões conservadas.')
          normalParts.push('Cavidades paranasais de conformação e aeração normais.')
          normalParts.push('Mastoides aeradas.')
          normalParts.push('Ossos da calota craniana sem evidências de anormalidades focais.')
        }
        parts.push(normalParts.join('\n'))
      } else {
        // User has selections — build specific text

        // Artefatos
        if (artMovimento) parts.push('Artefatos de movimento degradam algumas imagens, reduzindo a sensibilidade do estudo.')
        if (artSuscep) parts.push('Material metálico nas arcadas dentárias determina artefatos de susceptibilidade magnética que degradam imagens em algumas aquisições, prejudicando sua interpretação.')

        // Comentário livre 1
        if (comentario1.trim()) parts.push(comentario1.trim())

        // ── HEMORRAGIA ──
        if (hipHem) {
          const faseMap: Record<string, string> = { aguda: isRM ? 'Área com sinal compatível com hemorragia aguda' : 'Coleção hemática hiperdensa (aguda)', subaguda: isRM ? 'Área com sinal compatível com hemorragia subaguda' : 'Coleção hemática (subaguda)' }
          const localMap: Record<string, string> = {
            lobar_frontal: 'no lobo frontal', lobar_parietal: 'no lobo parietal', lobar_temporal: 'no lobo temporal', lobar_occipital: 'no lobo occipital',
            nucleocapsular: 'na região nucleocapsular', talamica: 'na região talâmica',
            cerebelar: 'no hemisfério cerebelar', pontina: 'na ponte', mesencefalica: 'no mesencéfalo',
          }
          let s = faseMap[hipHemFase] || (isRM ? 'Coleção hemática intraparenquimatosa' : 'Coleção hemática hiperdensa intraparenquimatosa')
          if (hipHemLocal && localMap[hipHemLocal]) s += ` ${localMap[hipHemLocal]}`
          if (hipHemLado) s += ` à ${hipHemLado}`
          if (hipHemDim) s += `, apresentando dimensões de aproximadamente ${hipHemDim}`
          if (hipHemEdema) s += ', com edema perilesional'
          if (hipHemEfeitoMassa) s += ' e efeito de massa sobre as estruturas adjacentes'
          parts.push(s + '.')
          if (hipHemInundacao) parts.push('Nota-se inundação hemorrágica ventricular.')
          if (hipHemNivel) parts.push('Nível hematócrito nos ventrículos laterais.')
        }

        if (hsa) {
          const locais: string[] = []
          if (hsaSulcos) locais.push('nos sulcos das convexidades')
          if (hsaCisternas) locais.push('nas cisternas da base')
          if (hsaSylviana) locais.push('nas fissuras sylvianas')
          let s = isRM ? 'Sinais de hemorragia subaracnóidea' : 'Hiperdensidade no espaço subaracnóideo'
          if (locais.length > 0) s += `, ${locais.join(', ')}`
          s += ', compatível com hemorragia subaracnóidea'
          if (hsaFisher) s += ` (Fisher ${hsaFisher})`
          parts.push(s + '.')
        }

        if (subdural) {
          const faseMap: Record<string, string> = { agudo: isRM ? 'com sinal compatível com fase aguda' : 'hiperdensa (aguda)', subagudo: isRM ? 'com sinal compatível com fase subaguda' : 'iso a discretamente hiperdensa (subaguda)', cronico: isRM ? 'com sinal compatível com fase crônica' : 'hipodensa (crônica)' }
          let s = `Coleção subdural ${faseMap[subduralFase] || ''}`
          if (subduralLado === 'bilateral') s += ' bilateral'
          else if (subduralLado) s += ` à ${subduralLado}`
          if (subduralEsp) s += `, com espessura máxima de aproximadamente ${subduralEsp} mm`
          if (subduralMembrana) s += ', com formação de membranas internas sugerindo cronicidade'
          parts.push(s + '.')
        }

        if (epidural) {
          const localMap: Record<string, string> = { frontal: 'na região frontal', temporal: 'na região temporal', parietal: 'na região parietal', occipital: 'na região occipital', fossa_post: 'na fossa posterior' }
          let s = 'Coleção epidural biconvexa'
          if (epiduralLocal && localMap[epiduralLocal]) s += ` ${localMap[epiduralLocal]}`
          if (epiduralLado) s += ` à ${epiduralLado}`
          if (epiduralEsp) s += `, com espessura máxima de ${epiduralEsp} mm`
          parts.push(s + '.')
        }

        if (hiv) parts.push('Hemorragia intraventricular.')
        if (hemComentario.trim()) parts.push(hemComentario.trim())

        // ── AVC ISQUÊMICO ──
        if (avcAgudo) {
          const terrMap: Record<string, string> = {
            acm: 'no território da artéria cerebral média', aca: 'no território da artéria cerebral anterior',
            acp: 'no território da artéria cerebral posterior', vb: 'no território vertebrobasilar',
            lacunar: 'na região dos núcleos da base, compatível com infarto lacunar',
          }
          let s = isRM ? 'Área de alteração de sinal' : 'Área de hipodensidade com perda da diferenciação substância branca/cinzenta'
          if (avcTerritorio && terrMap[avcTerritorio]) s += ` ${terrMap[avcTerritorio]}`
          if (avcLado) s += ` à ${avcLado}`
          if (avcRestricao) s += isRM ? ', com restrição à difusão, compatível com isquemia aguda' : ''
          parts.push(s + '.')
          if (avcTransfHem) parts.push('Nota-se transformação hemorrágica associada.')
          if (avcComentario.trim()) parts.push(avcComentario.trim())
        }

        if (sequelaIsq) {
          const seqLocalMap: Record<string, string> = {
            frontal: 'no lobo frontal', parietal: 'no lobo parietal', temporal: 'no lobo temporal', occipital: 'no lobo occipital',
            nucleocapsular: 'na região nucleocapsular', talamica: 'na região talâmica',
            cerebelar: 'no hemisfério cerebelar', ponte: 'na ponte',
            acm: 'no território da artéria cerebral média', aca: 'no território da artéria cerebral anterior', acp: 'no território da artéria cerebral posterior',
          }
          let s = isRM ? 'Área de encefalomalácia/gliose' : 'Área de encefalomalácia'
          if (sequelaLocal && seqLocalMap[sequelaLocal]) s += ` ${seqLocalMap[sequelaLocal]}`
          if (sequelaLado === 'bilateral') s += ' bilateral'
          else if (sequelaLado) s += ` à ${sequelaLado}`
          s += ', compatível com sequela isquêmica'
          parts.push(s + '.')
        }

        // ── LESÃO EXPANSIVA ──
        if (lesaoExp) {
          const tipoMap: Record<string, string> = { intra: 'intra-axial', extra: 'extra-axial' }
          const localMap: Record<string, string> = {
            frontal: 'no lobo frontal', parietal: 'no lobo parietal', temporal: 'no lobo temporal', occipital: 'no lobo occipital',
            fossa_post: 'na fossa posterior', selar: 'na região selar/parasselar',
            apc: 'no ângulo pontocerebelar', pineal: 'na região pineal',
            ventricular: 'intraventricular', meninges: 'nas meninges',
          }
          const realceMap: Record<string, string> = { homogeneo: 'com realce homogêneo pelo meio de contraste', heterogeneo: 'com realce heterogêneo pelo meio de contraste', anelar: 'com realce anelar/periférico pelo meio de contraste', ausente: 'sem realce significativo pelo meio de contraste' }
          let s = `Formação expansiva ${tipoMap[lesaoExpTipo] || ''}`
          if (lesaoExpLocal && localMap[lesaoExpLocal]) s += ` ${localMap[lesaoExpLocal]}`
          if (lesaoExpLado === 'mediana') s += ' de localização mediana'
          else if (lesaoExpLado) s += ` à ${lesaoExpLado}`
          if (lesaoExpDim) s += `, apresentando dimensões de aproximadamente ${lesaoExpDim}`
          if (lesaoExpRealce && realceMap[lesaoExpRealce]) s += `, ${realceMap[lesaoExpRealce]}`
          if (lesaoExpRestricao && isRM) s += ', com restrição à difusão'
          if (lesaoExpEdema) s += ', com edema perilesional'
          if (lesaoExpEfeitoMassa) s += ' e efeito de massa sobre as estruturas adjacentes'
          parts.push(s + '.')
          if (lesaoExpComentario.trim()) parts.push(lesaoExpComentario.trim())
        }

        // ── LINHA MÉDIA / EFEITO DE MASSA ──
        if (desvioLM) {
          let s = `Desvio das estruturas da linha média para a ${desvioLM}`
          if (desvioLMmm) s += `, em aproximadamente ${desvioLMmm} mm`
          parts.push(s + '.')
        }
        if (hernSubfalc) parts.push('Herniação subfalcina.')
        if (hernTranstent === 'desc') parts.push('Sinais de herniação transtentorial descendente.')
        else if (hernTranstent === 'asc') parts.push('Sinais de herniação transtentorial ascendente.')
        if (hernTonsilar) parts.push('Herniação tonsilar.')
        if (apagCisternas) parts.push('Apagamento das cisternas da base.')

        // Espaços liquóricos
        const liqParts: string[] = []
        if (sulcos === 'amplos_fp') liqParts.push('Sulcos corticais amplos nas convexidades frontoparietais.')
        else if (sulcos === 'amplos_fissuras') liqParts.push('Sulcos corticais, fissuras inter-hemisférica e sylvianas amplos.')

        if (ventriculos === 'discreto') liqParts.push('Discreto aumento dos ventrículos laterais e III ventrículo.')
        else if (ventriculos === 'dilatados') liqParts.push('Ventrículos laterais e III ventrículo dilatados.')

        if (fossaPost) liqParts.push('Cisternas da base e sulcos/fissuras cerebelares amplas.')

        if (atrofia) {
          liqParts.push('Alargamento dos sulcos corticais, fissuras inter-hemisférica e sylvianas, assim como aumento dos ventrículos laterais e III ventrículo. Cisternas da base e sulcos/fissuras cerebelares amplas.')
        }

        if (hpn) {
          liqParts.push('Menor amplitude dos sulcos corticais frontoparietais parassagitais e da fissura inter-hemisférica junto ao vértice. Alargamento dos demais sulcos corticais, fissuras sylvianas, assim como grande aumento dos ventrículos laterais e III ventrículo, com aspecto globoso. Cisternas da base amplas.')
          liqParts.push('Sinais de redução volumétrica do encéfalo, notando-se certa desproporção entre as maiores dimensões ventriculares e a amplitude reduzida dos sulcos corticais no vértice, um achado inespecífico, mas que pode ser observado nos distúrbios da dinâmica do fluxo liquórico, em contexto clínico compatível.')
        }

        if (assimVL) liqParts.push(`Assimetria dos ventrículos laterais, maior à ${assimVL}.`)
        if (coaptDir) liqParts.push('Coaptação focal do corno anterior do ventrículo lateral direito.')
        if (coaptEsq) liqParts.push('Coaptação focal do corno anterior do ventrículo lateral esquerdo.')

        const cavoParts: string[] = []
        if (cavoPelucido) cavoParts.push('do septo pelúcido')
        if (cavoVerga) cavoParts.push('de Verga')
        if (cavoVeu) cavoParts.push('do véu interposto')
        if (cavoParts.length > 0) {
          const cavoStr = cavoParts.length === 1 ? `do cavo ${cavoParts[0]}` : `dos cavos ${cavoParts.join(' e ')}`
          liqParts.push(`Persistência ${cavoStr} (variação da normalidade).`)
        }

        if (cistoAracnoide) liqParts.push('Alargamento do espaço liquórico retrovermiano, que pode estar relacionado a megacisterna magna ou cisto aracnoide. Achado fortuito, mais comumente sem significado clínico.')
        if (demaisSulcosNorm) liqParts.push('Demais sulcos corticais e fissuras encefálicas com amplitude normal.')
        if (restanteSVNorm) liqParts.push('Restante do sistema ventricular com dimensões normais.')
        if (liqParts.length > 0) parts.push(liqParts.join('\n'))

        // Substância branca
        if (sbMode === 'pronto' && sbPronto) {
          const sbMap: Record<string, string> = {
            discretas_perivent: `Discretas ${hipoDensidade} na substância branca dos hemisférios cerebrais, ao redor dos cornos anteriores e átrios dos ventrículos laterais, esparsas nos centros semiovais, mais raras nas regiões frontoparietais subcorticais.`,
            confluentes: `${hipoDensidade.charAt(0).toUpperCase() + hipoDensidade.slice(1)} na substância branca dos hemisférios cerebrais, confluentes ao redor dos cornos anteriores e átrios dos ventrículos laterais, esparsas nos centros semiovais, nas regiões frontoparietais subcorticais e subinsulares.`,
            extensas: `Extensas ${hipoDensidade} na substância branca dos hemisférios cerebrais, confluentes ao redor dos cornos anteriores e átrios dos ventrículos laterais, difusas nos centros semiovais/ coroas radiadas, nas regiões frontoparietais subcorticais e subinsulares.`,
            tenues: `Tênues ${hipoDensidade} na substância branca dos hemisférios cerebrais, ao redor dos cornos anteriores dos ventrículos laterais.`,
            inespecificas: `${hipoDensidade.charAt(0).toUpperCase() + hipoDensidade.slice(1)} na substância branca dos hemisférios cerebrais, inespecíficas, frequentemente relacionadas a gliose/ rarefação de mielina.`,
          }
          if (sbMap[sbPronto]) parts.push(sbMap[sbPronto])
        } else if (sbMode === 'construir') {
          const locais: string[] = []
          if (sbConfluentes) locais.push('confluentes')
          if (sbCornAnt) locais.push('ao redor dos cornos anteriores')
          if (sbAtrios) locais.push('e átrios dos ventrículos laterais')
          if (sbCentrosSO) locais.push('nos centros semiovais')
          if (sbDifusas) locais.push('difusas')
          if (sbEsparsas) locais.push('esparsas')
          if (sbCorRad) locais.push('nas coroas radiadas')
          if (sbSubcort) locais.push('nas regiões subcorticais')
          if (sbMaisRaras) locais.push('mais raras')
          if (sbRegFP) locais.push('nas regiões frontoparietais subcorticais')
          if (sbSubins) locais.push('nas regiões subinsulares')
          if (locais.length > 0) {
            const int = sbIntensidade === 'discretas' ? 'Discretas' : sbIntensidade === 'extensas' ? 'Extensas' : ''
            const prefix = int ? `${int} ${hipoDensidade}` : `${hipoDensidade.charAt(0).toUpperCase() + hipoDensidade.slice(1)}`
            parts.push(`${prefix} na substância branca dos hemisférios cerebrais, ${locais.join(', ')}.`)
          }
        }

        // Comentário 2
        if (comentario2.trim()) parts.push(comentario2.trim())

        // EPVA / Lacunas
        if (epvaQtd) {
          const locais: string[] = []
          if (epvaCentrosSO) locais.push('nos centros semiovais')
          if (epvaNLent) locais.push('nos núcleos lentiformes')
          if (epvaCauD) locais.push('na cabeça do núcleo caudado à direita')
          if (epvaCauE) locais.push('na cabeça do núcleo caudado à esquerda')
          if (epvaCapIntD) locais.push('na cápsula interna à direita')
          if (epvaCapIntE) locais.push('na cápsula interna à esquerda')
          if (epvaTalD) locais.push('no tálamo à direita')
          if (epvaTalE) locais.push('no tálamo à esquerda')
          if (epvaInfPut) locais.push('nas regiões infraputaminais')
          if (epvaSubins) locais.push('nas regiões subinsulares')
          if (epvaMesenc) locais.push('no mesencéfalo')
          if (epvaPont) locais.push('na ponte')
          if (locais.length > 0) {
            const qtdLabel = epvaQtd === 'multiplos' ? 'Múltiplos focos' : epvaQtd === 'alguns' ? 'Alguns focos' : 'Focos'
            const sinalLabel = isRM ? 'com sinal liquórico' : 'com densidade liquórica'
            parts.push(`${qtdLabel} circunscritos ${sinalLabel} ${locais.join(', ')}, provavelmente representando espaços perivasculares.`)
          }
        }
        if (lacunas) parts.push(isRM ? 'Lacunas com sinal liquórico no corpo do núcleo caudado.' : 'Lacunas com densidade liquórica.')

        // Cerebelo
        const cerebMap: Record<string, string> = {
          seq_dir: 'Pequena sequela isquêmica ou fissura focalmente alargada no hemisfério cerebelar direito.',
          seq_esq: 'Pequena sequela isquêmica ou fissura focalmente alargada no hemisfério cerebelar esquerdo.',
          seq_bilat: 'Pequenas sequelas isquêmicas ou fissuras focalmente alargadas nos hemisférios cerebelares.',
          faixa_dir: isRM ? 'Delgada faixa alongada com sinal liquórico na periferia do hemisfério cerebelar direito.' : 'Delgada faixa alongada na periferia do hemisfério cerebelar direito.',
          faixa_esq: isRM ? 'Delgada faixa alongada com sinal liquórico na periferia do hemisfério cerebelar esquerdo.' : 'Delgada faixa alongada na periferia do hemisfério cerebelar esquerdo.',
          faixas_bilat: isRM ? 'Delgadas faixas alongadas com sinal liquórico nos hemisférios cerebelares.' : 'Delgadas faixas alongadas nos hemisférios cerebelares.',
        }
        if (cerebelo && cerebMap[cerebelo]) parts.push(cerebMap[cerebelo])

        // Hipocampos
        const hipMap: Record<string, string> = {
          normais_tc: 'Formações hipocampais com atenuação e dimensões conservadas.',
          normais_rm: 'Formações hipocampais simétricas, com características de sinal e dimensões conservadas.',
          red_prop_tc: 'Formações hipocampais com dimensões reduzidas, de maneira proporcional às demais estruturas encefálicas à análise não quantitativa.',
          red_prop_rm: 'Formações hipocampais proporcionais às demais estruturas encefálicas à análise não quantitativa, com características de sinal conservadas.',
          alt_bilat: `Formações hipocampais de dimensões reduzidas, de maneira desproporcional às demais estruturas encefálicas à análise não quantitativa${isRM ? ', e aumento de sinal em T2/FLAIR' : ''}.`,
          alt_dir: `Formação hipocampal direita de dimensões reduzidas de maneira mais acentuada em relação às demais estruturas encefálicas à análise não quantitativa${isRM ? ', e aumento de sinal em T2/FLAIR' : ''}.`,
          alt_esq: `Formação hipocampal esquerda de dimensões reduzidas de maneira mais acentuada em relação às demais estruturas encefálicas à análise não quantitativa${isRM ? ', e aumento de sinal em T2/FLAIR' : ''}.`,
          ehm_bilat: 'Nota-se obliquidade/verticalização segmentar da junção cabeça/corpo das formações hipocampais, compatível com variante anatômica.',
          ehm_dir: 'Nota-se obliquidade/verticalização segmentar da junção cabeça/corpo hipocampais à direita compatível com variante anatômica.',
          ehm_esq: 'Nota-se obliquidade/verticalização segmentar da junção cabeça/corpo hipocampais à esquerda compatível com variante anatômica.',
        }
        const hipKey = hipocampos === 'normais' ? (isRM ? 'normais_rm' : 'normais_tc')
          : hipocampos === 'red_prop' ? (isRM ? 'red_prop_rm' : 'red_prop_tc')
          : hipocampos
        if (hipKey && hipMap[hipKey]) parts.push(hipMap[hipKey])

        // Comentário 3
        if (comentario3.trim()) parts.push(comentario3.trim())

        // Realce pós-contraste
        if (realceMeningeo === 'paquimeningeo') parts.push('Realce paquimeníngeo (dural) difuso após a injeção do meio de contraste.')
        else if (realceMeningeo === 'leptomeningeo') parts.push('Realce leptomeníngeo após a injeção do meio de contraste.')
        if (realceComentario.trim()) parts.push(realceComentario.trim())

        // Calcificações
        if (calcPalidais) parts.push('Calcificações palidais, achado habitual nesta faixa etária.')
        if (sbstParamag && isRM) parts.push('Hipossinal nos núcleos lentiformes em SWI, compatível com depósito de minerais, achado habitual nesta faixa etária.')

        // Hiperostose
        const hipLocs: string[] = []
        if (hipFrontal) hipLocs.push('frontais')
        if (hipParietal) hipLocs.push('parietais')
        if (hipLocs.length > 0) {
          parts.push(`Espessamento e lobulações na tábua interna da escama dos ossos ${hipLocs.join(' e ')}, compatíveis com hiperostose benigna.`)
        }

        // Sela túrcica
        if (selaVazia) {
          let selaStr = 'Insinuação liquórica na cavidade selar, caracterizando sela parcialmente vazia'
          if (selaPacIdoso) selaStr += ', achado frequente na faixa etária'
          selaStr += '.'
          parts.push(selaStr)
        }
        if (nervosOpt) parts.push('Ingurgitamento das bainhas dos nervos ópticos.')
        if (seiosVenAfilados) parts.push('Seios venosos intracranianos de aspecto afilado.')
        if (cavosMeckel) parts.push('Cavos de Meckel amplos.')
        if (iiiVentrFenda) parts.push('III ventrículo em fenda.')
        if (hicBenigna) parts.push('Tais achados são inespecíficos, mas podem ser encontrados na hipertensão intracraniana benigna idiopática.')

        // Ossos
        if (lesaoOssea.trim()) parts.push(lesaoOssea.trim())

        // SPN
        const spnText = gerarTextoSPN(spn, spnNormal, exame)
        if (spnText) parts.push(spnText)

        // Mastoides
        const mastText = gerarTextoMastoides()
        if (mastText) parts.push(mastText)

        // Facectomia
        if (facectomia === 'bilateral') parts.push('Facectomias bilaterais.')
        else if (facectomia === 'direita') parts.push('Facectomia à direita.')
        else if (facectomia === 'esquerda') parts.push('Facectomia à esquerda.')
      }
    }

    // ── ANGIO ARTERIAL ──
    if (temAngioArterial) {
      const angioText = gerarTextoAngio()
      if (angioText) parts.push(angioText)
    }

    // ── ANGIO VENOSA ──
    if (angioVen) {
      const angVenText = gerarTextoAngioVenosa()
      if (angVenText) parts.push(angVenText)
    }

    return parts.join('\n\n')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exame, temCranio, hasCranioSelections, artMovimento, artSuscep, comentario1, hipHem, hipHemFase, hipHemLocal, hipHemLado, hipHemDim, hipHemEdema, hipHemEfeitoMassa, hipHemInundacao, hipHemNivel, hsa, hsaFisher, hsaSulcos, hsaCisternas, hsaSylviana, subdural, subduralFase, subduralLado, subduralEsp, subduralMembrana, epidural, epiduralLado, epiduralLocal, epiduralEsp, hiv, hemComentario, avcAgudo, avcTerritorio, avcLado, avcRestricao, avcTransfHem, avcComentario, sequelaIsq, sequelaLocal, sequelaLado, lesaoExp, lesaoExpTipo, lesaoExpLocal, lesaoExpLado, lesaoExpDim, lesaoExpRealce, lesaoExpEdema, lesaoExpEfeitoMassa, lesaoExpRestricao, lesaoExpComentario, desvioLM, desvioLMmm, hernSubfalc, hernTranstent, hernTonsilar, apagCisternas, realceMeningeo, realceComentario, sulcos, ventriculos, fossaPost, atrofia, hpn, assimVL, coaptDir, coaptEsq, cavoPelucido, cavoVerga, cavoVeu, demaisSulcosNorm, restanteSVNorm, cistoAracnoide, sbMode, sbPronto, sbIntensidade, sbConfluentes, sbDifusas, sbCornAnt, sbAtrios, sbCentrosSO, sbEsparsas, sbCorRad, sbSubcort, sbMaisRaras, sbRegFP, sbSubins, comentario2, epvaQtd, epvaCentrosSO, epvaNLent, epvaCauD, epvaCauE, epvaCapIntD, epvaCapIntE, epvaTalD, epvaTalE, epvaInfPut, epvaSubins, epvaMesenc, epvaPont, lacunas, cerebelo, hipocampos, comentario3, calcPalidais, sbstParamag, hipFrontal, hipParietal, selaVazia, selaPacIdoso, nervosOpt, seiosVenAfilados, cavosMeckel, iiiVentrFenda, hicBenigna, lesaoOssea, spn, spnNormal, mastoidesNormal, mastHipopneuBilat, mastHipopneuDir, mastHipopneuEsq, mastEburneo, mastApiceDir, mastApiceEsq, mastOblit, mastDelineamento, mastDelineDir, mastDelineEsq, mastNivelLiq, facectomia, temAngioArterial, angioGeral, vasos, vertDom, circFetal, a1Hipoplasia, fenestBasilar, artTrigeminal, azigus, angioVen, venNormal, venAssimTransvDir, venAssimTransvEsq, venTrombose, venTromboseLocal, venComentario])

  // ── SPN text generation ──
  function gerarTextoSPN(spnData: Record<string, SPNSeio>, normal: boolean, _exame: Exame): string {
    if (normal) return 'Cavidades paranasais de conformação e aeração normais.'

    const achados: string[] = []
    type Finding = { seio: typeof SEIOS[number]; lados: ('dir' | 'esq')[] }

    const checkFinding = (key: keyof SPNSide): Finding[] => {
      const found: Finding[] = []
      for (const seio of SEIOS) {
        const s = spnData[seio.id as keyof typeof spnData]
        if (!s) continue
        const lados: ('dir' | 'esq')[] = []
        if (s.dir[key]) lados.push('dir')
        if (s.esq[key]) lados.push('esq')
        if (lados.length > 0) found.push({ seio, lados })
      }
      return found
    }

    const esp = checkFinding('espessamento')
    const espDisc = checkFinding('espessamentoDiscreto')
    const allEsp = [...esp, ...espDisc]
    if (allEsp.length > 0) {
      const locStrs = allEsp.map(f => {
        const bilateral = f.lados.length === 2
        const label = bilateral ? f.seio.labelArtigoPl : f.seio.labelArtigoSg
        const lado = !bilateral ? (f.lados[0] === 'dir' ? ' à direita' : ' à esquerda') : ''
        return `${label}${lado}`
      })
      const prefix = espDisc.length > 0 && esp.length === 0 ? 'Discreto espessamento do revestimento mucoso' : 'Espessamento do revestimento mucoso'
      achados.push(`${prefix} ${locStrs.join(', ')}.`)
    }

    const lob = checkFinding('contornosLob')
    if (lob.length > 0) {
      const locStrs = lob.map(f => {
        const bilateral = f.lados.length === 2
        return bilateral ? f.seio.labelArtigoPl : `${f.seio.labelArtigoSg}${f.lados[0] === 'dir' ? ' à direita' : ' à esquerda'}`
      })
      achados.push(`Aspecto por vezes lobulado deste espessamento mucoso ${locStrs.join(', ')}, podendo corresponder a cistos de retenção/pólipos.`)
    }

    const par = checkFinding('paredesEsp')
    if (par.length > 0) {
      const locStrs = par.map(f => {
        const bilateral = f.lados.length === 2
        return bilateral ? f.seio.labelArtigoPl : `${f.seio.labelArtigoSg}${f.lados[0] === 'dir' ? ' à direita' : ' à esquerda'}`
      })
      achados.push(`Espessamento e esclerose das paredes ósseas ${locStrs.join(', ')} (osteíte reacional), sugerindo cronicidade do processo inflamatório.`)
    }

    const calc = checkFinding('calcMucosas')
    if (calc.length > 0) {
      const locStrs = calc.map(f => {
        const bilateral = f.lados.length === 2
        return bilateral ? `n${f.seio.labelArtigoSg.substring(1)}` : `n${f.seio.labelArtigoSg.substring(1)}${f.lados[0] === 'dir' ? ' à direita' : ' à esquerda'}`
      })
      achados.push(`Presença de calcificações mucosas/submucosas ${locStrs.join(', ')}, sugerindo cronicidade do processo inflamatório.`)
    }

    const secPeq = checkFinding('secrecaoPeqQtd')
    if (secPeq.length > 0) {
      const locStrs = secPeq.map(f => {
        const bilateral = f.lados.length === 2
        return bilateral ? `n${f.seio.labelArtigoSg.substring(1)}` : `n${f.seio.labelArtigoSg.substring(1)}${f.lados[0] === 'dir' ? ' à direita' : ' à esquerda'}`
      })
      achados.push(`Presença de secreção em pequena quantidade ${locStrs.join(', ')}.`)
    }

    const secOblit = checkFinding('secrecaoOblit')
    if (secOblit.length > 0) {
      const locStrs = secOblit.map(f => {
        const bilateral = f.lados.length === 2
        return bilateral ? f.seio.labelOblitPl : `${f.seio.labelOblitSg}${f.lados[0] === 'dir' ? ' à direita' : ' à esquerda'}`
      })
      achados.push(`Presença de secreção obliterando ${locStrs.join(', ')}.`)
    }

    const bolhas = checkFinding('bolhasAereas')
    if (bolhas.length > 0) {
      const locStrs = bolhas.map(f => {
        const bilateral = f.lados.length === 2
        return bilateral ? `n${f.seio.labelArtigoSg.substring(1)}` : `n${f.seio.labelArtigoSg.substring(1)}${f.lados[0] === 'dir' ? ' à direita' : ' à esquerda'}`
      })
      achados.push(`Bolhas aéreas de permeio ${locStrs.join(', ')}.`)
    }

    const nivel = checkFinding('nivelLiquido')
    if (nivel.length > 0) {
      const locStrs = nivel.map(f => {
        const bilateral = f.lados.length === 2
        return bilateral ? `n${f.seio.labelArtigoSg.substring(1)}` : `n${f.seio.labelArtigoSg.substring(1)}${f.lados[0] === 'dir' ? ' à direita' : ' à esquerda'}`
      })
      achados.push(`Nível líquido ${locStrs.join(', ')} sugerindo quadro agudo/agudizado.`)
    }

    const hiper = checkFinding('compHiperdenso')
    if (hiper.length > 0) {
      const locStrs = hiper.map(f => {
        const bilateral = f.lados.length === 2
        return bilateral ? `n${f.seio.labelArtigoSg.substring(1)}` : `n${f.seio.labelArtigoSg.substring(1)}${f.lados[0] === 'dir' ? ' à direita' : ' à esquerda'}`
      })
      achados.push(`Componentes hiperdensos de permeio ${locStrs.join(', ')} que pode estar relacionado a conteúdo hiperprotêico, hemático ou fúngico.`)
    }

    return achados.join(' ')
  }

  // ── Mastoides text ──
  function gerarTextoMastoides(): string {
    if (mastoidesNormal) return 'Mastoides aeradas.'
    const p: string[] = []
    if (mastHipopneuBilat) {
      let s = 'Mastoides hipopneumatizadas'
      if (mastEburneo) s += ', de aspecto ebúrneo'
      p.push(s + '.')
    } else {
      if (mastHipopneuDir) p.push('Mastoide direita hipopneumatizada.')
      if (mastHipopneuEsq) p.push('Mastoide esquerda hipopneumatizada.')
    }
    if (mastApiceDir && mastApiceEsq) p.push('Ápices das mastoides hipopneumatizados.')
    else if (mastApiceDir) p.push('Ápice da mastoide à direita hipopneumatizado.')
    else if (mastApiceEsq) p.push('Ápice da mastoide à esquerda hipopneumatizado.')
    if (mastOblit) p.push('Obliteração de algumas células das mastoides por material com atenuação de partes moles.')
    if (mastDelineamento) {
      const lado = mastDelineDir && mastDelineEsq ? 'das mastoides' : mastDelineDir ? 'da mastoide direita' : 'da mastoide esquerda'
      let s = `Delineamento dos contornos das células ${lado} por material hidratado`
      if (mastNivelLiq) s += ', por vezes formando níveis líquidos'
      p.push(s + '.')
    }
    return p.join(' ')
  }

  // ── Angio arterial text ──
  function gerarTextoAngio(): string {
    if (!temAngioArterial) return ''
    const p: string[] = []

    if (angioGeral === 'normal') {
      const reg = angioCervical && angioIntra ? 'cervicais, intracranianos e seus principais ramos' : angioCervical ? 'cervicais e seus principais ramos' : 'intracranianos e seus principais ramos'
      p.push(`Colunas de fluxo representantes dos grandes troncos arteriais ${reg} de trajeto e calibre normais.`)
    } else if (angioGeral === 'leve_tort') {
      p.push('Grandes troncos arteriais cervicais e seus principais ramos de trajeto levemente alongado e tortuoso.')
    } else if (angioGeral === 'tortuoso') {
      p.push('Grandes troncos arteriais cervicais e seus principais ramos de trajeto alongado e tortuoso.')
    } else if (angioGeral === 'esp_par') {
      p.push('Grandes troncos arteriais cervicais e seus principais ramos de trajeto alongado e tortuoso, apresentando espessamento parietal difuso.')
    }

    for (const v of vasos) {
      if (!v.vaso) continue
      const vasoNome = v.vaso + (v.lado ? ` ${v.lado}` : '')
      const vp: string[] = []
      if (v.trajeto === 'normal') vp.push('De trajeto e calibre normais')
      else if (v.trajeto === 'discr_along') vp.push('Discretamente alongada e tortuosa')
      else if (v.trajeto === 'along_tort') vp.push('Alongada, tortuosa e irregular')
      if (v.acotovelamento) vp.push('com presença de acotovelamento vascular')
      if (v.alcaVasc) vp.push('com presença de alças vasculares redundantes')
      if (v.parede === 'esp_difuso') vp.push('Espessamento parietal difuso')
      else if (v.parede === 'placas_irreg') vp.push('com presença de discretas irregularidades parietais por presumíveis placas calcificadas')
      else if (v.parede === 'placas_mult') vp.push('com presença de múltiplas irregularidades parietais por presumíveis placas parietais calcificadas')
      if (v.placa1Tipo) {
        const tipoMap: Record<string, string> = { calcificada: 'calcificada', parc_calc: 'parcialmente calcificada', nao_calc: 'não calcificada (placa "mole")' }
        const segMap: Record<string, string> = { inicial: 'no segmento inicial', medio: 'no segmento médio', distal: 'no segmento distal' }
        const estMap: Record<string, string> = { sem: 'sem repercussões luminais', discreta: 'determinando estenose discreta', moderada: 'determinando estenose moderada', acentuada: 'determinando estenose acentuada' }
        let plStr = `Placa parietal ${tipoMap[v.placa1Tipo] || ''}`
        if (v.placa1Seg) plStr += ` localizada ${segMap[v.placa1Seg] || ''}`
        if (v.placa1Ulc) plStr += ', com irregularidades superficiais/ulcerações'
        if (v.placa1Estenose) plStr += `, ${estMap[v.placa1Estenose] || ''}`
        vp.push(plStr)
      }
      if (v.placa2Tipo) {
        const tipoMap: Record<string, string> = { calcificada: 'calcificada', parc_calc: 'parcialmente calcificada', nao_calc: 'não calcificada' }
        const segMap: Record<string, string> = { inicial: 'no segmento inicial', medio: 'no segmento médio', distal: 'no segmento distal' }
        const estMap: Record<string, string> = { sem: 'sem repercussões luminais', discreta: 'determinando estenose discreta', moderada: 'determinando estenose moderada', acentuada: 'determinando estenose acentuada' }
        let plStr = `Segunda placa parietal ${tipoMap[v.placa2Tipo] || ''}`
        if (v.placa2Seg) plStr += ` localizada ${segMap[v.placa2Seg] || ''}`
        if (v.placa2Ulc) plStr += ', com irregularidades superficiais/ulcerações'
        if (v.placa2Estenose) plStr += `, ${estMap[v.placa2Estenose] || ''}`
        vp.push(plStr)
      }
      if (v.aneurisma) {
        const segMap: Record<string, string> = { inicial: 'do segmento inicial', medio: 'do segmento médio', distal: 'do segmento distal' }
        let anStr = `Dilatação aneurismática ${v.aneurisma === 'sacular' ? 'sacular' : 'fusiforme'}`
        if (v.aneurismaSeg) anStr += ` ${segMap[v.aneurismaSeg] || ''}`
        if (v.aneurismaDiam) anStr += `, apresentando diâmetro máximo de ${v.aneurismaDiam} cm`
        if (v.aneurismaOrient) anStr += `, notando-se orientação ${v.aneurismaOrient}`
        if (v.aneurismaColo) anStr += ` e colo estimado em ${v.aneurismaColo} cm`
        vp.push(anStr)
      }
      if (v.dilatInfund) vp.push('Pode representar dilatação infundibular ou pequeno aneurisma')
      if (v.disseccao) {
        const segMap: Record<string, string> = { inicial: 'no segmento inicial', medio: 'no segmento médio', distal: 'no segmento distal' }
        const estMap: Record<string, string> = { leve: 'leve', moderada: 'moderada', acentuada: 'acentuada' }
        if (v.disseccao === 'flap') {
          let dStr = 'Sinais de dissecção, caracterizados por flap intimal'
          if (v.disseccaoSeg) dStr += ` ${segMap[v.disseccaoSeg] || ''}`
          if (v.disseccaoEst) dStr += `, determina redução luminal ${estMap[v.disseccaoEst] || ''}`
          if (v.disseccaoFluxo) dStr += `. O fluxo distal está ${v.disseccaoFluxo === 'preservado' ? 'preservado' : 'ausente'}`
          vp.push(dStr)
        } else {
          let dStr = 'Redução luminal excêntrica, por vezes assumindo aspecto em espiral'
          if (v.disseccaoSeg) dStr += ` ${segMap[v.disseccaoSeg] || ''}`
          vp.push(dStr + '. Tal aspecto é suspeito para dissecção vascular')
        }
      }
      if (v.obstrucao) {
        const segMap: Record<string, string> = { origem: 'desde sua origem', medio: 'desde seu segmento médio', distal: 'desde seu segmento distal' }
        vp.push(`Sinais de obstrução do fluxo arterial ${segMap[v.obstrucaoSeg] || ''}`)
      }
      if (v.displasia) vp.push('Irregularidades sucessivas nas paredes vasculares, com áreas de estenose e dilatação alternantes, por vezes em aspecto de "colar de contas", achado que pode representar displasia fibromuscular')
      if (v.comentario.trim()) vp.push(v.comentario.trim())
      if (vp.length > 0) p.push(`${vasoNome}: ${vp.join('. ')}.`)
    }

    // Variações da normalidade
    const varParts: string[] = []
    if (vertDom === 'dir') varParts.push('Dominância da artéria vertebral direita')
    else if (vertDom === 'esq') varParts.push('Dominância da artéria vertebral esquerda')
    if (circFetal === 'dir') varParts.push('Circulação fetal à direita')
    else if (circFetal === 'esq') varParts.push('Circulação fetal à esquerda')
    else if (circFetal === 'bilat') varParts.push('Circulação fetal bilateral')
    if (a1Hipoplasia === 'dir') varParts.push('Hipoplasia do segmento A1 à direita')
    else if (a1Hipoplasia === 'esq') varParts.push('Hipoplasia do segmento A1 à esquerda')
    if (fenestBasilar) varParts.push('Fenestração da artéria basilar')
    if (artTrigeminal) varParts.push('Artéria trigeminal persistente')
    if (azigus) varParts.push('Artéria cerebral anterior ázigos')
    if (varParts.length > 0) p.push(varParts.join('. ') + ' (variação da normalidade).')

    return p.join('\n')
  }

  // ── Angio venosa text ──
  function gerarTextoAngioVenosa(): string {
    if (!angioVen) return ''
    const p: string[] = []
    if (venNormal) p.push('Seios venosos intracranianos pérvios, de calibre e sinal normais.')
    if (venAssimTransvDir) p.push('Assimetria dos seios transversos e sigmoides, com dominância à direita.')
    if (venAssimTransvEsq) p.push('Assimetria dos seios transversos e sigmoides, com dominância à esquerda.')
    if (venTrombose) {
      let s = 'Sinais de trombose venosa'
      if (venTromboseLocal.trim()) s += ` ${venTromboseLocal.trim()}`
      p.push(s + '.')
    }
    if (venComentario.trim()) p.push(venComentario.trim())
    return p.join('\n')
  }

  // ══════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════
  // CONCLUSÃO
  // ══════════════════════════════════════════════════════════

  const textoConclusao = useMemo(() => {
    const conc: string[] = []
    const isRM = exame === 'rm'

    // Normal cranio
    if (temCranio && !hasCranioSelections) {
      conc.push(isRM ? 'Exame do encéfalo dentro dos limites da normalidade.' : 'Exame do encéfalo dentro dos limites da normalidade.')
    } else if (temCranio) {
      // Hemorragia
      if (hipHem) {
        const localMap: Record<string, string> = {
          lobar_frontal: 'frontal', lobar_parietal: 'parietal', lobar_temporal: 'temporal', lobar_occipital: 'occipital',
          nucleocapsular: 'nucleocapsular', talamica: 'talâmica', cerebelar: 'cerebelar', pontina: 'pontina', mesencefalica: 'mesencefálica',
        }
        let s = 'Hemorragia intraparenquimatosa'
        if (hipHemLocal && localMap[hipHemLocal]) s += ` ${localMap[hipHemLocal]}`
        if (hipHemLado) s += ` à ${hipHemLado}`
        conc.push(s + '.')
      }
      if (hsa) conc.push('Hemorragia subaracnóidea.')
      if (subdural) {
        const faseStr = subduralFase === 'agudo' ? 'agudo' : subduralFase === 'subagudo' ? 'subagudo' : subduralFase === 'cronico' ? 'crônico' : ''
        conc.push(`Hematoma subdural ${faseStr}${subduralLado === 'bilateral' ? ' bilateral' : subduralLado ? ` à ${subduralLado}` : ''}.`)
      }
      if (epidural) conc.push(`Hematoma epidural${epiduralLado ? ` à ${epiduralLado}` : ''}.`)
      if (hiv) conc.push('Hemorragia intraventricular.')

      // AVC
      if (avcAgudo) {
        const terrMap: Record<string, string> = { acm: 'no território da ACM', aca: 'no território da ACA', acp: 'no território da ACP', vb: 'vertebrobasilar', lacunar: 'lacunar' }
        conc.push(`Isquemia aguda ${terrMap[avcTerritorio] || ''}${avcLado ? ` à ${avcLado}` : ''}.`)
      }
      if (sequelaIsq) conc.push(`Sequela isquêmica${sequelaLado === 'bilateral' ? ' bilateral' : sequelaLado ? ` à ${sequelaLado}` : ''}.`)
      if (avcTransfHem) conc.push('Transformação hemorrágica.')

      // Lesão expansiva
      if (lesaoExp) {
        let s = `Lesão expansiva ${lesaoExpTipo === 'intra' ? 'intra-axial' : lesaoExpTipo === 'extra' ? 'extra-axial' : ''}`
        if (lesaoExpLado === 'mediana') s += ' mediana'
        else if (lesaoExpLado) s += ` à ${lesaoExpLado}`
        if (lesaoExpDim) s += ` (${lesaoExpDim})`
        conc.push(s + ' (a investigar / correlacionar com dados clínicos).')
      }

      // Linha média
      if (desvioLM) conc.push(`Desvio da linha média para a ${desvioLM}${desvioLMmm ? ` (${desvioLMmm} mm)` : ''}.`)
      if (hernSubfalc || hernTranstent || hernTonsilar) {
        const h: string[] = []
        if (hernSubfalc) h.push('subfalcina')
        if (hernTranstent) h.push(`transtentorial ${hernTranstent === 'desc' ? 'descendente' : 'ascendente'}`)
        if (hernTonsilar) h.push('tonsilar')
        conc.push(`Herniação ${h.join(', ')}.`)
      }

      // Realce
      if (realceMeningeo === 'paquimeningeo') conc.push('Realce paquimeníngeo.')
      else if (realceMeningeo === 'leptomeningeo') conc.push('Realce leptomeníngeo.')

      // Atrofia / HPN
      if (atrofia) conc.push('Sinais de redução volumétrica encefálica.')
      if (hpn) conc.push('Achados que podem ser observados nos distúrbios da dinâmica do fluxo liquórico (hidrocefalia de pressão normal), em contexto clínico compatível.')

      // Substância branca
      if (sbMode === 'pronto' && sbPronto) {
        if (sbPronto === 'tenues' || sbPronto === 'discretas_perivent') {
          conc.push('Focos de alteração de sinal na substância branca, inespecíficos, podendo estar relacionados a microangiopatia / gliose.')
        } else if (sbPronto === 'confluentes' || sbPronto === 'extensas') {
          conc.push('Alterações de sinal na substância branca dos hemisférios cerebrais, de aspecto inespecífico, com distribuição sugestiva de doença de pequenos vasos / microangiopatia.')
        } else if (sbPronto === 'inespecificas') {
          conc.push('Focos de alteração de sinal na substância branca, inespecíficos, frequentemente relacionados a gliose/rarefação de mielina.')
        }
      } else if (sbMode === 'construir' && (sbConfluentes || sbDifusas || sbCornAnt || sbAtrios || sbCentrosSO || sbEsparsas || sbCorRad || sbSubcort || sbMaisRaras || sbRegFP || sbSubins)) {
        conc.push('Alterações de sinal na substância branca, inespecíficas, podendo estar relacionadas a microangiopatia / gliose.')
      }

      // Lacunas/EPVA
      if (epvaQtd) conc.push('Espaços perivasculares proeminentes.')
      if (lacunas) conc.push('Lacunas isquêmicas.')

      // Hipocampos
      if (hipocampos === 'alt_bilat') conc.push('Sinais de esclerose hipocampal bilateral (correlacionar com dados clínicos).')
      else if (hipocampos === 'alt_dir') conc.push('Sinais de esclerose hipocampal à direita (correlacionar com dados clínicos).')
      else if (hipocampos === 'alt_esq') conc.push('Sinais de esclerose hipocampal à esquerda (correlacionar com dados clínicos).')

      // Calcificações
      if (calcPalidais) conc.push('Calcificações palidais fisiológicas.')

      // Hiperostose
      if (hipFrontal || hipParietal) conc.push('Hiperostose benigna.')

      // Sela
      if (selaVazia) conc.push('Sela parcialmente vazia.')
      if (hicBenigna) conc.push('Achados que podem ser encontrados na hipertensão intracraniana benigna idiopática.')

      // SPN
      if (!spnNormal && Object.values(spn).some(s => Object.values(s.dir).some(Boolean) || Object.values(s.esq).some(Boolean))) {
        conc.push('Alterações inflamatórias/sinusopatia dos seios paranasais.')
      }

      // Cerebelo
      if (cerebelo && cerebelo.startsWith('seq')) conc.push('Pequena(s) sequela(s) isquêmica(s) cerebelar(es).')

      // If has selections but nothing generated a conclusion yet
      if (conc.length === 0) {
        conc.push('Demais achados conforme descritos.')
      }
    }

    // Angio arterial
    if (temAngioArterial) {
      if (angioGeral === 'normal' && vasos.length === 0) {
        const reg = angioCervical && angioIntra ? 'cervicais e intracranianos' : angioCervical ? 'cervicais' : 'intracranianos'
        conc.push(`Estudo angiográfico dos vasos ${reg} dentro dos limites da normalidade.`)
      } else {
        // Check for specific vaso findings
        const temAneurisma = vasos.some(v => v.aneurisma)
        const temEstenose = vasos.some(v => (v.placa1Estenose && v.placa1Estenose !== 'sem') || (v.placa2Estenose && v.placa2Estenose !== 'sem'))
        const temDisseccao = vasos.some(v => v.disseccao)
        const temObstrucao = vasos.some(v => v.obstrucao)

        if (temAneurisma) {
          const aneurismas = vasos.filter(v => v.aneurisma)
          for (const a of aneurismas) {
            const nome = a.vaso + (a.lado ? ` ${a.lado}` : '')
            const tipo = a.aneurisma === 'sacular' ? 'sacular' : 'fusiforme'
            let desc = `Dilatação aneurismática ${tipo} da ${nome}`
            if (a.aneurismaDiam) desc += ` (${a.aneurismaDiam} cm)`
            conc.push(desc + '.')
          }
        }
        if (temEstenose) conc.push('Estenose(s) vascular(es) conforme descrito(s).')
        if (temDisseccao) conc.push('Sinais de dissecção vascular conforme descrito.')
        if (temObstrucao) conc.push('Obstrução vascular conforme descrito.')

        if (angioGeral === 'leve_tort' || angioGeral === 'tortuoso' || angioGeral === 'esp_par') {
          conc.push('Sinais de ateromatose / alongamento e tortuosidade vascular.')
        }
      }

      // Variações
      const vars: string[] = []
      if (vertDom) vars.push(`dominância vertebral à ${vertDom === 'dir' ? 'direita' : 'esquerda'}`)
      if (circFetal) vars.push(`circulação fetal ${circFetal === 'bilat' ? 'bilateral' : `à ${circFetal === 'dir' ? 'direita' : 'esquerda'}`}`)
      if (a1Hipoplasia) vars.push(`hipoplasia do segmento A1 à ${a1Hipoplasia === 'dir' ? 'direita' : 'esquerda'}`)
      if (fenestBasilar) vars.push('fenestração basilar')
      if (artTrigeminal) vars.push('artéria trigeminal persistente')
      if (azigus) vars.push('ACA ázigos')
      if (vars.length > 0) conc.push(`Variações da normalidade: ${vars.join(', ')}.`)
    }

    // Angio venosa
    if (angioVen) {
      if (venNormal && !venTrombose) {
        conc.push('Seios venosos intracranianos pérvios.')
      }
      if (venTrombose) conc.push('Sinais de trombose venosa intracraniana.')
      if (venAssimTransvDir || venAssimTransvEsq) conc.push(`Assimetria dos seios transversos com dominância à ${venAssimTransvDir ? 'direita' : 'esquerda'} (variação da normalidade).`)
    }

    return conc.join('\n')
  }, [exame, temCranio, hasCranioSelections, hipHem, hipHemLocal, hipHemLado, hipHemFase, hipHemDim, hsa, subdural, subduralFase, subduralLado, subduralEsp, epidural, epiduralLado, hiv, avcAgudo, avcTerritorio, avcLado, avcTransfHem, sequelaIsq, sequelaLado, lesaoExp, lesaoExpTipo, lesaoExpLado, lesaoExpDim, desvioLM, desvioLMmm, hernSubfalc, hernTranstent, hernTonsilar, realceMeningeo, atrofia, hpn, sbMode, sbPronto, sbConfluentes, sbDifusas, sbCornAnt, sbAtrios, sbCentrosSO, sbEsparsas, sbCorRad, sbSubcort, sbMaisRaras, sbRegFP, sbSubins, epvaQtd, lacunas, hipocampos, calcPalidais, hipFrontal, hipParietal, selaVazia, hicBenigna, spnNormal, spn, cerebelo, temAngioArterial, angioGeral, vasos, angioCervical, angioIntra, vertDom, circFetal, a1Hipoplasia, fenestBasilar, artTrigeminal, azigus, angioVen, venNormal, venTrombose, venAssimTransvDir, venAssimTransvEsq])

  // Copy functions — rich HTML for Word/Docs compatibility
  // ══════════════════════════════════════════════════════════

  const laudoRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState('')

  const copyRich = useCallback(async (text: string, label: string) => {
    // Build styled HTML for Word/Google Docs
    const lines = text.split('\n')
    const htmlLines = lines.map(l => {
      if (!l.trim()) return '<br>'
      // Detect section headers (all caps lines)
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

  const fullText = `${titulo}\n\nTÉCNICA:\n${textoTecnica}\n\nACHADOS:\n${textoAchados}\n\nCONCLUSÃO:\n${textoConclusao}`

  // ══════════════════════════════════════════════════════════
  // Vaso & SPN management
  // ══════════════════════════════════════════════════════════

  const addVaso = () => setVasos(p => [...p, emptyVaso()])
  const removeVaso = (i: number) => setVasos(p => p.filter((_, j) => j !== i))
  const updateVaso = (i: number, updates: Partial<VasoState>) => setVasos(p => p.map((v, j) => j === i ? { ...v, ...updates } : v))

  const updateSPN = (seioId: string, lado: 'dir' | 'esq', key: keyof SPNSide, val: boolean) => {
    setSpn(prev => ({
      ...prev,
      [seioId]: {
        ...prev[seioId as keyof typeof prev],
        [lado]: { ...prev[seioId as keyof typeof prev][lado], [key]: val },
      },
    }))
  }

  // Available vasos based on exam type
  const vasosDisponiveis = useMemo(() => {
    if (angioCervical && angioIntra) return [...VASOS_CERVICAIS, ...VASOS_INTRACRANIANOS]
    if (angioCervical) return VASOS_CERVICAIS
    return VASOS_INTRACRANIANOS
  }, [angioCervical, angioIntra])

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════

  return (
    <CalculatorLayout title="Gerador de Laudo Neuro" subtitle="TC e RM de crânio, angio cervical/intracraniana/venosa">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,440px] gap-6 items-start">
        {/* LEFT — Input sections */}
        <div className="space-y-2">

          {/* Exame e Técnica — now with checkboxes for combined exams */}
          <Card id="tecnica" activeCard={activeCard} setActiveCard={setActiveCard} title="Exame e Técnica">
            <div className="space-y-3">
              <Radio value={exame} onChange={setExame} label="Modalidade"
                options={[{ v: 'tc', l: 'TC' }, { v: 'rm', l: 'RM' }]} />
              <Radio value={contraste} onChange={setContraste} label="Contraste"
                options={[{ v: 'sem', l: 'Sem contraste' }, { v: 'ev', l: 'EV' }, { v: 'dinamico', l: 'Dinâmico' }]} />
              <div>
                <span className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text3)' }}>Componentes do exame</span>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <Chk checked={temCranio} onChange={setTemCranio} label="Crânio" />
                  <Chk checked={angioCervical} onChange={setAngioCervical} label="Angio cervical" />
                  <Chk checked={angioIntra} onChange={setAngioIntra} label="Angio intracraniana" />
                  <Chk checked={angioVen} onChange={setAngioVen} label="Angio venosa" />
                </div>
              </div>
              <div className="rounded-lg p-2 text-[10px] leading-tight" style={{ backgroundColor: 'var(--surface2)', color: 'var(--text3)' }}>
                Marque todos os componentes do exame. Ex: TC Crânio + Angio cervical + Angio intracraniana + Angio venosa.
              </div>
            </div>
          </Card>

          {/* ── CRÂNIO SECTIONS ── */}
          {temCranio && <>
            {/* Artefatos */}
            <Card id="artefatos" activeCard={activeCard} setActiveCard={setActiveCard} title="Artefatos">
              <Chk checked={artMovimento} onChange={setArtMovimento} label="Artefatos de movimento" />
              <Chk checked={artSuscep} onChange={setArtSuscep} label="Susceptibilidade magnética (arcadas dentárias)" />
              <div className="mt-2">
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text3)' }}>Comentário:</span>
                <Txt value={comentario1} onChange={setComentario1} placeholder="Texto livre..." />
              </div>
            </Card>

            <GroupHeader label="Achados Agudos / Lesões" color="var(--red)" />

            {/* Hemorragia */}
            <Card id="hemorragia" activeCard={activeCard} setActiveCard={setActiveCard} title="Hemorragia"
              badge={hipHem || hsa || subdural || epidural || hiv ? 'ATIVO' : undefined}>
              <div className="space-y-3">
                {/* HIP */}
                <div className="space-y-1">
                  <Chk checked={hipHem} onChange={setHipHem} label="Hemorragia intraparenquimatosa (HIP)" />
                  {hipHem && <div className="pl-4 space-y-1">
                    <Radio value={hipHemFase} onChange={setHipHemFase} label="Fase"
                      options={[{ v: '' as any, l: '—' }, { v: 'aguda', l: 'Aguda' }, { v: 'subaguda', l: 'Subaguda' }]} />
                    <Radio value={hipHemLocal} onChange={setHipHemLocal} label="Localização"
                      options={[{ v: '' as any, l: '—' }, { v: 'lobar_frontal', l: 'Frontal' }, { v: 'lobar_parietal', l: 'Parietal' }, { v: 'lobar_temporal', l: 'Temporal' }]} />
                    <Radio value={hipHemLocal} onChange={setHipHemLocal}
                      options={[{ v: 'lobar_occipital', l: 'Occipital' }, { v: 'nucleocapsular', l: 'Nucleocaps.' }, { v: 'talamica', l: 'Talâmica' }, { v: 'cerebelar', l: 'Cerebelar' }]} />
                    <Radio value={hipHemLocal} onChange={setHipHemLocal}
                      options={[{ v: 'pontina', l: 'Pontina' }, { v: 'mesencefalica', l: 'Mesencefálica' }]} />
                    <Radio value={hipHemLado} onChange={setHipHemLado} label="Lado"
                      options={[{ v: '' as any, l: '—' }, { v: 'direita', l: 'D' }, { v: 'esquerda', l: 'E' }]} />
                    <Txt value={hipHemDim} onChange={setHipHemDim} placeholder="Dimensões (ex: 3,0 x 2,5 x 2,0 cm)" />
                    <Chk checked={hipHemEdema} onChange={setHipHemEdema} label="Edema perilesional" />
                    <Chk checked={hipHemEfeitoMassa} onChange={setHipHemEfeitoMassa} label="Efeito de massa" />
                    <Chk checked={hipHemInundacao} onChange={setHipHemInundacao} label="Inundação ventricular" />
                    <Chk checked={hipHemNivel} onChange={setHipHemNivel} label="Nível hematócrito ventricular" />
                  </div>}
                </div>

                {/* HSA */}
                <div className="space-y-1">
                  <Chk checked={hsa} onChange={setHsa} label="Hemorragia subaracnóidea (HSA)" />
                  {hsa && <div className="pl-4 space-y-1">
                    <div className="flex flex-wrap gap-3">
                      <Chk checked={hsaSulcos} onChange={setHsaSulcos} label="Sulcos convexidades" />
                      <Chk checked={hsaCisternas} onChange={setHsaCisternas} label="Cisternas da base" />
                      <Chk checked={hsaSylviana} onChange={setHsaSylviana} label="Fissuras sylvianas" />
                    </div>
                    <Radio value={hsaFisher} onChange={setHsaFisher} label="Fisher"
                      options={[{ v: '' as any, l: '—' }, { v: 'I', l: 'I' }, { v: 'II', l: 'II' }, { v: 'III', l: 'III' }]} />
                  </div>}
                </div>

                {/* Subdural */}
                <div className="space-y-1">
                  <Chk checked={subdural} onChange={setSubdural} label="Hematoma subdural" />
                  {subdural && <div className="pl-4 space-y-1">
                    <Radio value={subduralFase} onChange={setSubduralFase} label="Fase"
                      options={[{ v: '' as any, l: '—' }, { v: 'agudo', l: 'Agudo' }, { v: 'subagudo', l: 'Subagudo' }, { v: 'cronico', l: 'Crônico' }]} />
                    <Radio value={subduralLado} onChange={setSubduralLado} label="Lado"
                      options={[{ v: '' as any, l: '—' }, { v: 'direita', l: 'D' }, { v: 'esquerda', l: 'E' }, { v: 'bilateral', l: 'Bilateral' }]} />
                    <Txt value={subduralEsp} onChange={setSubduralEsp} placeholder="Espessura máxima (mm)" />
                    <Chk checked={subduralMembrana} onChange={setSubduralMembrana} label="Membranas internas (cronicidade)" />
                  </div>}
                </div>

                {/* Epidural */}
                <div className="space-y-1">
                  <Chk checked={epidural} onChange={setEpidural} label="Hematoma epidural" />
                  {epidural && <div className="pl-4 space-y-1">
                    <Radio value={epiduralLocal} onChange={setEpiduralLocal} label="Localização"
                      options={[{ v: '' as any, l: '—' }, { v: 'frontal', l: 'Frontal' }, { v: 'temporal', l: 'Temporal' }, { v: 'parietal', l: 'Parietal' }]} />
                    <Radio value={epiduralLocal} onChange={setEpiduralLocal}
                      options={[{ v: 'occipital', l: 'Occipital' }, { v: 'fossa_post', l: 'Fossa posterior' }]} />
                    <Radio value={epiduralLado} onChange={setEpiduralLado} label="Lado"
                      options={[{ v: '' as any, l: '—' }, { v: 'direita', l: 'D' }, { v: 'esquerda', l: 'E' }]} />
                    <Txt value={epiduralEsp} onChange={setEpiduralEsp} placeholder="Espessura máxima (mm)" />
                  </div>}
                </div>

                <Chk checked={hiv} onChange={setHiv} label="Hemorragia intraventricular" />
                <Txt value={hemComentario} onChange={setHemComentario} placeholder="Comentário hemorragia..." />
              </div>
            </Card>

            {/* AVC Isquêmico */}
            <Card id="avc" activeCard={activeCard} setActiveCard={setActiveCard} title="AVC Isquêmico"
              badge={avcAgudo || sequelaIsq ? 'ATIVO' : undefined}>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Chk checked={avcAgudo} onChange={setAvcAgudo} label="Isquemia aguda" />
                  {avcAgudo && <div className="pl-4 space-y-1">
                    <Radio value={avcTerritorio} onChange={setAvcTerritorio} label="Território"
                      options={[{ v: '' as any, l: '—' }, { v: 'acm', l: 'ACM' }, { v: 'aca', l: 'ACA' }, { v: 'acp', l: 'ACP' }]} />
                    <Radio value={avcTerritorio} onChange={setAvcTerritorio}
                      options={[{ v: 'vb', l: 'Vertebrobasilar' }, { v: 'lacunar', l: 'Lacunar' }]} />
                    <Radio value={avcLado} onChange={setAvcLado} label="Lado"
                      options={[{ v: '' as any, l: '—' }, { v: 'direita', l: 'D' }, { v: 'esquerda', l: 'E' }]} />
                    {exame === 'rm' && <Chk checked={avcRestricao} onChange={setAvcRestricao} label="Restrição à difusão" />}
                    <Chk checked={avcTransfHem} onChange={setAvcTransfHem} label="Transformação hemorrágica" />
                    <Txt value={avcComentario} onChange={setAvcComentario} placeholder="Comentário AVC agudo..." />
                  </div>}
                </div>
                <div className="space-y-1">
                  <Chk checked={sequelaIsq} onChange={setSequelaIsq} label="Sequela isquêmica" />
                  {sequelaIsq && <div className="pl-4 space-y-1">
                    <Radio value={sequelaLocal} onChange={setSequelaLocal} label="Localização"
                      options={[{ v: '' as any, l: '—' }, { v: 'frontal', l: 'Frontal' }, { v: 'parietal', l: 'Parietal' }, { v: 'temporal', l: 'Temporal' }]} />
                    <Radio value={sequelaLocal} onChange={setSequelaLocal}
                      options={[{ v: 'occipital', l: 'Occipital' }, { v: 'nucleocapsular', l: 'Nucleocaps.' }, { v: 'talamica', l: 'Talâmica' }, { v: 'cerebelar', l: 'Cerebelar' }]} />
                    <Radio value={sequelaLocal} onChange={setSequelaLocal}
                      options={[{ v: 'ponte', l: 'Ponte' }, { v: 'acm', l: 'Territ. ACM' }, { v: 'aca', l: 'Territ. ACA' }, { v: 'acp', l: 'Territ. ACP' }]} />
                    <Radio value={sequelaLado} onChange={setSequelaLado} label="Lado"
                      options={[{ v: '' as any, l: '—' }, { v: 'direita', l: 'D' }, { v: 'esquerda', l: 'E' }, { v: 'bilateral', l: 'Bilateral' }]} />
                  </div>}
                </div>
              </div>
            </Card>

            {/* Lesão Expansiva */}
            <Card id="lesaoexp" activeCard={activeCard} setActiveCard={setActiveCard} title="Lesão Expansiva"
              badge={lesaoExp ? 'ATIVO' : undefined}>
              <div className="space-y-2">
                <Chk checked={lesaoExp} onChange={setLesaoExp} label="Formação expansiva" />
                {lesaoExp && <>
                  <Radio value={lesaoExpTipo} onChange={setLesaoExpTipo} label="Tipo"
                    options={[{ v: '' as any, l: '—' }, { v: 'intra', l: 'Intra-axial' }, { v: 'extra', l: 'Extra-axial' }]} />
                  <Radio value={lesaoExpLocal} onChange={setLesaoExpLocal} label="Localização"
                    options={[{ v: '' as any, l: '—' }, { v: 'frontal', l: 'Frontal' }, { v: 'parietal', l: 'Parietal' }, { v: 'temporal', l: 'Temporal' }]} />
                  <Radio value={lesaoExpLocal} onChange={setLesaoExpLocal}
                    options={[{ v: 'occipital', l: 'Occipital' }, { v: 'fossa_post', l: 'Fossa post.' }, { v: 'selar', l: 'Selar' }, { v: 'apc', l: 'APC' }]} />
                  <Radio value={lesaoExpLocal} onChange={setLesaoExpLocal}
                    options={[{ v: 'pineal', l: 'Pineal' }, { v: 'ventricular', l: 'Ventricular' }, { v: 'meninges', l: 'Meninges' }]} />
                  <Radio value={lesaoExpLado} onChange={setLesaoExpLado} label="Lado"
                    options={[{ v: '' as any, l: '—' }, { v: 'direita', l: 'D' }, { v: 'esquerda', l: 'E' }, { v: 'mediana', l: 'Mediana' }]} />
                  <Txt value={lesaoExpDim} onChange={setLesaoExpDim} placeholder="Dimensões (ex: 3,0 x 2,5 x 2,0 cm)" />
                  {contraste !== 'sem' && <Radio value={lesaoExpRealce} onChange={setLesaoExpRealce} label="Realce"
                    options={[{ v: '' as any, l: '—' }, { v: 'homogeneo', l: 'Homogêneo' }, { v: 'heterogeneo', l: 'Heterogêneo' }, { v: 'anelar', l: 'Anelar' }]} />}
                  {exame === 'rm' && <Chk checked={lesaoExpRestricao} onChange={setLesaoExpRestricao} label="Restrição à difusão" />}
                  <Chk checked={lesaoExpEdema} onChange={setLesaoExpEdema} label="Edema perilesional" />
                  <Chk checked={lesaoExpEfeitoMassa} onChange={setLesaoExpEfeitoMassa} label="Efeito de massa" />
                  <Txt value={lesaoExpComentario} onChange={setLesaoExpComentario} placeholder="Comentário lesão..." rows={2} />
                </>}
              </div>
            </Card>

            {/* Linha Média / Efeito de Massa */}
            <Card id="linhamedia" activeCard={activeCard} setActiveCard={setActiveCard} title="Linha Média / Efeito de Massa"
              badge={desvioLM || hernSubfalc || hernTranstent || hernTonsilar ? 'ATIVO' : undefined}>
              <div className="space-y-2">
                <Radio value={desvioLM} onChange={setDesvioLM} label="Desvio da linha média"
                  options={[{ v: '' as any, l: 'Sem' }, { v: 'direita', l: 'Para D' }, { v: 'esquerda', l: 'Para E' }]} />
                {desvioLM && <Txt value={desvioLMmm} onChange={setDesvioLMmm} placeholder="Medida (mm)" />}
                <Chk checked={hernSubfalc} onChange={setHernSubfalc} label="Herniação subfalcina" />
                <Radio value={hernTranstent} onChange={v => setHernTranstent(v)} label="Herniação transtentorial"
                  options={[{ v: '' as any, l: 'Sem' }, { v: 'desc', l: 'Descendente' }, { v: 'asc', l: 'Ascendente' }]} />
                <Chk checked={hernTonsilar} onChange={setHernTonsilar} label="Herniação tonsilar" />
                <Chk checked={apagCisternas} onChange={setApagCisternas} label="Apagamento cisternas da base" />
              </div>
            </Card>

            {/* Realce pós-contraste */}
            {contraste !== 'sem' && (
              <Card id="realce" activeCard={activeCard} setActiveCard={setActiveCard} title="Realce Pós-Contraste">
                <div className="space-y-2">
                  <Radio value={realceMeningeo} onChange={setRealceMeningeo} label="Realce meníngeo"
                    options={[{ v: '' as any, l: 'Sem' }, { v: 'paquimeningeo', l: 'Paquimeníngeo' }, { v: 'leptomeningeo', l: 'Leptomeníngeo' }]} />
                  <Txt value={realceComentario} onChange={setRealceComentario} placeholder="Outros achados de realce (texto livre)..." rows={2} />
                </div>
              </Card>
            )}

            <GroupHeader label="Parênquima" />

            {/* Espaços liquóricos */}
            <Card id="liquoricos" activeCard={activeCard} setActiveCard={setActiveCard} title="Espaços Liquóricos">
              <div className="space-y-2">
                <div className="rounded-lg p-2 text-[10px]" style={{ backgroundColor: 'var(--accent)0D', color: 'var(--accent)' }}>
                  Se nada for marcado, o laudo virá com máscara normal.
                </div>
                <Radio value={sulcos} onChange={setSulcos} label="Sulcos"
                  options={[{ v: '' as any, l: 'Normal' }, { v: 'amplos_fp', l: 'Amplos FP' }, { v: 'amplos_fissuras', l: 'Amplos + fissuras' }]} />
                <Radio value={ventriculos} onChange={setVentriculos} label="Ventrículos"
                  options={[{ v: '' as any, l: 'Normal' }, { v: 'discreto', l: 'Discreto aumento' }, { v: 'dilatados', l: 'Dilatados' }]} />
                <Chk checked={fossaPost} onChange={setFossaPost} label="Cisternas da base e sulcos cerebelares amplos" />
                <Chk checked={atrofia} onChange={setAtrofia} label="Sinais de redução volumétrica (atrofia)" />
                <Chk checked={hpn} onChange={setHpn} label="HPN (hidrocefalia pressão normal)" />
                <Radio value={assimVL} onChange={setAssimVL} label="Assimetria VL"
                  options={[{ v: '' as any, l: 'Sem' }, { v: 'direita', l: 'Maior à D' }, { v: 'esquerda', l: 'Maior à E' }]} />
                <div className="flex flex-wrap gap-3">
                  <Chk checked={coaptDir} onChange={setCoaptDir} label="Coaptação VL direito" />
                  <Chk checked={coaptEsq} onChange={setCoaptEsq} label="Coaptação VL esquerdo" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Chk checked={cavoPelucido} onChange={setCavoPelucido} label="Cavo septo pelúcido" />
                  <Chk checked={cavoVerga} onChange={setCavoVerga} label="Cavo de Verga" />
                  <Chk checked={cavoVeu} onChange={setCavoVeu} label="Cavo véu interposto" />
                </div>
                <Chk checked={cistoAracnoide} onChange={setCistoAracnoide} label="Megacisterna magna / cisto aracnoide" />
                <Chk checked={demaisSulcosNorm} onChange={setDemaisSulcosNorm} label="Demais sulcos normais" />
                <Chk checked={restanteSVNorm} onChange={setRestanteSVNorm} label="Restante do SV normal" />
              </div>
            </Card>

            {/* Substância branca */}
            <Card id="sb" activeCard={activeCard} setActiveCard={setActiveCard} title="Substância Branca">
              <div className="space-y-2">
                <Radio value={sbMode} onChange={setSbMode} label="Modo"
                  options={[{ v: 'pronto', l: 'Frases prontas' }, { v: 'construir', l: 'Construir frase' }]} />
                {sbMode === 'pronto' && (
                  <div className="space-y-1">
                    {[
                      { v: 'tenues', l: 'Tênues (cornos anteriores)' },
                      { v: 'discretas_perivent', l: 'Discretas periventriculares' },
                      { v: 'confluentes', l: 'Confluentes' },
                      { v: 'extensas', l: 'Extensas' },
                      { v: 'inespecificas', l: 'Inespecíficas' },
                    ].map(o => (
                      <Chk key={o.v} checked={sbPronto === o.v} onChange={checked => setSbPronto(checked ? o.v : '')} label={o.l} />
                    ))}
                  </div>
                )}
                {sbMode === 'construir' && (
                  <div className="space-y-1">
                    <Radio value={sbIntensidade} onChange={setSbIntensidade} label="Intensidade"
                      options={[{ v: '' as any, l: 'Padrão' }, { v: 'discretas', l: 'Discretas' }, { v: 'extensas', l: 'Extensas' }]} />
                    <Chk checked={sbConfluentes} onChange={setSbConfluentes} label="Confluentes" />
                    <Chk checked={sbCornAnt} onChange={setSbCornAnt} label="Cornos anteriores" />
                    <Chk checked={sbAtrios} onChange={setSbAtrios} label="Átrios" />
                    <Chk checked={sbCentrosSO} onChange={setSbCentrosSO} label="Centros semi-ovais" />
                    <Chk checked={sbDifusas} onChange={setSbDifusas} label="Difusas" />
                    <Chk checked={sbEsparsas} onChange={setSbEsparsas} label="Esparsas" />
                    <Chk checked={sbCorRad} onChange={setSbCorRad} label="Coroas radiadas" />
                    <Chk checked={sbSubcort} onChange={setSbSubcort} label="Subcortical" />
                    <Chk checked={sbMaisRaras} onChange={setSbMaisRaras} label="Mais raras" />
                    <Chk checked={sbRegFP} onChange={setSbRegFP} label="Regiões frontoparietais subcorticais" />
                    <Chk checked={sbSubins} onChange={setSbSubins} label="Regiões subinsulares" />
                  </div>
                )}
              </div>
            </Card>

            {/* Comentário 2 */}
            <Card id="comentario2" activeCard={activeCard} setActiveCard={setActiveCard} title="Comentário Adicional">
              <Txt value={comentario2} onChange={setComentario2} placeholder="Texto livre entre SB e EPVA..." rows={2} />
            </Card>

            {/* Lacunas / EPVA */}
            <Card id="epva" activeCard={activeCard} setActiveCard={setActiveCard} title="Lacunas / Espaços Perivasculares">
              <div className="space-y-2">
                <Radio value={epvaQtd} onChange={setEpvaQtd} label="Quantidade"
                  options={[{ v: '' as any, l: 'Sem' }, { v: 'focos', l: 'Focos' }, { v: 'alguns', l: 'Alguns' }, { v: 'multiplos', l: 'Múltiplos' }]} />
                {epvaQtd && (
                  <div className="grid grid-cols-2 gap-x-4">
                    <Chk checked={epvaCentrosSO} onChange={setEpvaCentrosSO} label="Centros semi-ovais" />
                    <Chk checked={epvaNLent} onChange={setEpvaNLent} label="Núcleos lentiformes" />
                    <Chk checked={epvaCauD} onChange={setEpvaCauD} label="Caudado D" />
                    <Chk checked={epvaCauE} onChange={setEpvaCauE} label="Caudado E" />
                    <Chk checked={epvaCapIntD} onChange={setEpvaCapIntD} label="Cáps. interna D" />
                    <Chk checked={epvaCapIntE} onChange={setEpvaCapIntE} label="Cáps. interna E" />
                    <Chk checked={epvaTalD} onChange={setEpvaTalD} label="Tálamo D" />
                    <Chk checked={epvaTalE} onChange={setEpvaTalE} label="Tálamo E" />
                    <Chk checked={epvaInfPut} onChange={setEpvaInfPut} label="Infraputaminais" />
                    <Chk checked={epvaSubins} onChange={setEpvaSubins} label="Subinsulares" />
                    <Chk checked={epvaMesenc} onChange={setEpvaMesenc} label="Mesencéfalo" />
                    <Chk checked={epvaPont} onChange={setEpvaPont} label="Ponte" />
                  </div>
                )}
                <Chk checked={lacunas} onChange={setLacunas} label="Lacunas" />
              </div>
            </Card>

            {/* Cerebelo */}
            <Card id="cerebelo" activeCard={activeCard} setActiveCard={setActiveCard} title="Cerebelo">
              <div className="space-y-1">
                {[
                  { v: 'seq_dir', l: 'Sequela / fissura alargada — hemisfério D' },
                  { v: 'seq_esq', l: 'Sequela / fissura alargada — hemisfério E' },
                  { v: 'seq_bilat', l: 'Sequelas bilaterais' },
                  { v: 'faixa_dir', l: 'Faixa alongada — hemisfério D' },
                  { v: 'faixa_esq', l: 'Faixa alongada — hemisfério E' },
                  { v: 'faixas_bilat', l: 'Faixas bilaterais' },
                ].map(o => (
                  <Chk key={o.v} checked={cerebelo === o.v} onChange={c => setCerebelo(c ? o.v : '')} label={o.l} />
                ))}
              </div>
            </Card>

            {/* Hipocampos */}
            <Card id="hipocampos" activeCard={activeCard} setActiveCard={setActiveCard} title="Hipocampos">
              <div className="space-y-1">
                {[
                  { v: 'normais', l: 'Normais' },
                  { v: 'red_prop', l: 'Reduzidos proporcionalmente' },
                  { v: 'alt_bilat', l: 'Alterados bilateral' },
                  { v: 'alt_dir', l: 'Alterado à direita' },
                  { v: 'alt_esq', l: 'Alterado à esquerda' },
                  { v: 'ehm_bilat', l: 'EHM bilateral (variante)' },
                  { v: 'ehm_dir', l: 'EHM à direita (variante)' },
                  { v: 'ehm_esq', l: 'EHM à esquerda (variante)' },
                ].map(o => (
                  <Chk key={o.v} checked={hipocampos === o.v} onChange={c => setHipocampos(c ? o.v : '')} label={o.l} />
                ))}
              </div>
            </Card>

            {/* Parênquima / Difusão + Comentário 3 */}
            <Card id="parenquima" activeCard={activeCard} setActiveCard={setActiveCard} title="Parênquima / Difusão">
              <Txt value={comentario3} onChange={setComentario3} placeholder="Comentário livre..." rows={2} />
            </Card>

            {/* Calcificações */}
            <Card id="calcif" activeCard={activeCard} setActiveCard={setActiveCard} title="Calcificações">
              <Chk checked={calcPalidais} onChange={setCalcPalidais} label="Calcificações palidais (habitual na faixa etária)" />
              {exame === 'rm' && <Chk checked={sbstParamag} onChange={setSbstParamag} label="Hipossinal SWI nos lentiformes (depósito minerais)" />}
            </Card>

            <GroupHeader label="Estruturas" />

            {/* Hiperostose */}
            <Card id="hiperostose" activeCard={activeCard} setActiveCard={setActiveCard} title="Hiperostose">
              <Chk checked={hipFrontal} onChange={setHipFrontal} label="Frontal" />
              <Chk checked={hipParietal} onChange={setHipParietal} label="Parietal" />
            </Card>

            {/* Sela túrcica */}
            <Card id="sela" activeCard={activeCard} setActiveCard={setActiveCard} title="Sela Túrcica / HIC">
              <div className="space-y-1">
                <Chk checked={selaVazia} onChange={setSelaVazia} label="Sela parcialmente vazia" />
                {selaVazia && <Chk checked={selaPacIdoso} onChange={setSelaPacIdoso} label="Achado frequente na faixa etária" indent={1} />}
                <Chk checked={nervosOpt} onChange={setNervosOpt} label="Ingurgitamento bainhas dos nervos ópticos" />
                <Chk checked={seiosVenAfilados} onChange={setSeiosVenAfilados} label="Seios venosos afilados" />
                <Chk checked={cavosMeckel} onChange={setCavosMeckel} label="Cavos de Meckel amplos" />
                <Chk checked={iiiVentrFenda} onChange={setIiiVentrFenda} label="III ventrículo em fenda" />
                <Chk checked={hicBenigna} onChange={setHicBenigna} label="Achados podem ser encontrados na HIC benigna idiopática" />
              </div>
            </Card>

            {/* Ossos */}
            <Card id="ossos" activeCard={activeCard} setActiveCard={setActiveCard} title="Ossos da Calota">
              <Txt value={lesaoOssea} onChange={setLesaoOssea} placeholder="Lesão óssea (texto livre)..." />
            </Card>

            {/* SPN */}
            <Card id="spn" activeCard={activeCard} setActiveCard={setActiveCard} title="Seios Paranasais">
              <div className="space-y-3">
                <Chk checked={spnNormal} onChange={setSpnNormal} label="Normal (aeração preservada)" />
                {!spnNormal && SEIOS.map(seio => (
                  <div key={seio.id} className="rounded-lg border p-2" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-[11px] font-bold block mb-1" style={{ color: 'var(--text2)' }}>{seio.label}</span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                      <span className="text-[9px] font-bold uppercase" style={{ color: 'var(--text3)' }}>Direita</span>
                      <span className="text-[9px] font-bold uppercase" style={{ color: 'var(--text3)' }}>Esquerda</span>
                      {([
                        ['espessamento', 'Espessamento mucoso'],
                        ['espessamentoDiscreto', 'Espessamento discreto'],
                        ['contornosLob', 'Contornos lobulados'],
                        ['paredesEsp', 'Paredes espessadas'],
                        ['calcMucosas', 'Calcificações mucosas'],
                        ['secrecaoPeqQtd', 'Secreção peq. qtd.'],
                        ['secrecaoOblit', 'Secreção obliterante'],
                        ['nivelLiquido', 'Nível líquido'],
                        ['compHiperdenso', 'Comp. hiperdenso'],
                      ] as const).map(([key, label]) => (
                        <div key={key} className="contents">
                          <Chk checked={spn[seio.id as keyof typeof spn].dir[key]} onChange={v => updateSPN(seio.id, 'dir', key, v)} label={label} />
                          <Chk checked={spn[seio.id as keyof typeof spn].esq[key]} onChange={v => updateSPN(seio.id, 'esq', key, v)} label={label} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Mastoides */}
            <Card id="mastoides" activeCard={activeCard} setActiveCard={setActiveCard} title="Mastoides">
              <div className="space-y-1">
                <Chk checked={mastoidesNormal} onChange={setMastoidesNormal} label="Aeradas (normal)" />
                <Chk checked={mastHipopneuBilat} onChange={setMastHipopneuBilat} label="Hipopneumatizadas bilateral" />
                {!mastHipopneuBilat && <>
                  <Chk checked={mastHipopneuDir} onChange={setMastHipopneuDir} label="Hipopneu. direita" indent={1} />
                  <Chk checked={mastHipopneuEsq} onChange={setMastHipopneuEsq} label="Hipopneu. esquerda" indent={1} />
                </>}
                <Chk checked={mastEburneo} onChange={setMastEburneo} label="Aspecto ebúrneo" />
                <Chk checked={mastApiceDir} onChange={setMastApiceDir} label="Ápice hipopneu. direito" />
                <Chk checked={mastApiceEsq} onChange={setMastApiceEsq} label="Ápice hipopneu. esquerdo" />
                <Chk checked={mastOblit} onChange={setMastOblit} label="Obliteração por material partes moles" />
                <Chk checked={mastDelineamento} onChange={setMastDelineamento} label="Delineamento por material hidratado" />
                {mastDelineamento && <>
                  <Chk checked={mastDelineDir} onChange={setMastDelineDir} label="Direita" indent={1} />
                  <Chk checked={mastDelineEsq} onChange={setMastDelineEsq} label="Esquerda" indent={1} />
                  <Chk checked={mastNivelLiq} onChange={setMastNivelLiq} label="Com níveis líquidos" indent={1} />
                </>}
              </div>
            </Card>

            {/* Facectomia */}
            <Card id="adicionais" activeCard={activeCard} setActiveCard={setActiveCard} title="Achados Adicionais">
              <Radio value={facectomia} onChange={setFacectomia} label="Facectomia"
                options={[{ v: '' as any, l: 'Sem' }, { v: 'bilateral', l: 'Bilateral' }, { v: 'direita', l: 'Direita' }, { v: 'esquerda', l: 'Esquerda' }]} />
            </Card>
          </>}

          {/* ── ANGIO ── */}
          {(temAngioArterial || angioVen) && <GroupHeader label="Angiografia" color="var(--accent)" />}

          {temAngioArterial && (
            <Card id="angio" activeCard={activeCard} setActiveCard={setActiveCard} title={`Angio Arterial${angioCervical && angioIntra ? ' (Cervical + Intracraniana)' : angioCervical ? ' (Cervical)' : ' (Intracraniana)'}`}>
              <div className="space-y-3">
                <Radio value={angioGeral} onChange={setAngioGeral} label="Achado geral"
                  options={[
                    { v: '' as any, l: 'Descrever por vaso' },
                    { v: 'normal', l: 'Normal' },
                    { v: 'leve_tort', l: 'Leve tortuosidade' },
                    { v: 'tortuoso', l: 'Alongado e tortuoso' },
                    { v: 'esp_par', l: 'Tortuoso + espessamento' },
                  ]} />

                {vasos.map((v, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-2" style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--accent)08' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>Vaso {i + 1}</span>
                      <button type="button" onClick={() => removeVaso(i)} className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}>Remover</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-semibold" style={{ color: 'var(--text3)' }}>Vaso</span>
                        <select value={v.vaso} onChange={e => updateVaso(i, { vaso: e.target.value })}
                          className="w-full px-2 py-1 rounded text-[11px] border" style={{ backgroundColor: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                          <option value="">Selecione...</option>
                          {vasosDisponiveis.map(vn => (
                            <option key={vn} value={vn}>{vn}</option>
                          ))}
                        </select>
                      </div>
                      <Radio value={v.lado} onChange={l => updateVaso(i, { lado: l })} label="Lado"
                        options={[{ v: '' as any, l: '—' }, { v: 'direita', l: 'D' }, { v: 'esquerda', l: 'E' }]} />
                    </div>
                    <Radio value={v.trajeto} onChange={t => updateVaso(i, { trajeto: t })} label="Trajeto"
                      options={[{ v: '' as any, l: '—' }, { v: 'normal', l: 'Normal' }, { v: 'discr_along', l: 'Discr. along.' }, { v: 'along_tort', l: 'Along./tort.' }]} />
                    <div className="flex gap-3">
                      <Chk checked={v.acotovelamento} onChange={c => updateVaso(i, { acotovelamento: c })} label="Acotovelamento" />
                      <Chk checked={v.alcaVasc} onChange={c => updateVaso(i, { alcaVasc: c })} label="Alça vascular" />
                    </div>
                    <Radio value={v.parede} onChange={p => updateVaso(i, { parede: p })} label="Parede"
                      options={[{ v: '' as any, l: '—' }, { v: 'esp_difuso', l: 'Esp. difuso' }, { v: 'placas_irreg', l: 'Placas irreg.' }, { v: 'placas_mult', l: 'Placas múlt.' }]} />

                    {/* Placa 1 */}
                    <div className="rounded border p-2" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-[10px] font-bold" style={{ color: 'var(--text3)' }}>Placa 1</span>
                      <Radio value={v.placa1Tipo} onChange={t => updateVaso(i, { placa1Tipo: t })} label=""
                        options={[{ v: '' as any, l: '—' }, { v: 'calcificada', l: 'Calcificada' }, { v: 'parc_calc', l: 'Parc. calc.' }, { v: 'nao_calc', l: 'Não calc.' }]} />
                      {v.placa1Tipo && <>
                        <Radio value={v.placa1Seg} onChange={s => updateVaso(i, { placa1Seg: s })} label="Segmento"
                          options={[{ v: '' as any, l: '—' }, { v: 'inicial', l: 'Inicial' }, { v: 'medio', l: 'Médio' }, { v: 'distal', l: 'Distal' }]} />
                        <Radio value={v.placa1Estenose} onChange={e => updateVaso(i, { placa1Estenose: e })} label="Estenose"
                          options={[{ v: '' as any, l: '—' }, { v: 'sem', l: 'Sem' }, { v: 'discreta', l: 'Discreta' }, { v: 'moderada', l: 'Moderada' }, { v: 'acentuada', l: 'Acentuada' }]} />
                        <Chk checked={v.placa1Ulc} onChange={c => updateVaso(i, { placa1Ulc: c })} label="Ulceração" />
                      </>}
                    </div>

                    {/* Aneurisma */}
                    <Radio value={v.aneurisma} onChange={a => updateVaso(i, { aneurisma: a })} label="Aneurisma"
                      options={[{ v: '' as any, l: '—' }, { v: 'sacular', l: 'Sacular' }, { v: 'fusiforme', l: 'Fusiforme' }]} />
                    {v.aneurisma && <div className="flex flex-wrap gap-2">
                      <Num value={v.aneurismaDiam} onChange={d => updateVaso(i, { aneurismaDiam: d })} placeholder="Diam" unit="cm" />
                      <Num value={v.aneurismaColo} onChange={c => updateVaso(i, { aneurismaColo: c })} placeholder="Colo" unit="cm" />
                      <Txt value={v.aneurismaOrient} onChange={o => updateVaso(i, { aneurismaOrient: o })} placeholder="Orientação..." />
                    </div>}
                    <Chk checked={v.dilatInfund} onChange={c => updateVaso(i, { dilatInfund: c })} label="Dilatação infundibular?" />

                    {/* Dissecção */}
                    <Radio value={v.disseccao} onChange={d => updateVaso(i, { disseccao: d })} label="Dissecção"
                      options={[{ v: '' as any, l: '—' }, { v: 'flap', l: 'Flap intimal' }, { v: 'red_lum', l: 'Red. luminal excêntrica' }]} />
                    {v.disseccao && <>
                      <Radio value={v.disseccaoSeg} onChange={s => updateVaso(i, { disseccaoSeg: s })} label="Segmento"
                        options={[{ v: '' as any, l: '—' }, { v: 'inicial', l: 'Inicial' }, { v: 'medio', l: 'Médio' }, { v: 'distal', l: 'Distal' }]} />
                      <Radio value={v.disseccaoEst} onChange={e => updateVaso(i, { disseccaoEst: e })} label="Estenose"
                        options={[{ v: '' as any, l: '—' }, { v: 'leve', l: 'Leve' }, { v: 'moderada', l: 'Moderada' }, { v: 'acentuada', l: 'Acentuada' }]} />
                    </>}

                    {/* Obstrução */}
                    <Chk checked={v.obstrucao} onChange={c => updateVaso(i, { obstrucao: c })} label="Obstrução" />
                    {v.obstrucao && <Radio value={v.obstrucaoSeg} onChange={s => updateVaso(i, { obstrucaoSeg: s })} label="Desde"
                      options={[{ v: '' as any, l: '—' }, { v: 'origem', l: 'Origem' }, { v: 'medio', l: 'Médio' }, { v: 'distal', l: 'Distal' }]} />}

                    <Chk checked={v.displasia} onChange={c => updateVaso(i, { displasia: c })} label="Displasia fibromuscular" />
                    <Txt value={v.comentario} onChange={c => updateVaso(i, { comentario: c })} placeholder="Comentário..." />
                  </div>
                ))}
                <button type="button" onClick={addVaso} className="text-xs px-3 py-1.5 rounded-lg border font-semibold"
                  style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>+ Adicionar vaso</button>

                {/* Variações */}
                <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-[11px] font-bold" style={{ color: 'var(--text2)' }}>Variações da normalidade</span>
                  <Radio value={vertDom} onChange={setVertDom} label="Dominância vertebral"
                    options={[{ v: '' as any, l: '—' }, { v: 'dir', l: 'Direita' }, { v: 'esq', l: 'Esquerda' }]} />
                  <Radio value={circFetal} onChange={setCircFetal} label="Circulação fetal"
                    options={[{ v: '' as any, l: '—' }, { v: 'dir', l: 'Direita' }, { v: 'esq', l: 'Esquerda' }, { v: 'bilat', l: 'Bilateral' }]} />
                  <Radio value={a1Hipoplasia} onChange={setA1Hipoplasia} label="Hipoplasia A1"
                    options={[{ v: '' as any, l: '—' }, { v: 'dir', l: 'Direita' }, { v: 'esq', l: 'Esquerda' }]} />
                  <Chk checked={fenestBasilar} onChange={setFenestBasilar} label="Fenestração basilar" />
                  <Chk checked={artTrigeminal} onChange={setArtTrigeminal} label="Artéria trigeminal persistente" />
                  <Chk checked={azigus} onChange={setAzigus} label="ACA ázigos" />
                </div>
              </div>
            </Card>
          )}

          {/* ── ANGIO VENOSA ── */}
          {angioVen && (
            <Card id="venosa" activeCard={activeCard} setActiveCard={setActiveCard} title="Angio Venosa">
              <div className="space-y-1">
                <Chk checked={venNormal} onChange={setVenNormal} label="Seios venosos pérvios, normais" />
                <Chk checked={venAssimTransvDir} onChange={setVenAssimTransvDir} label="Assimetria transverso/sigmoide — dominância D" />
                <Chk checked={venAssimTransvEsq} onChange={setVenAssimTransvEsq} label="Assimetria transverso/sigmoide — dominância E" />
                <Chk checked={venTrombose} onChange={setVenTrombose} label="Trombose venosa" />
                {venTrombose && <Txt value={venTromboseLocal} onChange={setVenTromboseLocal} placeholder="Localização da trombose..." />}
                <Txt value={venComentario} onChange={setVenComentario} placeholder="Comentário..." />
              </div>
            </Card>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            RIGHT — Document-style output panel
            ═══════════════════════════════════════════════════════ */}
        <div className="lg:sticky lg:top-20 space-y-3">
          {/* Action buttons */}
          <div className="flex gap-2">
            <button type="button" onClick={() => copyRich(fullText, 'tudo')}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                backgroundColor: copied === 'tudo' ? 'var(--green)' : 'var(--accent)',
                color: '#fff',
              }}>
              {copied === 'tudo' ? 'Copiado!' : 'Copiar Laudo Completo'}
            </button>
            <button type="button" onClick={() => copyRich(textoAchados, 'achados')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all"
              style={{ borderColor: 'var(--border)', color: copied === 'achados' ? 'var(--green)' : 'var(--text2)' }}>
              {copied === 'achados' ? 'Copiado!' : 'Achados'}
            </button>
            <button type="button" onClick={() => copyRich(textoTecnica, 'tecnica')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all"
              style={{ borderColor: 'var(--border)', color: copied === 'tecnica' ? 'var(--green)' : 'var(--text2)' }}>
              {copied === 'tecnica' ? 'Copiado!' : 'Técnica'}
            </button>
            <button type="button" onClick={() => copyRich(textoConclusao, 'conclusao')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all"
              style={{ borderColor: 'var(--border)', color: copied === 'conclusao' ? 'var(--green)' : 'var(--text2)' }}>
              {copied === 'conclusao' ? 'Copiado!' : 'Conclusão'}
            </button>
          </div>

          {/* Document preview */}
          <div ref={laudoRef}
            className="rounded-xl border shadow-lg overflow-hidden"
            style={{ backgroundColor: '#fff' }}>
            {/* Document body */}
            <div className="px-8 py-8 sm:px-10 sm:py-10"
              style={{ fontFamily: "'Calibri', 'Arial', sans-serif", fontSize: '11pt', lineHeight: 1.5, color: '#1a1a1a' }}>
              {/* Title */}
              <p style={{ fontWeight: 700, fontSize: '12pt', textAlign: 'center', marginBottom: '16pt', letterSpacing: '0.5px' }}>
                {titulo.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < titulo.split('\n').length - 1 && <br />}</span>
                ))}
              </p>

              {/* Técnica */}
              <p style={{ fontWeight: 700, fontSize: '11pt', marginBottom: '4pt', color: '#333' }}>TÉCNICA:</p>
              {textoTecnica.split('\n').map((line, i) => (
                <p key={i} style={{ marginBottom: '4pt', textAlign: 'justify' }}>{line}</p>
              ))}

              <div style={{ height: '10pt' }} />

              {/* Achados */}
              <p style={{ fontWeight: 700, fontSize: '11pt', marginBottom: '4pt', color: '#333' }}>ACHADOS:</p>
              {textoAchados ? textoAchados.split('\n').map((line, i) => {
                if (!line.trim()) return <div key={i} style={{ height: '6pt' }} />
                return <p key={i} style={{ marginBottom: '4pt', textAlign: 'justify' }}>{line}</p>
              }) : (
                <p style={{ color: '#999', fontStyle: 'italic' }}>Selecione os achados nas seções ao lado...</p>
              )}

              {/* Normal indicator */}
              {temCranio && !hasCranioSelections && (
                <div style={{ marginTop: '12pt', padding: '6pt 10pt', backgroundColor: '#f0f9f0', borderRadius: '6px', border: '1px solid #c8e6c9' }}>
                  <p style={{ fontSize: '9pt', color: '#2e7d32', fontWeight: 600, margin: 0 }}>
                    Laudo normal — nenhum achado patológico selecionado
                  </p>
                </div>
              )}

              <div style={{ height: '10pt' }} />

              {/* Conclusão */}
              <p style={{ fontWeight: 700, fontSize: '11pt', marginBottom: '4pt', color: '#333' }}>CONCLUSÃO:</p>
              {textoConclusao ? textoConclusao.split('\n').map((line, i) => {
                if (!line.trim()) return <div key={i} style={{ height: '6pt' }} />
                return <p key={i} style={{ marginBottom: '4pt', textAlign: 'justify' }}>{line}</p>
              }) : (
                <p style={{ color: '#999', fontStyle: 'italic' }}>A conclusão será gerada automaticamente...</p>
              )}
            </div>
          </div>

          {/* Quick info */}
          <div className="rounded-lg p-2 text-center" style={{ backgroundColor: 'var(--surface2)' }}>
            <span className="text-[10px]" style={{ color: 'var(--text3)' }}>
              O laudo é copiado em formato rico (Calibri 11pt) compatível com Word e Google Docs
            </span>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  )
}
