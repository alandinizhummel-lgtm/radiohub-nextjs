'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
} from '@/app/calculadora/components/calculator-layout'

// ── Finding type ──────────────────────────────────────────
const findingOpts = [
  { value: 'none', label: 'Nenhum achado', description: 'Exame sem alterações' },
  { value: 'benign', label: 'Achado tipicamente benigno', description: 'Cisto simples, linfonodo intramamário, implante, calcificações benignas' },
  { value: 'mass', label: 'Nódulo / Massa', description: 'Lesão ocupando espaço, visível em duas incidências' },
  { value: 'calc', label: 'Calcificação', description: 'Calcificações suspeitas ou indeterminadas' },
  { value: 'asymmetry', label: 'Assimetria', description: 'Assimetria de densidade mamária' },
  { value: 'distortion', label: 'Distorção arquitetural', description: 'Alteração da arquitetura sem massa definida' },
  { value: 'known', label: 'Malignidade conhecida', description: 'Diagnóstico histopatológico prévio de malignidade' },
]

// ── Composition ────────────────────────────────────────────
const compositionOpts = [
  { value: 'a', label: 'A — Gordurosa', description: 'Mamas quase inteiramente gordurosas' },
  { value: 'b', label: 'B — Esparsas', description: 'Áreas esparsas de densidade fibroglandular' },
  { value: 'c', label: 'C — Heterogeneamente densa', description: 'Mamas heterogeneamente densas (pode obscurecer lesões)' },
  { value: 'd', label: 'D — Extremamente densa', description: 'Mamas extremamente densas (sensibilidade reduzida)' },
]

// ── Mass descriptors ───────────────────────────────────────
const massShapeOpts = [
  { value: 'oval', label: 'Oval', description: 'Forma elíptica — favorece benignidade' },
  { value: 'round', label: 'Redonda', description: 'Forma esférica — indeterminada' },
  { value: 'irregular', label: 'Irregular', description: 'Forma não classificável — suspeita' },
]

const massMarginOpts = [
  { value: 'circumscribed', label: 'Circunscrita', description: 'Pelo menos 75% das margens bem definidas' },
  { value: 'obscured', label: 'Obscurecida', description: 'Margem oculta por tecido adjacente' },
  { value: 'microlobulated', label: 'Microlobulada', description: 'Pequenas ondulações na margem' },
  { value: 'indistinct', label: 'Indistinta', description: 'Margem mal definida, sem causa adjacente' },
  { value: 'spiculated', label: 'Espiculada', description: 'Linhas irradiando da margem — altamente suspeita' },
]

// ── Calcification descriptors ──────────────────────────────
const calcMorphOpts = [
  { value: 'benign', label: 'Tipicamente benigna', description: 'Vasculares, grosseiras (pipoca), casca de ovo, leite de cálcio, sutura, distrófica' },
  { value: 'amorphous', label: 'Amorfa', description: 'Pequenas e sem forma definida' },
  { value: 'coarse_hetero', label: 'Grosseira heterogênea', description: 'Irregulares, entre 0,5 e 1 mm' },
  { value: 'fine_pleomorphic', label: 'Fina pleomórfica', description: 'Variáveis em tamanho e forma, < 0,5 mm' },
  { value: 'fine_linear', label: 'Fina linear / ramificada', description: 'Finas e lineares, sugestivas de preenchimento ductal' },
]

const calcDistOpts = [
  { value: 'diffuse', label: 'Difusa', description: 'Distribuídas aleatoriamente pela mama' },
  { value: 'regional', label: 'Regional', description: 'Ocupam grande volume (> 2 cm), não ductal' },
  { value: 'grouped', label: 'Agrupada', description: 'Pequeno grupo (cluster), < 2 cm' },
  { value: 'linear', label: 'Linear', description: 'Dispostas em linha, sugerindo ducto' },
  { value: 'segmental', label: 'Segmentar', description: 'Distribuição ductal / lobar' },
]

// ── Asymmetry descriptors ──────────────────────────────────
const asymmetryOpts = [
  { value: 'global', label: 'Assimetria global', description: 'Volume assimétrico sem massa focal' },
  { value: 'focal', label: 'Assimetria focal', description: 'Área focal de assimetria de densidade' },
  { value: 'developing', label: 'Assimetria em desenvolvimento', description: 'Assimetria focal nova ou em crescimento' },
]

