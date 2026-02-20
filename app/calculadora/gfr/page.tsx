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

export default function GFRCalculator() {
  const [creatinina, setCreatinina] = useState('')
  const [idade, setIdade] = useState('')
  const [sexo, setSexo] = useState<'masculino' | 'feminino'>('masculino')

  const result = useMemo(() => {
    const scr = parseFloat(creatinina)
    const age = parseFloat(idade)

    if (!(scr > 0) || !(age > 0)) {
      return {
        egfr: null,
        stage: { text: '—', color: 'var(--text3)' },
        contrastWarning: false,
      }
    }

    /* CKD-EPI 2021 (race-free) */
    const kappa = sexo === 'feminino' ? 0.7 : 0.9
    const alpha = sexo === 'feminino' ? -0.241 : -0.302
    const sexFactor = sexo === 'feminino' ? 1.012 : 1.0

    const minRatio = Math.min(scr / kappa, 1)
    const maxRatio = Math.max(scr / kappa, 1)

    const egfr =
      142 *
      Math.pow(minRatio, alpha) *
      Math.pow(maxRatio, -1.2) *
      Math.pow(0.9938, age) *
      sexFactor

    function classifyGFR(v: number): { text: string; color: string } {
      if (v >= 90) return { text: 'G1 - Normal ou elevado', color: 'var(--green)' }
      if (v >= 60) return { text: 'G2 - Levemente reduzido', color: 'var(--green)' }
      if (v >= 45) return { text: 'G3a - Leve a moderadamente reduzido', color: 'var(--orange)' }
      if (v >= 30) return { text: 'G3b - Moderado a severamente reduzido', color: 'var(--orange)' }
      if (v >= 15) return { text: 'G4 - Severamente reduzido', color: 'var(--red)' }
      return { text: 'G5 - Falência renal', color: 'var(--red)' }
    }

    return {
      egfr,
      stage: classifyGFR(egfr),
      contrastWarning: egfr < 30,
    }
  }, [creatinina, idade, sexo])

  return (
    <CalculatorLayout
      title="Taxa de Filtração Glomerular (TFG)"
      subtitle="CKD-EPI 2021 (sem variável de raça)"
      references={[
        {
          text: 'Inker LA, Eneanya ND, Coresh J, et al. New Creatinine- and Cystatin C-Based Equations to Estimate GFR without Race. N Engl J Med. 2021;385(19):1737-1749.',
        },
      ]}
    >
      {/* Dados */}
      <Section title="Dados do Paciente">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>
              Creatinina sérica (mg/dL)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="1.0"
              value={creatinina}
              onChange={(e) => setCreatinina(e.target.value)}
              min={0}
              step={0.01}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Idade (anos)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="50"
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
              min={0}
              step={1}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Sexo
            </label>
            <select
              className={selectCls}
              value={sexo}
              onChange={(e) =>
                setSexo(e.target.value as 'masculino' | 'feminino')
              }
            >
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Resultados */}
      <Section title="Resultados">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <ResultBadge
            label="eGFR (CKD-EPI 2021)"
            value={
              result.egfr !== null
                ? `${result.egfr.toFixed(1)} mL/min/1.73m²`
                : '—'
            }
            color={result.stage.color}
            large
          />
          <ResultBadge
            label="Estágio DRC"
            value={result.stage.text}
            color={result.stage.color}
          />
        </div>

        {/* Contrast warning */}
        {result.contrastWarning && (
          <div
            className="rounded-lg border p-3 mb-3"
            style={{
              backgroundColor: 'rgba(239,68,68,0.08)',
              borderColor: 'var(--red)',
            }}
          >
            <p
              className="text-xs font-bold mb-1"
              style={{ color: 'var(--red)' }}
            >
              Alerta: Contraste Iodado
            </p>
            <p className="text-xs" style={{ color: 'var(--red)' }}>
              eGFR &lt;30 mL/min/1,73m²: risco elevado de nefropatia induzida por contraste. Avaliar necessidade do exame contrastado, hidratação prévia e alternativas diagnósticas.
            </p>
          </div>
        )}

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
            Classificação KDIGO
          </p>
          <div className="space-y-1">
            {[
              { stage: 'G1', range: '≥ 90', desc: 'Normal ou elevado', color: 'var(--green)' },
              { stage: 'G2', range: '60 - 89', desc: 'Levemente reduzido', color: 'var(--green)' },
              { stage: 'G3a', range: '45 - 59', desc: 'Leve a moderadamente reduzido', color: 'var(--orange)' },
              { stage: 'G3b', range: '30 - 44', desc: 'Moderado a severamente reduzido', color: 'var(--orange)' },
              { stage: 'G4', range: '15 - 29', desc: 'Severamente reduzido', color: 'var(--red)' },
              { stage: 'G5', range: '< 15', desc: 'Falência renal', color: 'var(--red)' },
            ].map((row) => (
              <div key={row.stage} className="flex items-center gap-2 text-xs">
                <span
                  className="w-8 font-bold"
                  style={{ color: row.color }}
                >
                  {row.stage}
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
            Fórmula CKD-EPI 2021
          </p>
          <p className="text-xs font-mono" style={{ color: 'var(--text3)' }}>
            eGFR = 142 &times; min(Scr/&kappa;, 1)^&alpha; &times; max(Scr/&kappa;, 1)^(-1,200) &times; 0,9938^Idade &times; (1,012 se feminino)
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
            &kappa; = 0,7 (feminino), 0,9 (masculino) | &alpha; = -0,241 (feminino), -0,302 (masculino)
          </p>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
