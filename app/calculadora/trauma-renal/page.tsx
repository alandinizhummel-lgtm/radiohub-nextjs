'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
} from '@/app/calculadora/components/calculator-layout'

const gradeOptions = [
  {
    value: '1',
    label: 'Grau I',
    description: 'Hematoma subcapsular sem laceração. Contusão (sem alteração na TC).',
  },
  {
    value: '2',
    label: 'Grau II',
    description: 'Hematoma perirrenal confinado ao retroperitônio. Laceração ≤1cm de profundidade, sem envolvimento do sistema coletor.',
  },
  {
    value: '3',
    label: 'Grau III',
    description: 'Laceração >1cm de profundidade, sem ruptura do sistema coletor ou extravasamento urinario.',
  },
  {
    value: '4',
    label: 'Grau IV',
    description: 'Laceração atingindo o sistema coletor com extravasamento urinario. Laceração da pelve renal. Lesão vascular segmentar (infarto segmentar).',
  },
  {
    value: '5',
    label: 'Grau V',
    description: 'Trombose/laceração da artéria ou veia renal principal. Rim desvascularizado. Rim fragmentado (shattered).',
  },
]

const vascularOptions = [
  { value: 'no', label: 'Ausente', description: 'Sem lesão vascular na imagem' },
  { value: 'yes', label: 'Presente', description: 'Pseudoaneurisma, fistula AV ou extravasamento ativo (adiciona 1 grau)' },
]

function getManagement(finalGrade: number): { text: string; color: string } {
  if (finalGrade <= 2) {
    return {
      text: 'Tratamento conservador. Observação clinica com repouso e monitorização.',
      color: 'var(--green)',
    }
  }
  if (finalGrade === 3) {
    return {
      text: 'Tratamento conservador na maioria dos casos. Monitorização rigorosa com imagem de controle.',
      color: 'var(--green)',
    }
  }
  if (finalGrade === 4) {
    return {
      text: 'Considerar angiografia com embolização ou intervenção urológica. Drenagem de urinoma se necessario.',
      color: 'var(--orange)',
    }
  }
  return {
    text: 'Alta probabilidade de intervenção cirurgica. Considerar nefrectomia ou revascularização.',
    color: 'var(--red)',
  }
}

export default function TraumaRenal() {
  const [grade, setGrade] = useState('')
  const [vascular, setVascular] = useState('')

  const result = useMemo(() => {
    if (!grade) return null

    const baseGrade = parseInt(grade)
    const hasVascular = vascular === 'yes'
    const finalGrade = Math.min(hasVascular ? baseGrade + 1 : baseGrade, 5)
    const management = getManagement(finalGrade)

    return { baseGrade, finalGrade, hasVascular, management }
  }, [grade, vascular])

  return (
    <CalculatorLayout
      title="Escala de Lesão Renal AAST"
      subtitle="Revisão 2018 - Classificação de trauma renal"
      references={[
        {
          text: 'Kozar RA, Crandall M, Shanmuganathan K, et al. Organ injury scaling 2018 update: Spleen, liver, and kidney. J Trauma Acute Care Surg. 2018;85(6):1119-1122.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/30462622/',
        },
      ]}
    >
      <Section title="Grau da Lesão Renal">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          Selecione o grau baseado nos achados de imagem (TC com contraste).
        </p>
        <OptionGrid options={gradeOptions} value={grade} onChange={setGrade} columns={2} />
      </Section>

      <Section title="Modificador de Lesão Vascular">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          Presença de lesão vascular na imagem (pseudoaneurisma, fistula AV, extravasamento ativo) avança o grau em 1.
        </p>
        <OptionGrid options={vascularOptions} value={vascular} onChange={setVascular} columns={2} />
      </Section>

      {result && (
        <Section title="Resultado">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <ResultBadge
              label="Grau Base"
              value={`Grau ${result.baseGrade}`}
              large
            />
            <ResultBadge
              label="Grau Final"
              value={`Grau ${result.finalGrade}`}
              color={
                result.finalGrade <= 3
                  ? 'var(--green)'
                  : result.finalGrade === 4
                  ? 'var(--orange)'
                  : 'var(--red)'
              }
              large
            />
          </div>

          {result.hasVascular && (
            <div
              className="rounded-lg border p-3 mb-3"
              style={{ backgroundColor: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.3)' }}
            >
              <p className="text-xs font-semibold" style={{ color: '#eab308' }}>
                Modificador vascular aplicado: grau avançado de {result.baseGrade} para {result.finalGrade}
              </p>
            </div>
          )}

          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: 'var(--bg2)',
              borderColor: result.management.color + '44',
            }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>
              Recomendação de Conduta
            </p>
            <p className="text-sm font-semibold" style={{ color: result.management.color }}>
              {result.management.text}
            </p>
          </div>

          <div className="mt-3 rounded-lg border p-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Notas</p>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              A classificação AAST 2018 revisada para lesão renal vai de I a V. O modificador de lesão vascular avança o grau em 1 (até o maximo de V). A maioria das lesões grau I-III pode ser tratada conservadoramente. Lesões grau IV-V frequentemente requerem intervenção.
            </p>
          </div>
        </Section>
      )}
    </CalculatorLayout>
  )
}
