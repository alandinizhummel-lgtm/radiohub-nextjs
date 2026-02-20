'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
} from '@/app/calculadora/components/calculator-layout'

const stenosisOptions = [
  { value: '0', label: 'CAD-RADS 0', description: 'Ausencia de estenose (0%)' },
  { value: '1', label: 'CAD-RADS 1', description: 'Estenose minima (1-24%)' },
  { value: '2', label: 'CAD-RADS 2', description: 'Estenose leve (25-49%)' },
  { value: '3', label: 'CAD-RADS 3', description: 'Estenose moderada (50-69%)' },
  { value: '4A', label: 'CAD-RADS 4A', description: 'Estenose severa (70-99%) - 1-2 vasos' },
  { value: '4B', label: 'CAD-RADS 4B', description: 'Estenose severa (70-99%) - 3 vasos ou TCE' },
  { value: '5', label: 'CAD-RADS 5', description: 'Oclusao total (100%)' },
]

interface Modifier {
  key: string
  label: string
  description: string
}

const modifierDefs: Modifier[] = [
  { key: 'N', label: 'N - Nao diagnostico', description: 'Segmento nao avaliavel (artefato de movimento, calcificacao extensa, etc.)' },
  { key: 'S', label: 'S - Stent', description: 'Stent coronariano presente' },
  { key: 'G', label: 'G - Enxerto (Bypass)', description: 'Enxerto de bypass coronariano presente' },
  { key: 'E', label: 'E - Excecao', description: 'Anomalia congenita coronariana' },
  { key: 'HRP', label: 'HRP - Placa de alto risco', description: 'Remodelamento positivo, placa de baixa atenuacao, sinal do anel de guardanapo, calcificacao pontilhada' },
]

function getCategoryColor(cat: string): string {
  if (cat === '0') return '#16a34a'
  if (cat === '1') return '#22c55e'
  if (cat === '2') return '#84cc16'
  if (cat === '3') return '#f59e0b'
  if (cat === '4A' || cat === '4B') return '#f97316'
  if (cat === '5') return '#dc2626'
  return 'var(--text3)'
}

function getManagement(cat: string, hasHRP: boolean): { text: string; color: string } {
  const hrpNote = hasHRP ? ' Placa de alto risco presente: considerar terapia preventiva intensificada.' : ''

  switch (cat) {
    case '0':
      return {
        text: 'Nenhuma doenca coronariana. Nenhum tratamento especifico necessario.' + hrpNote,
        color: '#16a34a',
      }
    case '1':
      return {
        text: 'Estenose minima. Tratamento preventivo. Considerar controle de fatores de risco.' + hrpNote,
        color: '#22c55e',
      }
    case '2':
      return {
        text: 'Estenose leve. Tratamento preventivo. Controle de fatores de risco cardiovascular.' + hrpNote,
        color: '#84cc16',
      }
    case '3':
      return {
        text: 'Estenose moderada. Considerar teste funcional (cintilografia, RM de estresse, FFR-CT). Tratamento clinico otimizado.' + hrpNote,
        color: '#f59e0b',
      }
    case '4A':
      return {
        text: 'Estenose severa em 1-2 vasos. Considerar cateterismo cardiaco / ICP. Discussao com equipe de cardiologia.' + hrpNote,
        color: '#f97316',
      }
    case '4B':
      return {
        text: 'Estenose severa trivascular ou do TCE. Considerar cateterismo e revascularizacao cirurgica (CRVM). Heart Team recomendado.' + hrpNote,
        color: '#f97316',
      }
    case '5':
      return {
        text: 'Oclusao total. Avaliar viabilidade miocardica. Discutir revascularizacao com Heart Team.' + hrpNote,
        color: '#dc2626',
      }
    default:
      return { text: '', color: 'var(--text3)' }
  }
}

