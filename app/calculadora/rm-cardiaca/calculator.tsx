'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  referencias,
  classificarValor,
  classificarValorFromRef,
  formatarResultado,
  calcularASC,
  type Sexo,
  type TipoRef,
  type Classificacao,
  type RefParam,
} from '@/lib/cardiac-references'
import { renderTemplate } from '@/lib/cardiac-template-engine'
import { TEMPLATE_VARIABLES, TEMPLATE_BLOCKS } from '@/lib/cardiac-types'
import type { CardiacMask, CardiacReferenceTable } from '@/lib/cardiac-types'
import AnaliseMiocardio from './analise-miocardio'

// ── Types ────────────────────────────────────────────────
interface DiastoleRow { ve_endo: string; ve_epi: string; vd_endo: string; vd_epi: string }
interface SystoleRow { ve_endo: string; vd_endo: string }
interface ValveState { alterada: boolean; refluxo: string; estenose: boolean; grauEstenose: string }

const emptyDias = (): DiastoleRow => ({ ve_endo: '', ve_epi: '', vd_endo: '', vd_epi: '' })
const emptySist = (): SystoleRow => ({ ve_endo: '', vd_endo: '' })

// ── Color mapping (inline styles to work with .light-mode class system) ──
const classifStyles: Record<Classificacao, { borderColor: string; bgLight: string; bgDark: string; badgeBg: string }> = {
  normal:    { borderColor: '#16a34a', bgLight: '#dcfce7', bgDark: 'rgba(22,163,74,0.15)', badgeBg: '#16a34a' },
  discreto:  { borderColor: '#d97706', bgLight: '#fef3c7', bgDark: 'rgba(217,119,6,0.15)', badgeBg: '#d97706' },
  moderado:  { borderColor: '#ea580c', bgLight: '#ffedd5', bgDark: 'rgba(234,88,12,0.15)', badgeBg: '#ea580c' },
  acentuado: { borderColor: '#b91c1c', bgLight: '#fee2e2', bgDark: 'rgba(185,28,28,0.15)', badgeBg: '#b91c1c' },
}

const classifTexts = (c: Classificacao, tipo: string) => {
  if (c === 'normal') return 'Normal'
  const arrow = tipo === 'aumentado' ? '↑' : '↓'
  const arrows = c === 'discreto' ? arrow : c === 'moderado' ? arrow + arrow : arrow + arrow + arrow
  return `${arrows} ${c.charAt(0).toUpperCase() + c.slice(1)}`
}

