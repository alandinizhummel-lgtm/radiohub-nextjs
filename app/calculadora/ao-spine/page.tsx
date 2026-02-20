'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
} from '@/app/calculadora/components/calculator-layout'

const typeAOptions = [
  { value: 'A0', label: 'A0 - Menor', description: 'Fratura menor sem comprometimento da integridade estrutural (ex: processo transverso, espinhoso)' },
  { value: 'A1', label: 'A1 - Cunha', description: 'Fratura por compressão em cunha de um platô vertebral, sem envolvimento da parede posterior' },
  { value: 'A2', label: 'A2 - Split (cisão)', description: 'Fratura por cisão (split) envolvendo ambos os platôs, sem envolvimento da parede posterior' },
  { value: 'A3', label: 'A3 - Burst incompleta', description: 'Fratura em explosão (burst) incompleta: envolvimento de um platô com fratura da parede posterior' },
  { value: 'A4', label: 'A4 - Burst completa', description: 'Fratura em explosão (burst) completa: envolvimento de ambos os platôs com fratura da parede posterior' },
]

const typeBOptions = [
  { value: 'B1', label: 'B1 - Óssea', description: 'Lesão da banda de tensão posterior com fratura transóssea (fratura de Chance)' },
  { value: 'B2', label: 'B2 - Ligamentar', description: 'Lesão da banda de tensão posterior com ruptura ligamentar/capsular' },
  { value: 'B3', label: 'B3 - Hiperextensão', description: 'Lesão por hiperextensão através do disco ou corpo vertebral' },
]

const typeCOption = [
  { value: 'C', label: 'Tipo C - Deslocamento/Translação', description: 'Qualquer tipo de lesão com deslocamento ou translação em qualquer plano (qualquer morfologia associada)' },
]

const neuroOptions = [
  { value: 'N0', label: 'N0 - Intacto', description: 'Sem deficit neurológico' },
  { value: 'N1', label: 'N1 - Transitório', description: 'Deficit neurológico transitório (resolvido)' },
  { value: 'N2', label: 'N2 - Radiculopatia', description: 'Radiculopatia (deficit radicular)' },
  { value: 'N3', label: 'N3 - LME incompleta', description: 'Lesão medular espinhal incompleta' },
  { value: 'N4', label: 'N4 - LME completa', description: 'Lesão medular espinhal completa' },
  { value: 'NX', label: 'NX - Indeterminado', description: 'Status neurológico não pode ser avaliado' },
]

const modifierOptions = [
  { value: 'none', label: 'Sem modificador', description: 'Nenhum modificador aplicavel' },
  { value: 'M1', label: 'M1', description: 'Banda de tensão posterior indeterminada (achado de imagem inconclusivo)' },
  { value: 'M2', label: 'M2', description: 'Comorbidades especificas do paciente que influenciam o tratamento' },
]

