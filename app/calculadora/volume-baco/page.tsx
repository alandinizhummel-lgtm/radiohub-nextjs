'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  inputCls,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

export default function VolumeBaco() {
  const [l, setL] = useState('')
  const [w, setW] = useState('')
  const [t, setT] = useState('')

  const result = useMemo(() => {
    const lv = parseFloat(l)
    const wv = parseFloat(w)
    const tv = parseFloat(t)

    const valid = lv > 0 && wv > 0 && tv > 0

    const splenicIndex = valid ? lv * wv * tv : null
    const volume = valid ? 0.524 * lv * wv * tv : null

    function classifyIndex(v: number | null): {
      text: string
      color: string
    } {
      if (v === null) return { text: '—', color: 'var(--text3)' }
      if (v < 480) return { text: 'Normal', color: 'var(--green)' }
      return { text: 'Aumentado', color: 'var(--red)' }
    }

    function classifyVolume(v: number | null): {
      text: string
      color: string
    } {
      if (v === null) return { text: '—', color: 'var(--text3)' }
      if (v < 315) return { text: 'Normal', color: 'var(--green)' }
      if (v <= 500) return { text: 'Esplenomegalia leve', color: 'var(--orange)' }
      if (v <= 800) return { text: 'Esplenomegalia moderada', color: 'var(--orange)' }
      return { text: 'Esplenomegalia severa', color: 'var(--red)' }
    }

    return {
      splenicIndex,
      volume,
      classIndex: classifyIndex(splenicIndex),
      classVolume: classifyVolume(volume),
      length: lv > 0 ? lv : null,
    }
  }, [l, w, t])

  return (
    <CalculatorLayout
      title="Volume Esplênico + Índice Esplênico"
      subtitle="Volume = 0,524 × L × W × T | Índice = L × W × T"
      references={[
        {
          text: 'Bezerra AS, D\'Ippolito G, Fiqueiredo SS, et al. Determination of splenomegaly by CT: is there a place for a single measurement? Radiology. 2005;234(3):728-732.',
        },
      ]}
    >
      {/* Dimensões */}
      <Section title="Dimensões do Baço">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>
              Comprimento / L (cm)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="0.0"
              value={l}
              onChange={(e) => setL(e.target.value)}
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
              Espessura / T (cm)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="0.0"
              value={t}
              onChange={(e) => setT(e.target.value)}
              min={0}
              step={0.1}
            />
          </div>
        </div>
      </Section>

      {/* Resultados */}
      <Section title="Resultados">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <ResultBadge
            label="Volume Esplênico"
            value={
              result.volume !== null
                ? `${result.volume.toFixed(0)} mL`
                : '—'
            }
            color={result.classVolume.color}
            large
          />
          <ResultBadge
            label="Índice Esplênico"
            value={
              result.splenicIndex !== null
                ? result.splenicIndex.toFixed(0)
                : '—'
            }
            color={result.classIndex.color}
            large
          />
          <ResultBadge
            label="Comprimento Craniocaudal"
            value={
              result.length !== null
                ? `${result.length.toFixed(1)} cm`
                : '—'
            }
            color={
              result.length !== null
                ? result.length <= 12
                  ? 'var(--green)'
                  : result.length <= 15
                    ? 'var(--orange)'
                    : 'var(--red)'
                : 'var(--text3)'
            }
          />
        </div>

        {/* Classification */}
        {result.classVolume.text !== '—' && (
          <div
            className="rounded-lg border p-3 mb-3"
            style={{
              backgroundColor: 'var(--bg2)',
              borderColor: 'var(--border)',
            }}
          >
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: 'var(--text)' }}
            >
              Classificação
            </p>
            <p
              className="text-xs mb-1"
              style={{ color: result.classVolume.color }}
            >
              {result.classVolume.text} ({result.volume?.toFixed(0)} mL)
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
            className="text-xs font-semibold mb-1"
            style={{ color: 'var(--text)' }}
          >
            Valores de Referência
          </p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            Índice esplênico normal: &lt;480 | Volume normal: &lt;315 mL
          </p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            Esplenomegalia: leve 315&ndash;500 mL | moderada 500&ndash;800 mL | severa &gt;800 mL
          </p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            Comprimento craniocaudal normal: &le;12 cm
          </p>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
