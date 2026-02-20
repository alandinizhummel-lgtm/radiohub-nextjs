'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
  inputCls,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

const nodeTypeOptions = [
  { value: 'solid', label: 'Solido', description: 'Nodulo completamente solido' },
  { value: 'partsolid', label: 'Parcialmente solido', description: 'Componente solido e vidro fosco' },
  { value: 'ggn', label: 'Vidro fosco (nao solido)', description: 'Opacidade em vidro fosco sem componente solido' },
]

const contextOptions = [
  { value: 'new', label: 'Novo', description: 'Primeiro exame ou nodulo novo' },
  { value: 'stable', label: 'Estavel', description: 'Sem alteracao em relacao ao exame previo' },
  { value: 'growing', label: 'Em crescimento', description: 'Aumento em relacao ao exame previo' },
]

const yesNoOptions = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Nao' },
]

interface LungRadsResult {
  category: string
  label: string
  risk: string
  recommendation: string
  color: string
}

function getCategoryColor(cat: string): string {
  if (cat === '1') return '#16a34a'
  if (cat === '2') return '#22c55e'
  if (cat === '3') return '#f59e0b'
  if (cat === '4A') return '#f97316'
  if (cat === '4B' || cat === '4X') return '#dc2626'
  if (cat === '0') return 'var(--text3)'
  return 'var(--text3)'
}

function getCategoryLabel(cat: string): string {
  switch (cat) {
    case '0': return 'Incompleto'
    case '1': return 'Negativo'
    case '2': return 'Benigno ou provavelmente benigno'
    case '3': return 'Provavelmente benigno'
    case '4A': return 'Suspeito'
    case '4B': return 'Muito suspeito'
    case '4X': return 'Muito suspeito com achados adicionais'
    default: return ''
  }
}

function getRecommendation(cat: string): string {
  switch (cat) {
    case '0': return 'Exame incompleto. Comparacao com exames previos ou exame adicional necessario.'
    case '1': return 'Continuar rastreamento anual com TCBD (tomografia de baixa dose) em 12 meses.'
    case '2': return 'Continuar rastreamento anual com TCBD em 12 meses.'
    case '3': return 'TCBD em 6 meses para avaliar estabilidade.'
    case '4A': return 'TCBD em 3 meses. Considerar PET-CT se nodulo >= 8 mm.'
    case '4B': return 'PET-CT e/ou biopsia. Discussao multidisciplinar recomendada.'
    case '4X': return 'PET-CT e/ou biopsia. Discussao multidisciplinar recomendada. Achados adicionais suspeitos presentes.'
    default: return ''
  }
}

function getRisk(cat: string): string {
  switch (cat) {
    case '0': return 'Indeterminado'
    case '1': return '<1%'
    case '2': return '<1%'
    case '3': return '1-2%'
    case '4A': return '5-15%'
    case '4B': return '>15%'
    case '4X': return '>15%'
    default: return ''
  }
}

