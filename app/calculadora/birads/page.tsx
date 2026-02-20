'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
} from '@/app/calculadora/components/calculator-layout'

const categoryOpts = [
  { value: '0', label: 'BI-RADS 0', description: 'Avaliacao incompleta - necessita exames adicionais' },
  { value: '1', label: 'BI-RADS 1', description: 'Negativo - nenhum achado' },
  { value: '2', label: 'BI-RADS 2', description: 'Achado benigno' },
  { value: '3', label: 'BI-RADS 3', description: 'Achado provavelmente benigno (< 2% malignidade)' },
  { value: '4A', label: 'BI-RADS 4A', description: 'Baixa suspeita de malignidade (2-10%)' },
  { value: '4B', label: 'BI-RADS 4B', description: 'Suspeita moderada de malignidade (10-50%)' },
  { value: '4C', label: 'BI-RADS 4C', description: 'Alta suspeita de malignidade (50-95%)' },
  { value: '5', label: 'BI-RADS 5', description: 'Altamente sugestivo de malignidade (>= 95%)' },
  { value: '6', label: 'BI-RADS 6', description: 'Malignidade comprovada por biopsia' },
]

const compositionOpts = [
  { value: 'a', label: 'A - Gordurosa', description: 'Mamas quase inteiramente gordurosas' },
  { value: 'b', label: 'B - Esparsas', description: 'Areas esparsas de densidade fibroglandular' },
  { value: 'c', label: 'C - Heterogeneamente densa', description: 'Mamas heterogeneamente densas' },
  { value: 'd', label: 'D - Extremamente densa', description: 'Mamas extremamente densas' },
]

const massShapeOpts = [
  { value: 'round', label: 'Redonda', description: 'Forma esferica' },
  { value: 'oval', label: 'Oval', description: 'Forma eliptica' },
  { value: 'irregular', label: 'Irregular', description: 'Forma nao classificavel' },
]

const massMarginOpts = [
  { value: 'circumscribed', label: 'Circunscrita', description: 'Pelo menos 75% das margens bem definidas' },
  { value: 'obscured', label: 'Obscurecida', description: 'Margem oculta por tecido adjacente' },
  { value: 'microlobulated', label: 'Microlobulada', description: 'Pequenas ondulacoes na margem' },
  { value: 'indistinct', label: 'Indistinta', description: 'Margem mal definida, sem massas adjacentes' },
  { value: 'spiculated', label: 'Espiculada', description: 'Linhas irradiando da margem da massa' },
]

const massDensityOpts = [
  { value: 'high', label: 'Alta densidade', description: 'Mais densa que o parenquima' },
  { value: 'equal', label: 'Isodensa', description: 'Mesma densidade do parenquima' },
  { value: 'low', label: 'Baixa densidade', description: 'Menos densa que o parenquima, mas nao gordurosa' },
  { value: 'fat', label: 'Conteudo gorduroso', description: 'Hipodensa, compativel com gordura' },
]

const calcOpts = [
  { value: 'benign', label: 'Tipicamente benignas', description: 'Pele, vasculares, grosseiras (pipoca), em casca de ovo, leite de calcio, sutura, distroficas' },
  { value: 'suspicious', label: 'Morfologia suspeita', description: 'Amorfas, grosseiras heterogeneas, finas pleomorficas, finas lineares/ramificadas' },
]

function getManagement(cat: string): { text: string; color: string } {
  switch (cat) {
    case '0': return { text: 'Avaliacao incompleta. Solicitar exames adicionais (incidencias complementares, ultrassonografia, RM).', color: '#eab308' }
    case '1': return { text: 'Exame normal. Seguimento de rotina conforme faixa etaria.', color: '#16a34a' }
    case '2': return { text: 'Achado benigno. Seguimento de rotina conforme faixa etaria.', color: '#16a34a' }
    case '3': return { text: 'Provavelmente benigno. Seguimento em curto prazo (6 meses) recomendado. Biopsia em caso de crescimento ou alteracao.', color: '#22c55e' }
    case '4A': return { text: 'Baixa suspeita. Biopsia percutanea recomendada (core biopsy ou aspiracao por agulha fina).', color: '#f59e0b' }
    case '4B': return { text: 'Suspeita moderada. Biopsia percutanea recomendada.', color: '#f59e0b' }
    case '4C': return { text: 'Alta suspeita. Biopsia percutanea recomendada. Considerar correlacao cirurgica se resultado benigno.', color: '#dc2626' }
    case '5': return { text: 'Altamente sugestivo de malignidade. Biopsia percutanea e planejamento terapeutico recomendados.', color: '#dc2626' }
    case '6': return { text: 'Malignidade comprovada. Tratamento oncologico conforme estadiamento.', color: '#dc2626' }
    default: return { text: '', color: 'var(--text3)' }
  }
}

function getMalignancyRisk(cat: string): string {
  switch (cat) {
    case '0': return 'N/A'
    case '1': return '~0%'
    case '2': return '~0%'
    case '3': return '< 2%'
    case '4A': return '2 - 10%'
    case '4B': return '10 - 50%'
    case '4C': return '50 - 95%'
    case '5': return '>= 95%'
    case '6': return '100% (comprovado)'
    default: return ''
  }
}

