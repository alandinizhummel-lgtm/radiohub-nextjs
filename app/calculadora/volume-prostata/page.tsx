'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  inputCls,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

export default function VolumeProstata() {
  const [ap, setAp] = useState('')
  const [trans, setTrans] = useState('')
  const [long, setLong] = useState('')
  const [psa, setPsa] = useState('')

  const result = useMemo(() => {
    const a = parseFloat(ap)
    const t = parseFloat(trans)
    const l = parseFloat(long)
    const psaVal = parseFloat(psa)

    const volume =
      a > 0 && t > 0 && l > 0 ? (Math.PI / 6) * a * t * l : null
    const psaDensity =
      volume !== null && volume > 0 && psaVal >= 0
        ? psaVal / volume
        : null

    function classifyVolume(v: number | null): {
      text: string
      color: string
    } {
      if (v === null) return { text: '—', color: 'var(--text3)' }
      if (v < 30) return { text: 'Normal', color: 'var(--green)' }
      if (v <= 40) return { text: 'Aumentada', color: 'var(--orange)' }
      return { text: 'Muito aumentada', color: 'var(--red)' }
    }

    function classifyPSAD(d: number | null): {
      text: string
      color: string
    } {
      if (d === null) return { text: '—', color: 'var(--text3)' }
      if (d <= 0.15)
        return { text: 'Normal', color: 'var(--green)' }
      return { text: 'Suspeito', color: 'var(--red)' }
    }

    return {
      volume,
      psaDensity,
      classVol: classifyVolume(volume),
      classPSAD: classifyPSAD(psaDensity),
    }
  }, [ap, trans, long, psa])

  return (
    <CalculatorLayout
      title="Volume da Próstata + Densidade do PSA"
      subtitle="Fórmula do elipsoide (V = π/6 × AP × T × L)"
      references={[
        {
          text: 'Turkbey B, Rosenkrantz AB, Haider MA, et al. Prostate Imaging Reporting and Data System Version 2.1: 2019 Update. Radiology. 2019;292(2):362-367.',
        },
      ]}
    >
      {/* Dimensões */}
      <Section title="Dimensões da Próstata">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>
              AP (cm)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="0.0"
              value={ap}
              onChange={(e) => setAp(e.target.value)}
              min={0}
              step={0.1}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Transverso (cm)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="0.0"
              value={trans}
              onChange={(e) => setTrans(e.target.value)}
              min={0}
              step={0.1}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Longitudinal (cm)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="0.0"
              value={long}
              onChange={(e) => setLong(e.target.value)}
              min={0}
              step={0.1}
            />
          </div>
        </div>
      </Section>

      {/* PSA */}
      <Section title="PSA Sérico">
        <div className="max-w-xs">
          <label className={labelCls} style={labelStyle}>
            PSA (ng/mL)
          </label>
          <input
            type="number"
            className={inputCls}
            placeholder="0.00"
            value={psa}
            onChange={(e) => setPsa(e.target.value)}
            min={0}
            step={0.01}
          />
        </div>
      </Section>

      {/* Resultados */}
      <Section title="Resultados">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <ResultBadge
            label="Volume Prostático"
            value={
              result.volume !== null
                ? `${result.volume.toFixed(1)} mL`
                : '—'
            }
            color={result.classVol.color}
            large
          />
          <ResultBadge
            label="Densidade do PSA"
            value={
              result.psaDensity !== null
                ? result.psaDensity.toFixed(3)
                : '—'
            }
            color={result.classPSAD.color}
            large
          />
        </div>

        {/* Classification */}
        <div
          className="mt-4 rounded-lg border p-3"
          style={{
            backgroundColor: 'var(--bg2)',
            borderColor: 'var(--border)',
          }}
        >
          <p
            className="text-xs font-semibold mb-2"
            style={{ color: 'var(--text)' }}
          >
            Interpretação
          </p>
          {result.classVol.text !== '—' && (
            <p
              className="text-xs mb-1"
              style={{ color: result.classVol.color }}
            >
              Volume: {result.classVol.text} ({result.volume?.toFixed(1)} mL)
            </p>
          )}
          {result.classPSAD.text !== '—' && (
            <p
              className="text-xs mb-1"
              style={{ color: result.classPSAD.color }}
            >
              Densidade PSA: {result.classPSAD.text} (
              {result.psaDensity?.toFixed(3)} ng/mL/mL)
            </p>
          )}
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
            Volume: &lt;30 mL (normal) | 30&ndash;40 mL (aumentada) | &gt;40 mL (muito aumentada)
          </p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            Densidade PSA: &le;0,15 (normal) | &gt;0,15 (suspeito &mdash; considerar biópsia)
          </p>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