export default function LungRADSCalculator() {
  const [nodeType, setNodeType] = useState('')
  const [context, setContext] = useState('')
  const [measurement, setMeasurement] = useState('')
  const [solidComponent, setSolidComponent] = useState('')
  const [suspicious, setSuspicious] = useState('')
  const [sModifier, setSModifier] = useState('')

  const result = useMemo((): LungRadsResult | null => {
    if (!nodeType || !context) return null

    const meas = parseFloat(measurement)
    const solidComp = parseFloat(solidComponent)

    if (nodeType === 'solid') {
      if (isNaN(meas)) return null

      let category = '2'

      if (context === 'stable') {
        // Stable solid nodules: Cat 2 regardless of size (benign behavior)
        category = '2'
      } else if (context === 'new') {
        if (meas < 6) category = '2'
        else if (meas < 8) category = '3'
        else if (meas < 15) category = '4A'
        else category = '4B'
      } else {
        // growing
        if (meas < 6) category = '3'
        else if (meas < 8) category = '4A'
        else category = '4B'
      }

      if (suspicious === 'yes' && (category === '3' || category.startsWith('4'))) {
        category = '4X'
      }

      return {
        category,
        label: getCategoryLabel(category),
        risk: getRisk(category),
        recommendation: getRecommendation(category),
        color: getCategoryColor(category),
      }
    }

    if (nodeType === 'partsolid') {
      if (isNaN(meas)) return null

      let category = '2'

      if (meas < 6) {
        category = '2'
      } else {
        // total >= 6mm, check solid component
        if (isNaN(solidComp)) return null
        if (solidComp < 6) category = '3'
        else if (solidComp < 8) category = '4A'
        else category = '4B'
      }

      if (suspicious === 'yes' && (category === '3' || category.startsWith('4'))) {
        category = '4X'
      }

      return {
        category,
        label: getCategoryLabel(category),
        risk: getRisk(category),
        recommendation: getRecommendation(category),
        color: getCategoryColor(category),
      }
    }

    if (nodeType === 'ggn') {
      if (isNaN(meas)) return null

      let category = '2'

      if (context === 'new' || context === 'stable') {
        if (meas < 30) category = '2'
        else category = '3'
      } else {
        // growing
        if (!isNaN(solidComp) && solidComp >= 4) {
          category = '4B'
        } else {
          category = '4A'
        }
      }

      if (suspicious === 'yes' && (category === '3' || category.startsWith('4'))) {
        category = '4X'
      }

      return {
        category,
        label: getCategoryLabel(category),
        risk: getRisk(category),
        recommendation: getRecommendation(category),
        color: getCategoryColor(category),
      }
    }

    return null
  }, [nodeType, context, measurement, solidComponent, suspicious, sModifier])

  const laudoText = useMemo(() => {
    if (!result) return ''
    const parts: string[] = []
    const typeText = nodeType === 'solid' ? 'solido' : nodeType === 'partsolid' ? 'parcialmente solido' : 'em vidro fosco'
    const contextText = context === 'new' ? 'novo' : context === 'stable' ? 'estavel' : 'em crescimento'

    parts.push(`Nodulo pulmonar ${typeText}, ${contextText}.`)
    if (measurement) parts.push(`Dimensao: ${measurement} mm.`)
    if (nodeType === 'partsolid' && solidComponent) parts.push(`Componente solido: ${solidComponent} mm.`)
    parts.push(`Classificacao Lung-RADS v2022: Categoria ${result.category} - ${result.label}.`)
    parts.push(`Risco estimado de malignidade: ${result.risk}.`)
    if (sModifier === 'yes') parts.push('Modificador S: achado clinicamente significativo nao pulmonar identificado.')
    parts.push(`Recomendacao: ${result.recommendation}`)
    return parts.join(' ')
  }, [result, nodeType, context, measurement, solidComponent, sModifier])

  return (
    <CalculatorLayout
      title="Lung-RADS v2022"
      subtitle="Classificacao de nodulos pulmonares em rastreamento"
      references={[
        {
          text: 'Dyer SC, Defined by ACR Committee on Lung-RADS. Lung-RADS v2022 Assessment Categories. J Thorac Imaging. 2023;38(Suppl 1):S3-S11.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/37579105/',
        },
      ]}
    >
      <Section title="1. Tipo de nodulo">
        <OptionGrid options={nodeTypeOptions} value={nodeType} onChange={setNodeType} columns={3} />
      </Section>

      {nodeType && (
        <Section title="2. Contexto">
          <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
            O nodulo e novo ou foi observado em exame previo?
          </p>
          <OptionGrid options={contextOptions} value={context} onChange={setContext} columns={3} />
        </Section>
      )}

      {nodeType && context && (
        <Section title="3. Medidas">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={labelStyle}>
                {nodeType === 'solid' ? 'Maior dimensao do nodulo (mm)' :
                  nodeType === 'partsolid' ? 'Maior dimensao total (mm)' :
                    'Maior dimensao (mm)'}
              </label>
              <input
                type="number"
                className={inputCls}
                placeholder="Ex: 12"
                value={measurement}
                onChange={e => setMeasurement(e.target.value)}
                min={0}
                step={0.1}
              />
            </div>
            {(nodeType === 'partsolid' || (nodeType === 'ggn' && context === 'growing')) && (
              <div>
                <label className={labelCls} style={labelStyle}>
                  {nodeType === 'partsolid' ? 'Componente solido (mm)' : 'Componente solido, se presente (mm)'}
                </label>
                <input
                  type="number"
                  className={inputCls}
                  placeholder="Ex: 4"
                  value={solidComponent}
                  onChange={e => setSolidComponent(e.target.value)}
                  min={0}
                  step={0.1}
                />
              </div>
            )}
          </div>
        </Section>
      )}

      {nodeType && context && measurement && (
        <Section title="4. Achados adicionais suspeitos">
          <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
            Presenca de espiculacao, linfadenopatia, invasao da parede toracica, ou outros achados suspeitos? (Modificador 4X)
          </p>
          <OptionGrid options={yesNoOptions} value={suspicious} onChange={setSuspicious} columns={2} />
        </Section>
      )}

      {nodeType && context && measurement && (
        <Section title="5. Modificador S">
          <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
            Achado clinicamente significativo nao pulmonar? (ex: massa mediastinal, derrame pleural, etc.)
          </p>
          <OptionGrid options={yesNoOptions} value={sModifier} onChange={setSModifier} columns={2} />
        </Section>
      )}

      {result && (
        <Section title="Resultado">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <ResultBadge
              label="Categoria Lung-RADS"
              value={`${result.category}${sModifier === 'yes' ? '/S' : ''}`}
              color={result.color}
              large
            />
            <ResultBadge
              label="Classificacao"
              value={result.label}
              color={result.color}
            />
            <ResultBadge
              label="Risco de malignidade"
              value={result.risk}
              color={result.color}
            />
          </div>

          <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: result.color + '44' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Recomendacao</p>
            <p className="text-sm font-semibold" style={{ color: result.color }}>
              {result.recommendation}
            </p>
          </div>

          {sModifier === 'yes' && (
            <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.3)' }}>
              <p className="text-xs font-semibold" style={{ color: '#eab308' }}>
                Modificador S presente: achado clinicamente significativo nao pulmonar identificado. Comunicar ao medico solicitante.
              </p>
            </div>
          )}

          <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Resumo das categorias</p>
            <div className="space-y-1">
              <p className="text-xs" style={{ color: '#16a34a' }}>1 - Negativo: sem nodulos ou nodulos claramente benignos</p>
              <p className="text-xs" style={{ color: '#22c55e' }}>2 - Benigno/provavelmente benigno: risco &lt;1%</p>
              <p className="text-xs" style={{ color: '#f59e0b' }}>3 - Provavelmente benigno: risco 1-2%, TCBD em 6 meses</p>
              <p className="text-xs" style={{ color: '#f97316' }}>4A - Suspeito: risco 5-15%, TCBD em 3 meses ou PET-CT</p>
              <p className="text-xs" style={{ color: '#dc2626' }}>4B - Muito suspeito: risco &gt;15%, PET-CT e/ou biopsia</p>
              <p className="text-xs" style={{ color: '#dc2626' }}>4X - Achados adicionais suspeitos: PET-CT e/ou biopsia</p>
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
