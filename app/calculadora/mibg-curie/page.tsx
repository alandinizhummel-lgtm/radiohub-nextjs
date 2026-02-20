'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
} from '@/app/calculadora/components/calculator-layout'

interface Segment {
  id: string
  label: string
}

const segments: Segment[] = [
  { id: 'head', label: 'Cabeça / Crânio' },
  { id: 'chest', label: 'Tórax' },
  { id: 'spine_t', label: 'Coluna torácica' },
  { id: 'spine_l', label: 'Coluna lombar' },
  { id: 'pelvis', label: 'Pelve' },
  { id: 'arms_upper', label: 'Braços (úmeros)' },
  { id: 'arms_lower', label: 'Antebraços / Mãos' },
  { id: 'legs_upper', label: 'Fêmures / Coxas' },
  { id: 'legs_lower', label: 'Pernas / Pés' },
]

const scoreLabels: Record<string, string> = {
  '0': '0 - Sem captação',
  '1': '1 - Um foco discreto',
  '2': '2 - Mais de um foco discreto',
  '3': '3 - Difuso (>50% do segmento)',
}

const scoreOptions = [
  { value: '0', label: '0', description: 'Sem captação' },
  { value: '1', label: '1', description: 'Um foco discreto' },
  { value: '2', label: '2', description: 'Mais de um foco discreto' },
  { value: '3', label: '3', description: 'Difuso (>50% do segmento)' },
]

const softTissueOptions = [
  { value: '0', label: '0', description: 'Sem captação em partes moles' },
  { value: '1', label: '1', description: 'Um foco discreto' },
  { value: '2', label: '2', description: 'Mais de um foco discreto' },
  { value: '3', label: '3', description: 'Difuso (>50%)' },
]

export default function MibgCurie() {
  const [scores, setScores] = useState<Record<string, string>>({})
  const [softTissue, setSoftTissue] = useState('')

  const setSegmentScore = (segmentId: string, score: string) => {
    setScores(prev => ({ ...prev, [segmentId]: score }))
  }

  const result = useMemo(() => {
    const filledSegments = segments.filter(s => scores[s.id] !== undefined && scores[s.id] !== '')
    if (filledSegments.length === 0) return null

    const totalScore = segments.reduce((sum, s) => {
      const val = parseInt(scores[s.id] || '0')
      return sum + (isNaN(val) ? 0 : val)
    }, 0)

    const softTissueScore = parseInt(softTissue || '0')
    const maxPossible = 27
    const relativeScore = ((totalScore / maxPossible) * 100).toFixed(1)

    let interpretation: string
    let color: string

    if (totalScore === 0) {
      interpretation = 'Sem captação esquelética de mIBG. Resposta completa.'
      color = 'var(--green)'
    } else if (totalScore <= 2) {
      interpretation = 'Score favoravel (<=2). Resposta adequada ao tratamento.'
      color = 'var(--green)'
    } else if (totalScore <= 9) {
      interpretation = 'Score desfavoravel (>2). Doença residual significativa.'
      color = 'var(--orange)'
    } else {
      interpretation = 'Score elevado. Doença disseminada extensa.'
      color = 'var(--red)'
    }

    return {
      totalScore,
      softTissueScore: isNaN(softTissueScore) ? 0 : softTissueScore,
      relativeScore,
      interpretation,
      color,
      filledCount: filledSegments.length,
    }
  }, [scores, softTissue])

  return (
    <CalculatorLayout
      title="Score de Curie - mIBG"
      subtitle="Score semiquantitativo de mIBG para neuroblastoma"
      references={[
        {
          text: 'Ady N, Zucker JM, Asselain B, et al. A new 123I-MIBG whole body scan scoring method--application to the prediction of the response of metastases to induction chemotherapy in stage IV neuroblastoma. Eur J Cancer. 1995;31A(2):256-261.',
        },
        {
          text: 'Yanik GA, Parisi MT, Shulkin BL, et al. Semiquantitative mIBG scoring as a prognostic indicator in patients with stage 4 neuroblastoma: a report from the Children\'s Oncology Group. J Nucl Med. 2013;54(4):541-548.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/23440228/',
        },
      ]}
    >
      <Section title="Segmentos Anatômicos (Score Esquelético)">
        <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>
          Pontue cada um dos 9 segmentos anatômicos de 0 a 3 conforme a captação de mIBG. Score maximo esquelético: 27 pontos.
        </p>

        <div className="space-y-4">
          {segments.map(segment => (
            <div key={segment.id}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>
                {segment.label}
                {scores[segment.id] !== undefined && scores[segment.id] !== '' && (
                  <span style={{ color: 'var(--accent)', marginLeft: 8 }}>
                    = {scoreLabels[scores[segment.id]]}
                  </span>
                )}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {scoreOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSegmentScore(segment.id, opt.value)}
                    className="text-left p-2 rounded-lg border transition-all text-xs"
                    style={
                      scores[segment.id] === opt.value
                        ? {
                            borderColor: 'var(--accent)',
                            backgroundColor: 'rgba(99,102,241,0.1)',
                            color: 'var(--text)',
                          }
                        : {
                            borderColor: 'var(--border)',
                            backgroundColor: 'transparent',
                            color: 'var(--text3)',
                          }
                    }
                  >
                    <span className="font-semibold">{opt.label}</span>
                    <span className="ml-1 opacity-75">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Score de Partes Moles">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          Avaliação separada da captação em partes moles (excluindo tumor primario).
        </p>
        <OptionGrid options={softTissueOptions} value={softTissue} onChange={setSoftTissue} columns={4} />
      </Section>

      {result && (
        <Section title="Resultado">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <ResultBadge
              label="Score Esquelético"
              value={`${result.totalScore} / 27`}
              color={result.color}
              large
            />
            <ResultBadge
              label="Partes Moles"
              value={`${result.softTissueScore} / 3`}
              large
            />
            <ResultBadge
              label="Score Relativo"
              value={`${result.relativeScore}%`}
              color={result.color}
              large
            />
          </div>

          <div
            className="rounded-lg border p-4 mb-3"
            style={{
              backgroundColor: 'var(--bg2)',
              borderColor: result.color + '44',
            }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>
              Interpretação
            </p>
            <p className="text-sm font-semibold" style={{ color: result.color }}>
              {result.interpretation}
            </p>
          </div>

          <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Detalhamento por Segmento</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
              {segments.map(segment => {
                const val = parseInt(scores[segment.id] || '0')
                return (
                  <div key={segment.id} className="flex items-center justify-between text-xs py-1 px-2 rounded" style={{ backgroundColor: val > 0 ? 'rgba(220,38,38,0.06)' : 'transparent' }}>
                    <span style={{ color: 'var(--text3)' }}>{segment.label}</span>
                    <span
                      className="font-semibold"
                      style={{ color: val === 0 ? 'var(--green)' : val <= 1 ? 'var(--orange)' : 'var(--red)' }}
                    >
                      {scores[segment.id] || '0'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Limiares Clinicos</p>
            <div className="space-y-1">
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                <span style={{ color: 'var(--green)', fontWeight: 600 }}>Score &lt;=2:</span> Favoravel - resposta adequada ao tratamento (COG)
              </p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                <span style={{ color: 'var(--red)', fontWeight: 600 }}>Score &gt;2:</span> Desfavoravel - doença residual significativa, considerar mudança terapêutica
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
                O score de partes moles é avaliado separadamente. Um score esquelético de 0 indica resposta completa por mIBG.
              </p>
            </div>
          </div>
        </Section>
      )}
    </CalculatorLayout>
  )
}