export default function CADRADSCalculator() {
  const [stenosis, setStenosis] = useState('')
  const [modifiers, setModifiers] = useState<Record<string, boolean>>({
    N: false,
    S: false,
    G: false,
    E: false,
    HRP: false,
  })

  const toggleModifier = (key: string) => {
    setModifiers(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const result = useMemo(() => {
    if (!stenosis) return null

    const activeModifiers = Object.entries(modifiers)
      .filter(([, v]) => v)
      .map(([k]) => k)

    const fullCategory = `CAD-RADS ${stenosis}${activeModifiers.length > 0 ? '/' + activeModifiers.join('/') : ''}`
    const management = getManagement(stenosis, modifiers.HRP)

    return { category: stenosis, fullCategory, activeModifiers, management }
  }, [stenosis, modifiers])

  const laudoText = useMemo(() => {
    if (!result) return ''
    const parts: string[] = []

    parts.push(`Classificacao CAD-RADS 2.0: ${result.fullCategory}.`)

    const stenosisText: Record<string, string> = {
      '0': 'Ausencia de estenose coronariana',
      '1': 'Estenose coronariana minima (1-24%)',
      '2': 'Estenose coronariana leve (25-49%)',
      '3': 'Estenose coronariana moderada (50-69%)',
      '4A': 'Estenose coronariana severa (70-99%) em 1-2 vasos',
      '4B': 'Estenose coronariana severa (70-99%) em 3 vasos ou tronco da coronaria esquerda',
      '5': 'Oclusao coronariana total (100%)',
    }
    parts.push(stenosisText[stenosis] + '.')

    if (result.activeModifiers.length > 0) {
      const modTexts: string[] = []
      if (modifiers.N) modTexts.push('segmento(s) nao diagnostico(s)')
      if (modifiers.S) modTexts.push('stent presente')
      if (modifiers.G) modTexts.push('enxerto de bypass presente')
      if (modifiers.E) modTexts.push('anomalia congenita coronariana')
      if (modifiers.HRP) modTexts.push('placa de alto risco (HRP)')
      parts.push(`Modificadores: ${modTexts.join(', ')}.`)
    }

    parts.push(`Conduta: ${result.management.text}`)
    return parts.join(' ')
  }, [result, stenosis, modifiers])

  return (
    <CalculatorLayout
      title="CAD-RADS 2.0"
      subtitle="Coronary Artery Disease - Reporting and Data System (2022)"
      references={[
        {
          text: 'Cury RC, Leipsic J, Abbara S, et al. CAD-RADS 2.0 - 2022 Coronary Artery Disease-Reporting and Data System. Radiology. 2022;305(1):72-86.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/35916673/',
        },
      ]}
    >
      <Section title="1. Grau de estenose">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          Selecione o maior grau de estenose observado na angiotomografia coronariana (ATCC).
        </p>
        <OptionGrid options={stenosisOptions} value={stenosis} onChange={setStenosis} columns={2} />
      </Section>

      <Section title="2. Modificadores">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          Selecione os modificadores aplicaveis. Multiplos modificadores podem ser combinados.
        </p>
        <div className="space-y-2">
          {modifierDefs.map(mod => (
            <label
              key={mod.key}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer border text-sm"
              style={{
                borderColor: modifiers[mod.key] ? 'var(--accent)' : 'var(--border)',
                backgroundColor: modifiers[mod.key] ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: 'var(--text)',
              }}
            >
              <input
                type="checkbox"
                checked={modifiers[mod.key]}
                onChange={() => toggleModifier(mod.key)}
                className="accent-[var(--accent)]"
              />
              <div className="flex-1">
                <div className="font-semibold">{mod.label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{mod.description}</div>
              </div>
            </label>
          ))}
        </div>
      </Section>

      {result && (
        <Section title="Resultado">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <ResultBadge
              label="Classificacao"
              value={result.fullCategory}
              color={getCategoryColor(result.category)}
              large
            />
            <ResultBadge
              label="Grau de estenose"
              value={stenosisOptions.find(o => o.value === result.category)?.description || ''}
              color={getCategoryColor(result.category)}
            />
          </div>

          {result.activeModifiers.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {result.activeModifiers.map(m => (
                <div
                  key={m}
                  className="rounded-lg border p-2 text-center text-xs font-bold"
                  style={{ borderColor: 'var(--accent)', backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--accent)' }}
                >
                  {m}
                </div>
              ))}
            </div>
          )}

          <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: result.management.color + '44' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Recomendacao de Conduta</p>
            <p className="text-sm font-semibold" style={{ color: result.management.color }}>
              {result.management.text}
            </p>
          </div>

          <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Resumo das categorias CAD-RADS 2.0</p>
            <div className="space-y-1">
              <p className="text-xs" style={{ color: '#16a34a' }}>0 - Ausencia de estenose (0%): sem tratamento especifico</p>
              <p className="text-xs" style={{ color: '#22c55e' }}>1 - Minima (1-24%): tratamento preventivo</p>
              <p className="text-xs" style={{ color: '#84cc16' }}>2 - Leve (25-49%): tratamento preventivo</p>
              <p className="text-xs" style={{ color: '#f59e0b' }}>3 - Moderada (50-69%): considerar teste funcional</p>
              <p className="text-xs" style={{ color: '#f97316' }}>4A - Severa (70-99%) 1-2 vasos: cateterismo/ICP</p>
              <p className="text-xs" style={{ color: '#f97316' }}>4B - Severa (70-99%) 3 vasos/TCE: Heart Team</p>
              <p className="text-xs" style={{ color: '#dc2626' }}>5 - Oclusao (100%): avaliar viabilidade</p>
            </div>
          </div>

          {laudoText && (
            <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Texto para laudo</p>
                <button
                  onClick={() => navigator.clipboard.writeText(laudoText)}
                  className="text-xs px-2 py-1 rounded border"
                  style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text3)', whiteSpace: 'pre-wrap' }}>
                {laudoText}
              </p>
            </div>
          )}
        </Section>
      )}
    </CalculatorLayout>
  )
}
