'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
  inputCls,
  labelCls,
  labelStyle,
  selectCls,
} from '@/app/calculadora/components/calculator-layout'

const marginOptions = [
  { value: 'well', label: 'Bem definidas', description: 'Margem esclerotica ou cortical intacta' },
  { value: 'geographic', label: 'Geograficas', description: 'Margem bem definida sem orla esclerotica (nao agressiva)' },
  { value: 'ill', label: 'Mal definidas / permeativas', description: 'Margem irregular, padrao permeativo ou destrutivo' },
]

const matrixOptions = [
  { value: 'none', label: 'Sem mineralizacao', description: 'Lesao litica pura ou sem matriz identificavel' },
  { value: 'sclerotic', label: 'Esclerotica / ossea', description: 'Matriz ossea, esclerose homogenea' },
  { value: 'chondroid', label: 'Condroide', description: 'Calcificacoes em pipoca, arcos e aneis' },
  { value: 'aggressive', label: 'Mineralizacao amorfa / agressiva', description: 'Mineralizacao irregular, desorganizada' },
]

const periostealOptions = [
  { value: 'none', label: 'Ausente', description: 'Sem reacao periosteal' },
  { value: 'solid', label: 'Solida / espessada', description: 'Reacao periosteal continua, lisa' },
  { value: 'aggressive', label: 'Agressiva', description: 'Laminas (casca de cebola), espiculada (raios de sol), triangulo de Codman' },
]

const softTissueOptions = [
  { value: 'no', label: 'Ausente', description: 'Sem componente de partes moles' },
  { value: 'yes', label: 'Presente', description: 'Componente extra-osseo identificavel' },
]

const yesNoOptions = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Nao' },
]

function getCategoryColor(cat: number): string {
  if (cat === 0) return 'var(--text3)'
  if (cat === 1) return '#16a34a'
  if (cat === 2) return '#22c55e'
  if (cat === 3) return '#f59e0b'
  if (cat === 4) return '#dc2626'
  return 'var(--text3)'
}

function getCategoryLabel(cat: number): string {
  switch (cat) {
    case 0: return 'Incompleto'
    case 1: return 'Negativo'
    case 2: return 'Benigno'
    case 3: return 'Provavelmente benigno'
    case 4: return 'Suspeito'
    default: return ''
  }
}

function getManagement(cat: number): string {
  switch (cat) {
    case 0: return 'Exame incompleto. Metodo de imagem complementar necessario para caracterizacao adequada.'
    case 1: return 'Sem lesao ossea focal identificada. Nenhum seguimento necessario para esta indicacao.'
    case 2: return 'Achado benigno. Nenhum seguimento ou avaliacao adicional necessario. Exemplos: ilha ossea, encondroma tipico, fibroma nao-ossificante, cisto osseo simples.'
    case 3: return 'Provavelmente benigno. Seguimento por imagem recomendado em 3-6 meses para confirmar estabilidade. Se crescimento ou mudanca, considerar biopsia.'
    case 4: return 'Achado suspeito para malignidade. Biopsia recomendada. Encaminhamento para ortopedia oncologica / equipe especializada.'
    default: return ''
  }
}

