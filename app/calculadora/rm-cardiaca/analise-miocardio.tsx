'use client'

import { useState, useEffect } from 'react'

// ══════════════════════════════════════════════════════════
// AHA 17-Segment Model
// ══════════════════════════════════════════════════════════

const SEGMENT_NAMES: Record<number, string> = {
  1: 'anterior basal',
  2: 'anteroseptal basal',
  3: 'inferoseptal basal',
  4: 'inferior basal',
  5: 'inferolateral basal',
  6: 'anterolateral basal',
  7: 'anterior médio',
  8: 'anteroseptal médio',
  9: 'inferoseptal médio',
  10: 'inferior médio',
  11: 'inferolateral médio',
  12: 'anterolateral médio',
  13: 'anterior apical',
  14: 'septal apical',
  15: 'inferior apical',
  16: 'lateral apical',
  17: 'apex do ventrículo esquerdo',
}

const ALL_17 = new Set(Array.from({ length: 17 }, (_, i) => i + 1))

function listarSegmentos(segs: Set<number>): string {
  const sorted = Array.from(segs).sort((a, b) => a - b)
  if (sorted.length === 0) return ''
  if (sorted.length === 1) return `segmento ${SEGMENT_NAMES[sorted[0]]}`
  const names = sorted.map(s => SEGMENT_NAMES[s])
  const last = names.pop()!
  return `segmentos ${names.join(', ')} e ${last}`
}

// ══════════════════════════════════════════════════════════
// Disease Configuration
// ══════════════════════════════════════════════════════════

interface DiseaseOption {
  key: string
  tipo: 'toggle' | 'select' | 'number'
  label: string
  opcoes?: { value: string; label: string }[]
  defaultValue?: string | boolean | number
}

interface DiseaseConfig {
  id: string
  nome: string
  cor: string
  padroes: { value: string; label: string }[]
  usaBullseye: boolean
  temEdema: boolean
  temMassa: boolean
  temTerritorio: boolean
  territorios?: { value: string; label: string }[]
  isquemico: boolean
  sufixoTexto?: string // appended after segment list
  opcoes?: DiseaseOption[]
}

const DISEASE_CONFIGS: DiseaseConfig[] = [
  {
    id: 'miocardite',
    nome: 'Miocardite',
    cor: '#ef4444',
    padroes: [
      { value: 'subepicardico', label: 'Subepicárdico' },
      { value: 'mesocardico', label: 'Mesocárdico' },
      { value: 'mesosubepicardico', label: 'Meso/subepicárdico' },
      { value: 'transmural', label: 'Transmural' },
    ],
    usaBullseye: true,
    temEdema: true,
    temMassa: true,
    temTerritorio: false,
    isquemico: false,
    opcoes: [
      {
        key: 'intensidade', tipo: 'select', label: 'Intensidade',
        opcoes: [
          { value: 'tenues', label: 'Tênues' },
          { value: 'discretos', label: 'Discretos' },
          { value: 'extensos', label: 'Extensos' },
        ],
        defaultValue: 'discretos',
      },
      {
        key: 'fase', tipo: 'select', label: 'Fase',
        opcoes: [
          { value: 'aguda', label: 'Aguda' },
          { value: 'cronica', label: 'Crônica' },
          { value: 'indeterminada', label: 'Indeterminada' },
        ],
        defaultValue: 'aguda',
      },
    ],
  },
  {
    id: 'infarto',
    nome: 'Infarto / Isquemia',
    cor: '#f59e0b',
    padroes: [
      { value: 'subendocardico', label: 'Subendocárdico' },
      { value: 'transmural', label: 'Transmural' },
    ],
    usaBullseye: true,
    temEdema: false,
    temMassa: true,
    temTerritorio: true,
    territorios: [
      { value: 'DA', label: 'DA (Descendente Anterior)' },
      { value: 'Cx', label: 'Cx (Circunflexa)' },
      { value: 'CD', label: 'CD (Coronária Direita)' },
    ],
    isquemico: true,
    opcoes: [
      {
        key: 'viabilidade', tipo: 'select', label: 'Viabilidade',
        opcoes: [
          { value: 'com', label: 'Com viabilidade' },
          { value: 'sem', label: 'Sem viabilidade' },
        ],
        defaultValue: 'com',
      },
      {
        key: 'contratilidade', tipo: 'select', label: 'Contratilidade',
        opcoes: [
          { value: 'acinesia', label: 'Acinesia' },
          { value: 'hipocinesia', label: 'Hipocinesia' },
        ],
        defaultValue: 'acinesia',
      },
      { key: 'afilamento', tipo: 'toggle', label: 'Afilamento parietal', defaultValue: false },
    ],
  },
  {
    id: 'amiloidose',
    nome: 'Amiloidose',
    cor: '#8b5cf6',
    padroes: [
      { value: 'difuso_subendocardico', label: 'Difuso subendocárdico' },
      { value: 'difuso_transmural', label: 'Difuso transmural' },
    ],
    usaBullseye: false,
    temEdema: false,
    temMassa: false,
    temTerritorio: false,
    isquemico: false,
    opcoes: [
      { key: 'ti_alterado', tipo: 'toggle', label: 'Alteração TI Scout', defaultValue: false },
      { key: 'disfuncao_diastolica', tipo: 'toggle', label: 'Disfunção diastólica', defaultValue: false },
    ],
  },
  {
    id: 'hcm',
    nome: 'Cardiomiopatia Hipertrófica',
    cor: '#06b6d4',
    padroes: [
      { value: 'mesocardico', label: 'Mesocárdico' },
      { value: 'transmural', label: 'Transmural' },
    ],
    usaBullseye: true,
    temEdema: false,
    temMassa: true,
    temTerritorio: false,
    isquemico: false,
    sufixoTexto: ', compatível com fibrose em contexto de cardiomiopatia hipertrófica',
    opcoes: [
      {
        key: 'tipo_hcm', tipo: 'select', label: 'Tipo',
        opcoes: [
          { value: 'assimetrica_septal', label: 'Assimétrica septal' },
          { value: 'apical', label: 'Apical (Yamaguchi)' },
          { value: 'concentrica', label: 'Concêntrica' },
        ],
        defaultValue: 'assimetrica_septal',
      },
      { key: 'obstrucao_vsve', tipo: 'toggle', label: 'Obstrução da VSVE', defaultValue: false },
      { key: 'sam', tipo: 'toggle', label: 'SAM', defaultValue: false },
      { key: 'espessura_max', tipo: 'number', label: 'Espessura máxima (cm)' },
    ],
  },
  {
    id: 'sarcoidose',
    nome: 'Sarcoidose',
    cor: '#10b981',
    padroes: [
      { value: 'subepicardico', label: 'Subepicárdico' },
      { value: 'mesocardico', label: 'Mesocárdico' },
      { value: 'transmural', label: 'Transmural' },
      { value: 'multifocal', label: 'Multifocal' },
    ],
    usaBullseye: true,
    temEdema: false,
    temMassa: true,
    temTerritorio: false,
    isquemico: false,
    sufixoTexto: ', compatível com acometimento por sarcoidose',
    opcoes: [
      { key: 'dist_conducao', tipo: 'toggle', label: 'Distúrbio de condução', defaultValue: false },
      { key: 'deposito_gordura', tipo: 'toggle', label: 'Depósito gorduroso', defaultValue: false },
    ],
  },
  {
    id: 'stress_positivo',
    nome: 'Stress Positivo',
    cor: '#ec4899',
    padroes: [
      { value: 'isquemia', label: 'Isquemia' },
    ],
    usaBullseye: true,
    temEdema: false,
    temMassa: false,
    temTerritorio: true,
    territorios: [
      { value: 'DA', label: 'DA (Descendente Anterior)' },
      { value: 'Cx', label: 'Cx (Circunflexa)' },
      { value: 'CD', label: 'CD (Coronária Direita)' },
    ],
    isquemico: true,
    opcoes: [
      { key: 'carga_isquemica', tipo: 'number', label: 'Carga isquêmica (%)' },
    ],
  },
]

