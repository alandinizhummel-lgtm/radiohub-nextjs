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
  { id: 'IC', label: 'IC', fullName: 'Cápsula interna', level: 'ganglionic' },
  { id: 'I', label: 'I', fullName: 'Córtex insular', level: 'ganglionic' },
  { id: 'M1', label: 'M1', fullName: 'Córtex ACM anterior', level: 'ganglionic' },
  { id: 'M2', label: 'M2', fullName: 'Córtex ACM lateral à ínsula', level: 'ganglionic' },
  { id: 'M3', label: 'M3', fullName: 'Córtex ACM posterior', level: 'ganglionic' },
  { id: 'M4', label: 'M4', fullName: 'Território ACM anterior (acima M1)', level: 'supraganglionic' },
  { id: 'M5', label: 'M5', fullName: 'Território ACM lateral (acima M2)', level: 'supraganglionic' },
  { id: 'M6', label: 'M6', fullName: 'Território ACM posterior (acima M3)', level: 'supraganglionic' },
]

// ═══════════════════════════════════════════════════════════
// Brain SVG region geometry
// Brain ellipse: cx=100 cy=102 rx=75 ry=70
// Inner cortex: rx=52 ry=48 | Deep boundary: rx=35 ry=32
// ═══════════════════════════════════════════════════════════

const GANG_PATHS: { id: string; d: string; lx: number; ly: number }[] = [
  { id: 'M1', d: 'M100,32 A75,70 0 0 0 35,67 L55,78 A52,48 0 0 1 100,54 Z', lx: 63, ly: 52 },
  { id: 'M2', d: 'M35,67 A75,70 0 0 0 35,137 L55,126 A52,48 0 0 1 55,78 Z', lx: 37, ly: 102 },
  { id: 'M3', d: 'M35,137 A75,70 0 0 0 100,172 L100,150 A52,48 0 0 1 55,126 Z', lx: 63, ly: 152 },
  { id: 'I', d: 'M60,71 A52,48 0 0 0 60,133 L73,123 A35,32 0 0 1 73,81 Z', lx: 58, ly: 102 },
]

const GANG_DEEP: { id: string; cx: number; cy: number; rx: number; ry: number }[] = [
  { id: 'C', cx: 92, cy: 78, rx: 7, ry: 9 },
  { id: 'IC', cx: 87, cy: 92, rx: 4, ry: 7 },
  { id: 'L', cx: 80, cy: 106, rx: 10, ry: 9 },
]

const SUPRA_PATHS: { id: string; d: string; lx: number; ly: number }[] = [
  { id: 'M4', d: 'M100,32 A75,70 0 0 0 35,67 L100,102 Z', lx: 72, ly: 60 },
  { id: 'M5', d: 'M35,67 A75,70 0 0 0 35,137 L100,102 Z', lx: 52, ly: 102 },
  { id: 'M6', d: 'M35,137 A75,70 0 0 0 100,172 L100,102 Z', lx: 72, ly: 145 },
]

const SULCI_R = [
  'M110,48 Q132,56 158,50', 'M108,72 Q138,78 168,70',
  'M106,98 Q142,92 172,102', 'M108,124 Q138,130 168,124',
  'M106,148 Q132,154 162,146',
]

function BrainSVG({ level, affected, onToggle }: {
  level: 'ganglionic' | 'supraganglionic'
  affected: Set<string>
  onToggle: (id: string) => void
}) {
  const paths = level === 'ganglionic' ? GANG_PATHS : SUPRA_PATHS
  const deep = level === 'ganglionic' ? GANG_DEEP : []
  const f = (id: string) => affected.has(id) ? 'rgba(220,50,50,0.4)' : 'rgba(130,190,255,0.18)'
  const s = (id: string) => affected.has(id) ? '#dc2626' : 'rgba(100,100,100,0.5)'
  const t = (id: string) => affected.has(id) ? '#b91c1c' : '#555'

  return (
    <div className="text-center">
      <p className="text-[10px] font-semibold mb-1" style={{ color: 'var(--text3)' }}>
        {level === 'ganglionic' ? 'Nível Ganglionar' : 'Nível Supraganglionar'}
      </p>
      <svg viewBox="0 0 200 204" className="w-full max-w-[220px] mx-auto select-none">
        <ellipse cx={100} cy={102} rx={90} ry={82} fill="#fde8e8" stroke="#d4a0a0" strokeWidth={1.5} />
        <ellipse cx={8} cy={102} rx={5} ry={12} fill="#fde8e8" stroke="#d4a0a0" strokeWidth={1} />
        <ellipse cx={192} cy={102} rx={5} ry={12} fill="#fde8e8" stroke="#d4a0a0" strokeWidth={1} />
        <path d="M95,22 Q100,12 105,22" fill="#fde8e8" stroke="#d4a0a0" strokeWidth={1.2} />
        <path d="M100,32 A75,70 0 0 1 100,172 Z" fill="#e8e0ee" stroke="#bbb" strokeWidth={0.8} />
        {SULCI_R.map((d, i) => <path key={`r${i}`} d={d} fill="none" stroke="rgba(150,130,170,0.35)" strokeWidth={0.7} style={{ pointerEvents: 'none' }} />)}
        <path d="M100,32 A75,70 0 0 0 100,172 Z" fill="#f3ecf8" stroke="#bbb" strokeWidth={0.8} />
        {SULCI_R.map((d, i) => <path key={`l${i}`} d={d} fill="none" stroke="rgba(150,130,170,0.2)" strokeWidth={0.5} transform="scale(-1,1) translate(-200,0)" style={{ pointerEvents: 'none' }} />)}
        {paths.map(r => (
          <g key={r.id} onClick={() => onToggle(r.id)} style={{ cursor: 'pointer' }}>
            <path d={r.d} fill={f(r.id)} stroke={s(r.id)} strokeWidth={1.2} />
            <text x={r.lx} y={r.ly} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold" fill={t(r.id)} style={{ pointerEvents: 'none' }}>{r.id}</text>
          </g>
        ))}
        {deep.map(ds => (
          <g key={ds.id} onClick={() => onToggle(ds.id)} style={{ cursor: 'pointer' }}>
            <ellipse cx={ds.cx} cy={ds.cy} rx={ds.rx} ry={ds.ry} fill={f(ds.id)} stroke={s(ds.id)} strokeWidth={1.2} />
            <text x={ds.cx} y={ds.cy} textAnchor="middle" dominantBaseline="central" fontSize={ds.id === 'IC' ? 7 : 9} fontWeight="bold" fill={t(ds.id)} style={{ pointerEvents: 'none' }}>{ds.id}</text>
          </g>
        ))}
        <line x1={100} y1={32} x2={100} y2={172} stroke="rgba(100,100,100,0.3)" strokeWidth={0.8} strokeDasharray="4,3" style={{ pointerEvents: 'none' }} />
        <text x={100} y={8} textAnchor="middle" fontSize={9} fill="#bbb" style={{ pointerEvents: 'none' }}>A</text>
        <text x={100} y={198} textAnchor="middle" fontSize={9} fill="#bbb" style={{ pointerEvents: 'none' }}>P</text>
        <text x={145} y={102} textAnchor="middle" fontSize={8} fill="#aaa" fontStyle="italic" style={{ pointerEvents: 'none' }}>normal</text>
      </svg>
    </div>
  )
}

