'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  inputCls,
  labelCls,
  labelStyle,
} from '@/app/calculadora/components/calculator-layout'

export default function VolumeHepatico() {
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [volumeManual, setVolumeManual] = useState('')
  const [remnantVol, setRemnantVol] = useState('')

  const result = useMemo(() => {
    const w = parseFloat(peso)
    const h = parseFloat(altura)
    const manual = parseFloat(volumeManual)
    const remnant = parseFloat(remnantVol)

    /* BSA (Mosteller) */
    const bsa = w > 0 && h > 0 ? Math.sqrt((h * w) / 3600) : null

    /* Standard Liver Volume (Urata) */
    const slv = bsa !== null ? 706.2 * bsa + 2.4 : null

    /* Total liver volume: use manual if provided, otherwise SLV */
    const totalLiver = manual > 0 ? manual : slv

    /* Future Liver Remnant % */
    const flrPercent =
      remnant > 0 && totalLiver !== null && totalLiver > 0
        ? (remnant / totalLiver) * 100
        : null

    function classifyFLR(v: number | null): {
      text: string
      color: string
    } {
      if (v === null) return { text: '—', color: 'var(--text3)' }
      if (v >= 40)
        return { text: 'Adequado (fígado normal)', color: 'var(--green)' }
      if (v >= 30)
        return {
          text: 'Limítrofe (avaliar contexto)',
          color: 'var(--orange)',
        }
      if (v >= 20)
        return {
          text: 'Insuficiente para fígado normal; pode ser adequado se fígado saudável jovem',
          color: 'var(--orange)',
        }
      return { text: 'Insuficiente', color: 'var(--red)' }
    }

    return {
      bsa,
      slv,
      totalLiver,
      flrPercent,
      classFLR: classifyFLR(flrPercent),
    }
  }, [peso, altura, volumeManual, remnantVol])

  return (
    <CalculatorLayout
      title="Volume Hepático Padrão"
      subtitle="Fórmula de Urata (SLV = 706,2 × BSA + 2,4)"
      references={[
        {
          text: 'Urata K, Kawasaki S, Matsunami H, et al. Calculation of child and adult standard liver volume for liver transplantation. Hepatology. 1995;21(2):317-321.',
        },
      ]}
    >
      {/* Dados do Paciente */}
      <Section title="Dados do Paciente">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>
              Peso (kg)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="70"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              min={0}
              step={0.1}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Altura (cm)
            </label>
            <input
              type="number"
              className={inputCls}
              placeholder="170"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              min={0}
              step={1}
            />
          </div>
        </div>
      </Section>

      {/* Volume Manual (volumetria TC/RM) */}
      <Section title="Volumetria por TC/RM (opcional)">
        <div className="max-w-xs">
          <label className={labelCls} style={labelStyle}>
            Volume hepático total medido (mL)
          </label>
          <input
            type="number"
            className={inputCls}
            placeholder="Opcional"
            value={volumeManual}
            onChange={(e) => setVolumeManual(e.target.value)}
            min={0}
            step={1}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
            Se preenchido, será usado no lugar do SLV para o cálculo do remanescente.
          </p>
        </div>
      </Section>

      {/* Remanescente Hepático Futuro */}
      <Section title="Remanescente Hepático Futuro (FLR)">
        <div className="max-w-xs">
          <label className={labelCls} style={labelStyle}>
            Volume do remanescente (mL)
          </label>
          <input
            type="number"
            className={inputCls}
            placeholder="0"
            value={remnantVol}
            onChange={(e) => setRemnantVol(e.target.value)}
            min={0}
            step={1}
          />
        </div>
      </Section>

      {/* Resultados */}
      <Section title="Resultados">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <ResultBadge
            label="BSA (Mosteller)"
            value={
              result.bsa !== null ? `${result.bsa.toFixed(2)} m²` : '—'
            }
          />
          <ResultBadge
            label="Vol. Hepático Padrão (SLV)"
            value={
              result.slv !== null ? `${result.slv.toFixed(0)} mL` : '—'
            }
            color="var(--accent)"
            large
          />
          <ResultBadge
            label="Volume de Referência"
            value={
              result.totalLiver !== null
                ? `${result.totalLiver.toFixed(0)} mL`
                : '—'
            }
          />
        </div>

        {result.flrPercent !== null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <ResultBadge
              label="FLR (%)"
              value={`${result.flrPercent.toFixed(1)}%`}
              color={result.classFLR.color}
              large
            />
            <ResultBadge
              label="Interpretação FLR"
              value={result.classFLR.text}
              color={result.classFLR.color}
            />
          </div>
        )}

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
            Informações
          </p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            BSA (Mosteller) = &radic;(Altura &times; Peso / 3600)
          </p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>
            SLV (Urata) = 706,2 &times; BSA + 2,4
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
            FLR adequado: &ge;40% (fígado normal) | &ge;30% (pós-quimioterapia) | &ge;20% (fígado jovem saudável)
          </p>
        </div>
      </Section>
    </CalculatorLayout>
  )
}