// ══════════════════════════════════════════════════════════
// Disease Instance State
// ══════════════════════════════════════════════════════════

interface DiseaseInstance {
  instanceId: number
  diseaseId: string
  // segments per pattern (mutual exclusion within the instance)
  segmentosPorPadrao: Record<string, Set<number>>
  edema: boolean
  massa: string
  massaPct: string
  territorio: string
  padrao: string // for diseases without bullseye (e.g. amiloidose)
  extras: Record<string, string | boolean | number>
}

function createInstance(diseaseId: string, nextId: number): DiseaseInstance {
  const cfg = DISEASE_CONFIGS.find(c => c.id === diseaseId)!
  const segmentosPorPadrao: Record<string, Set<number>> = {}
  if (cfg.usaBullseye) {
    for (const p of cfg.padroes) {
      segmentosPorPadrao[p.value] = new Set<number>()
    }
  }
  const extras: Record<string, string | boolean | number> = {}
  if (cfg.opcoes) {
    for (const opt of cfg.opcoes) {
      if (opt.defaultValue !== undefined) {
        extras[opt.key] = opt.defaultValue
      } else if (opt.tipo === 'toggle') {
        extras[opt.key] = false
      } else if (opt.tipo === 'number') {
        extras[opt.key] = ''
      } else if (opt.tipo === 'select' && opt.opcoes?.length) {
        extras[opt.key] = opt.opcoes[0].value
      }
    }
  }

  return {
    instanceId: nextId,
    diseaseId,
    segmentosPorPadrao,
    edema: false,
    massa: '',
    massaPct: '',
    territorio: cfg.territorios?.[0]?.value || '',
    padrao: cfg.padroes[0]?.value || '',
    extras,
  }
}

// ══════════════════════════════════════════════════════════
// Text Generation
// ══════════════════════════════════════════════════════════

const PADRAO_LABELS: Record<string, string> = {
  subepicardico: 'subepicárdico',
  mesocardico: 'mesocárdico',
  mesosubepicardico: 'meso/subepicárdico',
  transmural: 'transmural',
  subendocardico: 'subendocárdico',
  difuso_subendocardico: 'difuso subendocárdico',
  difuso_transmural: 'transmural difuso',
  multifocal: 'multifocal',
  isquemia: 'isquemia',
}

const TERRITORIO_LABELS: Record<string, string> = {
  DA: 'descendente anterior',
  Cx: 'circunflexa',
  CD: 'coronária direita',
}

