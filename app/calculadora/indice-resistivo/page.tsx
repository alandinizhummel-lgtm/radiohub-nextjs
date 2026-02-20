'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  inputCls,
  selectCls,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

type OrgaoContexto = 'renal' | 'hepatico' | 'transplante' | 'outro'

export default function IndiceResistivo() {
  const [psv, setPsv] = useState('')
  const [edv, setEdv] = useState('')
  const [contexto, setContexto] = useState<OrgaoContexto>('renal')

  const result = useMemo(() => {
    const psvVal = parseFloat(psv)
    const edvVal = parseFloat(edv)

    if (!(psvVal > 0) || edvVal < 0 || psvVal <= edvVal) {
      return {
        ri: null,
        classification: { text: '—', color: 'var(--text3)' },
        interpretation: '',
      }
    }

    const ri = (psvVal - edvVal) / psvVal

    function classify(v: number, ctx: OrgaoContexto): { text: string; color: string } {
      if (ctx === 'hepatico') {
        if (v >= 0.55 && v <= 0.75) return { text: 'Normal', color: 'var(--green)' }
        if (v > 0.75) return { text: 'Elevado', color: 'var(--red)' }
        return { text: 'Reduzido', color: 'var(--orange)' }
      }
      if (ctx === 'transplante') {
        if (v <= 0.7) return { text: 'Normal', color: 'var(--green)' }
        if (v <= 0.8) return { text: 'Limítrofe', color: 'var(--orange)' }
        return { text: 'Elevado', color: 'var(--red)' }
      }
      // renal nativo / outro
      if (v >= 0.5 && v <= 0.7) return { text: 'Normal', color: 'var(--green)' }
      if (v > 0.7) return { text: 'Elevado', color: 'var(--red)' }
      return { text: 'Reduzido', color: 'var(--orange)' }
    }

    function getInterpretation(
      v: number,
      ctx: OrgaoContexto
    ): string {
      switch (ctx) {
        case 'renal':
          if (v > 0.7)
            return 'IR > 0,70: pode indicar nefropatia parenquimatosa, obstrução, rejeição de transplante ou estenose de artéria renal. Correlacionar com clínica.'
          if (v >= 0.5)
            return 'IR dentro da faixa de normalidade para artérias renais (0,50 - 0,70).'
          return 'IR reduzido: pode ser visto em estenose de artéria renal a jusante (tardus-parvus) ou fístula arteriovenosa.'

        case 'hepatico':
          if (v > 0.75)
            return 'IR elevado na artéria hepática: pode indicar rejeição de transplante hepático ou hepatopatia.'
          if (v >= 0.55 && v <= 0.75)
            return 'IR dentro da faixa de normalidade para a artéria hepática (0,55 - 0,75).'
          return 'IR reduzido na artéria hepática: pode indicar estenose da artéria hepática ou trombose.'

        case 'transplante':
          if (v > 0.8)
            return 'IR > 0,80 em transplante renal: altamente sugestivo de rejeição aguda, necrose tubular aguda ou obstrução. Correlação clínica urgente.'
          if (v > 0.7)
            return 'IR limítrofe em transplante renal: considerar rejeição, toxicidade por ciclosporina ou causa obstrutiva.'
          return 'IR dentro da faixa aceitável para transplante renal.'

        default:
          if (v > 0.7) return 'IR elevado. Correlacionar com contexto clínico.'
          if (v >= 0.5) return 'IR dentro da faixa habitual.'
          return 'IR reduzido. Correlacionar com contexto clínico.'
      }
    }

    return {
      ri,
      classification: classify(ri, contexto),
      interpretation: getInterpretation(ri, contexto),
    }
  }, [psv, edv, contexto])

  return (
    <CalculatorLayout
      title="Índice de Resistividade (IR)"
      subtitle="IR = (PSV - EDV) / PSV"
      references={[
        {
          text: 'Platt JF, Ellis JH, Rubin JM, et al. Intrarenal arterial Doppler sonography in patients with nonobstructive renal disease: correlation of resistive index with biopsy findings. AJR Am J Roentgenol. 1991;157(4):731-733.',
        },
      ]}
    >
      {/* Velocidades */}
      <Section title="Velocidades Doppler">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>
              Velocidade de Pico Sistólico - PSV (cm/s)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="Ex: 80"
              value={psv}
              onChange={(e) => setPsv(e.target.value)}
              min={0}
              step={0.1}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Velocidade Diastólica Final - EDV (cm/s)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="Ex: 25"
              value={edv}
              onChange={(e) => setEdv(e.target.value)}
              min={0}
              step={0.1}
            />
          </div>
        </div>
      </Section>

      {/* Contexto */}
      <Section title="Contexto Clínico">
        <div className="max-w-xs">
          <label className={labelCls} style={labelStyle}>
            Órgão / Contexto
          </label>
          <select
            className={selectCls}
            value={contexto}
            onChange={(e) => setContexto(e.target.value as OrgaoContexto)}
          >
            <option value="renal">Renal (nativo)</option>
            <option value="transplante">Transplante renal</option>
            <option value="hepatico">Hepático</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      </Section>

      {/* Resultados */}
      <Section title="Resultados">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <ResultBadge
            label="Índice de Resistividade (IR)"
            value={
              result.ri !== null ? result.ri.toFixed(2) : '—'
            }
            color={result.classification.color}
            large
          />
          <ResultBadge
            label="Classificação"
            value={result.classification.text}
            color={result.classification.color}
          />
        </div>

        {/* Interpretation */}
        {result.interpretation && (
          <div
            className="rounded-lg border p-3 mb-3"
            style={{
              backgroundColor: 'var(--bg2)',
              borderColor: 'var(--border)',
            }}
          >
            <p
              className="text-xs font-semibold mb-1"
              style={{ color: 'var(--text)' }}
            >
              Interpretação
            </p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              {result.interpretation}
            </p>
          </div>
        )}

        <div
          className="rounded-lg border p-3"
          style={{
            backgroundColor: 'var(--bg2)',
            borderColor: 'var(--border)',
          }}
        >
          <p
            className="text-xs font-semibold mb-2"
            style={{ color: 'var(--text)' }}
          >
            Valores de Referência por Contexto
          </p>
          <div className="space-y-1">
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              <strong style={{ color: 'var(--text2)' }}>Renal (nativo):</strong>{' '}
              0,50 &ndash; 0,70 (normal) | &gt;0,70 (anormal)
            </p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              <strong style={{ color: 'var(--text2)' }}>Transplante renal:</strong>{' '}
              &lt;0,80 (aceitável) | &gt;0,80 (suspeito de rejeição)
            </p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              <strong style={{ color: 'var(--text2)' }}>Hepático:</strong>{' '}
              0,55 &ndash; 0,75 (normal)
            </p>
          </div>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