export default function BIRADSCalculator() {
  const [category, setCategory] = useState('')
  const [composition, setComposition] = useState('')
  const [massShape, setMassShape] = useState('')
  const [massMargin, setMassMargin] = useState('')
  const [massDensity, setMassDensity] = useState('')
  const [calcType, setCalcType] = useState('')

  const result = useMemo(() => {
    if (!category) return null
    const management = getManagement(category)
    const risk = getMalignancyRisk(category)
    const color = management.color
    return { category, management, risk, color }
  }, [category])

  const reportText = useMemo(() => {
    if (!result) return ''
    const parts: string[] = []

    if (composition) {
      const compLabels: Record<string, string> = { a: 'gordurosa (a)', b: 'densidades fibroglandulares esparsas (b)', c: 'heterogeneamente densa (c)', d: 'extremamente densa (d)' }
      parts.push(`Composicao mamaria: ${compLabels[composition] || composition}.`)
    }

    const findingParts: string[] = []
    if (massShape) {
      const shapeLabels: Record<string, string> = { round: 'redonda', oval: 'oval', irregular: 'irregular' }
      findingParts.push(`forma ${shapeLabels[massShape] || massShape}`)
    }
    if (massMargin) {
      const marginLabels: Record<string, string> = { circumscribed: 'circunscrita', obscured: 'obscurecida', microlobulated: 'microlobulada', indistinct: 'indistinta', spiculated: 'espiculada' }
      findingParts.push(`margem ${marginLabels[massMargin] || massMargin}`)
    }
    if (massDensity) {
      const densLabels: Record<string, string> = { high: 'alta densidade', equal: 'isodensa', low: 'baixa densidade', fat: 'conteudo gorduroso' }
      findingParts.push(densLabels[massDensity] || massDensity)
    }
    if (findingParts.length > 0) parts.push(`Massa de ${findingParts.join(', ')}.`)

    if (calcType) {
      parts.push(calcType === 'benign' ? 'Calcificacoes tipicamente benignas.' : 'Calcificacoes de morfologia suspeita.')
    }

    const catLabel = categoryOpts.find(o => o.value === result.category)?.description || ''
    parts.push(`Classificacao BI-RADS: ${result.category} - ${catLabel}. Risco de malignidade: ${result.risk}. ${result.management.text}`)

    return parts.join(' ')
  }, [result, composition, massShape, massMargin, massDensity, calcType])

  return (
    <CalculatorLayout
      title="BI-RADS"
      subtitle="Breast Imaging Reporting and Data System - 6a Edicao (ACR 2024)"
      references={[
        { text: "D'Orsi CJ, Sickles EA, Mendelson EB, Morris EA. ACR BI-RADS Atlas: Breast Imaging Reporting and Data System. 6th ed. Reston, VA: American College of Radiology; 2024." },
      ]}
    >
      <Section title="Categoria BI-RADS">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>Selecione a categoria de avaliacao final.</p>
        <OptionGrid options={categoryOpts} value={category} onChange={setCategory} columns={2} />
      </Section>

      <Section title="Composicao Mamaria" defaultOpen={false}>
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>Composicao do parenquima mamario (classificacao de densidade).</p>
        <OptionGrid options={compositionOpts} value={composition} onChange={setComposition} columns={2} />
      </Section>

      <Section title="Descricao do Achado - Massa" defaultOpen={false}>
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>Auxiliar para descricao de massas (opcional).</p>

        <div className="mb-4">
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Forma</p>
          <OptionGrid options={massShapeOpts} value={massShape} onChange={setMassShape} columns={3} />
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Margem</p>
          <OptionGrid options={massMarginOpts} value={massMargin} onChange={setMassMargin} columns={3} />
        </div>

        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Densidade</p>
          <OptionGrid options={massDensityOpts} value={massDensity} onChange={setMassDensity} columns={2} />
        </div>
      </Section>

      <Section title="Calcificacoes" defaultOpen={false}>
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>Classificacao morfologica das calcificacoes (se presentes).</p>
        <OptionGrid options={calcOpts} value={calcType} onChange={setCalcType} columns={2} />
      </Section>

      {result && (
        <Section title="Resultado">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <ResultBadge label="Categoria" value={`BI-RADS ${result.category}`} color={result.color} large />
            <ResultBadge label="Risco de Malignidade" value={result.risk} color={result.color} large />
            <ResultBadge
              label="Densidade"
              value={composition ? composition.toUpperCase() : 'Nao informada'}
              color="var(--accent)"
            />
          </div>

          <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: result.color + '44' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Recomendacao de Conduta</p>
            <p className="text-sm font-semibold" style={{ color: result.color }}>{result.management.text}</p>
          </div>

          <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Resumo das Categorias</p>
            <p className="text-xs" style={{ color: '#eab308' }}>0: Incompleto</p>
            <p className="text-xs" style={{ color: '#16a34a' }}>1: Negativo</p>
            <p className="text-xs" style={{ color: '#16a34a' }}>2: Benigno</p>
            <p className="text-xs" style={{ color: '#22c55e' }}>3: Provavelmente benigno (&lt; 2%)</p>
            <p className="text-xs" style={{ color: '#f59e0b' }}>4A: Baixa suspeita (2-10%)</p>
            <p className="text-xs" style={{ color: '#f59e0b' }}>4B: Moderada suspeita (10-50%)</p>
            <p className="text-xs" style={{ color: '#dc2626' }}>4C: Alta suspeita (50-95%)</p>
            <p className="text-xs" style={{ color: '#dc2626' }}>5: Altamente sugestivo (&ge; 95%)</p>
            <p className="text-xs" style={{ color: '#dc2626' }}>6: Malignidade comprovada</p>
          </div>

          {reportText && (
            <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Texto para Laudo</p>
              <p className="text-sm font-mono p-3 rounded-lg" style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', userSelect: 'all' }}>
                {reportText}
              </p>
            </div>
          )}
        </Section>
      )}
    </CalculatorLayout>
  )
}