function gerarTextoInstancia(inst: DiseaseInstance): string {
  const cfg = DISEASE_CONFIGS.find(c => c.id === inst.diseaseId)!
  const ex = inst.extras || {}

  // Amiloidose: no bullseye, just pattern
  if (!cfg.usaBullseye) {
    const padrao = PADRAO_LABELS[inst.padrao] || inst.padrao
    if (cfg.id === 'amiloidose') {
      const parts = [`Realce tardio ${padrao} sugestivo de depósito amiloide`]
      if (ex.ti_alterado) parts.push('Alteração do TI Scout sugestiva de depósito amiloide')
      if (ex.disfuncao_diastolica) parts.push('Sinais de disfunção diastólica')
      return parts.join('. ') + ';'
    }
    return ''
  }

  // Collect patterns that have segments
  const padroesAtivos = cfg.padroes
    .map(p => ({ value: p.value, label: PADRAO_LABELS[p.value] || p.value, segs: inst.segmentosPorPadrao[p.value] }))
    .filter(p => p.segs && p.segs.size > 0)

  if (padroesAtivos.length === 0) return ''

  // Stress Positivo: special text
  if (cfg.id === 'stress_positivo') {
    const allSegs = new Set<number>()
    for (const p of padroesAtivos) for (const s of p.segs) allSegs.add(s)
    const carga = ex.carga_isquemica ? String(ex.carga_isquemica) : '?'
    let texto = `Sinais de isquemia induzida por estresse nos ${listarSegmentos(allSegs)}`
    if (cfg.temTerritorio && inst.territorio) {
      texto += `, em território da artéria ${TERRITORIO_LABELS[inst.territorio] || inst.territorio}`
    }
    texto += `. Carga isquêmica estimada em ${carga}%.`
    return texto
  }

  const tipoStr = cfg.isquemico ? 'padrão isquêmico' : 'padrão não isquêmico'

  // Helper massa
  const massaParts: string[] = []
  if (inst.massa) massaParts.push(`massa de realce tardio estimada em ${inst.massa} g`)
  if (inst.massaPct) massaParts.push(`correspondendo a ${inst.massaPct}% da massa do VE`)
  const massaSuffix = massaParts.length > 0 ? `, ${massaParts.join(', ')}` : ''

  let texto: string

  // Infarto: include contratilidade and afilamento
  if (cfg.id === 'infarto') {
    const allSegs = new Set<number>()
    for (const p of padroesAtivos) for (const s of p.segs) allSegs.add(s)
    const contrat = ex.contratilidade === 'hipocinesia' ? 'hipocinesia' : 'acinesia'
    const afilamento = ex.afilamento ? 'Afilamento parietal, ' : ''
    if (padroesAtivos.length === 1) {
      const p = padroesAtivos[0]
      texto = `${afilamento}${contrat.charAt(0).toUpperCase() + contrat.slice(1)} e realce tardio ${p.label} (${tipoStr}) nos ${listarSegmentos(p.segs)}`
    } else {
      const partes = padroesAtivos.map(p => `${p.label} nos ${listarSegmentos(p.segs)}`)
      const last = partes.pop()!
      texto = `${afilamento}${contrat.charAt(0).toUpperCase() + contrat.slice(1)} e realce tardio (${tipoStr}): ${partes.join(', ')}, e ${last}`
    }
  } else if (cfg.id === 'miocardite') {
    // Miocardite: include intensidade
    const intensidadeMap: Record<string, string> = { tenues: 'Tênues', discretos: 'Discretos', extensos: 'Extensos' }
    const intLabel = intensidadeMap[String(ex.intensidade)] || 'Discretos'
    if (padroesAtivos.length === 1) {
      const p = padroesAtivos[0]
      texto = `${intLabel} focos de realce tardio ${p.label} (${tipoStr}) nos ${listarSegmentos(p.segs)}`
    } else {
      const partes = padroesAtivos.map(p => `${p.label} nos ${listarSegmentos(p.segs)}`)
      const last = partes.pop()!
      texto = `${intLabel} focos de realce tardio (${tipoStr}): ${partes.join(', ')}, e ${last}`
    }
  } else if (cfg.id === 'hcm') {
    // HCM: include tipo, espessura máxima, obstrução VSVE, SAM
    const tipoHcmMap: Record<string, string> = {
      assimetrica_septal: 'assimétrica septal',
      apical: 'apical (Yamaguchi)',
      concentrica: 'concêntrica',
    }
    const tipoHcm = tipoHcmMap[String(ex.tipo_hcm)] || 'assimétrica septal'
    const hcmParts: string[] = []
    if (ex.espessura_max) hcmParts.push(`espessura máxima de ${ex.espessura_max} cm`)
    if (ex.obstrucao_vsve) hcmParts.push('obstrução da VSVE')
    if (ex.sam) hcmParts.push('SAM (movimento anterior sistólico)')
    const hcmExtra = hcmParts.length > 0 ? `. ${hcmParts.join('. ')}.` : ''

    if (padroesAtivos.length === 1) {
      const p = padroesAtivos[0]
      texto = `Hipertrofia ${tipoHcm} com realce tardio ${p.label} (${tipoStr}) nos ${listarSegmentos(p.segs)}`
    } else {
      const partes = padroesAtivos.map(p => `${p.label} nos ${listarSegmentos(p.segs)}`)
      const last = partes.pop()!
      texto = `Hipertrofia ${tipoHcm} com realce tardio (${tipoStr}): ${partes.join(', ')}, e ${last}`
    }
    texto += hcmExtra
  } else if (cfg.id === 'sarcoidose') {
    // Sarcoidose: include distúrbio de condução and depósito gorduroso
    if (padroesAtivos.length === 1) {
      const p = padroesAtivos[0]
      texto = `Foco de realce tardio ${p.label} (${tipoStr}) nos ${listarSegmentos(p.segs)}`
    } else {
      const partes = padroesAtivos.map(p => `${p.label} nos ${listarSegmentos(p.segs)}`)
      const last = partes.pop()!
      texto = `Focos de realce tardio (${tipoStr}): ${partes.join(', ')}, e ${last}`
    }
    const sarcParts: string[] = []
    if (ex.dist_conducao) sarcParts.push('Distúrbio de condução associado')
    if (ex.deposito_gordura) sarcParts.push('Depósito gorduroso miocárdico')
    if (sarcParts.length > 0) texto += `. ${sarcParts.join('. ')}`
  } else {
    // Generic (fallback)
    if (padroesAtivos.length === 1) {
      const p = padroesAtivos[0]
      texto = `Foco de realce tardio ${p.label} (${tipoStr}) nos ${listarSegmentos(p.segs)}`
    } else {
      const partes = padroesAtivos.map(p => `${p.label} nos ${listarSegmentos(p.segs)}`)
      const last = partes.pop()!
      texto = `Focos de realce tardio (${tipoStr}): ${partes.join(', ')}, e ${last}`
    }
  }

  // Território (infarto)
  if (cfg.temTerritorio && inst.territorio) {
    texto += `, em território da artéria ${TERRITORIO_LABELS[inst.territorio] || inst.territorio}`
  }

  // Sufixo da doença
  if (cfg.sufixoTexto) {
    texto += cfg.sufixoTexto
  }

  // Edema
  if (cfg.temEdema) {
    texto += inst.edema ? ', com edema associado' : ', sem edema associado'
  }

  // Massa
  texto += massaSuffix

  return texto + ';'
}