export default function BoneRADSCalculator() {
  const [incomplete, setIncomplete] = useState('')
  const [hasLesion, setHasLesion] = useState('')
  const [age, setAge] = useState('')
  const [margins, setMargins] = useState('')
  const [matrix, setMatrix] = useState('')
  const [periosteal, setPeriosteal] = useState('')
  const [softTissue, setSoftTissue] = useState('')
  const [location, setLocation] = useState('')

  const result = useMemo(() => {
    if (incomplete === 'yes') return { category: 0 }
    if (hasLesion === 'no') return { category: 1 }
    if (hasLesion !== 'yes') return null
    if (!margins) return null

    const ageVal = parseInt(age)
    const isYoung = !isNaN(ageVal) && ageVal < 40

    // Aggressive features
    const aggressiveMargin = margins === 'ill'
    const aggressivePeriosteal = periosteal === 'aggressive'
    const hasSoftTissue = softTissue === 'yes'
    const aggressiveMatrix = matrix === 'aggressive'

    // Count aggressive features
    const aggressiveCount = [aggressiveMargin, aggressivePeriosteal, hasSoftTissue, aggressiveMatrix].filter(Boolean).length

    // Benign features
    const benignMargin = margins === 'well'
    const benignMatrix = matrix === 'sclerotic' || matrix === 'chondroid'
    const noPeriosteal = periosteal === 'none'
    const noSoftTissue = softTissue === 'no'

    if (aggressiveCount >= 2) return { category: 4 }
    if (aggressiveMargin || aggressivePeriosteal) return { category: 4 }
    if (hasSoftTissue && (aggressiveMargin || aggressivePeriosteal)) return { category: 4 }

    if (benignMargin && (benignMatrix || matrix === 'none') && noPeriosteal && noSoftTissue) {
      return { category: 2 }
    }

    // Geographic / intermediate
    if (margins === 'geographic') {
      if (noPeriosteal && noSoftTissue) return { category: 3 }
      if (hasSoftTissue) return { category: 4 }
      return { category: 3 }
    }

    // If young patient with any uncertain features, lean more suspicious
    if (isYoung && hasSoftTissue) return { category: 4 }

    // Default intermediate
    if (hasSoftTissue) return { category: 4 }

    return { category: 3 }
  }, [incomplete, hasLesion, age, margins, matrix, periosteal, softTissue, location])

  const laudoText = useMemo(() => {
    if (!result) return ''
    const cat = result.category
    const parts: string[] = []

    parts.push(`Classificacao Bone-RADS: Categoria ${cat} - ${getCategoryLabel(cat)}.`)

    if (cat >= 2) {
      const features: string[] = []
      if (margins === 'well') features.push('margens bem definidas')
      if (margins === 'geographic') features.push('margens geograficas')
      if (margins === 'ill') features.push('margens mal definidas / padrao permeativo')
      if (matrix === 'sclerotic') features.push('matriz esclerotica')
      if (matrix === 'chondroid') features.push('matriz condroide')
      if (matrix === 'aggressive') features.push('mineralizacao agressiva')
      if (periosteal === 'solid') features.push('reacao periosteal solida')
      if (periosteal === 'aggressive') features.push('reacao periosteal agressiva')
      if (softTissue === 'yes') features.push('componente de partes moles')
      if (features.length > 0) parts.push(`Caracteristicas: ${features.join(', ')}.`)
      if (age) parts.push(`Idade do paciente: ${age} anos.`)
    }

    parts.push(`Conduta: ${getManagement(cat)}`)
    return parts.join(' ')
  }, [result, margins, matrix, periosteal, softTissue, age])

  return (
    <CalculatorLayout
      title="Bone-RADS"
      subtitle="Bone Reporting and Data System"
      references={[
        {
          text: "O'Connor EE, Defined by ACR Committee. Bone-RADS: A Standardized Reporting System for Bone Lesions. J Am Coll Radiol. 2022;19(11):1290-1298.",
          url: 'https://pubmed.ncbi.nlm.nih.gov/36371370/',
        },
      ]}
    >
      <Section title="1. Qualidade do exame">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          O exame esta completo e adequado para avaliacao?
        </p>
        <OptionGrid
          options={[
            { value: 'no', label: 'Sim, completo', description: 'Exame adequado para avaliacao' },
            { value: 'yes', label: 'Nao, incompleto', description: 'Exame limitado ou incompleto' },
          ]}
          value={incomplete}
          onChange={setIncomplete}
          columns={2}
        />
      </Section>

      {incomplete === 'no' && (
        <Section title="2. Ha lesao ossea focal?">
          <OptionGrid
            options={[
              { value: 'yes', label: 'Sim', description: 'Lesao ossea focal identificada' },
              { value: 'no', label: 'Nao', description: 'Sem lesao ossea focal' },
            ]}
            value={hasLesion}
            onChange={setHasLesion}
            columns={2}
          />
        </Section>
      )}

      {incomplete === 'no' && hasLesion === 'yes' && (
        <>
          <Section title="3. Dados do paciente e localizacao">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls} style={labelStyle}>Idade (anos)</label>
                <input
                  type="number"
                  className={inputCls}
                  placeholder="Ex: 35"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  min={0}
                  max={120}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                  Pacientes &lt;40 anos: maior suspicao para certas lesoes
                </p>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Localizacao</label>
                <select className={selectCls} value={location} onChange={e => setLocation(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="epi">Epifise</option>
                  <option value="meta">Metafise</option>
                  <option value="dia">Diafise</option>
                  <option value="flat">Osso chato (pelve, escapula)</option>
                  <option value="vert">Vertebra</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>
          </Section>

          <Section title="4. Margens da lesao">
            <OptionGrid options={marginOptions} value={margins} onChange={setMargins} columns={3} />
          </Section>

          <Section title="5. Matriz / mineralizacao">
            <OptionGrid options={matrixOptions} value={matrix} onChange={setMatrix} columns={2} />
          </Section>

          <Section title="6. Reacao periosteal">
            <OptionGrid options={periostealOptions} value={periosteal} onChange={setPeriosteal} columns={3} />
          </Section>

          <Section title="7. Componente de partes moles">
            <OptionGrid options={softTissueOptions} value={softTissue} onChange={setSoftTissue} columns={2} />
          </Section>
        </>
      )}

      {result && (
        <Section title="Resultado">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <ResultBadge
              label="Bone-RADS"
              value={`Categoria ${result.category}`}
              color={getCategoryColor(result.category)}
              large
            />
            <ResultBadge
              label="Classificacao"
              value={getCategoryLabel(result.category)}
              color={getCategoryColor(result.category)}
            />
          </div>

          <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: getCategoryColor(result.category) + '44' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Recomendacao de Conduta</p>
            <p className="text-sm font-semibold" style={{ color: getCategoryColor(result.category) }}>
              {getManagement(result.category)}
            </p>
          </div>

          <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Criterios de classificacao</p>
            <div className="space-y-1.5">
              <p className="text-xs" style={{ color: '#22c55e' }}>
                <strong>Cat. 2 (Benigno):</strong> Margens bem definidas com orla esclerotica, sem reacao periosteal, sem componente de partes moles
              </p>
              <p className="text-xs" style={{ color: '#f59e0b' }}>
                <strong>Cat. 3 (Provavelmente benigno):</strong> Margens geograficas nao agressivas, sem componente de partes moles
              </p>
              <p className="text-xs" style={{ color: '#dc2626' }}>
                <strong>Cat. 4 (Suspeito):</strong> Padrao permeativo / destrutivo, reacao periosteal agressiva, componente de partes moles
              </p>
            </div>
          </div>

          {laudoText && (
            <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Texto para laudo</p>
                <button
                  onClick={() => navigator.clipboard.writeText(laudoText)}
                  className="text-xs px-2 py-1 rounded border"
                  style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text3)', whiteSpace: 'pre-wrap' }}>
                {laudoText}
              </p>
            </div>
          )}
        </Section>
      )}
    </CalculatorLayout>
  )
}