export default function Aspects() {
  const [affected, setAffected] = useState<Set<string>>(new Set())

  const toggleRegion = (id: string) => {
    setAffected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const score = useMemo(() => 10 - affected.size, [affected])

  const interpretation = useMemo(() => {
    if (score === 10) return { text: 'Sem alterações isquêmicas precoces no território da ACM', color: 'var(--green)' }
    if (score >= 8) return { text: 'Alterações isquêmicas precoces mínimas. Prognóstico geralmente favorável.', color: 'var(--green)' }
    if (score >= 6) return { text: 'Alterações isquêmicas moderadas. Score ≥6: favorável para trombectomia mecânica.', color: 'var(--orange)' }
    if (score >= 4) return { text: 'Alterações isquêmicas extensas. Score ≤7: risco aumentado de transformação hemorrágica.', color: 'var(--orange)' }
    return { text: 'Alterações isquêmicas muito extensas. Risco elevado de transformação hemorrágica.', color: 'var(--red)' }
  }, [score])

  return (
    <CalculatorLayout
      title="ASPECTS"
      subtitle="Alberta Stroke Program Early CT Score – Território da ACM"
      references={[{
        text: 'Barber PA, Demchuk AM, Zhang J, Buchan AM. Validity and reliability of a quantitative computed tomography score in predicting outcome of hyperacute stroke before thrombolytic therapy. Lancet. 2000;355(9216):1670-1674.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/10905241/',
      }]}
    >
      <Section title="Regiões do Território da ACM">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          Clique nas regiões com sinais de isquemia precoce (hipodensidade, edema, apagamento de sulcos).
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <BrainSVG level="ganglionic" affected={affected} onToggle={toggleRegion} />
          <BrainSVG level="supraganglionic" affected={affected} onToggle={toggleRegion} />
        </div>

        <div className="flex flex-wrap gap-1.5 justify-center">
          {regions.map(r => {
            const on = affected.has(r.id)
            return (
              <button key={r.id} type="button" onClick={() => toggleRegion(r.id)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all"
                style={on
                  ? { borderColor: 'var(--red)', backgroundColor: 'rgba(220,38,38,0.12)', color: 'var(--red)' }
                  : { borderColor: 'var(--border)', backgroundColor: 'var(--surface2)', color: 'var(--text3)' }
                }
              >
                <span className="font-bold">{r.label}</span>{' '}
                <span className="opacity-75">{r.fullName}</span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Resultado">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <ResultBadge label="ASPECTS Score" value={`${score} / 10`}
            color={score >= 8 ? 'var(--green)' : score >= 6 ? 'var(--orange)' : 'var(--red)'} large />
          <ResultBadge label="Regiões Afetadas" value={`${affected.size} de 10`}
            color={affected.size === 0 ? 'var(--green)' : affected.size <= 3 ? 'var(--orange)' : 'var(--red)'} large />
        </div>

        <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg2)', borderColor: interpretation.color + '44' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Interpretação</p>
          <p className="text-sm font-semibold" style={{ color: interpretation.color }}>{interpretation.text}</p>
        </div>

        <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Limiares Clínicos</p>
          <div className="space-y-1">
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>ASPECTS 8-10:</span> Alterações mínimas, bom prognóstico
            </p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              <span style={{ color: 'var(--orange)', fontWeight: 600 }}>ASPECTS 6-7:</span> Favorável para trombectomia mecânica
            </p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              <span style={{ color: 'var(--red)', fontWeight: 600 }}>ASPECTS &lt;6:</span> Risco elevado, benefício limitado
            </p>
          </div>
        </div>

        {affected.size > 0 && (
          <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Regiões Afetadas</p>
            <div className="flex flex-wrap gap-1.5">
              {regions.filter(r => affected.has(r.id)).map(r => (
                <span key={r.id} className="text-xs px-2 py-0.5 rounded-md font-semibold"
                  style={{ backgroundColor: 'rgba(220,38,38,0.12)', color: 'var(--red)' }}
                >{r.label} – {r.fullName}</span>
              ))}
            </div>
          </div>
        )}
      </Section>
    </CalculatorLayout>
  )
}