// ══════════════════════════════════════════════════════════
// Conclusion Generation
// ══════════════════════════════════════════════════════════

function gerarConclusaoInstancia(inst: DiseaseInstance): string {
  const cfg = DISEASE_CONFIGS.find(c => c.id === inst.diseaseId)!
  const ex = inst.extras || {}

  // Get all selected segments across patterns
  const allSegs = new Set<number>()
  if (cfg.usaBullseye) {
    for (const segs of Object.values(inst.segmentosPorPadrao)) {
      for (const s of segs) allSegs.add(s)
    }
  }

  switch (cfg.id) {
    case 'infarto': {
      if (!cfg.usaBullseye || allSegs.size === 0) return ''
      const viab = ex.viabilidade === 'sem' ? 'sem' : 'com'
      const massaPct = inst.massaPct ? ` Envolvimento estimado em ${inst.massaPct}%.` : ''
      return `Sinais de infarto pregresso do miocárdio ${viab} viabilidade nos ${listarSegmentos(allSegs)}.${massaPct}`
    }
    case 'miocardite': {
      if (!cfg.usaBullseye || allSegs.size === 0) return ''
      const fase = String(ex.fase || 'aguda')
      if (fase === 'aguda') return 'Alterações compatíveis com miocardite aguda.'
      return 'Alterações que comportam miocardite nos diferenciais.'
    }
    case 'amiloidose': {
      return 'Os achados comportam nos diferenciais a possibilidade de amiloidose cardíaca.'
    }
    case 'hcm': {
      const tipoHcmMap: Record<string, string> = {
        assimetrica_septal: 'assimétrica septal',
        apical: 'apical (Yamaguchi)',
        concentrica: 'concêntrica',
      }
      const tipoHcm = tipoHcmMap[String(ex.tipo_hcm)] || 'assimétrica septal'
      const vsve = ex.obstrucao_vsve ? 'com' : 'sem'
      return `Cardiomiopatia hipertrófica ${tipoHcm}, ${vsve} estenose da VSVE.`
    }
    case 'sarcoidose': {
      return 'O diagnóstico diferencial inclui sarcoidose.'
    }
    case 'stress_positivo': {
      if (allSegs.size === 0) return ''
      const carga = ex.carga_isquemica ? String(ex.carga_isquemica) : '?'
      return `Perfusão com sinais de isquemia nos ${listarSegmentos(allSegs)}. Carga isquêmica ${carga}%.`
    }
    default:
      return ''
  }
}

// ══════════════════════════════════════════════════════════
// Bullseye SVG — Geometry helpers
// ══════════════════════════════════════════════════════════

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, rO: number, rI: number, s: number, e: number) {
  const p1 = polar(cx, cy, rO, s)
  const p2 = polar(cx, cy, rO, e)
  const p3 = polar(cx, cy, rI, e)
  const p4 = polar(cx, cy, rI, s)
  const la = (e - s) > 180 ? 1 : 0
  return `M${p1.x.toFixed(1)},${p1.y.toFixed(1)} A${rO},${rO} 0 ${la} 1 ${p2.x.toFixed(1)},${p2.y.toFixed(1)} L${p3.x.toFixed(1)},${p3.y.toFixed(1)} A${rI},${rI} 0 ${la} 0 ${p4.x.toFixed(1)},${p4.y.toFixed(1)}Z`
}

function midPt(cx: number, cy: number, rO: number, rI: number, s: number, e: number) {
  return polar(cx, cy, (rO + rI) / 2, (s + e) / 2)
}

const BS = 200
const BCX = BS / 2, BCY = BS / 2
const R1 = 92, R2 = 69, R3 = 48, R4 = 26