// ── BI-RADS calculation logic ──────────────────────────────

function calcMassBirads(shape: string, margin: string): string {
  // Score: shape (oval=0, round=1, irregular=2) + margin (circumscribed=0, obscured=1, microlobulated=2, indistinct=2, spiculated=3)
  const shapeScore = shape === 'oval' ? 0 : shape === 'round' ? 1 : 2
  const marginScore = margin === 'circumscribed' ? 0 : margin === 'obscured' ? 1 :
    margin === 'microlobulated' ? 2 : margin === 'indistinct' ? 2 : 3
  const total = shapeScore + marginScore

  if (total <= 1) return '3'
  if (total === 2) return '4A'
  if (total === 3) return '4B'
  if (total === 4) return '4C'
  return '5'
}

function calcCalcBirads(morph: string, dist: string): string {
  if (morph === 'benign') return '2'
  // Suspicious distribution (linear, segmental) can upgrade
  const suspDist = dist === 'linear' || dist === 'segmental'
  if (morph === 'amorphous') return suspDist ? '4B' : '4A'
  if (morph === 'coarse_hetero') return suspDist ? '4B' : '4B'
  if (morph === 'fine_pleomorphic') return suspDist ? '4C' : '4B'
  if (morph === 'fine_linear') return '4C'
  return '4A'
}

function calcAsymBirads(type: string): string {
  if (type === 'global') return '3'
  if (type === 'focal') return '4A'
  if (type === 'developing') return '4B'
  return '3'
}

// ── Management & risk ──────────────────────────────────────

function getManagement(cat: string): { text: string; color: string } {
  switch (cat) {
    case '0': return { text: 'Avaliação incompleta. Solicitar exames adicionais (incidências complementares, ultrassonografia, RM).', color: '#eab308' }
    case '1': return { text: 'Exame normal. Seguimento de rotina conforme faixa etária.', color: '#16a34a' }
    case '2': return { text: 'Achado benigno. Seguimento de rotina conforme faixa etária.', color: '#16a34a' }
    case '3': return { text: 'Provavelmente benigno. Seguimento em curto prazo (6 meses) recomendado. Biópsia em caso de crescimento ou alteração.', color: '#22c55e' }
    case '4A': return { text: 'Baixa suspeita de malignidade. Biópsia percutânea recomendada (core biopsy ou PAAF).', color: '#f59e0b' }
    case '4B': return { text: 'Suspeita moderada de malignidade. Biópsia percutânea recomendada.', color: '#f59e0b' }
    case '4C': return { text: 'Alta suspeita de malignidade. Biópsia percutânea recomendada. Considerar correlação cirúrgica se resultado benigno.', color: '#dc2626' }
    case '5': return { text: 'Altamente sugestivo de malignidade. Biópsia percutânea e planejamento terapêutico recomendados.', color: '#dc2626' }
    case '6': return { text: 'Malignidade comprovada por biópsia. Tratamento oncológico conforme estadiamento.', color: '#dc2626' }
    default: return { text: '', color: 'var(--text3)' }
  }
}

function getMalignancyRisk(cat: string): string {
  switch (cat) {
    case '0': return 'N/A'
    case '1': return '~0%'
    case '2': return '~0%'
    case '3': return '< 2%'
    case '4A': return '2–10%'
    case '4B': return '10–50%'
    case '4C': return '50–95%'
    case '5': return '≥ 95%'
    case '6': return '100% (comprovado)'
    default: return ''
  }
}

// ── Main component ─────────────────────────────────────────

