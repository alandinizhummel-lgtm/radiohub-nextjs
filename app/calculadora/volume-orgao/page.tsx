'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  inputCls,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

export default function VolumeOrgao() {
  const [d1, setD1] = useState('')
  const [d2, setD2] = useState('')
  const [d3, setD3] = useState('')
  const [orgao, setOrgao] = useState('')

  const result = useMemo(() => {
    const a = parseFloat(d1)
    const b = parseFloat(d2)
    const c = parseFloat(d3)

    const valid = a > 0 && b > 0 && c > 0

    const volumeEllipsoid = valid ? (Math.PI / 6) * a * b * c : null
    const volumeSimplified = valid ? 0.52 * a * b * c : null

    return { volumeEllipsoid, volumeSimplified }
  }, [d1, d2, d3])

  return (
    <CalculatorLayout
      title="Volume de Órgão (Elipsoide Genérico)"
      subtitle="V = π/6 × D1 × D2 × D3"
      references={[
        {
          text: 'Aproximação elipsoide geral. O volume de um elipsoide é V = (4/3)π(a/2)(b/2)(c/2) = π/6 × D1 × D2 × D3.',
        },
      ]}
    >
      {/* Nome do órgão */}
      <Section title="Identificação">
        <div className="max-w-sm">
          <label className={labelCls} style={labelStyle}>
            Nome do órgão / estrutura
          </label>
          <input
            type="text"
            className={inputCls}
            placeholder="Ex: Rim direito, Nódulo, etc."
            value={orgao}
            onChange={(e) => setOrgao(e.target.value)}
          />
        </div>
      </Section>

      {/* Dimensões */}
      <Section title="Dimensões">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>
              D1 (cm)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="0.0"
              value={d1}
              onChange={(e) => setD1(e.target.value)}
              min={0}
              step={0.1}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              D2 (cm)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="0.0"
              value={d2}
              onChange={(e) => setD2(e.target.value)}
              min={0}
              step={0.1}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              D3 (cm)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="0.0"
              value={d3}
              onChange={(e) => setD3(e.target.value)}
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
            label={
              orgao
                ? `Volume - ${orgao} (π/6)`
                : 'Volume (π/6 × D1 × D2 × D3)'
            }
            value={
              result.volumeEllipsoid !== null
                ? `${result.volumeEllipsoid.toFixed(2)} mL`
                : '—'
            }
            color="var(--accent)"
            large
          />
          <ResultBadge
            label={
              orgao
                ? `Volume - ${orgao} (0,52)`
                : 'Volume (0,52 × D1 × D2 × D3)'
            }
            value={
              result.volumeSimplified !== null
                ? `${result.volumeSimplified.toFixed(2)} mL`
                : '—'
            }
            color="var(--accent2)"
            large
          />
        </div>

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
            Fórmulas
          </p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            <strong style={{ color: 'var(--text2)' }}>Elipsoide exato:</strong>{' '}
            V = &pi;/6 &times; D1 &times; D2 &times; D3 &asymp; 0,5236 &times; D1 &times; D2 &times; D3
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
            <strong style={{ color: 'var(--text2)' }}>Simplificado:</strong>{' '}
            V = 0,52 &times; D1 &times; D2 &times; D3
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
            A fórmula do elipsoide é uma aproximação amplamente utilizada para estimar o volume de estruturas de formato oval em imagens de ultrassom, TC e RM. Os diâmetros devem ser medidos nos três planos ortogonais.
          </p>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
