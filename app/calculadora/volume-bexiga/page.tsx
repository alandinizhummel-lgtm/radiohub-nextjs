'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  inputCls,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

export default function VolumeBexiga() {
  const [h, setH] = useState('')
  const [w, setW] = useState('')
  const [d, setD] = useState('')

  const result = useMemo(() => {
    const hv = parseFloat(h)
    const wv = parseFloat(w)
    const dv = parseFloat(d)

    const volume =
      hv > 0 && wv > 0 && dv > 0 ? 0.52 * hv * wv * dv : null

    function classifyResidual(v: number | null): {
      text: string
      color: string
    } {
      if (v === null) return { text: '—', color: 'var(--text3)' }
      if (v < 50) return { text: 'Resíduo normal (pós-miccional)', color: 'var(--green)' }
      if (v <= 100) return { text: 'Resíduo levemente aumentado', color: 'var(--orange)' }
      if (v <= 200) return { text: 'Resíduo moderadamente aumentado', color: 'var(--orange)' }
      return { text: 'Resíduo significativamente aumentado', color: 'var(--red)' }
    }

    function classifyCapacity(v: number | null): {
      text: string
      color: string
    } {
      if (v === null) return { text: '—', color: 'var(--text3)' }
      if (v <= 300) return { text: 'Capacidade normal', color: 'var(--green)' }
      if (v <= 500) return { text: 'Repleção moderada', color: 'var(--orange)' }
      return { text: 'Hiperdistensão', color: 'var(--red)' }
    }

    return {
      volume,
      classResidual: classifyResidual(volume),
      classCapacity: classifyCapacity(volume),
    }
  }, [h, w, d])

  return (
    <CalculatorLayout
      title="Volume Vesical"
      subtitle="Fórmula validada para bexiga (V = 0,52 × H × W × D)"
      references={[
        {
          text: 'Dicuio M, Pomara G, Menchini Fabris F, et al. Measurements of urinary bladder volume: comparison of five ultrasound calculation methods in volunteers. Arch Ital Urol Androl. 2005;77(1):60-62.',
        },
      ]}
    >
      {/* Dimensões */}
      <Section title="Dimensões da Bexiga">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>
              Altura / H (cm)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="0.0"
              value={h}
              onChange={(e) => setH(e.target.value)}
              min={0}
              step={0.1}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Largura / W (cm)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="0.0"
              value={w}
              onChange={(e) => setW(e.target.value)}
              min={0}
              step={0.1}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Profundidade / D (cm)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="0.0"
              value={d}
              onChange={(e) => setD(e.target.value)}
              min={0}
              step={0.1}
            />
          </div>
        </div>
      </Section>

      {/* Resultados */}
      <Section title="Resultados">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <ResultBadge
            label="Volume Vesical"
            value={
              result.volume !== null
                ? `${result.volume.toFixed(0)} mL`
                : '—'
            }
            color={
              result.volume !== null ? 'var(--accent)' : 'var(--text3)'
            }
            large
          />
          <div className="flex flex-col gap-3">
            <ResultBadge
              label="Contexto Pós-Miccional"
              value={result.classResidual.text}
              color={result.classResidual.color}
            />
            <ResultBadge
              label="Contexto Pré-Miccional"
              value={result.classCapacity.text}
              color={result.classCapacity.color}
            />
          </div>
        </div>

        <div
          className="mt-3 rounded-lg border p-3"
          style={{
            backgroundColor: 'var(--bg2)',
            borderColor: 'var(--border)',
          }}
        >
          <p
            className="text-xs font-semibold mb-1"
            style={{ color: 'var(--text)' }}
          >
            Valores de Referência
          </p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            Resíduo pós-miccional: &lt;50 mL (normal) | 50&ndash;100 mL (levemente aumentado)
          </p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            Capacidade vesical normal: ~300 mL (pré-miccional)
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
            Fórmula: V = 0,52 &times; H &times; W &times; D (fator de correção validado para bexiga)
          </p>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