export default function AOSpine() {
  const [injuryType, setInjuryType] = useState('')
  const [subtype, setSubtype] = useState('')
  const [neuro, setNeuro] = useState('')
  const [modifier, setModifier] = useState('')

  const handleTypeChange = (type: string) => {
    setInjuryType(type)
    setSubtype('')
  }

  const subtypeOptions = useMemo(() => {
    switch (injuryType) {
      case 'A': return typeAOptions
      case 'B': return typeBOptions
      case 'C': return typeCOption
      default: return []
    }
  }, [injuryType])

  const classification = useMemo(() => {
    if (!subtype || !neuro) return null

    const morphology = injuryType === 'C' ? 'C' : subtype
    const modStr = modifier && modifier !== 'none' ? ` ${modifier}` : ''
    const code = `${morphology} ${neuro}${modStr}`

    let severity: 'low' | 'moderate' | 'high'
    let severityText: string
    let color: string

    if (injuryType === 'C' || neuro === 'N3' || neuro === 'N4') {
      severity = 'high'
      severityText = 'Alta gravidade - geralmente indicação cirurgica'
      color = 'var(--red)'
    } else if (
      injuryType === 'B' ||
      subtype === 'A3' ||
      subtype === 'A4' ||
      neuro === 'N2'
    ) {
      severity = 'moderate'
      severityText = 'Gravidade moderada - considerar tratamento cirurgico ou conservador conforme contexto clinico'
      color = 'var(--orange)'
    } else {
      severity = 'low'
      severityText = 'Baixa gravidade - tratamento conservador geralmente indicado'
      color = 'var(--green)'
    }

    return { code, severity, severityText, color, morphology }
  }, [injuryType, subtype, neuro, modifier])

  return (
    <CalculatorLayout
      title="Classificação AO Spine"
      subtitle="Classificação de lesões toracolombar (T1-L5)"
      references={[
        {
          text: 'Vaccaro AR, Oner C, Kepler CK, et al. AOSpine thoracolumbar spine injury classification system: fracture description, neurological status, and key modifiers. Spine. 2013;38(22 Suppl 1):S186-S190.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/24113426/',
        },
      ]}
    >
      <Section title="1. Tipo de Lesão (Morfologia)">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          Selecione o tipo principal da fratura toracolombar.
        </p>
        <OptionGrid
          options={[
            { value: 'A', label: 'Tipo A - Compressão', description: 'Falha do corpo vertebral por compressão' },
            { value: 'B', label: 'Tipo B - Banda de tensão', description: 'Falha da banda de tensão anterior ou posterior' },
            { value: 'C', label: 'Tipo C - Translação', description: 'Deslocamento/translação em qualquer plano' },
          ]}
          value={injuryType}
          onChange={handleTypeChange}
          columns={3}
        />
      </Section>

      {injuryType && (
        <Section title="2. Subtipo">
          <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
            {injuryType === 'C'
              ? 'Tipo C não possui subtipos; a morfologia associada pode ser qualquer tipo A ou B.'
              : 'Selecione o subtipo especifico da fratura.'}
          </p>
          <OptionGrid
            options={subtypeOptions}
            value={subtype}
            onChange={setSubtype}
            columns={injuryType === 'C' ? 1 : 2}
          />
        </Section>
      )}

      <Section title="3. Status Neurológico">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          Selecione o status neurológico do paciente.
        </p>
        <OptionGrid options={neuroOptions} value={neuro} onChange={setNeuro} columns={3} />
      </Section>

      <Section title="4. Modificadores">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          Modificadores especificos do paciente (opcionais).
        </p>
        <OptionGrid options={modifierOptions} value={modifier} onChange={setModifier} columns={3} />
      </Section>

      {classification && (
        <Section title="Classificação Final">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <ResultBadge
              label="Código AO Spine"
              value={classification.code}
              color={classification.color}
              large
            />
            <ResultBadge
              label="Gravidade"
              value={
                classification.severity === 'high'
                  ? 'Alta'
                  : classification.severity === 'moderate'
                  ? 'Moderada'
                  : 'Baixa'
              }
              color={classification.color}
              large
            />
          </div>

          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: 'var(--bg2)',
              borderColor: classification.color + '44',
            }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>
              Orientação Terapêutica
            </p>
            <p className="text-sm font-semibold" style={{ color: classification.color }}>
              {classification.severityText}
            </p>
          </div>

          <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Componentes da Classificação</p>
            <div className="space-y-1">
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Morfologia:</span> {classification.morphology}
              </p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Neurológico:</span> {neuro}
              </p>
              {modifier && modifier !== 'none' && (
                <p className="text-xs" style={{ color: 'var(--text3)' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Modificador:</span> {modifier}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Notas</p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              A classificação AO Spine combina morfologia da fratura, status neurológico e modificadores clinicos para guiar o tratamento. Tipo C e lesões com deficit neurológico grave (N3/N4) geralmente requerem estabilização cirurgica. O modificador M1 indica necessidade de imagem adicional (RM) para avaliar a banda de tensão posterior.
            </p>
          </div>
        </Section>
      )}
    </CalculatorLayout>
  )
}