// ── Collapsible Card Component ──
function CollapsibleCard({ title, icon, defaultOpen = true, children, className = '' }: {
  title: string; icon?: string; defaultOpen?: boolean; children: React.ReactNode; className?: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className={`bg-[var(--surface)] border border-[var(--border)] rounded-lg mb-4 hover:shadow-sm transition-shadow ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
          {icon && <span>{icon}</span>}
          {title}
        </span>
        <span className="text-[var(--text3)] text-xs transition-transform" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
          {'\u25BC'}
        </span>
      </button>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.25s ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="px-4 pb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CardiacCalculator() {
  // ── Theme ──
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const isLight = theme === 'light'

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' || 'dark'
    setTheme(saved)
    document.documentElement.classList.toggle('light-mode', saved === 'light')
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('light-mode', next === 'light')
  }

  // ── Patient data ──
  const [sexo, setSexo] = useState<Sexo | ''>('')
  const [altura, setAltura] = useState('')
  const [peso, setPeso] = useState('')
  const [tipoRef, setTipoRef] = useState<TipoRef>('ESC')
  const [arredondarABNT, setArredondarABNT] = useState(false)

  // ── Method ──
  const [method, setMethod] = useState<'manual' | 'app'>('manual')
  const [calcMassaVD, setCalcMassaVD] = useState(false)

  // ── Manual data ──
  const [diasRows, setDiasRows] = useState<DiastoleRow[]>(Array.from({ length: 8 }, emptyDias))
  const [sistRows, setSistRows] = useState<SystoleRow[]>(Array.from({ length: 8 }, emptySist))

  // ── App data ──
  const [appVeVdf, setAppVeVdf] = useState('')
  const [appVeVsf, setAppVeVsf] = useState('')
  const [appVeMassa, setAppVeMassa] = useState('')
  const [appVdVdf, setAppVdVdf] = useState('')
  const [appVdVsf, setAppVdVsf] = useState('')
  const [appVdMassa, setAppVdMassa] = useState('')

  // ── VE measurements ──
  const [veDdf, setVeDdf] = useState('')
  const [veEspSepto, setVeEspSepto] = useState('')
  const [veEspInferior, setVeEspInferior] = useState('')

  // ── AE ──
  const [aeArea4ch, setAeArea4ch] = useState('')
  const [aeArea2ch, setAeArea2ch] = useState('')
  const [aeEixoLongo, setAeEixoLongo] = useState('')
  const [aeDiamAp, setAeDiamAp] = useState('')

  // ── AD ──
  const [adArea4ch, setAdArea4ch] = useState('')
  const [adArea2ch, setAdArea2ch] = useState('')

  // ── Parametric maps ──
  const [t1MioPre, setT1MioPre] = useState('')
  const [t1SanguePre, setT1SanguePre] = useState('')
  const [t1MioPos, setT1MioPos] = useState('')
  const [t1SanguePos, setT1SanguePos] = useState('')
  const [campoMag, setCampoMag] = useState('1.5')
  const [hematocrito, setHematocrito] = useState('')
  const [usarHTSintetico, setUsarHTSintetico] = useState(false)
  const [t2Nativo, setT2Nativo] = useState('')
  const [t2Estrela, setT2Estrela] = useState('')

  // ── Report ──
  const [mascara, setMascara] = useState('1')
  const laudoRef = useRef<HTMLDivElement>(null)

  // ── Myocardium analysis ──
  const [anMiocardioText, setAnMiocardioText] = useState('Miocárdio ventricular esquerdo com espessura e sinal preservados.\nNão se identifica realce tardio miocárdico.')
  const handleMiocardioChange = useCallback((text: string) => setAnMiocardioText(text), [])

  // ── Technique ──
  const [comContraste, setComContraste] = useState(true)

  // ── Perfusion ──
  const [perfStress, setPerfStress] = useState(false)

  // ── Valves ──
  const emptyValve = (): ValveState => ({ alterada: false, refluxo: '', estenose: false, grauEstenose: '' })
  const [valvaAortica, setValvaAortica] = useState<ValveState>(emptyValve)
  const [valvaMitral, setValvaMitral] = useState<ValveState>(emptyValve)
  const [valvaTricuspide, setValvaTricuspide] = useState<ValveState>(emptyValve)
  const [valvaPulmonar, setValvaPulmonar] = useState<ValveState>(emptyValve)

  // ── Pericardium ──
  const [pericardioNormal, setPericardioNormal] = useState(true)
  const [pericardioEspessamento, setPericardioEspessamento] = useState(false)
  const [pericardioDerrame, setPericardioDerrame] = useState(false)

  // ── Aorta & Pulmonary ──
  const [aortaAlterada, setAortaAlterada] = useState(false)
  const [aortaBulbo, setAortaBulbo] = useState('')
  const [aortaAscendente, setAortaAscendente] = useState('')
  const [aortaCrossa, setAortaCrossa] = useState('')
  const [aortaDescendente, setAortaDescendente] = useState('')
  const [troncoPulmonar, setTroncoPulmonar] = useState('')

  // ── Firestore masks/references ──
  const [firestoreMasks, setFirestoreMasks] = useState<CardiacMask[]>([])
  const [firestoreRefs, setFirestoreRefs] = useState<CardiacReferenceTable[]>([])
  const [selectedFirestoreRef, setSelectedFirestoreRef] = useState<string>('')  // '' = use built-in

  useEffect(() => {
    fetch('/api/cardiac/masks').then(r => r.json()).then(d => setFirestoreMasks(d.masks || [])).catch(() => {})
    fetch('/api/cardiac/references?full=true').then(r => r.json()).then(d => setFirestoreRefs(d.references || [])).catch(() => {})
  }, [])

  // ── Ref modal ──
  const [refModal, setRefModal] = useState<{ open: boolean; secao: string }>({ open: false, secao: '' })

  // ══ COMPUTED VALUES ═══════════════════════════════════════
  const asc = useMemo(() => {
    const h = parseFloat(altura)
    const w = parseFloat(peso)
    if (h && w) return calcularASC(h, w)
    return 0
  }, [altura, peso])

  // Manual totals
  const diasTotals = useMemo(() => {
    let ve = 0, epi = 0, vd = 0, vdEpi = 0
    diasRows.forEach(r => {
      ve += parseFloat(r.ve_endo) || 0
      epi += parseFloat(r.ve_epi) || 0
      vd += parseFloat(r.vd_endo) || 0
      vdEpi += parseFloat(r.vd_epi) || 0
    })
    return { ve, epi, vd, vdEpi }
  }, [diasRows])

  const sistTotals = useMemo(() => {
    let ve = 0, vd = 0
    sistRows.forEach(r => {
      ve += parseFloat(r.ve_endo) || 0
      vd += parseFloat(r.vd_endo) || 0
    })
    return { ve, vd }
  }, [sistRows])

  // Core volumes (from manual or app)
  const volumes = useMemo(() => {
    let veVDF: number, veVSF: number, veMassa: number, vdVDF: number, vdVSF: number, vdMassa: number
    if (method === 'manual') {
      veVDF = diasTotals.ve
      veVSF = sistTotals.ve
      vdVDF = diasTotals.vd
      vdVSF = sistTotals.vd
      veMassa = (diasTotals.epi - diasTotals.ve) * 1.05
      vdMassa = calcMassaVD ? (diasTotals.vdEpi - diasTotals.vd) * 1.05 : NaN
    } else {
      veVDF = parseFloat(appVeVdf)
      veVSF = parseFloat(appVeVsf)
      veMassa = parseFloat(appVeMassa)
      vdVDF = parseFloat(appVdVdf)
      vdVSF = parseFloat(appVdVsf)
      vdMassa = calcMassaVD ? parseFloat(appVdMassa) : NaN
    }
    return { veVDF, veVSF, veMassa, vdVDF, vdVSF, vdMassa }
  }, [method, diasTotals, sistTotals, appVeVdf, appVeVsf, appVeMassa, appVdVdf, appVdVsf, appVdMassa, calcMassaVD])

  // VE results
  const veResults = useMemo(() => {
    const { veVDF, veVSF, veMassa } = volumes
    if (!veVDF || !veVSF || !asc) return null
    const edvI = veVDF / asc
    const esvI = veVSF / asc
    const ve = veVDF - veVSF
    const ef = (ve / veVDF) * 100
    const massaI = veMassa / asc
    const veI = ve / asc
    return { edv: veVDF, esv: veVSF, edvI, esvI, ve, ef, massa: veMassa, massaI, veI }
  }, [volumes, asc])

  // VD results
  const vdResults = useMemo(() => {
    const { vdVDF, vdVSF, vdMassa } = volumes
    if (!vdVDF || !vdVSF || !asc) return null
    const edvI = vdVDF / asc
    const esvI = vdVSF / asc
    const ve = vdVDF - vdVSF
    const ef = (ve / vdVDF) * 100
    const veI = ve / asc
    const massaI = !isNaN(vdMassa) ? vdMassa / asc : NaN
    return { edv: vdVDF, esv: vdVSF, edvI, esvI, ve, ef, massa: vdMassa, massaI, veI }
  }, [volumes, asc])

  // AE results
  const aeResults = useMemo(() => {
    const a4 = parseFloat(aeArea4ch)
    const a2 = parseFloat(aeArea2ch)
    const eixo = parseFloat(aeEixoLongo)
    const vol = a4 && a2 && eixo ? (8 / 3 / Math.PI) * (a4 * a2 / eixo) : NaN
    const volI = !isNaN(vol) && asc ? vol / asc : NaN
    const area4chI = a4 && asc ? a4 / asc : NaN
    const area2chI = a2 && asc ? a2 / asc : NaN
    return { volI, area4chI, area2chI }
  }, [aeArea4ch, aeArea2ch, aeEixoLongo, asc])

  // AD results
  const adResults = useMemo(() => {
    const a4 = parseFloat(adArea4ch)
    const a2 = parseFloat(adArea2ch)
    const area4chI = a4 && asc ? a4 / asc : NaN
    const area2chI = a2 && asc ? a2 / asc : NaN
    return { area4chI, area2chI }
  }, [adArea4ch, adArea2ch, asc])

  // ECV calculation
  const ecvResults = useMemo(() => {
    const pre = parseFloat(t1MioPre)
    const bloodPre = parseFloat(t1SanguePre)
    const post = parseFloat(t1MioPos)
    const bloodPost = parseFloat(t1SanguePos)
    let ht = parseFloat(hematocrito)
    let htSint: number | null = null

    if (usarHTSintetico && bloodPre) {
      const campo = parseFloat(campoMag) || 1.5
      htSint = campo === 1.5
        ? (1 / (0.00115 * bloodPre + 0.37))
        : (1 / (0.00105 * bloodPre + 0.40))
      ht = htSint
    }

    if (!pre || !bloodPre || !post || !bloodPost || !ht) {
      return { lambda: NaN, ecv: NaN, htSint }
    }

    const lambda = ((1 / post) - (1 / pre)) / ((1 / bloodPost) - (1 / bloodPre))
    const ecv = (1 - ht) * lambda * 100
    return { lambda, ecv, htSint }
  }, [t1MioPre, t1SanguePre, t1MioPos, t1SanguePos, hematocrito, usarHTSintetico, campoMag])

  // ECV classification
  const ecvClassif = useMemo((): Classificacao | null => {
    const ecv = ecvResults.ecv
    if (isNaN(ecv)) return null
    const campo = parseFloat(campoMag) || 1.5
    if (campo === 1.5) {
      if (ecv >= 21 && ecv <= 29) return 'normal'
      if (ecv > 29 && ecv <= 33) return 'discreto'
      if (ecv > 33 && ecv <= 37) return 'moderado'
      if (ecv > 37) return 'acentuado'
    } else {
      if (ecv >= 22 && ecv <= 30) return 'normal'
      if (ecv > 30 && ecv <= 34) return 'discreto'
      if (ecv > 34 && ecv <= 38) return 'moderado'
      if (ecv > 38) return 'acentuado'
    }
    return null
  }, [ecvResults.ecv, campoMag])

  // Volume difference
  const volumeDiff = useMemo(() => {
    if (!veResults || !vdResults) return null
    const diff = Math.abs(veResults.ve - vdResults.ve)
    return diff
  }, [veResults, vdResults])

  // ── Computed text blocks ──
  const textoPerfusao = useMemo(() => {
    if (perfStress) return 'Perfusão miocárdica em repouso e pós-estresse farmacológico sem sinais de isquemia.'
    return 'Perfusão miocárdica em repouso sem sinais de isquemia.'
  }, [perfStress])

  const textoMetodo = useMemo(() => {
    const repouso = perfStress ? 'Exame realizado em repouso e após estresse farmacológico.' : 'Exame realizado em repouso.'
    if (comContraste) {
      return `Realizadas sequências de cinerressonância e morfológicas antes da administração endovenosa do meio de contraste paramagnético. Após a sua administração, foram realizadas sequências de perfusão miocárdica, volumétrica do tórax e de realce tardio. ${repouso}`
    }
    return `Realizadas sequências de cinerressonância e morfológicas sem administração de meio de contraste paramagnético. ${repouso}`
  }, [comContraste, perfStress])

  const textoValvas = useMemo(() => {
    const allValves = [
      { nome: 'aórtica', ...valvaAortica },
      { nome: 'mitral', ...valvaMitral },
      { nome: 'tricúspide', ...valvaTricuspide },
      { nome: 'pulmonar', ...valvaPulmonar },
    ]

    const altered = allValves.filter(v => (v.alterada && v.refluxo) || (v.estenose && v.grauEstenose))
    if (altered.length === 0) return 'Valvas cardíacas sem alterações evidentes ao método.'

    // Build per-valve description
    const descriptions = altered.map(v => {
      const parts: string[] = []
      if (v.alterada && v.refluxo) parts.push(`refluxo ${v.refluxo}`)
      if (v.estenose && v.grauEstenose) parts.push(`sinais de estenose ${v.grauEstenose}`)
      return { nome: v.nome, desc: parts.join(' e ') }
    })

    let texto: string
    const allSameDesc = descriptions.every(d => d.desc === descriptions[0].desc)

    if (descriptions.length === 1) {
      texto = `Valva ${descriptions[0].nome} com ${descriptions[0].desc}`
    } else if (allSameDesc) {
      const names = descriptions.map(d => d.nome)
      const last = names.pop()!
      texto = `Valvas ${names.join(', ')} e ${last} com ${descriptions[0].desc}`
    } else {
      const parts = descriptions.map(d => `valva ${d.nome} com ${d.desc}`)
      const last = parts.pop()!
      texto = parts.join(', ') + ' e ' + last
      texto = texto.charAt(0).toUpperCase() + texto.slice(1)
    }

    texto += ' (análise visual qualitativa). Demais valvas cardíacas sem alterações evidentes ao método.'
    return texto
  }, [valvaAortica, valvaMitral, valvaTricuspide, valvaPulmonar])

  const textoPericardio = useMemo(() => {
    if (pericardioNormal) return 'Não se observa espessamento ou derrame pericárdico.'
    const achados: string[] = []
    if (pericardioEspessamento) achados.push('espessamento pericárdico')
    if (pericardioDerrame) achados.push('derrame pericárdico')
    if (achados.length === 0) return 'Não se observa espessamento ou derrame pericárdico.'
    return `Observa-se ${achados.join(' e ')}.`
  }, [pericardioNormal, pericardioEspessamento, pericardioDerrame])

  const textoAortaPulmonar = useMemo(() => {
    if (!aortaAlterada) return 'Aorta torácica e tronco pulmonar com calibre normal.'

    const segments = [
      { value: aortaBulbo, label: 'bulbo aórtico', vn: 4.0 },
      { value: aortaAscendente, label: 'porção tubular ascendente da aorta', vn: 4.0 },
      { value: aortaCrossa, label: 'crossa aórtica', vn: 3.5 },
      { value: aortaDescendente, label: 'aorta descendente', vn: 3.0 },
    ]

    const filled = segments.filter(s => s.value)
    const ectasias = filled.filter(s => parseFloat(s.value) > s.vn)
    const normais = filled.filter(s => parseFloat(s.value) <= s.vn)

    let texto = ''
    if (ectasias.length > 0) {
      const parts = ectasias.map(s => `ectasia do ${s.label}, medindo até ${s.value} cm`)
      const first = parts.shift()!
      texto = first.charAt(0).toUpperCase() + first.slice(1)
      if (parts.length > 0) {
        const last = parts.pop()!
        texto += parts.length > 0 ? ', ' + parts.join(', ') + ' e ' + last : ' e ' + last
      }
      texto += '.'
    }

    if (normais.length > 0 && ectasias.length > 0) {
      // Report normal segments with their measurements (aortometry)
      const normParts = normais.map(s => `${s.label} medindo ${s.value} cm`)
      texto += ' ' + normParts.map((p, i) => i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p).join(', ')
      if (filled.length < 4) {
        texto += '. Demais segmentos da aorta torácica com trajeto e calibre preservados.'
      } else {
        texto += '.'
      }
    } else if (normais.length > 0 && ectasias.length === 0) {
      // All filled segments are normal - aortometry only
      const normParts = normais.map(s => `${s.label} medindo ${s.value} cm`)
      texto = 'Aorta torácica com trajeto e calibre preservados: ' + normParts.join(', ') + '.'
      if (filled.length < 4) {
        texto += ' Demais segmentos com trajeto e calibre preservados.'
      }
    } else if (filled.length === 0) {
      texto = 'Aorta torácica com trajeto e calibre preservados.'
    } else if (ectasias.length > 0 && filled.length < 4) {
      texto += ' Demais segmentos da aorta torácica com trajeto e calibre preservados.'
    }

    const tpVal = parseFloat(troncoPulmonar)
    if (troncoPulmonar && tpVal > 3.0) {
      texto += `\nEctasia do tronco da artéria pulmonar, medindo até ${troncoPulmonar} cm.`
    } else if (troncoPulmonar && tpVal <= 3.0) {
      texto += `\nTronco pulmonar com calibre normal, medindo ${troncoPulmonar} cm.`
    } else {
      texto += '\nTronco pulmonar com calibre normal.'
    }

    return texto
  }, [aortaAlterada, aortaBulbo, aortaAscendente, aortaCrossa, aortaDescendente, troncoPulmonar])

  // ── Helper: classify ──
  const cl = useCallback((param: string, valor: number): Classificacao | null => {
    if (!sexo || isNaN(valor)) return null
    // Use Firestore reference if selected
    if (selectedFirestoreRef) {
      const fsRef = firestoreRefs.find(r => r.id === selectedFirestoreRef)
      if (fsRef) {
        const sexKey = sexo === 'Masculino' ? 'M' : 'F'
        const refParam = fsRef.parametros?.[sexKey]?.[param]
        if (refParam) return classificarValorFromRef(valor, refParam)
      }
    }
    return classificarValor(valor, param, sexo as Sexo, tipoRef)
  }, [sexo, tipoRef, selectedFirestoreRef, firestoreRefs])

  const fmt = useCallback((valor: number, casas = 1) => {
    return formatarResultado(valor, casas, arredondarABNT)
  }, [arredondarABNT])

  // ── Report generation ──
  const laudoHtml = useMemo(() => {
    if (!sexo || !asc) return ''

    // Build template variables for both hardcoded and Firestore masks
    const templateVars: Record<string, string | number> = {
      '$VEVDF': veResults ? fmt(veResults.edv) : '[  ]',
      '$VEVSF': veResults ? fmt(veResults.esv) : '[  ]',
      '$VEVDFI': veResults ? fmt(veResults.edvI) : '[  ]',
      '$VEVSFI': veResults ? fmt(veResults.esvI) : '[  ]',
      '$VEVE': veResults ? fmt(veResults.ve) : '[  ]',
      '$VEVEI': veResults ? fmt(veResults.veI) : '[  ]',
      '$VEFE': veResults ? fmt(veResults.ef) : '[  ]',
      '$VEMASSA': veResults ? fmt(veResults.massa) : '[  ]',
      '$VEMASSAI': veResults ? fmt(veResults.massaI) : '[  ]',
      '$VEDDF': veDdf || '[  ]',
      '$VEESPSEPTO': veEspSepto || '[  ]',
      '$VEESPINFERIOR': veEspInferior || '[  ]',
      '$VDVDF': vdResults ? fmt(vdResults.edv) : '[  ]',
      '$VDVSF': vdResults ? fmt(vdResults.esv) : '[  ]',
      '$VDVDFI': vdResults ? fmt(vdResults.edvI) : '[  ]',
      '$VDVSFI': vdResults ? fmt(vdResults.esvI) : '[  ]',
      '$VDVE': vdResults ? fmt(vdResults.ve) : '[  ]',
      '$VDVEI': vdResults ? fmt(vdResults.veI) : '[  ]',
      '$VDFE': vdResults ? fmt(vdResults.ef) : '[  ]',
      '$VDMASSA': vdResults ? fmt(vdResults.massa) : '[  ]',
      '$VDMASSAI': vdResults ? fmt(vdResults.massaI) : '[  ]',
      '$AEVOLINDEX': !isNaN(aeResults.volI) ? fmt(aeResults.volI) : '[  ]',
      '$AEAREA4CHI': !isNaN(aeResults.area4chI) ? fmt(aeResults.area4chI) : '[  ]',
      '$AEAREA2CHI': !isNaN(aeResults.area2chI) ? fmt(aeResults.area2chI) : '[  ]',
      '$AEDIAMAP': aeDiamAp || '[  ]',
      '$ADAREA4CHI': !isNaN(adResults.area4chI) ? fmt(adResults.area4chI) : '[  ]',
      '$ADAREA2CHI': !isNaN(adResults.area2chI) ? fmt(adResults.area2chI) : '[  ]',
      '$T1MIOPRE': t1MioPre || '[  ]',
      '$T1SANGUEPRE': t1SanguePre || '[  ]',
      '$T1MIOPOS': t1MioPos || '[  ]',
      '$T1SANGUEPOS': t1SanguePos || '[  ]',
      '$ECV': !isNaN(ecvResults.ecv) ? fmt(ecvResults.ecv) : '[  ]',
      '$HTSINTETICO': ecvResults.htSint != null ? fmt(ecvResults.htSint, 2) : '[  ]',
      '$T2NATIVO': t2Nativo || '[  ]',
      '$T2ESTRELA': t2Estrela || '[  ]',
      '$CAMPOMAG': campoMag,
      '$ASC': asc ? asc.toFixed(2) : '[  ]',
      '$SEXO': sexo,
      '$DELTAVEVD': volumeDiff != null ? fmt(volumeDiff) : '[  ]',
    }

    const v = {
      AE_DIAM_AP: aeDiamAp || '[  ]',
      VD_EDV: vdResults ? fmt(vdResults.edv) : '[  ]',
      VD_EDV_INDEX: vdResults ? fmt(vdResults.edvI) : '[  ]',
      VD_ESV_INDEX: vdResults ? fmt(vdResults.esvI) : '[  ]',
      VD_EF: vdResults ? fmt(vdResults.ef) : '[  ]',
      VE_DDF: veDdf || '[  ]',
      VE_EDV: veResults ? fmt(veResults.edv) : '[  ]',
      VE_EDV_INDEX: veResults ? fmt(veResults.edvI) : '[  ]',
      VE_ESV_INDEX: veResults ? fmt(veResults.esvI) : '[  ]',
      VE_EF: veResults ? fmt(veResults.ef) : '[  ]',
      VE_ESP_SEPTO: veEspSepto || '[  ]',
      VE_MASSA: veResults ? fmt(veResults.massa) : '[  ]',
      VE_MASSA_INDEX: veResults ? fmt(veResults.massaI) : '[  ]',
    }

    // Text generators
    const gerarTextoAtrios = () => {
      const aeVolI = aeResults.volI
      const adAreaI = adResults.area4chI
      const aeC = !isNaN(aeVolI) ? cl('AE_VOL_INDEX', aeVolI) : null
      const aeAumentado = aeC && aeC !== 'normal'
      const aeGrau = aeC === 'discreto' ? 'discreta' : aeC === 'moderado' ? 'moderada' : aeC === 'acentuado' ? 'acentuada' : ''

      let adC: Classificacao | null = 'normal'
      if (!isNaN(adAreaI)) {
        if (adAreaI > 20) adC = 'acentuado'
        else if (adAreaI >= 19) adC = 'moderado'
        else if (adAreaI >= 17) adC = 'discreto'
      }
      const adAumentado = adC !== 'normal'
      const adGrau = adC === 'discreto' ? 'discreta' : adC === 'moderado' ? 'moderada' : adC === 'acentuado' ? 'acentuada' : ''

      const aeVolStr = !isNaN(aeVolI) ? fmt(aeVolI) : '[  ]'
      const adAreaStr = !isNaN(adAreaI) ? fmt(adAreaI) : '[  ]'

      if (!aeAumentado && !adAumentado) {
        return `Átrios cardíacos com dimensões normais. Átrio esquerdo com diâmetro anteroposterior de ${v.AE_DIAM_AP} cm (VN 2,3-4,2 cm) e volume estimado em ${aeVolStr} ml/m² (VN 18-90 ml/m²).`
      } else if (!adAumentado && aeAumentado) {
        return `Átrio direito com dimensões normais.\nÁtrio esquerdo com dilatação ${aeGrau}, diâmetro anteroposterior de ${v.AE_DIAM_AP} cm (VN 2,3-4,2 cm) e volume estimado em ${aeVolStr} ml/m² (VN 18-90 ml/m²).`
      } else if (adAumentado && !aeAumentado) {
        return `Átrio direito com dilatação ${adGrau}, área de ${adAreaStr} cm²/m² no plano quatro câmaras (VN 8-16 cm²/m²) e volume estimado em [  ] ml/m² (VN 18-90 ml/m²).\nÁtrio esquerdo com dimensões normais, diâmetro anteroposterior de ${v.AE_DIAM_AP} cm (VN 2,3-4,2 cm) e volume estimado em ${aeVolStr} ml/m² (VN 18-90 ml/m²).`
      } else {
        return `Átrio direito com dilatação ${adGrau}, área de ${adAreaStr} cm²/m² no plano quatro câmaras (VN 8-16 cm²/m²) e volume estimado em [  ] ml/m² (VN 18-90 ml/m²).\nÁtrio esquerdo com dilatação ${aeGrau}, diâmetro anteroposterior de ${v.AE_DIAM_AP} cm (VN 2,3-4,2 cm) e volume estimado em ${aeVolStr} ml/m² (VN 18-90 ml/m²).`
      }
    }

    const gerarTextoVE = () => {
      if (!veResults) return 'Ventrículo esquerdo com dimensões e função contrátil global preservadas, sem alterações na contratilidade segmentar.'
      const dimC = cl('VE_EDV_INDEX', veResults.edvI)
      const dimAumentada = dimC && dimC !== 'normal'
      const funcC = cl('VE_EF', veResults.ef)
      const funcReduzida = funcC && funcC !== 'normal'

      if (!dimAumentada && !funcReduzida) return 'Ventrículo esquerdo com dimensões e função contrátil global preservadas, sem alterações na contratilidade segmentar.'
      if (dimAumentada && !funcReduzida) return `Ventrículo esquerdo com dimensões aumentadas em grau ${dimC} e função contrátil global preservada. Sem alterações na contratilidade segmentar.`
      if (dimAumentada && funcReduzida) return `Ventrículo esquerdo com dimensões aumentadas em grau ${dimC} e função contrátil global reduzida em grau ${funcC}. Sem alterações na contratilidade segmentar.`
      return `Ventrículo esquerdo com dimensões normais e função contrátil global reduzida em grau ${funcC}. Sem alterações na contratilidade segmentar.`
    }

    const gerarTextoVD = () => {
      if (!vdResults) return 'Ventrículo direito com dimensões e função contrátil global preservadas, sem alterações na contratilidade segmentar.'
      const dimC = cl('VD_EDV_INDEX', vdResults.edvI)
      const dimAumentada = dimC && dimC !== 'normal'
      const funcC = cl('VD_EF', vdResults.ef)
      const funcReduzida = funcC && funcC !== 'normal'

      if (!dimAumentada && !funcReduzida) return 'Ventrículo direito com dimensões e função contrátil global preservadas, sem alterações na contratilidade segmentar.'
      if (dimAumentada && !funcReduzida) return `Ventrículo direito com dimensões aumentadas em grau ${dimC} e função contrátil global preservada. Sem alterações na contratilidade segmentar.`
      if (dimAumentada && funcReduzida) return `Ventrículo direito com dimensões aumentadas em grau ${dimC} e função contrátil global reduzida em grau ${funcC}. Sem alterações na contratilidade segmentar.`
      return `Ventrículo direito com dimensões normais e função contrátil global reduzida em grau ${funcC}. Sem alterações na contratilidade segmentar.`
    }

    const gerarTextoMapas = () => {
      const ecv = ecvResults.ecv
      const campo = campoMag
      const linhas: string[] = []
      if (t2Nativo) linhas.push('T2 nativo: ' + t2Nativo + ' ms (VN < 56 ms);')
      if (campo === '1.5') {
        if (t1MioPre) linhas.push('T1 nativo: ' + t1MioPre + ' ms (VN 989 +/- 84 ms - 1,5T);')
        if (!isNaN(ecv)) linhas.push('Volume extracelular (ECV): ' + fmt(ecv) + '% (VN 25 +/- 4% - 1,5T).')
      } else {
        if (t1MioPre) linhas.push('T1 nativo: ' + t1MioPre + ' ms (VN 1196 +/- 94 ms - 3T);')
        if (!isNaN(ecv)) linhas.push('Volume extracelular (ECV): ' + fmt(ecv) + '% (VN 26 +/- 4% - 3T).')
      }
      return linhas
    }

    const gerarResumo = () => {
      const linhas: string[] = []

      // Atria
      const aeVolI = aeResults.volI
      const adAreaI = adResults.area4chI
      const ae = !isNaN(aeVolI) ? cl('AE_VOL_INDEX', aeVolI) : null
      let ad: Classificacao | null = 'normal'
      if (!isNaN(adAreaI)) {
        if (adAreaI > 20) ad = 'acentuado'
        else if (adAreaI >= 19) ad = 'moderado'
        else if (adAreaI >= 17) ad = 'discreto'
      }
      const grau = (g: Classificacao | null) => g === 'discreto' ? 'discreta' : g === 'moderado' ? 'moderada' : 'acentuada'
      const aeAlterado = ae && ae !== 'normal'
      const adAlterado = ad !== 'normal'

      if (!aeAlterado && !adAlterado) {
        linhas.push('Átrios com dimensões normais.')
      } else if (aeAlterado && !adAlterado) {
        linhas.push('Átrio esquerdo com dilatação ' + grau(ae!) + '. Átrio direito com dimensões normais.')
      } else if (!aeAlterado && adAlterado) {
        linhas.push('Átrio direito com dilatação ' + grau(ad) + '. Átrio esquerdo com dimensões normais.')
      } else {
        const ordemG = ['acentuado', 'moderado', 'discreto']
        if (ordemG.indexOf(ae!) <= ordemG.indexOf(ad!)) {
          linhas.push('Átrio esquerdo com dilatação ' + grau(ae!) + '. Átrio direito com dilatação ' + grau(ad) + '.')
        } else {
          linhas.push('Átrio direito com dilatação ' + grau(ad) + '. Átrio esquerdo com dilatação ' + grau(ae!) + '.')
        }
      }

      // Ventricles
      const veD = veResults ? cl('VE_EDV_INDEX', veResults.edvI) : null
      const veF = veResults ? cl('VE_EF', veResults.ef) : null
      const vdD = vdResults ? cl('VD_EDV_INDEX', vdResults.edvI) : null
      const vdF = vdResults ? cl('VD_EF', vdResults.ef) : null
      const veDimAlt = veD && veD !== 'normal'
      const veFuncAlt = veF && veF !== 'normal'
      const vdDimAlt = vdD && vdD !== 'normal'
      const vdFuncAlt = vdF && vdF !== 'normal'
      const veAlt = veDimAlt || veFuncAlt
      const vdAlt = vdDimAlt || vdFuncAlt

      const grauPeso = (g: Classificacao | null) => g === 'acentuado' ? 3 : g === 'moderado' ? 2 : g === 'discreto' ? 1 : 0

      const txVE = () => {
        if (!veDimAlt && !veFuncAlt) return 'Ventrículo esquerdo com dimensões e função contrátil preservadas.'
        let t = 'Ventrículo esquerdo com '
        if (veDimAlt && veFuncAlt) t += 'dimensões aumentadas em grau ' + veD + ' e função contrátil reduzida em grau ' + veF + '.'
        else if (veDimAlt) t += 'dimensões aumentadas em grau ' + veD + ' e função contrátil preservada.'
        else t += 'dimensões preservadas e função contrátil reduzida em grau ' + veF + '.'
        return t
      }
      const txVD = () => {
        if (!vdDimAlt && !vdFuncAlt) return 'Ventrículo direito com dimensões e função contrátil preservados.'
        let t = 'Ventrículo direito com '
        if (vdDimAlt && vdFuncAlt) t += 'dimensões aumentadas em grau ' + vdD + ' e função contrátil reduzida em grau ' + vdF + '.'
        else if (vdDimAlt) t += 'dimensões aumentadas em grau ' + vdD + ' e função contrátil preservada.'
        else t += 'dimensões preservadas e função contrátil reduzida em grau ' + vdF + '.'
        return t
      }

      if (!veAlt && !vdAlt) {
        linhas.push('Ventrículos com dimensões, espessura miocárdica e função contrátil preservadas.')
      } else if (veAlt && !vdAlt) {
        linhas.push(txVE()); linhas.push(txVD())
      } else if (!veAlt && vdAlt) {
        linhas.push(txVD()); linhas.push(txVE())
      } else {
        const pVE = Math.max(grauPeso(veD), grauPeso(veF))
        const pVD = Math.max(grauPeso(vdD), grauPeso(vdF))
        if (pVE >= pVD) { linhas.push(txVE()); linhas.push(txVD()) }
        else { linhas.push(txVD()); linhas.push(txVE()) }
      }

      // ECV
      const ecvAlt = ecvClassif && ecvClassif !== 'normal'
      const temMapas = !!(t1MioPre || t2Nativo)
      if (!ecvAlt && !temMapas) {
        linhas.push('Não se identifica realce tardio, edema, alteração do T1 nativo ou do volume extracelular miocárdicos.')
      } else if (ecvAlt) {
        linhas.push('Volume extracelular miocárdico aumentado em grau ' + ecvClassif + '.')
        linhas.push('Não se identifica realce tardio ou edema miocárdico.')
      } else {
        linhas.push('Não se identifica realce tardio, edema, alteração do T1 nativo ou do volume extracelular miocárdicos.')
      }

      return linhas
    }

    const textoAtrios = gerarTextoAtrios()
    const textoVE = gerarTextoVE()
    const textoVD = gerarTextoVD()
    const mapasLinhas = gerarTextoMapas()
    const resumo = gerarResumo()

    // Block generators for template engine
    const blockGenerators: Record<string, () => string> = {
      '#ventrículoesquerdo': () => textoVE,
      '#ventrículodireito': () => textoVD,
      '#átrioesquerdo': () => textoAtrios.split('\n').filter(l => l.toLowerCase().includes('esquerdo') || l.toLowerCase().includes('átrios')).join('\n') || textoAtrios,
      '#átriodireito': () => textoAtrios.split('\n').filter(l => l.toLowerCase().includes('direito')).join('\n') || '',
      '#átrios': () => textoAtrios,
      '#mapasparamétricos': () => mapasLinhas.join('\n'),
      '#conclusão': () => resumo.join('\n'),
      '#perfusao': () => textoPerfusao,
      '#realcetardio': () => 'Não se identifica realce tardio miocárdico.',
      '#anmiocardio': () => anMiocardioText,
      '#valvas': () => textoValvas,
      '#pericardio': () => textoPericardio,
      '#aortaepulmonar': () => textoAortaPulmonar,
    }

    // If Firestore mask selected, use template engine
    if (mascara.startsWith('fs:')) {
      const maskId = mascara.slice(3)
      const fsMask = firestoreMasks.find(m => m.id === maskId)
      if (fsMask) {
        const rendered = renderTemplate(fsMask.template, templateVars, blockGenerators)
        const linhasFs = rendered.split('\n')
        const titulosNegrito = ['Método', 'Análise', 'Comentários', 'TÉCNICAS:', 'OBSERVAÇÕES:', 'IMPRESSÃO DIAGNÓSTICA:']
        return linhasFs.map(l => {
          const t = l.trim()
          if (t === '') return '<p style="margin:0;line-height:1.5"><br></p>'
          if (t.startsWith('RESSONÂNCIA MAGNÉTICA'))
            return '<p style="margin:0;line-height:1.5;text-align:center;font-weight:bold">' + t + '</p>'
          if (titulosNegrito.includes(t))
            return '<p style="margin:0;line-height:1.5;font-weight:bold">' + t + '</p>'
          return '<p style="margin:0;line-height:1.5">' + t + '</p>'
        }).join('')
      }
    }

    const rodape = [
      '', '*Valores de referência:',
      '1 - Petersen et al. Eur Heart J Cardiovasc Imaging. 2019 Dec 1;20(12):1321-1331.',
      '2 - Kawel-Boehm et al. Journal of Cardiovascular Magnetic Resonance (2020) 22:87.',
    ]

    let linhas: string[] = []

    if (mascara === '1') {
      linhas = [
        'RESSONÂNCIA MAGNÉTICA DE CORAÇÃO', '',
        'Método', '',
        textoMetodo,
        '', 'Análise', '',
        textoAtrios, '',
        textoVD + ' Volume diastólico final de ' + v.VD_EDV + ' ml e ' + v.VD_EDV_INDEX + ' ml/m², volume sistólico final de ' + v.VD_ESV_INDEX + ' ml/m² e fração de ejeção estimada em ' + v.VD_EF + '%.',
        '', 'Miocárdio ventricular direito com espessura e sinal preservados.', '',
        textoVE + ' Diâmetro diastólico final de ' + v.VE_DDF + ' cm, volume diastólico final de ' + v.VE_EDV + ' ml e ' + v.VE_EDV_INDEX + ' ml/m², volume sistólico final de ' + v.VE_ESV_INDEX + ' ml/m² e fração de ejeção estimada em ' + v.VE_EF + '%.',
        '', 'Miocárdio ventricular esquerdo:',
        'Espessura preservada, medindo até ' + v.VE_ESP_SEPTO + ' cm na parede septal basal (VN ≤ 1,2 cm);',
        'Massa estimada em ' + v.VE_MASSA + ' g e ' + v.VE_MASSA_INDEX + ' g/m²;',
        'Espessura relativa: [  ] (≤ 0,42);',
        'Índice relativo de massa: [  ] g/ml;',
        ...(mapasLinhas.length ? ['', 'Mapas Paramétricos:', ...mapasLinhas] : []),
        '', textoPerfusao,
        ...(anMiocardioText.includes('Não se identifica realce tardio')
          ? ['Não se identifica realce tardio miocárdico.']
          : anMiocardioText.split('\n')),
        textoValvas,
        textoPericardio,
        textoAortaPulmonar,
        '', 'Comentários', '',
        ...resumo, ...rodape,
      ]
    } else if (mascara === '2') {
      linhas = [
        'RESSONÂNCIA MAGNÉTICA DE CORAÇÃO', '',
        'Método', '',
        textoMetodo,
        '', 'Análise', '',
        textoAtrios, '',
        textoVD, 'Miocárdio ventricular direito com espessura e sinal preservados.', '',
        textoVE, 'Miocárdio ventricular esquerdo com espessura preservada, medindo até ' + v.VE_ESP_SEPTO + ' cm na parede septal basal.',
        ...(mapasLinhas.length ? ['', 'Mapas Paramétricos:', ...mapasLinhas] : []),
        '', textoPerfusao,
        ...(anMiocardioText.includes('Não se identifica realce tardio')
          ? ['Não se identifica realce tardio miocárdico.']
          : anMiocardioText.split('\n')),
        textoValvas,
        textoPericardio,
        textoAortaPulmonar,
        '', 'Comentários', '',
        ...resumo, ...rodape,
      ]
    } else {
      linhas = [
        'RESSONÂNCIA MAGNÉTICA DO CORAÇÃO', '', '',
        'TÉCNICAS:',
        'Cine-ressonância para avaliação da função ventricular global e segmentar.',
        'Angiorressonância magnética do tórax pós-contraste.',
        'Gradiente-Eco com TR fixo e variação do TE para cálculo do T2* do miocárdio.',
        'Mapa T1 pela técnica Modified Lock-Locker Inversion Recovery (MOLLI).',
        'Mapa T2 pela técnica SSFP (T2-TRUFI).',
        'Spin echo double IR e triple IR para caracterização tecidual.',
        'Sequência ponderada em T2 FAST Spin Eco 3D para avaliação linfática.',
        'CineMR com tagging pela técnica de modulação espacial de magnetização (SPAMM).',
        'Phase Contrast para análise de fluxos através da valva pulmonar/aórtica.',
        'Phase Contrast para análise de fluxos através do tronco da pulmonar, aorta ascendente, aorta descendente e artérias pulmonares.',
        'Perfusão de primeira passagem com gadolínio.',
        'Perfusão de primeira passagem com gadolínio após estresse com dipiridamol (0,56mg/kg/4min) e em repouso após a reversão com aminofilina.',
        'Realce tardio para avaliação de fibrose / infarto e viabilidade miocárdica.',
        '', '',
        'OBSERVAÇÕES:', '',
        'Átrio direito com dimensões preservadas / aumentadas (Análise qualitativa).', '',
        'Ventrículo direito com dimensões preservadas / aumentadas (IVDFVD= ' + v.VD_EDV_INDEX + ' mL/m²; IVSFVD= ' + v.VD_ESV_INDEX + ' mL/m²).', '',
        'Função sistólica do ventrículo direito preservada (FEVD= ' + v.VD_EF + '% ).', '',
        'Átrio esquerdo com dimensões preservadas / aumentadas (IVAE= [  ] mL/m²).', '',
        'Ventrículo esquerdo com dimensões preservadas / aumentadas (IVDFVE= ' + v.VE_EDV_INDEX + ' mL/m²; IVSFVE= ' + v.VE_ESV_INDEX + ' mL/m²).', '',
        'Função sistólica global e segmentar do ventrículo esquerdo preservada (FEVE= ' + v.VE_EF + '%).', '',
        'Espessura miocárdica normal.', '',
        'Ausência de edema miocárdico.', '',
        'Ausência de realce tardio miocárdico.', '',
        'Ausência de derrame pericárdico.',
        'Ausência de trombo intracavitário.', '',
        'Achados adicionais:', '', '',
        'IMPRESSÃO DIAGNÓSTICA:',
        'Câmaras cardíacas com dimensões preservadas.',
        'Função sistólica biventricular preservada.',
        'Ausência de fibrose/infarto miocárdico.',
      ]
    }

    const titulosNegrito = ['Método', 'Análise', 'Comentários', 'TÉCNICAS:', 'OBSERVAÇÕES:', 'IMPRESSÃO DIAGNÓSTICA:']
    return linhas.map(l => {
      const t = l.trim()
      if (t === '') return '<p style="margin:0;line-height:1.5"><br></p>'
      if (t.startsWith('RESSONÂNCIA MAGNÉTICA'))
        return '<p style="margin:0;line-height:1.5;text-align:center;font-weight:bold">' + t + '</p>'
      if (titulosNegrito.includes(t))
        return '<p style="margin:0;line-height:1.5;font-weight:bold">' + t + '</p>'
      return '<p style="margin:0;line-height:1.5">' + t + '</p>'
    }).join('')
  }, [sexo, asc, veResults, vdResults, aeResults, adResults, ecvResults, ecvClassif, cl, fmt, mascara, veDdf, veEspSepto, veEspInferior, aeDiamAp, t1MioPre, t1SanguePre, t1MioPos, t1SanguePos, t2Nativo, t2Estrela, campoMag, tipoRef, volumeDiff, firestoreMasks, anMiocardioText, textoPerfusao, textoMetodo, textoValvas, textoPericardio, textoAortaPulmonar])

  // ── Report actions ──
  const copiarLaudo = async () => {
    if (!laudoRef.current) return
    try {
      const html = laudoRef.current.innerHTML
      const text = laudoRef.current.innerText
      const styledHtml = `<div style="font-family:'Calibri',sans-serif;font-size:12pt;line-height:1.5;">${html}</div>`
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([styledHtml], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        })
      ])
      alert('Copiado!')
    } catch {
      try {
        await navigator.clipboard.writeText(laudoRef.current.innerText)
        alert('Copiado!')
      } catch { /* ignore */ }
    }
  }

  const salvarLaudo = () => {
    if (!laudoRef.current) return
    const blob = new Blob([laudoRef.current.innerText], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `laudo_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
  }

  // ── Row manipulation ──
  const addDiasRow = () => {
    if (diasRows.length >= 20) return
    setDiasRows(prev => [...prev, emptyDias()])
  }
  const removeDiasRow = () => {
    if (diasRows.length <= 1) return
    setDiasRows(prev => prev.slice(0, -1))
  }
  const addSistRow = () => {
    if (sistRows.length >= 20) return
    setSistRows(prev => [...prev, emptySist()])
  }
  const removeSistRow = () => {
    if (sistRows.length <= 1) return
    setSistRows(prev => prev.slice(0, -1))
  }

  const updateDiasRow = (i: number, field: keyof DiastoleRow, val: string) => {
    setDiasRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }
  const updateSistRow = (i: number, field: keyof SystoleRow, val: string) => {
    setSistRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }

  // ── Result card component ──
  const ResultItem = ({ label, value, unit, param, tooltip, checar }: {
    label: string; value: number; unit: string; param?: string; tooltip?: string; checar?: boolean
  }) => {
    const classif = param && sexo ? cl(param, value) : null
    const cs = classif ? classifStyles[classif] : null
    // Use Firestore reference if selected, otherwise built-in
    let ref: RefParam | null = null
    if (param && sexo) {
      if (selectedFirestoreRef) {
        const fsRef = firestoreRefs.find(r => r.id === selectedFirestoreRef)
        const sexKey = sexo === 'Masculino' ? 'M' : 'F'
        ref = fsRef?.parametros?.[sexKey]?.[param] as RefParam ?? null
      }
      if (!ref) {
        ref = referencias[tipoRef]?.[sexo as Sexo]?.[param] ?? null
      }
    }

    return (
      <div
        className="rounded-lg border border-[var(--border)] p-3 transition-all hover:-translate-y-px hover:shadow-sm"
        style={cs ? {
          borderTopWidth: 3,
          borderTopColor: cs.borderColor,
          backgroundColor: isLight ? cs.bgLight : cs.bgDark,
        } : {
          borderTopWidth: 3,
          borderTopColor: 'var(--border)',
          backgroundColor: 'var(--surface)',
        }}
        title={tooltip}
      >
        <div className="flex items-center gap-1 flex-wrap mb-1">
          {classif && cs && (
            <span
              className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase text-white"
              style={{ backgroundColor: cs.badgeBg }}
            >
              {classifTexts(classif, ref?.tipo || 'aumentado')}
            </span>
          )}
          {checar && (
            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase border" style={{ color: 'var(--orange, #d97706)', borderColor: 'var(--orange, #d97706)', backgroundColor: 'transparent' }}>
              checar
            </span>
          )}
        </div>
        <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text3)] mb-1">{label}</div>
        <span className="font-mono text-xl font-medium text-[var(--text)]">
          {isNaN(value) ? '-' : fmt(value)}
        </span>
        <span className="text-xs text-[var(--text3)] ml-1">{unit}</span>
        {ref?.normal && (
          <div className="text-[11px] text-[var(--text3)] mt-1">
            Ref: {ref.normal.min}-{ref.normal.max} {ref.unidade}
          </div>
        )}
      </div>
    )
  }

  // ── Reference modal content ──
  const refModalContent = useMemo(() => {
    if (!refModal.open || !sexo) return null
    const refData = referencias[tipoRef]?.[sexo as Sexo]
    if (!refData) return null

    const configs: Record<string, { titulo: string; params: string[] }> = {
      VE: { titulo: 'Ventrículo Esquerdo', params: ['VE_EDV', 'VE_EDV_INDEX', 'VE_ESV', 'VE_ESV_INDEX', 'VE_EF', 'VE_MASSA', 'VE_MASSA_INDEX'] },
      VD: { titulo: 'Ventrículo Direito', params: ['VD_EDV', 'VD_EDV_INDEX', 'VD_ESV', 'VD_ESV_INDEX', 'VD_EF', 'VD_MASSA', 'VD_MASSA_INDEX'] },
      AE: { titulo: 'Átrio Esquerdo', params: ['AE_VOL_INDEX'] },
      AD: { titulo: 'Átrio Direito', params: ['AD_AREA_4CH_INDEX', 'AD_VOL_INDEX'] },
    }

    const cfg = configs[refModal.secao]
    if (!cfg) return null

    const fmtRange = (v: number) => v >= 999990 ? '>' + (v - 1) : String(v)

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setRefModal({ open: false, secao: '' })}>
        <div className="bg-white dark:bg-[var(--surface)] rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border)]">
            <h3 className="text-lg font-bold text-[var(--text)]">{cfg.titulo} &mdash; {sexo}</h3>
            <button onClick={() => setRefModal({ open: false, secao: '' })} className="text-[var(--text3)] hover:text-[var(--text)] text-xl px-2">x</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[var(--border)]">
                <th className="text-left py-2 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--text3)]">Parâmetro</th>
                <th className="text-left py-2 px-2 text-xs font-semibold uppercase text-green-600">Normal</th>
                <th className="text-left py-2 px-2 text-xs font-semibold uppercase text-amber-600">Discreto</th>
                <th className="text-left py-2 px-2 text-xs font-semibold uppercase text-orange-600">Moderado</th>
                <th className="text-left py-2 px-2 text-xs font-semibold uppercase text-red-700">Acentuado</th>
              </tr>
            </thead>
            <tbody>
              {cfg.params.map(p => {
                const r = refData[p] as RefParam | undefined
                if (!r) return null
                return (
                  <tr key={p} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                    <td className="py-2 px-2 font-medium text-[var(--text)]">
                      {r.nome}<br />
                      <span className="text-xs text-[var(--text3)] font-mono">{r.unidade}</span>
                    </td>
                    <td className="py-2 px-2 font-mono font-semibold text-green-600">{r.normal ? `${fmtRange(r.normal.min)}-${fmtRange(r.normal.max)}` : '-'}</td>
                    <td className="py-2 px-2 font-mono font-semibold text-amber-600">{r.discreto ? `${fmtRange(r.discreto.min)}-${fmtRange(r.discreto.max)}` : '-'}</td>
                    <td className="py-2 px-2 font-mono font-semibold text-orange-600">{r.moderado ? `${fmtRange(r.moderado.min)}-${fmtRange(r.moderado.max)}` : '-'}</td>
                    <td className="py-2 px-2 font-mono font-semibold text-red-700">{r.acentuado ? `${fmtRange(r.acentuado.min)}+` : '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="mt-4 text-xs italic text-[var(--text3)]">
            Fonte: {tipoRef === 'ESC' ? 'ESC 2020 (Petersen et al.)' : 'ESC 2020 Ajustado'} &middot; Sexo: {sexo}
          </p>
        </div>
      </div>
    )
  }, [refModal, sexo, tipoRef])

  // ── Section header ──
  const SectionTitle = ({ children, dot, refSecao }: { children: React.ReactNode; dot?: string; refSecao?: string }) => (
    <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--text3)]">
      <div className="w-[3px] h-[14px] rounded-sm bg-[var(--accent)]" />
      {dot && <div className={`w-[9px] h-[9px] rounded-full ${dot}`} />}
      <span className="flex-1">{children}</span>
      {refSecao && (
        <button onClick={() => setRefModal({ open: true, secao: refSecao })} className="text-[var(--accent)] text-[11px] font-mono font-medium opacity-70 hover:opacity-100 transition-opacity">
          * Referência
        </button>
      )}
    </div>
  )

  // ── Input helpers ──
  const inputCls = "w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-colors"
  const selectCls = inputCls
  const labelCls = "text-xs font-medium text-[var(--text3)] tracking-wide mb-1"

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[var(--accent)] hover:text-[var(--accent2)] text-sm font-medium transition-colors">
            ← RadiologyhHub
          </Link>
          <span className="text-[var(--border2)]">|</span>
          <h1 className="text-base sm:text-lg font-bold text-[var(--text)]">Gerador de Laudo · RM Cardíaca</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--surface2)] text-[var(--text2)] hover:text-[var(--text)] transition-colors"
            aria-label={isLight ? 'Ativar modo escuro' : 'Ativar modo claro'}
          >
            {isLight ? '🌙' : '☀️'}
          </button>
          <span className="text-[10px] font-mono text-[var(--text3)] border border-[var(--border)] px-2 py-1 rounded-full tracking-wider uppercase hidden sm:inline">
            v12 &middot; Gerador de Laudo
          </span>
        </div>
      </header>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-56px)]">
        {/* ═══ LEFT PANEL: Inputs ═══ */}
        <div className="bg-[var(--bg2)] overflow-y-auto p-4 sm:p-6 lg:border-r border-[var(--border)]">
          {/* Patient data */}
          <CollapsibleCard title="Dados do Paciente" defaultOpen={true}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div>
                <label className={labelCls}>Idade</label>
                <input type="number" className={inputCls} placeholder="Anos" />
              </div>
              <div>
                <label className={labelCls}>Sexo</label>
                <select className={selectCls} value={sexo} onChange={e => setSexo(e.target.value as Sexo | '')}>
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Altura (cm)</label>
                <input type="number" className={inputCls} value={altura} onChange={e => setAltura(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Peso (kg)</label>
                <input type="number" className={inputCls} value={peso} onChange={e => setPeso(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>ASC (m²)</label>
                <input type="text" readOnly className={`${inputCls} opacity-70 cursor-default`} value={asc ? asc.toFixed(2) : ''} />
              </div>
              <div>
                <label className={labelCls}>Referência</label>
                <select className={selectCls} value={selectedFirestoreRef || tipoRef} onChange={e => {
                  const v = e.target.value
                  if (v === 'ESC' || v === 'ESC_AJUSTADO') {
                    setTipoRef(v as TipoRef)
                    setSelectedFirestoreRef('')
                  } else {
                    setSelectedFirestoreRef(v)
                  }
                }}>
                  <option value="ESC">ESC 2020</option>
                  <option value="ESC_AJUSTADO">ESC 2020 Ajustado</option>
                  {firestoreRefs.map(r => (
                    <option key={r.id} value={r.id}>{r.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          </CollapsibleCard>

          {/* Technique */}
          <CollapsibleCard title="Técnica do Exame" defaultOpen={true}>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={comContraste} onChange={e => setComContraste(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
                <span className="text-sm font-medium text-[var(--text)]">Com contraste</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={perfStress} onChange={e => setPerfStress(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
                <span className="text-sm font-medium text-[var(--text)]">Com estresse farmacológico</span>
              </label>
              <div>
                <label className={labelCls}>Campo Magnético</label>
                <select className={selectCls} value={campoMag} onChange={e => setCampoMag(e.target.value)}>
                  <option value="1.5">1.5T</option>
                  <option value="3">3T</option>
                </select>
              </div>
            </div>
          </CollapsibleCard>

          {/* Volume calculation method */}
          <CollapsibleCard title="Volumes Ventriculares" defaultOpen={true}>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMethod('manual')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium border transition-all ${
                  method === 'manual'
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md'
                    : 'bg-[var(--surface)] text-[var(--text2)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setMethod('app')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium border transition-all ${
                  method === 'app'
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md'
                    : 'bg-[var(--surface)] text-[var(--text2)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                }`}
              >
                Aplicativo Terceiro
              </button>
            </div>

            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input type="checkbox" checked={calcMassaVD} onChange={e => setCalcMassaVD(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
              <span className="text-sm font-medium text-[var(--text)]">Calcular massa do VD</span>
            </label>

            {method === 'manual' ? (
              <>
                {/* Diastole table */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-[var(--text)]">Diástole - Áreas dos Cortes</h3>
                  <div className="flex gap-2">
                    <button onClick={addDiasRow} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-md text-[var(--text2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">+ Corte</button>
                    <button onClick={removeDiasRow} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-md text-[var(--text2)] hover:border-[var(--red)] hover:text-[var(--red)] transition-colors">- Corte</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-[var(--border)]">
                        <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text3)] w-8">Corte</th>
                        <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text3)]">VE Endo (cm²)</th>
                        <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text3)]">VE Epi (cm²)</th>
                        <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text3)]">VD Endo (cm²)</th>
                        {calcMassaVD && <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text3)]">VD Epi (cm²)</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {diasRows.map((row, i) => (
                        <tr key={i} className="border-b border-[var(--border)]">
                          <td className="px-2 py-1 text-center text-xs font-mono text-[var(--text3)]">{i + 1}</td>
                          <td className="px-1 py-1"><input type="number" step="0.1" className={`${inputCls} font-mono text-xs py-1.5`} value={row.ve_endo} onChange={e => updateDiasRow(i, 've_endo', e.target.value)} /></td>
                          <td className="px-1 py-1"><input type="number" step="0.1" className={`${inputCls} font-mono text-xs py-1.5`} value={row.ve_epi} onChange={e => updateDiasRow(i, 've_epi', e.target.value)} /></td>
                          <td className="px-1 py-1"><input type="number" step="0.1" className={`${inputCls} font-mono text-xs py-1.5`} value={row.vd_endo} onChange={e => updateDiasRow(i, 'vd_endo', e.target.value)} /></td>
                          {calcMassaVD && <td className="px-1 py-1"><input type="number" step="0.1" className={`${inputCls} font-mono text-xs py-1.5`} value={row.vd_epi} onChange={e => updateDiasRow(i, 'vd_epi', e.target.value)} /></td>}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[var(--surface2)] font-semibold">
                        <td className="px-2 py-2 text-xs text-[var(--text3)]">Total</td>
                        <td className="px-2 py-2 font-mono text-sm text-[var(--accent)]">{diasTotals.ve.toFixed(1)}</td>
                        <td className="px-2 py-2 font-mono text-sm text-[var(--accent)]">{diasTotals.epi.toFixed(1)}</td>
                        <td className="px-2 py-2 font-mono text-sm text-[var(--accent)]">{diasTotals.vd.toFixed(1)}</td>
                        {calcMassaVD && <td className="px-2 py-2 font-mono text-sm text-[var(--accent)]">{diasTotals.vdEpi.toFixed(1)}</td>}
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <p className="text-[11px] text-[var(--text3)] italic mt-2">* Espessura do corte = 1 cm, soma das áreas = volume em ml</p>

                {/* Systole table */}
                <div className="flex justify-between items-center mb-3 mt-6">
                  <h3 className="text-sm font-bold text-[var(--text)]">Sístole - Áreas dos Cortes</h3>
                  <div className="flex gap-2">
                    <button onClick={addSistRow} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-md text-[var(--text2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">+ Corte</button>
                    <button onClick={removeSistRow} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-md text-[var(--text2)] hover:border-[var(--red)] hover:text-[var(--red)] transition-colors">- Corte</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-[var(--border)]">
                        <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text3)] w-8">Corte</th>
                        <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text3)]">VE Endo (cm²)</th>
                        <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text3)]">VD Endo (cm²)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sistRows.map((row, i) => (
                        <tr key={i} className="border-b border-[var(--border)]">
                          <td className="px-2 py-1 text-center text-xs font-mono text-[var(--text3)]">{i + 1}</td>
                          <td className="px-1 py-1"><input type="number" step="0.1" className={`${inputCls} font-mono text-xs py-1.5`} value={row.ve_endo} onChange={e => updateSistRow(i, 've_endo', e.target.value)} /></td>
                          <td className="px-1 py-1"><input type="number" step="0.1" className={`${inputCls} font-mono text-xs py-1.5`} value={row.vd_endo} onChange={e => updateSistRow(i, 'vd_endo', e.target.value)} /></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[var(--surface2)] font-semibold">
                        <td className="px-2 py-2 text-xs text-[var(--text3)]">Total</td>
                        <td className="px-2 py-2 font-mono text-sm text-[var(--accent)]">{sistTotals.ve.toFixed(1)}</td>
                        <td className="px-2 py-2 font-mono text-sm text-[var(--accent)]">{sistTotals.vd.toFixed(1)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <p className="text-[11px] text-[var(--text3)] italic mt-2">* Espessura do corte = 1 cm, soma das áreas = volume em ml</p>
              </>
            ) : (
              <>
                <h3 className="text-sm font-bold text-[var(--text)] mb-3">Ventrículo Esquerdo</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div><label className={labelCls}>VDF (ml)</label><input type="number" step="0.1" className={inputCls} value={appVeVdf} onChange={e => setAppVeVdf(e.target.value)} /></div>
                  <div><label className={labelCls}>VSF (ml)</label><input type="number" step="0.1" className={inputCls} value={appVeVsf} onChange={e => setAppVeVsf(e.target.value)} /></div>
                  <div><label className={labelCls}>Massa (g)</label><input type="number" step="0.1" className={inputCls} value={appVeMassa} onChange={e => setAppVeMassa(e.target.value)} /></div>
                </div>
                <h3 className="text-sm font-bold text-[var(--text)] mb-3">Ventrículo Direito</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className={labelCls}>VDF (ml)</label><input type="number" step="0.1" className={inputCls} value={appVdVdf} onChange={e => setAppVdVdf(e.target.value)} /></div>
                  <div><label className={labelCls}>VSF (ml)</label><input type="number" step="0.1" className={inputCls} value={appVdVsf} onChange={e => setAppVdVsf(e.target.value)} /></div>
                  {calcMassaVD && <div><label className={labelCls}>Massa (g)</label><input type="number" step="0.1" className={inputCls} value={appVdMassa} onChange={e => setAppVdMassa(e.target.value)} /></div>}
                </div>
              </>
            )}
          </CollapsibleCard>

          {/* VE measurements */}
          <CollapsibleCard title="Medidas do VE" defaultOpen={true}>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={labelCls}>DDF (cm)</label><input type="number" step="0.1" className={inputCls} value={veDdf} onChange={e => setVeDdf(e.target.value)} /></div>
              <div><label className={labelCls}>Espessura Septo (cm)</label><input type="number" step="0.1" className={inputCls} value={veEspSepto} onChange={e => setVeEspSepto(e.target.value)} /></div>
              <div><label className={labelCls}>Espessura Parede Inferior (cm)</label><input type="number" step="0.1" className={inputCls} value={veEspInferior} onChange={e => setVeEspInferior(e.target.value)} /></div>
            </div>
          </CollapsibleCard>

          {/* AE */}
          <CollapsibleCard title="Átrio Esquerdo" defaultOpen={true}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><label className={labelCls}>Área 4CH (cm²)</label><input type="number" step="0.1" className={inputCls} value={aeArea4ch} onChange={e => setAeArea4ch(e.target.value)} /></div>
              <div><label className={labelCls}>Área 2CH (cm²)</label><input type="number" step="0.1" className={inputCls} value={aeArea2ch} onChange={e => setAeArea2ch(e.target.value)} /></div>
              <div><label className={labelCls}>Eixo Longo (cm)</label><input type="number" step="0.1" className={inputCls} value={aeEixoLongo} onChange={e => setAeEixoLongo(e.target.value)} placeholder="Mín. de 4CH/2CH" /></div>
              <div><label className={labelCls}>Diâm AP 3CH (cm)</label><input type="number" step="0.1" className={inputCls} value={aeDiamAp} onChange={e => setAeDiamAp(e.target.value)} /></div>
            </div>
          </CollapsibleCard>

          {/* AD */}
          <CollapsibleCard title="Átrio Direito" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Área 4CH (cm²)</label><input type="number" step="0.1" className={inputCls} value={adArea4ch} onChange={e => setAdArea4ch(e.target.value)} /></div>
              <div><label className={labelCls}>Área 2CH (cm²)</label><input type="number" step="0.1" className={inputCls} value={adArea2ch} onChange={e => setAdArea2ch(e.target.value)} /></div>
            </div>
          </CollapsibleCard>

          {/* Parametric Maps */}
          <CollapsibleCard title="Mapas Paramétricos" defaultOpen={true}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div><label className={labelCls}>T1 Mio Pré (ms)</label><input type="number" step="0.1" className={inputCls} value={t1MioPre} onChange={e => setT1MioPre(e.target.value)} /></div>
              <div><label className={labelCls}>T1 Sangue Pré (ms)</label><input type="number" step="0.1" className={inputCls} value={t1SanguePre} onChange={e => setT1SanguePre(e.target.value)} /></div>
              <div><label className={labelCls}>T1 Mio Pós (ms)</label><input type="number" step="0.1" className={inputCls} value={t1MioPos} onChange={e => setT1MioPos(e.target.value)} /></div>
              <div><label className={labelCls}>T1 Sangue Pós (ms)</label><input type="number" step="0.1" className={inputCls} value={t1SanguePos} onChange={e => setT1SanguePos(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={labelCls}>Hematócrito (0-1)</label>
                <input type="number" step="0.01" className={inputCls} value={hematocrito} onChange={e => setHematocrito(e.target.value)} placeholder="ex: 0,42" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input type="checkbox" checked={usarHTSintetico} onChange={e => setUsarHTSintetico(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
                  <span className="text-sm font-medium text-[var(--text)]">Usar HT Sintético</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>T2 Nativo (ms)</label><input type="number" step="0.1" className={inputCls} value={t2Nativo} onChange={e => setT2Nativo(e.target.value)} /></div>
              <div><label className={labelCls}>T2* (ms)</label><input type="number" step="0.1" className={inputCls} value={t2Estrela} onChange={e => setT2Estrela(e.target.value)} /></div>
            </div>
          </CollapsibleCard>

          <CollapsibleCard title="Análise do Miocárdio" icon="🫀" defaultOpen={false}>
            <AnaliseMiocardio onTextChange={handleMiocardioChange} />
          </CollapsibleCard>

          {/* Perfusion */}
          <CollapsibleCard title="Perfusão" defaultOpen={false}>
            <div className="rounded-lg p-3 text-xs leading-relaxed border" style={{ backgroundColor: 'var(--bg2, var(--surface2))', borderColor: 'var(--border)', color: 'var(--text2)' }}>
              <span className="font-bold text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--accent)' }}>Texto gerado:</span>
              {textoPerfusao}
            </div>
            <p className="text-[11px] text-[var(--text3)] italic mt-2">* Estresse farmacológico controlado em &ldquo;Técnica do Exame&rdquo;</p>
          </CollapsibleCard>

          {/* Valves */}
          <CollapsibleCard title="Valvas" defaultOpen={false}>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>Insuficiência (refluxo)</label>
            <div className="space-y-2">
              {([
                { label: 'Aórtica', state: valvaAortica, setter: setValvaAortica },
                { label: 'Mitral', state: valvaMitral, setter: setValvaMitral },
                { label: 'Tricúspide', state: valvaTricuspide, setter: setValvaTricuspide },
                { label: 'Pulmonar', state: valvaPulmonar, setter: setValvaPulmonar },
              ] as { label: string; state: ValveState; setter: (v: ValveState) => void }[]).map(({ label, state, setter }) => (
                <div key={label} className="flex items-center gap-2 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer min-w-[120px]">
                    <input
                      type="checkbox"
                      checked={state.alterada}
                      onChange={e => setter({ ...state, alterada: e.target.checked, refluxo: e.target.checked ? 'discreto' : '' })}
                      className="w-4 h-4 accent-[var(--accent)]"
                    />
                    <span className="text-sm font-medium text-[var(--text)]">{label}</span>
                  </label>
                  {state.alterada && (
                    <div className="flex gap-1">
                      {['discreto', 'moderado', 'importante'].map(g => (
                        <button key={g} type="button"
                          onClick={() => setter({ ...state, refluxo: g })}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all"
                          style={state.refluxo === g
                            ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }
                            : { backgroundColor: 'transparent', borderColor: 'var(--border)', color: 'var(--text3)' }
                          }
                        >{g}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Estenose - expandable, always closed */}
            <details className="mt-4 border-t border-[var(--border)] pt-3">
              <summary className="text-xs font-semibold cursor-pointer hover:text-[var(--text2)] transition-colors" style={{ color: 'var(--text3)' }}>
                Estenose (raro)
              </summary>
              <div className="mt-2 space-y-2 pl-2 border-l-2 border-[var(--border)]">
                {([
                  { label: 'Aórtica', state: valvaAortica, setter: setValvaAortica },
                  { label: 'Mitral', state: valvaMitral, setter: setValvaMitral },
                  { label: 'Tricúspide', state: valvaTricuspide, setter: setValvaTricuspide },
                  { label: 'Pulmonar', state: valvaPulmonar, setter: setValvaPulmonar },
                ] as { label: string; state: ValveState; setter: (v: ValveState) => void }[]).map(({ label, state, setter }) => (
                  <div key={label} className="flex items-center gap-2 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer min-w-[120px]">
                      <input
                        type="checkbox"
                        checked={state.estenose}
                        onChange={e => setter({ ...state, estenose: e.target.checked, grauEstenose: e.target.checked ? 'leve' : '' })}
                        className="w-4 h-4 accent-[var(--accent)]"
                      />
                      <span className="text-sm font-medium text-[var(--text)]">{label}</span>
                    </label>
                    {state.estenose && (
                      <div className="flex gap-1">
                        {['leve', 'moderada', 'importante'].map(g => (
                          <button key={g} type="button"
                            onClick={() => setter({ ...state, grauEstenose: g })}
                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all"
                            style={state.grauEstenose === g
                              ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }
                              : { backgroundColor: 'transparent', borderColor: 'var(--border)', color: 'var(--text3)' }
                            }
                          >{g}</button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </details>

            <div className="mt-3 rounded-lg p-3 text-xs leading-relaxed border" style={{ backgroundColor: 'var(--bg2, var(--surface2))', borderColor: 'var(--border)', color: 'var(--text2)' }}>
              <span className="font-bold text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--accent)' }}>Texto gerado:</span>
              {textoValvas}
            </div>
          </CollapsibleCard>

          {/* Pericardium */}
          <CollapsibleCard title="Pericárdio" defaultOpen={false}>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pericardioNormal}
                  onChange={e => {
                    setPericardioNormal(e.target.checked)
                    if (e.target.checked) { setPericardioEspessamento(false); setPericardioDerrame(false) }
                  }}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <span className="text-sm font-medium text-[var(--text)]">Normal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pericardioEspessamento}
                  onChange={e => {
                    setPericardioEspessamento(e.target.checked)
                    if (e.target.checked) setPericardioNormal(false)
                  }}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <span className="text-sm font-medium text-[var(--text)]">Espessamento pericárdico</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pericardioDerrame}
                  onChange={e => {
                    setPericardioDerrame(e.target.checked)
                    if (e.target.checked) setPericardioNormal(false)
                  }}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <span className="text-sm font-medium text-[var(--text)]">Derrame pericárdico</span>
              </label>
            </div>
            <div className="mt-3 rounded-lg p-3 text-xs leading-relaxed border" style={{ backgroundColor: 'var(--bg2, var(--surface2))', borderColor: 'var(--border)', color: 'var(--text2)' }}>
              <span className="font-bold text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--accent)' }}>Texto gerado:</span>
              {textoPericardio}
            </div>
          </CollapsibleCard>

          {/* Aorta & Pulmonary Trunk */}
          <CollapsibleCard title="Aorta e Tronco Pulmonar" defaultOpen={false}>
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input type="checkbox" checked={aortaAlterada} onChange={e => setAortaAlterada(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
              <span className="text-sm font-medium text-[var(--text)]">Descrever diâmetros aórticos</span>
            </label>
            {aortaAlterada && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Bulbo (cm) <span className="text-[var(--text3)] font-normal">VN ≤ 4,0</span></label>
                    <input type="number" step="0.1" className={inputCls} value={aortaBulbo} onChange={e => setAortaBulbo(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Ascendente (cm) <span className="text-[var(--text3)] font-normal">VN ≤ 4,0</span></label>
                    <input type="number" step="0.1" className={inputCls} value={aortaAscendente} onChange={e => setAortaAscendente(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Crossa (cm) <span className="text-[var(--text3)] font-normal">VN ≤ 3,5</span></label>
                    <input type="number" step="0.1" className={inputCls} value={aortaCrossa} onChange={e => setAortaCrossa(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Descendente (cm) <span className="text-[var(--text3)] font-normal">VN ≤ 3,0</span></label>
                    <input type="number" step="0.1" className={inputCls} value={aortaDescendente} onChange={e => setAortaDescendente(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Tronco Pulmonar (cm) <span className="text-[var(--text3)] font-normal">VN ≤ 3,0</span></label>
                  <input type="number" step="0.1" className={inputCls} value={troncoPulmonar} onChange={e => setTroncoPulmonar(e.target.value)} />
                </div>
              </div>
            )}
            <div className="mt-3 rounded-lg p-3 text-xs leading-relaxed border whitespace-pre-line" style={{ backgroundColor: 'var(--bg2, var(--surface2))', borderColor: 'var(--border)', color: 'var(--text2)' }}>
              <span className="font-bold text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--accent)' }}>Texto gerado:</span>
              {textoAortaPulmonar}
            </div>
          </CollapsibleCard>
        </div>

        {/* ═══ RIGHT PANEL: Results ═══ */}
        <div className="bg-[var(--bg)] overflow-y-auto p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--text)]">Resultados</h2>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text3)]">
              <input type="checkbox" checked={arredondarABNT} onChange={e => setArredondarABNT(e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
              Arredondar ABNT
            </label>
          </div>

          {/* VE Results */}
          <CollapsibleCard title="VE - Ventrículo Esquerdo" defaultOpen={true}>
            <SectionTitle dot="bg-red-600" refSecao="VE">Ventrículo Esquerdo</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <ResultItem label="VDF" value={veResults?.edv ?? NaN} unit="ml" param="VE_EDV" tooltip="Volume Diastólico Final" checar />
              <ResultItem label="VDF Index" value={veResults?.edvI ?? NaN} unit="ml/m²" param="VE_EDV_INDEX" tooltip="VDF Indexado por ASC" checar />
              <ResultItem label="VSF" value={veResults?.esv ?? NaN} unit="ml" param="VE_ESV" tooltip="Volume Sistólico Final" checar />
              <ResultItem label="VSF Index" value={veResults?.esvI ?? NaN} unit="ml/m²" param="VE_ESV_INDEX" tooltip="VSF Indexado por ASC" checar />
              <ResultItem label="Fração de Ejeção" value={veResults?.ef ?? NaN} unit="%" param="VE_EF" tooltip="Fração de Ejeção (FEVE)" checar />
              <ResultItem label="Vol. Ejetado" value={veResults?.ve ?? NaN} unit="ml" tooltip="Volume Ejetado (VDF - VSF)" checar />
              <ResultItem label="Vol. Ejet. Index" value={veResults?.veI ?? NaN} unit="ml/m²" tooltip="Volume Ejetado Indexado" checar />
              <ResultItem label="Massa" value={veResults?.massa ?? NaN} unit="g" param="VE_MASSA" tooltip="Massa Miocárdica VE" checar />
              <ResultItem label="Massa Index" value={veResults?.massaI ?? NaN} unit="g/m²" param="VE_MASSA_INDEX" tooltip="Massa VE Indexada por ASC" checar />
            </div>
            {volumeDiff != null && volumeDiff > 15 && (
              <div className={`mt-3 text-sm font-bold font-mono ${volumeDiff > 30 ? 'text-[var(--red)]' : 'text-[var(--orange)]'}`}>
                Delta VE-VD: {fmt(volumeDiff)} ml {volumeDiff > 30 ? '> 30 ml!' : '> 15 ml'}
              </div>
            )}
          </CollapsibleCard>

          {/* VD Results */}
          <CollapsibleCard title="VD - Ventrículo Direito" defaultOpen={true}>
            <SectionTitle dot="bg-blue-600" refSecao="VD">Ventrículo Direito</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <ResultItem label="VDF" value={vdResults?.edv ?? NaN} unit="ml" param="VD_EDV" tooltip="Volume Diastólico Final VD" checar />
              <ResultItem label="VDF Index" value={vdResults?.edvI ?? NaN} unit="ml/m²" param="VD_EDV_INDEX" tooltip="VDF VD Indexado por ASC" checar />
              <ResultItem label="VSF" value={vdResults?.esv ?? NaN} unit="ml" param="VD_ESV" tooltip="Volume Sistólico Final VD" checar />
              <ResultItem label="VSF Index" value={vdResults?.esvI ?? NaN} unit="ml/m²" param="VD_ESV_INDEX" tooltip="VSF VD Indexado por ASC" checar />
              <ResultItem label="Fração de Ejeção" value={vdResults?.ef ?? NaN} unit="%" param="VD_EF" tooltip="Fração de Ejeção VD" checar />
              <ResultItem label="Vol. Ejetado" value={vdResults?.ve ?? NaN} unit="ml" tooltip="Volume Ejetado VD" checar />
              <ResultItem label="Vol. Ejet. Index" value={vdResults?.veI ?? NaN} unit="ml/m²" tooltip="Volume Ejetado VD Indexado" checar />
              {calcMassaVD && <ResultItem label="Massa" value={vdResults?.massa ?? NaN} unit="g" param="VD_MASSA" tooltip="Massa Miocárdica VD" checar />}
              {calcMassaVD && <ResultItem label="Massa Index" value={vdResults?.massaI ?? NaN} unit="g/m²" param="VD_MASSA_INDEX" tooltip="Massa VD Indexada por ASC" checar />}
            </div>
          </CollapsibleCard>

          {/* AE Results */}
          <CollapsibleCard title="AE - Átrio Esquerdo" defaultOpen={true}>
            <SectionTitle dot="bg-purple-600" refSecao="AE">Átrio Esquerdo</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <ResultItem label="Vol Index" value={aeResults.volI} unit="ml/m²" param="AE_VOL_INDEX" checar />
              <ResultItem label="Área 4CH Index" value={aeResults.area4chI} unit="cm²/m²" checar />
              <ResultItem label="Área 2CH Index" value={aeResults.area2chI} unit="cm²/m²" checar />
            </div>
          </CollapsibleCard>

          {/* AD Results */}
          <CollapsibleCard title="AD - Átrio Direito" defaultOpen={true}>
            <SectionTitle dot="bg-teal-600" refSecao="AD">Átrio Direito</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <ResultItem label="Área 4CH Index" value={adResults.area4chI} unit="cm²/m²" param="AD_AREA_4CH_INDEX" checar />
              <ResultItem label="Área 2CH Index" value={adResults.area2chI} unit="cm²/m²" checar />
            </div>
          </CollapsibleCard>

          {/* Parametric maps results */}
          <CollapsibleCard title="Mapas Paramétricos" defaultOpen={true}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div
                className="rounded-lg border border-[var(--border)] p-3"
                style={ecvClassif ? {
                  borderTopWidth: 3,
                  borderTopColor: classifStyles[ecvClassif].borderColor,
                  backgroundColor: isLight ? classifStyles[ecvClassif].bgLight : classifStyles[ecvClassif].bgDark,
                } : {
                  borderTopWidth: 3,
                  borderTopColor: 'var(--border)',
                  backgroundColor: 'var(--surface)',
                }}
              >
                {ecvClassif && (
                  <span
                    className="inline-block mb-1 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase text-white"
                    style={{ backgroundColor: classifStyles[ecvClassif].badgeBg }}
                  >
                    {ecvClassif === 'normal' ? 'Normal' : classifTexts(ecvClassif, 'aumentado')}
                  </span>
                )}
                <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text3)] mb-1">ECV</div>
                <span className="font-mono text-xl font-medium text-[var(--text)]">{!isNaN(ecvResults.ecv) ? fmt(ecvResults.ecv) : '-'}</span>
                <span className="text-xs text-[var(--text3)] ml-1">%</span>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3" style={{ borderTopWidth: 3, borderTopColor: 'var(--border)' }}>
                <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text3)] mb-1">HT Sintético</div>
                <span className="font-mono text-xl font-medium text-[var(--text)]">{ecvResults.htSint != null ? fmt(ecvResults.htSint, 2) : '-'}</span>
              </div>
            </div>
          </CollapsibleCard>

          {/* Report editor */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
              <h2 className="text-base font-bold text-[var(--text)]">Laudo Médico</h2>
              <div className="flex items-center gap-3">
                <select className={`${selectCls} text-xs py-1.5`} value={mascara} onChange={e => setMascara(e.target.value)}>
                  <option value="1">Máscara 1 - Completa</option>
                  <option value="2">Máscara 2 - Simplificada</option>
                  <option value="3">Máscara 3 - Incor</option>
                  {firestoreMasks.map(m => (
                    <option key={m.id} value={`fs:${m.id}`}>{m.nome}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button onClick={copiarLaudo} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-md text-[var(--text2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">Copiar</button>
                  <button onClick={() => { if (confirm('Limpar?') && laudoRef.current) laudoRef.current.innerHTML = '' }} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-md text-[var(--text2)] hover:border-[var(--red)] hover:text-[var(--red)] transition-colors">Limpar</button>
                  <button onClick={salvarLaudo} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-md text-[var(--text2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">Salvar</button>
                </div>
              </div>
            </div>
            <div
              ref={laudoRef}
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              className="w-full min-h-[580px] p-8 sm:px-12 sm:py-10 border border-[var(--border)] rounded-lg text-sm bg-white text-black text-justify outline-none cursor-text shadow-md focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10"
              style={{ fontFamily: 'Arial, sans-serif', fontSize: '12pt', lineHeight: 1.5 }}
              dangerouslySetInnerHTML={{ __html: laudoHtml }}
            />
          </div>
        </div>
      </div>

      {/* Reference modal */}
      {refModalContent}
    </div>
  )
}
