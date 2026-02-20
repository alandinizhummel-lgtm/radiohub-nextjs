'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  inputCls,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

type Mode = 'chemical-shift' | 'pdff'

export default function GorduraHepatica() {
  const [mode, setMode] = useState<Mode>('chemical-shift')

  /* Chemical Shift */
  const [inPhase, setInPhase] = useState('')
  const [outPhase, setOutPhase] = useState('')

  /* PDFF direto */
  const [pdff, setPdff] = useState('')

  const result = useMemo(() => {
    let fatFraction: number | null = null

    if (mode === 'chemical-shift') {
      const ip = parseFloat(inPhase)
      const op = parseFloat(outPhase)
      if (ip > 0 && op >= 0) {
        fatFraction = ((ip - op) / (2 * ip)) * 100
      }
    } else {
      const p = parseFloat(pdff)
      if (p >= 0) {
        fatFraction = p
      }
    }

    function classify(v: number | null): {
      text: string
      grade: string
      color: string
    } {
      if (v === null)
        return { text: '—', grade: '—', color: 'var(--text3)' }
      if (v < 5)
        return {
          text: 'Normal',
          grade: 'S0',
          color: 'var(--green)',
        }
      if (v <= 17)
        return {
          text: 'Esteatose leve',
          grade: 'S1',
          color: 'var(--orange)',
        }
      if (v <= 22)
        return {
          text: 'Esteatose moderada',
          grade: 'S2',
          color: 'var(--orange)',
        }
      return {
        text: 'Esteatose severa',
        grade: 'S3',
        color: 'var(--red)',
      }
    }

    return {
      fatFraction,
      classification: classify(fatFraction),
    }
  }, [mode, inPhase, outPhase, pdff])

  const tabBtnStyle = (active: boolean) => ({
    backgroundColor: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--text3)',
    borderColor: active ? 'var(--accent)' : 'var(--border)',
  })

  return (
    <CalculatorLayout
      title="Fração de Gordura Hepática"
      subtitle="Chemical Shift MRI ou PDFF"
      references={[
        {
          text: 'Reeder SB, Cruite I, Hamilton G, et al. Quantitative assessment of liver fat with magnetic resonance imaging and spectroscopy. J Magn Reson Imaging. 2011;34(4):729-749.',
        },
      ]}
    >
      {/* Modo */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode('chemical-shift')}
          className="px-4 py-2 rounded-lg border text-sm font-semibold transition-all"
          style={tabBtnStyle(mode === 'chemical-shift')}
        >
          Chemical Shift (IP/OP)
        </button>
        <button
          type="button"
          onClick={() => setMode('pdff')}
          className="px-4 py-2 rounded-lg border text-sm font-semibold transition-all"
          style={tabBtnStyle(mode === 'pdff')}
        >
          PDFF Direto
        </button>
      </div>

      {mode === 'chemical-shift' && (
        <Section title="Sinais - Chemical Shift MRI">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={labelStyle}>
                Sinal In-Phase (IP)
              </label>
              <input
                type="number"
                className={inputCls}
                placeholder="Ex: 500"
                value={inPhase}
                onChange={(e) => setInPhase(e.target.value)}
                min={0}
                step={1}
              />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>
                Sinal Out-of-Phase (OP)
              </label>
              <input
                type="number"
                className={inputCls}
                placeholder="Ex: 400"
                value={outPhase}
                onChange={(e) => setOutPhase(e.target.value)}
                min={0}
                step={1}
              />
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
            Fórmula: FF = (IP - OP) / (2 &times; IP) &times; 100%
          </p>
        </Section>
      )}

      {mode === 'pdff' && (
        <Section title="PDFF - Proton Density Fat Fraction">
          <div className="max-w-xs">
            <label className={labelCls} style={labelStyle}>
              PDFF (%)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="Ex: 8.5"
              value={pdff}
              onChange={(e) => setPdff(e.target.value)}
              min={0}
              max={100}
              step={0.1}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text3)' }}>
            Insira o valor de PDFF obtido diretamente da sequência de RM (ex: IDEAL-IQ, mDIXON Quant, LiverLab).
          </p>
        </Section>
      )}

      {/* Resultados */}
      <Section title="Resultados">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <ResultBadge
            label="Fração de Gordura"
            value={
              result.fatFraction !== null
                ? `${result.fatFraction.toFixed(1)}%`
                : '—'
            }
            color={result.classification.color}
            large
          />
          <ResultBadge
            label="Classificação"
            value={result.classification.text}
            color={result.classification.color}
          />
          <ResultBadge
            label="Grau"
            value={result.classification.grade}
            color={result.classification.color}
          />
        </div>

        {/* Classification table */}
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
            Classificação da Esteatose Hepática (PDFF / Chemical Shift)
          </p>
          <div className="space-y-1">
            {[
              {
                grade: 'S0',
                range: '< 5%',
                desc: 'Normal',
                color: 'var(--green)',
              },
              {
                grade: 'S1',
                range: '5 - 17%',
                desc: 'Esteatose leve',
                color: 'var(--orange)',
              },
              {
                grade: 'S2',
                range: '17 - 22%',
                desc: 'Esteatose moderada',
                color: 'var(--orange)',
              },
              {
                grade: 'S3',
                range: '> 22%',
                desc: 'Esteatose severa',
                color: 'var(--red)',
              },
            ].map((row) => (
              <div
                key={row.grade}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className="w-8 font-bold"
                  style={{ color: row.color }}
                >
                  {row.grade}
                </span>
                <span
                  className="w-16 font-mono"
                  style={{ color: 'var(--text2)' }}
                >
                  {row.range}
                </span>
                <span style={{ color: 'var(--text3)' }}>{row.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