// Label positions (midpoint of each full segment arc)
const SEG_LABELS: { id: number; lbl: { x: number; y: number } }[] = [
  { id: 1, lbl: midPt(BCX, BCY, R1, R2, -30, 30) },
  { id: 6, lbl: midPt(BCX, BCY, R1, R2, 30, 90) },
  { id: 5, lbl: midPt(BCX, BCY, R1, R2, 90, 150) },
  { id: 4, lbl: midPt(BCX, BCY, R1, R2, 150, 210) },
  { id: 3, lbl: midPt(BCX, BCY, R1, R2, 210, 270) },
  { id: 2, lbl: midPt(BCX, BCY, R1, R2, 270, 330) },
  { id: 7, lbl: midPt(BCX, BCY, R2, R3, -30, 30) },
  { id: 12, lbl: midPt(BCX, BCY, R2, R3, 30, 90) },
  { id: 11, lbl: midPt(BCX, BCY, R2, R3, 90, 150) },
  { id: 10, lbl: midPt(BCX, BCY, R2, R3, 150, 210) },
  { id: 9, lbl: midPt(BCX, BCY, R2, R3, 210, 270) },
  { id: 8, lbl: midPt(BCX, BCY, R2, R3, 270, 330) },
  { id: 13, lbl: midPt(BCX, BCY, R3, R4, -45, 45) },
  { id: 16, lbl: midPt(BCX, BCY, R3, R4, 45, 135) },
  { id: 15, lbl: midPt(BCX, BCY, R3, R4, 135, 225) },
  { id: 14, lbl: midPt(BCX, BCY, R3, R4, 225, 315) },
]

// ══════════════════════════════════════════════════════════
// Layered Bullseye — wall sub-layers per pattern
// ══════════════════════════════════════════════════════════

type SubLayer = 'subepi' | 'meso' | 'subendo'

// Which sub-layers of the wall each pattern fills
const PATTERN_LAYERS: Record<string, SubLayer[]> = {
  subepicardico: ['subepi'],
  mesocardico: ['meso'],
  mesosubepicardico: ['subepi', 'meso'],
  transmural: ['subepi', 'meso', 'subendo'],
  subendocardico: ['subendo'],
  isquemia: ['subepi', 'meso', 'subendo'],
  difuso_subendocardico: ['subendo'],
  difuso_transmural: ['subepi', 'meso', 'subendo'],
  multifocal: ['subepi', 'meso', 'subendo'],
}

// Split a ring (rOuter → rInner) into 3 equal sub-layers
function splitRing(rO: number, rI: number) {
  const t = (rO - rI) / 3
  return {
    subepi:  { rO, rI: rO - t },
    meso:    { rO: rO - t, rI: rO - 2 * t },
    subendo: { rO: rO - 2 * t, rI },
  }
}

const SUB_BASAL  = splitRing(R1, R2)
const SUB_MID    = splitRing(R2, R3)
const SUB_APICAL = splitRing(R3, R4)
const SUB_APEX   = splitRing(R4, 0)

// Segment → ring sub-layers
const SEG_SUB: Record<number, Record<SubLayer, { rO: number; rI: number }>> = {}
for (let i = 1; i <= 6; i++) SEG_SUB[i] = SUB_BASAL
for (let i = 7; i <= 12; i++) SEG_SUB[i] = SUB_MID
for (let i = 13; i <= 16; i++) SEG_SUB[i] = SUB_APICAL
SEG_SUB[17] = SUB_APEX

// Segment angle ranges
const SEG_ANGLES: Record<number, { s: number; e: number }> = {
  1: { s: -30, e: 30 },  2: { s: 270, e: 330 }, 3: { s: 210, e: 270 },
  4: { s: 150, e: 210 }, 5: { s: 90, e: 150 },  6: { s: 30, e: 90 },
  7: { s: -30, e: 30 },  8: { s: 270, e: 330 }, 9: { s: 210, e: 270 },
  10: { s: 150, e: 210 }, 11: { s: 90, e: 150 }, 12: { s: 30, e: 90 },
  13: { s: -45, e: 45 }, 14: { s: 225, e: 315 }, 15: { s: 135, e: 225 },
  16: { s: 45, e: 135 },
}

// Pre-compute all sublayer arc paths (segments 1-16)
const SUB_ARC_PATHS: { segId: number; layer: SubLayer; d: string }[] = []
const LAYERS: SubLayer[] = ['subepi', 'meso', 'subendo']
for (const segId of Object.keys(SEG_ANGLES).map(Number)) {
  const ang = SEG_ANGLES[segId]
  const sub = SEG_SUB[segId]
  for (const layer of LAYERS) {
    const { rO, rI } = sub[layer]
    SUB_ARC_PATHS.push({ segId, layer, d: arcPath(BCX, BCY, rO, rI, ang.s, ang.e) })
  }
}

// Pre-compute radial divider lines between segments
const RADIAL_LINES = [
  // Basal + Mid share same angles → lines from R3 to R1
  ...[-30, 30, 90, 150, 210, 270].map(a => {
    const p1 = polar(BCX, BCY, R3, a), p2 = polar(BCX, BCY, R1, a)
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }
  }),
  // Apical → lines from R4 to R3
  ...[-45, 45, 135, 225].map(a => {
    const p1 = polar(BCX, BCY, R4, a), p2 = polar(BCX, BCY, R3, a)
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }
  }),
]

const ENH_COLOR = '#1a1a1a' // black for late enhancement

