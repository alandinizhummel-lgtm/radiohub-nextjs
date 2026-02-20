'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
} from '@/app/calculadora/components/calculator-layout'

interface Region {
  id: string
  label: string
  fullName: string
  level: 'ganglionic' | 'supraganglionic'
}

const regions: Region[] = [
  { id: 'C', label: 'C', fullName: 'Caudado', level: 'ganglionic' },
  { id: 'L', label: 'L', fullName: 'Lentiforme', level: 'ganglionic' },
  { id: 'IC', label: 'IC', fullName: 'Capsula interna', level: 'ganglionic' },
  { id: 'I', label: 'I', fullName: 'Córtex insular', level: 'ganglionic' },
  { id: 'M1', label: 'M1', fullName: 'Córtex ACM anterior', level: 'ganglionic' },
  { id: 'M2', label: 'M2', fullName: 'Córtex ACM lateral à insula', level: 'ganglionic' },
  { id: 'M3', label: 'M3', fullName: 'Córtex ACM posterior', level: 'ganglionic' },
  { id: 'M4', label: 'M4', fullName: 'Território ACM anterior acima de M1', level: 'supraganglionic' },
  { id: 'M5', label: 'M5', fullName: 'Território ACM lateral acima de M2', level: 'supraganglionic' },
  { id: 'M6', label: 'M6', fullName: 'Território ACM posterior acima de M3', level: 'supraganglionic' },
]

export default function Aspects() {
  const [affected, setAffected] = useState<Set<string>>(new Set())

  const toggleRegion = (id: string) => {
    setAffected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const score = useMemo(() => 10 - affected.size, [affected])

  const interpretation = useMemo(() => {
    if (score === 10) return { text: 'Sem alterações isquêmicas precoces no território da ACM', color: 'var(--green)' }
    if (score >= 8) return { text: 'Alterações isquêmicas precoces minimas. Prognóstico geralmente favoravel.', color: 'var(--green)' }
    if (score >= 6) return { text: 'Alterações isquêmicas moderadas. Score >=6: favoravel para trombectomia mecânica.', color: 'var(--orange)' }
    if (score >= 4) return { text: 'Alterações isquêmicas extensas. Score <=7: risco aumentado de transformação hemorrágica.', color: 'var(--orange)' }
    return { text: 'Alterações isquêmicas muito extensas. Risco elevado de transformação hemorrágica. Beneficio limitado da trombectomia.', color: 'var(--red)' }
  }, [score])

  const ganglionicRegions = regions.filter(r => r.level === 'ganglionic')
  const supraganglionicRegions = regions.filter(r => r.level === 'supraganglionic')

  return (
    <CalculatorLayout
      title="ASPECTS"
      subtitle="Alberta Stroke Program Early CT Score - Território da ACM"
      references={[
        {
          text: 'Barber PA, Demchuk AM, Zhang J, Buchan AM. Validity and reliability of a quantitative computed tomography score in predicting outcome of hyperacute stroke before thrombolytic therapy. Lancet. 2000;355(9216):1670-1674.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/10905241/',
        },
      ]}
    >
      <Section title="Regiões do Território da ACM">
        <p className="text-xs mb-4" style={{ color: 'var(--text3)' }}>
          Clique nas regiões com sinais de isquemia precoce (hipodensidade, edema, apagamento de sulcos). Cada região afetada subtrai 1 ponto do escore total de 10.
        </p>

        <div className="mb-3">
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>
            Nivel Ganglionar (corte dos nucleos da base)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ganglionicRegions.map(region => {
              const isAffected = affected.has(region.id)
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => toggleRegion(region.id)}
                  className="p-3 rounded-lg border text-center transition-all"
                  style={
                    isAffected
                      ? {
                          borderColor: 'var(--red)',
                          backgroundColor: 'rgba(220,38,38,0.12)',
                          color: 'var(--red)',
                        }
                      : {
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--surface2)',
                          color: 'var(--text)',
                        }
                  }
                >
                  <div className="text-lg font-bold">{region.label}</div>
                  <div className="text-[10px] mt-0.5" style={{ opacity: 0.75 }}>
                    {region.fullName}
                  </div>
                  <div
                    className="text-[10px] font-semibold mt-1"
                    style={{ color: isAffected ? 'var(--red)' : 'var(--green)' }}
                  >
                    {isAffected ? 'Afetado (-1)' : 'Normal'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>
            Nivel Supraganglionar (acima dos nucleos da base)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {supraganglionicRegions.map(region => {
              const isAffected = affected.has(region.id)
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => toggleRegion(region.id)}
                  className="p-3 rounded-lg border text-center transition-all"
                  style={
                    isAffected
                      ? {
                          borderColor: 'var(--red)',
                          backgroundColor: 'rgba(220,38,38,0.12)',
                          color: 'var(--red)',
                        }
                      : {
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--surface2)',
                          color: 'var(--text)',
                        }
                  }
                >
                  <div className="text-lg font-bold">{region.label}</div>
                  <div className="text-[10px] mt-0.5" style={{ opacity: 0.75 }}>
                    {region.fullName}
                  </div>
                  <div
                    className="text-[10px] font-semibold mt-1"
                    style={{ color: isAffected ? 'var(--red)' : 'var(--green)' }}
                  >
                    {isAffected ? 'Afetado (-1)' : 'Normal'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </Section>

      <Section title="Resultado">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <ResultBadge
            label="ASPECTS Score"
            value={`${score} / 10`}
            color={
              score >= 8
                ? 'var(--green)'
                : score >= 6
                ? 'var(--orange)'
                : 'var(--red)'
            }
            large
          />
          <ResultBadge
            label="Regiões Afetadas"
            value={`${affected.size} de 10`}
            color={
              affected.size === 0
                ? 'var(--green)'
                : affected.size <= 3
                ? 'var(--orange)'
                : 'var(--red)'
            }
            large
          />
        </div>

        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: 'var(--bg2)',
            borderColor: interpretation.color + '44',
          }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>
            Interpretação
          </p>
          <p className="text-sm font-semibold" style={{ color: interpretation.color }}>
            {interpretation.text}
          </p>
        </div>

        <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Limiares Clinicos</p>
          <div className="space-y-1">
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>ASPECTS 8-10:</span> Alterações minimas, bom prognóstico com trombólise/trombectomia
            </p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              <span style={{ color: 'var(--orange)', fontWeight: 600 }}>ASPECTS 6-7:</span> Favoravel para trombectomia mecânica (ensaio MR CLEAN, ESCAPE)
            </p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              <span style={{ color: 'var(--red)', fontWeight: 600 }}>ASPECTS &lt;6:</span> Risco elevado de transformação hemorrágica, beneficio limitado
            </p>
          </div>
        </div>

        {affected.size > 0 && (
          <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Regiões Afetadas</p>
            <div className="flex flex-wrap gap-1.5">
              {regions
                .filter(r => affected.has(r.id))
                .map(r => (
                  <span
                    key={r.id}
                    className="text-xs px-2 py-0.5 rounded-md font-semibold"
                    style={{ backgroundColor: 'rgba(220,38,38,0.12)', color: 'var(--red)' }}
                  >
                    {r.label} - {r.fullName}
                  </span>
                ))}
            </div>
          </div>
        )}
      </Section>
    </CalculatorLayout>
  )
}
