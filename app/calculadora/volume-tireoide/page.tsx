'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  inputCls,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

export default function VolumeTireoide() {
  const [ld1, setLd1] = useState('')
  const [ld2, setLd2] = useState('')
  const [ld3, setLd3] = useState('')

  const [le1, setLe1] = useState('')
  const [le2, setLe2] = useState('')
  const [le3, setLe3] = useState('')

  const [istmo, setIstmo] = useState('')

  const result = useMemo(() => {
    const rAP = parseFloat(ld1)
    const rT = parseFloat(ld2)
    const rL = parseFloat(ld3)
    const lAP = parseFloat(le1)
    const lT = parseFloat(le2)
    const lL = parseFloat(le3)
    const ist = parseFloat(istmo)

    const volRight =
      rAP > 0 && rT > 0 && rL > 0
        ? (Math.PI / 6) * rAP * rT * rL
        : null
    const volLeft =
      lAP > 0 && lT > 0 && lL > 0
        ? (Math.PI / 6) * lAP * lT * lL
        : null
    const total =
      volRight !== null && volLeft !== null ? volRight + volLeft : null

    function classifyLobe(v: number | null): {
      text: string
      color: string
    } {
      if (v === null) return { text: '—', color: 'var(--text3)' }
      if (v <= 10) return { text: 'Normal', color: 'var(--green)' }
      if (v <= 15) return { text: 'Levemente aumentado', color: 'var(--orange)' }
      return { text: 'Aumentado', color: 'var(--red)' }
    }

    function classifyTotal(v: number | null): {
      text: string
      color: string
    } {
      if (v === null) return { text: '—', color: 'var(--text3)' }
      if (v <= 20) return { text: 'Normal', color: 'var(--green)' }
      if (v <= 30) return { text: 'Levemente aumentado', color: 'var(--orange)' }
      return { text: 'Aumentado', color: 'var(--red)' }
    }

    return {
      volRight,
      volLeft,
      total,
      istmoVal: ist > 0 ? ist : null,
      istmoClass:
        ist > 0
          ? ist <= 0.3
            ? { text: 'Normal', color: 'var(--green)' }
            : { text: 'Espessado', color: 'var(--orange)' }
          : { text: '—', color: 'var(--text3)' },
      classRight: classifyLobe(volRight),
      classLeft: classifyLobe(volLeft),
      classTotal: classifyTotal(total),
    }
  }, [ld1, ld2, ld3, le1, le2, le3, istmo])

  return (
    <CalculatorLayout
      title="Volume da Tireoide"
      subtitle="Cálculo por fórmula do elipsoide (V = π/6 × AP × T × L)"
      references={[
        {
          text: 'Brunn J, Block U, Ruf G, et al. Volumetric analysis of thyroid lobes by real-time ultrasound. J Clin Ultrasound. 1981;9(7):379-385.',
        },
      ]}
    >
      {/* Lobo Direito */}
      <Section title="Lobo Direito">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>
              AP (cm)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="0.0"
              value={ld1}
              onChange={(e) => setLd1(e.target.value)}
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
              value={ld2}
              onChange={(e) => setLd2(e.target.value)}
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
              value={ld3}
              onChange={(e) => setLd3(e.target.value)}
              min={0}
              step={0.1}
            />
          </div>
        </div>
      </Section>

      {/* Lobo Esquerdo */}
      <Section title="Lobo Esquerdo">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>
              AP (cm)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="0.0"
              value={le1}
              onChange={(e) => setLe1(e.target.value)}
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
              value={le2}
              onChange={(e) => setLe2(e.target.value)}
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
              value={le3}
              onChange={(e) => setLe3(e.target.value)}
              min={0}
              step={0.1}
            />
          </div>
        </div>
      </Section>

      {/* Istmo */}
      <Section title="Istmo">
        <div className="max-w-xs">
          <label className={labelCls} style={labelStyle}>
            Espessura do Istmo (cm)
          </label>
          <input
            type="number"
            className={inputCls}
            placeholder="0.0"
            value={istmo}
            onChange={(e) => setIstmo(e.target.value)}
            min={0}
            step={0.1}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
            Normal: &le; 3 mm
          </p>
        </div>
      </Section>

      {/* Resultados */}
      <Section title="Resultados">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <ResultBadge
            label="Volume Lobo Direito"
            value={
              result.volRight !== null
                ? `${result.volRight.toFixed(1)} mL`
                : '—'
            }
            color={result.classRight.color}
          />
          <ResultBadge
            label="Volume Lobo Esquerdo"
            value={
              result.volLeft !== null
                ? `${result.volLeft.toFixed(1)} mL`
                : '—'
            }
            color={result.classLeft.color}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ResultBadge
            label="Volume Total"
            value={
              result.total !== null
                ? `${result.total.toFixed(1)} mL`
                : '—'
            }
            color={result.classTotal.color}
            large
          />
          <ResultBadge
            label="Istmo"
            value={
              result.istmoVal !== null
                ? `${result.istmoVal.toFixed(1)} cm`
                : '—'
            }
            color={result.istmoClass.color}
          />
        </div>

        {/* Classification table */}
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
            Classificação
          </p>
          {result.classRight.text !== '—' && (
            <p className="text-xs mb-1" style={{ color: result.classRight.color }}>
              Lobo Direito: {result.classRight.text} ({result.volRight?.toFixed(1)} mL)
            </p>
          )}
          {result.classLeft.text !== '—' && (
            <p className="text-xs mb-1" style={{ color: result.classLeft.color }}>
              Lobo Esquerdo: {result.classLeft.text} ({result.volLeft?.toFixed(1)} mL)
            </p>
          )}
          {result.classTotal.text !== '—' && (
            <p className="text-xs mb-1" style={{ color: result.classTotal.color }}>
              Volume Total: {result.classTotal.text} ({result.total?.toFixed(1)} mL)
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
            Volume de cada lobo: 7 &ndash; 10 mL (normal) | Volume total: até 18 &ndash; 20 mL
          </p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            Istmo: &le; 3 mm
          </p>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