function CycleBullseye({ segmentosPorPadrao, onCycleSeg, compact }: {
  segmentosPorPadrao: Record<string, Set<number>>
  onCycleSeg: (seg: number) => void
  compact?: boolean
}) {
  const fontSize = compact ? 9 : 11

  // Map each segment to its current pattern
  const segPattern = new Map<number, string>()
  for (const [padrao, segs] of Object.entries(segmentosPorPadrao)) {
    for (const seg of segs) segPattern.set(seg, padrao)
  }

  return (
    <svg viewBox={`0 0 ${BS} ${BS}`} className={compact ? 'w-full' : 'w-full max-w-[280px] mx-auto'}>
      {/* Sub-layer arcs — segments 1-16 */}
      {SUB_ARC_PATHS.map(slp => {
        const pat = segPattern.get(slp.segId)
        const active = pat ? new Set(PATTERN_LAYERS[pat] || []) : new Set<SubLayer>()
        const on = active.has(slp.layer)
        return (
          <path key={`${slp.segId}-${slp.layer}`} d={slp.d}
            fill={on ? ENH_COLOR : 'rgba(128,128,128,0.06)'}
            stroke="rgba(128,128,128,0.15)" strokeWidth={0.5}
            onClick={() => onCycleSeg(slp.segId)}
            style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
          />
        )
      })}

      {/* Apex sub-layers — segment 17 */}
      {LAYERS.map(layer => {
        const { rO, rI } = SUB_APEX[layer]
        const pat = segPattern.get(17)
        const active = pat ? new Set(PATTERN_LAYERS[pat] || []) : new Set<SubLayer>()
        const on = active.has(layer)
        const fill = on ? ENH_COLOR : 'rgba(128,128,128,0.06)'
        if (rI < 0.1) {
          return <circle key={`17-${layer}`} cx={BCX} cy={BCY} r={rO}
            fill={fill} stroke="rgba(128,128,128,0.15)" strokeWidth={0.5}
            onClick={() => onCycleSeg(17)} style={{ cursor: 'pointer', transition: 'fill 0.15s' }} />
        }
        const d = `M${(BCX-rO).toFixed(1)},${BCY} A${rO.toFixed(1)},${rO.toFixed(1)} 0 1 1 ${(BCX+rO).toFixed(1)},${BCY} A${rO.toFixed(1)},${rO.toFixed(1)} 0 1 1 ${(BCX-rO).toFixed(1)},${BCY} ` +
                  `M${(BCX-rI).toFixed(1)},${BCY} A${rI.toFixed(1)},${rI.toFixed(1)} 0 1 0 ${(BCX+rI).toFixed(1)},${BCY} A${rI.toFixed(1)},${rI.toFixed(1)} 0 1 0 ${(BCX-rI).toFixed(1)},${BCY}`
        return <path key={`17-${layer}`} d={d} fill={fill} fillRule="evenodd"
          stroke="rgba(128,128,128,0.15)" strokeWidth={0.5}
          onClick={() => onCycleSeg(17)} style={{ cursor: 'pointer', transition: 'fill 0.15s' }} />
      })}

      {/* Ring borders — thick */}
      {[R1, R2, R3, R4].map(r => (
        <circle key={`ring-${r}`} cx={BCX} cy={BCY} r={r}
          fill="none" stroke="rgba(60,60,60,0.5)" strokeWidth={1.8}
          style={{ pointerEvents: 'none' }} />
      ))}

      {/* Radial segment dividers — thick */}
      {RADIAL_LINES.map((l, i) => (
        <line key={`rad-${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="rgba(60,60,60,0.5)" strokeWidth={1.8}
          style={{ pointerEvents: 'none' }} />
      ))}

      {/* Segment number labels */}
      {SEG_LABELS.map(seg => {
        const pat = segPattern.get(seg.id)
        const hasMeso = pat && (PATTERN_LAYERS[pat] || []).includes('meso')
        return (
          <text key={`l${seg.id}`} x={seg.lbl.x} y={seg.lbl.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={fontSize} fontWeight="bold"
            fill={hasMeso ? '#fff' : 'var(--text, #333)'}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >{seg.id}</text>
        )
      })}
      <text x={BCX} y={BCY} textAnchor="middle" dominantBaseline="central"
        fontSize={fontSize} fontWeight="bold"
        fill={segPattern.has(17) && (PATTERN_LAYERS[segPattern.get(17)!] || []).includes('meso') ? '#fff' : 'var(--text, #333)'}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >17</text>
    </svg>
  )
}

// ══════════════════════════════════════════════════════════
// Disease Card with Multiple Bullseyes
// ══════════════════════════════════════════════════════════

function DiseaseCard({ config, instance, onUpdate, onRemove }: {
  config: DiseaseConfig
  instance: DiseaseInstance
  onUpdate: (updates: Partial<DiseaseInstance>) => void
  onRemove: () => void
}) {
  const texto = gerarTextoInstancia(instance)
  const conclusao = gerarConclusaoInstancia(instance)

  const updateExtra = (key: string, value: string | boolean | number) => {
    onUpdate({ extras: { ...instance.extras, [key]: value } })
  }

  // Cycle a segment through patterns: click advances to next pattern, last click clears
  const cycleSeg = (seg: number) => {
    const updated = { ...instance.segmentosPorPadrao }
    for (const k of Object.keys(updated)) updated[k] = new Set(updated[k])

    // Find which pattern this segment is currently in
    let currentIdx = -1
    for (let i = 0; i < config.padroes.length; i++) {
      if (updated[config.padroes[i].value]?.has(seg)) {
        currentIdx = i
        break
      }
    }

    // Remove from current pattern
    if (currentIdx >= 0) updated[config.padroes[currentIdx].value].delete(seg)

    // Add to next pattern (or clear if past last)
    const nextIdx = currentIdx + 1
    if (nextIdx < config.padroes.length) {
      updated[config.padroes[nextIdx].value].add(seg)
    }

    onUpdate({ segmentosPorPadrao: updated })
  }

  const clearAll = () => {
    const updated = { ...instance.segmentosPorPadrao }
    for (const k of Object.keys(updated)) updated[k] = new Set<number>()
    onUpdate({ segmentosPorPadrao: updated })
  }

  const selectAllMax = () => {
    const updated = { ...instance.segmentosPorPadrao }
    const lastPadrao = config.padroes[config.padroes.length - 1].value
    for (const k of Object.keys(updated)) {
      updated[k] = k === lastPadrao ? new Set(ALL_17) : new Set<number>()
    }
    onUpdate({ segmentosPorPadrao: updated })
  }

  const totalSegs = Object.values(instance.segmentosPorPadrao).reduce((sum, s) => sum + s.size, 0)

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: config.cor + '55', backgroundColor: 'var(--surface)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: config.cor + '11' }}>
        <span className="font-bold text-sm" style={{ color: config.cor }}>{config.nome}</span>
        <button type="button" onClick={onRemove}
          className="text-xs px-2 py-1 rounded border transition-colors hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}
        >Remover</button>
      </div>

      <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: config.cor + '22' }}>
        {/* Single bullseye — click cycles through patterns */}
        {config.usaBullseye && (
          <div className="pt-3">
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>
              Segmentos ({totalSegs}/17) — clique para alternar padrão
            </label>
            <CycleBullseye
              segmentosPorPadrao={instance.segmentosPorPadrao}
              onCycleSeg={cycleSeg}
            />
            {/* Legend */}
            <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
              {config.padroes.map(p => {
                const count = instance.segmentosPorPadrao[p.value]?.size || 0
                return (
                  <span key={p.value} className="text-[10px] px-2 py-0.5 rounded border"
                    style={{
                      borderColor: count > 0 ? config.cor : 'var(--border)',
                      color: count > 0 ? config.cor : 'var(--text3)',
                      backgroundColor: count > 0 ? config.cor + '0A' : 'transparent',
                    }}
                  >{p.label} ({count})</span>
                )
              })}
            </div>
            <div className="flex justify-center gap-2 mt-2">
              <button type="button" onClick={selectAllMax}
                className="text-[10px] px-3 py-1 rounded border"
                style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}
              >Todos</button>
              <button type="button" onClick={clearAll}
                className="text-[10px] px-3 py-1 rounded border"
                style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}
              >Limpar</button>
            </div>
          </div>
        )}

        {/* Pattern selector for non-bullseye diseases (amiloidose) */}
        {!config.usaBullseye && (
          <div className="pt-3">
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>Padrão</label>
            <div className="flex flex-wrap gap-1.5">
              {config.padroes.map(p => (
                <button key={p.value} type="button"
                  onClick={() => onUpdate({ padrao: p.value })}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                  style={instance.padrao === p.value
                    ? { backgroundColor: config.cor + '22', borderColor: config.cor, color: config.cor }
                    : { backgroundColor: 'transparent', borderColor: 'var(--border)', color: 'var(--text3)' }
                  }
                >{p.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Território (infarto) */}
        {config.temTerritorio && config.territorios && (
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>Território</label>
            <div className="flex flex-wrap gap-1.5">
              {config.territorios.map(t => (
                <button key={t.value} type="button"
                  onClick={() => onUpdate({ territorio: t.value })}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                  style={instance.territorio === t.value
                    ? { backgroundColor: config.cor + '22', borderColor: config.cor, color: config.cor }
                    : { backgroundColor: 'transparent', borderColor: 'var(--border)', color: 'var(--text3)' }
                  }
                >{t.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* Edema */}
        {config.temEdema && (
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>Edema</label>
            <div className="flex gap-1.5">
              {[false, true].map(val => (
                <button key={String(val)} type="button"
                  onClick={() => onUpdate({ edema: val })}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                  style={instance.edema === val
                    ? { backgroundColor: config.cor + '22', borderColor: config.cor, color: config.cor }
                    : { backgroundColor: 'transparent', borderColor: 'var(--border)', color: 'var(--text3)' }
                  }
                >{val ? 'Com edema' : 'Sem edema'}</button>
              ))}
            </div>
          </div>
        )}

        {/* Massa */}
        {config.temMassa && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text3)' }}>Massa (g)</label>
              <input type="number" step="0.1" value={instance.massa}
                onChange={e => onUpdate({ massa: e.target.value })}
                placeholder="—"
                className="w-full px-3 py-1.5 rounded-lg text-sm border font-mono"
                style={{ backgroundColor: 'var(--bg2, var(--surface2))', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text3)' }}>% da Massa VE</label>
              <input type="number" step="0.1" value={instance.massaPct}
                onChange={e => onUpdate({ massaPct: e.target.value })}
                placeholder="—"
                className="w-full px-3 py-1.5 rounded-lg text-sm border font-mono"
                style={{ backgroundColor: 'var(--bg2, var(--surface2))', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
          </div>
        )}

        {/* Disease-specific options */}
        {config.opcoes && config.opcoes.length > 0 && (
          <div className="space-y-3">
            {config.opcoes.map(opt => {
              if (opt.tipo === 'select' && opt.opcoes) {
                return (
                  <div key={opt.key}>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>{opt.label}</label>
                    <div className="flex flex-wrap gap-1.5">
                      {opt.opcoes.map(o => (
                        <button key={o.value} type="button"
                          onClick={() => updateExtra(opt.key, o.value)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                          style={instance.extras[opt.key] === o.value
                            ? { backgroundColor: config.cor + '22', borderColor: config.cor, color: config.cor }
                            : { backgroundColor: 'transparent', borderColor: 'var(--border)', color: 'var(--text3)' }
                          }
                        >{o.label}</button>
                      ))}
                    </div>
                  </div>
                )
              }
              if (opt.tipo === 'toggle') {
                const isOn = !!instance.extras[opt.key]
                return (
                  <div key={opt.key}>
                    <button type="button"
                      onClick={() => updateExtra(opt.key, !isOn)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                      style={isOn
                        ? { backgroundColor: config.cor + '22', borderColor: config.cor, color: config.cor }
                        : { backgroundColor: 'transparent', borderColor: 'var(--border)', color: 'var(--text3)' }
                      }
                    >{opt.label}</button>
                  </div>
                )
              }
              if (opt.tipo === 'number') {
                return (
                  <div key={opt.key}>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text3)' }}>{opt.label}</label>
                    <input type="number" step="0.1"
                      value={instance.extras[opt.key] as string | number ?? ''}
                      onChange={e => updateExtra(opt.key, e.target.value)}
                      placeholder="—"
                      className="w-full max-w-[160px] px-3 py-1.5 rounded-lg text-sm border font-mono"
                      style={{ backgroundColor: 'var(--bg2, var(--surface2))', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                )
              }
              return null
            })}
          </div>
        )}

        {/* Generated text preview */}
        {texto && (
          <div className="rounded-lg p-3 text-xs leading-relaxed border"
            style={{ backgroundColor: config.cor + '0A', borderColor: config.cor + '33', color: 'var(--text2)' }}
          >
            <span className="font-bold text-[10px] uppercase tracking-wider block mb-1" style={{ color: config.cor }}>
              Texto gerado:
            </span>
            {texto}
          </div>
        )}

        {/* Conclusion preview */}
        {conclusao && (
          <div className="rounded-lg p-3 text-xs leading-relaxed border"
            style={{ backgroundColor: config.cor + '08', borderColor: config.cor + '22', color: 'var(--text2)' }}
          >
            <span className="font-bold text-[10px] uppercase tracking-wider block mb-1" style={{ color: config.cor }}>
              Conclusão:
            </span>
            {conclusao}
          </div>
        )}

        {config.usaBullseye && totalSegs === 0 && (
          <p className="text-[11px] italic" style={{ color: 'var(--text3)' }}>
            Selecione os segmentos acometidos nos bullseyes acima.
          </p>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════

export default function AnaliseMiocardio({ onTextChange, onConclusionChange }: {
  onTextChange: (text: string) => void
  onConclusionChange?: (text: string) => void
}) {
  const [instances, setInstances] = useState<DiseaseInstance[]>([])
  const [nextId, setNextId] = useState(1)

  // Generate combined text and conclusion, notify parent
  useEffect(() => {
    const analysisParts: string[] = []
    const conclusionParts: string[] = []
    for (const inst of instances) {
      const texto = gerarTextoInstancia(inst)
      if (texto) analysisParts.push(texto)
      const concl = gerarConclusaoInstancia(inst)
      if (concl) conclusionParts.push(concl)
    }

    if (analysisParts.length === 0) {
      onTextChange(
        'Miocárdio ventricular esquerdo com espessura e sinal preservados.\nNão se identifica realce tardio miocárdico.'
      )
    } else {
      onTextChange(analysisParts.join('\n'))
    }

    onConclusionChange?.(conclusionParts.join('\n'))
  }, [instances, onTextChange, onConclusionChange])

  const addDisease = (diseaseId: string) => {
    setInstances(prev => [...prev, createInstance(diseaseId, nextId)])
    setNextId(prev => prev + 1)
  }

  const removeInstance = (instanceId: number) => {
    setInstances(prev => prev.filter(i => i.instanceId !== instanceId))
  }

  const updateInstance = (instanceId: number, updates: Partial<DiseaseInstance>) => {
    setInstances(prev => prev.map(i =>
      i.instanceId === instanceId ? { ...i, ...updates } : i
    ))
  }

  return (
    <div className="space-y-3">
      {/* Add disease buttons */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>
          Adicionar doença:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {DISEASE_CONFIGS.map(cfg => (
            <button
              key={cfg.id}
              type="button"
              onClick={() => addDisease(cfg.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border hover:opacity-80"
              style={{ borderColor: cfg.cor + '55', color: cfg.cor, backgroundColor: cfg.cor + '0A' }}
            >
              + {cfg.nome}
            </button>
          ))}
        </div>
      </div>

      {/* Disease instances */}
      {instances.length === 0 && (
        <p className="text-xs py-4 text-center" style={{ color: 'var(--text3)' }}>
          Nenhuma doença adicionada. Texto padrão: miocárdio normal, sem realce tardio.
        </p>
      )}

      {instances.map(inst => {
        const cfg = DISEASE_CONFIGS.find(c => c.id === inst.diseaseId)!
        return (
          <DiseaseCard
            key={inst.instanceId}
            config={cfg}
            instance={inst}
            onUpdate={updates => updateInstance(inst.instanceId, updates)}
            onRemove={() => removeInstance(inst.instanceId)}
          />
        )
      })}
    </div>
  )
}