export default function BIRADSCalculator() {
  const [finding, setFinding] = useState('')
  const [composition, setComposition] = useState('')
  const [massShape, setMassShape] = useState('')
  const [massMargin, setMassMargin] = useState('')
  const [calcMorph, setCalcMorph] = useState('')
  const [calcDist, setCalcDist] = useState('')
  const [asymType, setAsymType] = useState('')
  const [distSurgical, setDistSurgical] = useState(false)

  // Reset sub-selections when finding type changes
  const handleFindingChange = (v: string) => {
    setFinding(v)
    setMassShape('')
    setMassMargin('')
    setCalcMorph('')
    setCalcDist('')
    setAsymType('')
    setDistSurgical(false)
  }

  // Calculate BI-RADS category
  const category = useMemo((): string | null => {
    if (!finding) return null
    if (finding === 'none') return '1'
    if (finding === 'benign') return '2'
    if (finding === 'known') return '6'
    if (finding === 'mass') {
      if (!massShape || !massMargin) return null
      return calcMassBirads(massShape, massMargin)
    }
    if (finding === 'calc') {
      if (!calcMorph) return null
      return calcCalcBirads(calcMorph, calcDist)
    }
    if (finding === 'asymmetry') {
      if (!asymType) return null
      return calcAsymBirads(asymType)
    }
    if (finding === 'distortion') {
      return distSurgical ? '3' : '4B'
    }
    return null
  }, [finding, massShape, massMargin, calcMorph, calcDist, asymType, distSurgical])

  const result = useMemo(() => {
    if (!category) return null
    const management = getManagement(category)
    const risk = getMalignancyRisk(category)
    return { category, management, risk, color: management.color }
  }, [category])

  // Report text
  const reportText = useMemo(() => {
    if (!result) return ''
    const parts: string[] = []

    if (composition) {
      const compLabels: Record<string, string> = { a: 'gordurosa (A)', b: 'densidades fibroglandulares esparsas (B)', c: 'heterogeneamente densa (C)', d: 'extremamente densa (D)' }
      parts.push(`Composição mamária: ${compLabels[composition] || composition}.`)
    }

    if (finding === 'none') {
      parts.push('Exame sem achados significativos.')
    } else if (finding === 'benign') {
      parts.push('Achado tipicamente benigno.')
    } else if (finding === 'mass') {
      const shapeLabels: Record<string, string> = { oval: 'oval', round: 'redonda', irregular: 'irregular' }
      const marginLabels: Record<string, string> = { circumscribed: 'circunscrita', obscured: 'obscurecida', microlobulated: 'microlobulada', indistinct: 'indistinta', spiculated: 'espiculada' }
      parts.push(`Nódulo de forma ${shapeLabels[massShape] || ''} e margem ${marginLabels[massMargin] || ''}.`)
    } else if (finding === 'calc') {
      const morphLabels: Record<string, string> = { benign: 'tipicamente benignas', amorphous: 'amorfas', coarse_hetero: 'grosseiras heterogêneas', fine_pleomorphic: 'finas pleomórficas', fine_linear: 'finas lineares/ramificadas' }
      const distLabels: Record<string, string> = { diffuse: 'distribuição difusa', regional: 'distribuição regional', grouped: 'agrupadas', linear: 'distribuição linear', segmental: 'distribuição segmentar' }
      let calcText = `Calcificações ${morphLabels[calcMorph] || ''}`
      if (calcDist) calcText += `, ${distLabels[calcDist] || ''}`
      parts.push(calcText + '.')
    } else if (finding === 'asymmetry') {
      const asymLabels: Record<string, string> = { global: 'Assimetria global de densidade', focal: 'Assimetria focal de densidade', developing: 'Assimetria focal em desenvolvimento' }
      parts.push(`${asymLabels[asymType] || ''}.`)
    } else if (finding === 'distortion') {
      parts.push(distSurgical ? 'Distorção arquitetural em sítio cirúrgico prévio.' : 'Distorção arquitetural sem história cirúrgica no local.')
    } else if (finding === 'known') {
      parts.push('Malignidade comprovada por biópsia.')
    }

    parts.push(`Classificação BI-RADS ${result.category}. Risco de malignidade: ${result.risk}. ${result.management.text}`)
    return parts.join(' ')
  }, [result, finding, composition, massShape, massMargin, calcMorph, calcDist, asymType, distSurgical])

  return (
    <CalculatorLayout
      title="BI-RADS"
      subtitle="Breast Imaging Reporting and Data System — 5ª Edição (ACR 2013)"
      references={[
        { text: "D'Orsi CJ, Sickles EA, Mendelson EB, Morris EA. ACR BI-RADS Atlas: Breast Imaging Reporting and Data System. 5th ed. Reston, VA: American College of Radiology; 2013." },
        { text: 'Mercado CL. BI-RADS Update. Radiol Clin North Am. 2014;52(3):481-487.' },
      ]}
    >
      {/* Composition */}
      <Section title="Composição Mamária" defaultOpen={false}>
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>Classificação de densidade do parênquima mamário (informativo, não altera a categoria).</p>
        <OptionGrid options={compositionOpts} value={composition} onChange={setComposition} columns={2} />
      </Section>

      {/* Finding type */}
      <Section title="Tipo de Achado">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>Selecione o tipo de achado principal para obter a classificação BI-RADS.</p>
        <OptionGrid options={findingOpts} value={finding} onChange={handleFindingChange} columns={2} />
      </Section>

      {/* Mass descriptors */}
      {finding === 'mass' && (
        <Section title="Caracterização do Nódulo / Massa">
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Forma</p>
            <OptionGrid options={massShapeOpts} value={massShape} onChange={setMassShape} columns={3} />
          </div>
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Margem</p>
            <OptionGrid options={massMarginOpts} value={massMargin} onChange={setMassMargin} columns={3} />
          </div>
          {!massShape || !massMargin ? (
            <p className="text-xs italic mt-3" style={{ color: 'var(--text3)' }}>Selecione forma e margem para calcular a categoria.</p>
          ) : null}
        </Section>
      )}

      {/* Calcification descriptors */}
      {finding === 'calc' && (
        <Section title="Caracterização das Calcificações">
          <div className="mb-4">
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Morfologia</p>
            <OptionGrid options={calcMorphOpts} value={calcMorph} onChange={setCalcMorph} columns={2} />
          </div>
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Distribuição</p>
            <OptionGrid options={calcDistOpts} value={calcDist} onChange={setCalcDist} columns={3} />
          </div>
        </Section>
      )}

      {/* Asymmetry descriptors */}
      {finding === 'asymmetry' && (
        <Section title="Tipo de Assimetria">
          <OptionGrid options={asymmetryOpts} value={asymType} onChange={setAsymType} columns={3} />
        </Section>
      )}

      {/* Architectural distortion */}
      {finding === 'distortion' && (
        <Section title="Distorção Arquitetural">
          <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>A presença de história cirúrgica no local altera a classificação.</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={distSurgical} onChange={e => setDistSurgical(e.target.checked)}
              className="w-4 h-4 accent-[var(--accent)]" />
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>História de cirurgia no local da distorção</span>
          </label>
        </Section>
      )}

      {/* Result */}
      {result && (
        <Section title="Resultado">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <ResultBadge label="Categoria" value={`BI-RADS ${result.category}`} color={result.color} large />
            <ResultBadge label="Risco de Malignidade" value={result.risk} color={result.color} large />
            <ResultBadge
              label="Densidade"
              value={composition ? composition.toUpperCase() : 'Não informada'}
              color="var(--accent)"
            />
          </div>

          <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: result.color + '44' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Recomendação de Conduta</p>
            <p className="text-sm font-semibold" style={{ color: result.color }}>{result.management.text}</p>
          </div>

          <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Resumo das Categorias</p>
            <p className="text-xs" style={{ color: '#16a34a' }}>1: Negativo &middot; 2: Benigno</p>
            <p className="text-xs" style={{ color: '#22c55e' }}>3: Provavelmente benigno (&lt; 2%)</p>
            <p className="text-xs" style={{ color: '#f59e0b' }}>4A: Baixa suspeita (2–10%) &middot; 4B: Moderada (10–50%) &middot; 4C: Alta (50–95%)</p>
            <p className="text-xs" style={{ color: '#dc2626' }}>5: Altamente sugestivo (≥ 95%) &middot; 6: Malignidade comprovada</p>
          </div>

          {reportText && (
            <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Texto para Laudo</p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(reportText).catch(() => {})}
                  className="text-[11px] px-2 py-1 rounded border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text3)' }}
                >Copiar</button>
              </div>
              <p className="text-sm font-mono p-3 rounded-lg leading-relaxed" style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', userSelect: 'all' }}>
                {reportText}
              </p>
            </div>
          )}
        </Section>
      )}
    </CalculatorLayout>
  )
}
