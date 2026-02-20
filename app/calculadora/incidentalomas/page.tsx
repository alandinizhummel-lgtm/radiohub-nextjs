'use client'

import { useState, useMemo } from 'react'
import CalculatorLayout, {
  Section,
  ResultBadge,
  OptionGrid,
  inputCls,
  selectCls,
  labelCls,
  labelStyle,
  cardCls,
  cardStyle,
} from '@/app/calculadora/components/calculator-layout'

/* ── Color helpers ── */
const GREEN = '#16a34a'
const YELLOW = '#f59e0b'
const RED = '#dc2626'

type Classification = 'benigno' | 'indeterminado' | 'suspeito' | null

function classColor(c: Classification): string {
  switch (c) {
    case 'benigno': return GREEN
    case 'indeterminado': return YELLOW
    case 'suspeito': return RED
    default: return 'var(--text3)'
  }
}

function classLabel(c: Classification): string {
  switch (c) {
    case 'benigno': return 'Benigno (Adenoma)'
    case 'indeterminado': return 'Indeterminado'
    case 'suspeito': return 'Suspeito'
    default: return '\u2014'
  }
}

const yesNoOptions = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Nao' },
]

const yesNoNaOptions = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Nao' },
  { value: 'na', label: 'Nao realizado' },
]

/* ── Main Component ── */
export default function AdrenalIncidentalomaCalculator() {
  /* Size */
  const [size, setSize] = useState('')

  /* CT unenhanced */
  const [unenhancedHU, setUnenhancedHU] = useState('')

  /* CT washout inputs */
  const [hasWashout, setHasWashout] = useState('')
  const [preHU, setPreHU] = useState('')
  const [enhancedHU, setEnhancedHU] = useState('')
  const [delayedHU, setDelayedHU] = useState('')

  /* MRI */
  const [hasMRI, setHasMRI] = useState('')
  const [signalDrop, setSignalDrop] = useState('')
  const [indiaInk, setIndiaInk] = useState('')

  /* Additional features */
  const [growing, setGrowing] = useState('')
  const [irregular, setIrregular] = useState('')
  const [functioning, setFunctioning] = useState('')

  /* ── Washout calculations ── */
  const washout = useMemo(() => {
    const pre = parseFloat(preHU)
    const en = parseFloat(enhancedHU)
    const del = parseFloat(delayedHU)

    let apw: number | null = null
    let rpw: number | null = null

    if (!isNaN(en) && !isNaN(del) && !isNaN(pre) && en !== pre) {
      apw = ((en - del) / (en - pre)) * 100
    }
    if (!isNaN(en) && !isNaN(del) && en !== 0) {
      rpw = ((en - del) / en) * 100
    }

    const apwAdenoma = apw !== null && apw >= 60
    const rpwAdenoma = rpw !== null && rpw >= 40

    return { apw, rpw, apwAdenoma, rpwAdenoma }
  }, [preHU, enhancedHU, delayedHU])

  /* ── Classification logic ── */
  const result = useMemo(() => {
    const s = parseFloat(size)
    const ue = parseFloat(unenhancedHU)
    if (isNaN(s)) return null

    const lipidRich = !isNaN(ue) && ue <= 10
    const mriSignalDrop = signalDrop === 'yes'
    const mriIndiaInk = indiaInk === 'yes'
    const washoutAdenoma = washout.apwAdenoma || washout.rpwAdenoma
    const isGrowing = growing === 'yes'
    const isIrregular = irregular === 'yes'
    const isFunctioning = functioning === 'yes'

    let classification: Classification = null
    let category = ''
    let recommendation = ''
    let details: string[] = []

    /* ── Size < 1 cm ── */
    if (s < 1) {
      classification = 'benigno'
      category = 'Provavelmente insignificante'
      recommendation = 'Nodulo adrenal < 1 cm: na ausencia de historia oncologica, nao requer seguimento ou avaliacao adicional.'
      details = [
        'Nodulos adrenais < 1 cm sao extremamente comuns e quase sempre benignos.',
        'Nenhuma investigacao adicional recomendada pelo ACR White Paper.',
      ]
      return { classification, category, recommendation, details }
    }

    /* ── Suspicious features: > 4 cm, growing, irregular ── */
    if (s > 4 || isGrowing || isIrregular || isFunctioning) {
      if (s > 4 && !lipidRich && !mriSignalDrop && !washoutAdenoma) {
        classification = 'suspeito'
        category = 'Lesao adrenal suspeita'
        recommendation = 'Nodulo adrenal > 4 cm sem criterios de adenoma: considerar adrenalectomia ou biopsia percutanea (apos exclusao de feocromocitoma). Avaliacao funcional obrigatoria.'
        details = [
          'Lesoes > 4 cm tem maior risco de carcinoma adrenocortical ou metastase.',
          'Avaliar funcionalidade: catecolaminas fracionadas/metanefrinas urinarias, cortisol (teste de supressao com dexametasona 1 mg), aldosterona/renina (se hipertensao), DHEA-S.',
          'PET-CT pode auxiliar na diferenciacao (SUV elevado sugere malignidade).',
          'Discussao em equipe multidisciplinar recomendada.',
        ]
        return { classification, category, recommendation, details }
      }

      if (isGrowing) {
        classification = 'suspeito'
        category = 'Lesao em crescimento'
        recommendation = 'Crescimento significativo (> 5 mm ou > 20% em seguimento): alto indice de suspeicao. Considerar PET-CT, biopsia ou cirurgia. Excluir feocromocitoma antes de biopsia.'
        details = [
          'Crescimento significativo e um dos criterios de maior preocupacao.',
          'Avaliar funcionalidade hormonal antes de qualquer intervencao.',
        ]
        return { classification, category, recommendation, details }
      }

      if (isIrregular) {
        classification = 'suspeito'
        category = 'Caracteristicas morfologicas suspeitas'
        recommendation = 'Margens irregulares, realce heterogeneo ou sinais de invasao: considerar investigacao complementar com PET-CT, biopsia ou cirurgia.'
        details = [
          'Contornos irregulares, necrose central e heterogeneidade sao sinais preocupantes.',
          'Excluir feocromocitoma antes de procedimento invasivo.',
        ]
        return { classification, category, recommendation, details }
      }
    }

    /* ── Benign adenoma criteria ── */
    if (lipidRich) {
      classification = 'benigno'
      category = 'Adenoma rico em lipidos'
      recommendation = 'Atenuacao <= 10 HU em fase sem contraste: diagnostico de adenoma. Nao ha necessidade de seguimento por imagem.'
      details = [
        'Adenomas ricos em lipidos intracelulares apresentam densidade <= 10 HU na TC sem contraste.',
        'Especificidade > 98% para adenoma.',
        'Nao necessita washout, RM ou PET-CT para confirmacao.',
      ]
      if (isFunctioning) {
        recommendation += ' Porem, avaliacao funcional positiva: encaminhar para endocrinologia independentemente do aspecto de imagem.'
        details.push('Adenomas funcionantes (Cushing subclinico, aldosteronoma) requerem acompanhamento clinico mesmo com diagnostico por imagem definido.')
      }
      return { classification, category, recommendation, details }
    }

    if (mriSignalDrop || mriIndiaInk) {
      classification = 'benigno'
      category = 'Adenoma (queda de sinal na RM)'
      recommendation = 'Queda de sinal na sequencia fora de fase (chemical shift): compativel com adenoma rico em lipidos intracelulares. Nao ha necessidade de seguimento por imagem.'
      details = [
        'Queda de sinal na imagem fora de fase em relacao a imagem em fase indica lipido intracelular (adenoma).',
        mriIndiaInk ? 'Sinal de India ink (borda escura na interface com tecido adjacente) presente, corroborando diagnostico.' : '',
        'Especificidade elevada para adenoma.',
      ].filter(Boolean)
      if (isFunctioning) {
        recommendation += ' Porem, avaliacao funcional positiva: encaminhar para endocrinologia.'
        details.push('Adenomas funcionantes requerem acompanhamento clinico mesmo com diagnostico por imagem definido.')
      }
      return { classification, category, recommendation, details }
    }

    if (washoutAdenoma) {
      classification = 'benigno'
      category = 'Adenoma (washout positivo)'
      const parts: string[] = []
      if (washout.apwAdenoma && washout.apw !== null) parts.push(`APW = ${washout.apw.toFixed(1)}% (>= 60%)`)
      if (washout.rpwAdenoma && washout.rpw !== null) parts.push(`RPW = ${washout.rpw.toFixed(1)}% (>= 40%)`)
      recommendation = `Criterios de washout preenchidos: ${parts.join('; ')}. Compativel com adenoma. Nao ha necessidade de seguimento por imagem.`
      details = [
        'Washout absoluto (APW) >= 60% ou washout relativo (RPW) >= 40% sao diagnosticos de adenoma.',
        'APW = (EN - DEL) / (EN - PRE) x 100',
        'RPW = (EN - DEL) / EN x 100',
        'Fase tardia adquirida aos 15 minutos apos injecao do contraste.',
      ]
      if (isFunctioning) {
        recommendation += ' Porem, avaliacao funcional positiva: encaminhar para endocrinologia.'
        details.push('Adenomas funcionantes requerem acompanhamento clinico.')
      }
      return { classification, category, recommendation, details }
    }

    /* ── Indeterminate ── */
    if (!isNaN(ue) && ue > 10) {
      classification = 'indeterminado'
      category = 'Indeterminado (> 10 HU sem criterios de adenoma)'

      if (hasWashout === 'no' && hasMRI !== 'yes') {
        recommendation = 'Atenuacao > 10 HU sem estudo de washout ou RM: recomenda-se protocolo de washout por TC (fase tardia 15 min) ou RM com chemical shift para diferenciacao.'
        details = [
          'A maioria dos nodulos > 10 HU sao adenomas pobres em lipidos, mas requerem confirmacao.',
          'Protocolo de washout: fase sem contraste, fase portal (60-90s) e fase tardia (15 min).',
          'Alternativa: RM com sequencias em fase e fora de fase (chemical shift).',
          'Se nenhum metodo conclusivo: considerar PET-CT ou seguimento em 6-12 meses.',
        ]
      } else if (hasWashout === 'yes' && !washoutAdenoma && washout.apw !== null) {
        recommendation = 'Washout nao atinge criterio de adenoma. Considerar PET-CT, biopsia ou seguimento em 6-12 meses conforme contexto clinico.'
        details = [
          washout.apw !== null ? `APW = ${washout.apw.toFixed(1)}% (criterio >= 60%)` : '',
          washout.rpw !== null ? `RPW = ${washout.rpw.toFixed(1)}% (criterio >= 40%)` : '',
          'PET-CT: lesoes benignas tipicamente apresentam captacao semelhante ou inferior ao figado.',
          'Biopsia percutanea: considerar apos exclusao de feocromocitoma.',
          'Seguimento: TC sem contraste em 6-12 meses para avaliar crescimento.',
        ].filter(Boolean)
      } else {
        recommendation = 'Nodulo adrenal indeterminado: completar investigacao com washout por TC ou chemical shift por RM. Se ambos inconclusivos, considerar PET-CT ou seguimento em 6-12 meses.'
        details = [
          'Objetivo: diferenciar adenoma pobre em lipidos de metastase ou carcinoma.',
          'Se tamanho estavel por 12 meses ou mais, provavel benigno.',
          'Em pacientes oncologicos, PET-CT ou biopsia devem ser priorizados.',
        ]
      }

      if (isFunctioning) {
        recommendation += ' Avaliacao funcional positiva: encaminhar para endocrinologia.'
      }

      return { classification, category, recommendation, details }
    }

    /* ── Fallback: size between 1-4 cm without density data ── */
    if (s >= 1 && s <= 4) {
      classification = 'indeterminado'
      category = 'Informacao insuficiente para classificacao'
      recommendation = 'Nodulo adrenal 1-4 cm: avaliar atenuacao em TC sem contraste. Se <= 10 HU, adenoma. Se > 10 HU, prosseguir com washout por TC ou RM chemical shift.'
      details = [
        'Primeira etapa: TC sem contraste para medir atenuacao (HU).',
        'Se <= 10 HU: adenoma rico em lipidos (encerrar investigacao).',
        'Se > 10 HU: washout por TC ou RM chemical shift.',
        'Avaliacao funcional: recomendada para todos os nodulos >= 1 cm conforme diretrizes europeias.',
      ]
      if (isFunctioning) {
        recommendation += ' Avaliacao funcional positiva: encaminhar para endocrinologia.'
      }
      return { classification, category, recommendation, details }
    }

    /* ── > 4 cm with benign features (handled above but fallback) ── */
    if (s > 4) {
      classification = 'indeterminado'
      category = 'Nodulo > 4 cm - avaliar criterios adicionais'
      recommendation = 'Nodulo adrenal > 4 cm: mesmo com criterios de adenoma, considerar avaliacao funcional completa. Seguimento proximo ou cirurgia conforme contexto clinico.'
      details = [
        'Nodulos > 4 cm tem maior probabilidade de malignidade, mesmo com aspecto benigno.',
        'Avaliacao funcional obrigatoria.',
        'Considerar PET-CT para complementacao.',
      ]
      return { classification, category, recommendation, details }
    }

    return null
  }, [size, unenhancedHU, signalDrop, indiaInk, washout, hasWashout, hasMRI, growing, irregular, functioning])

  /* ── Texto para Laudo ── */
  const laudoText = useMemo(() => {
    if (!result) return ''
    const s = parseFloat(size)
    const ue = parseFloat(unenhancedHU)

    const parts: string[] = []
    parts.push(`Nodulo adrenal incidental medindo ${s < 1 ? (s * 10).toFixed(0) + ' mm' : s.toFixed(1) + ' cm'}.`)

    if (!isNaN(ue)) {
      parts.push(`Atenuacao em fase sem contraste: ${ue} HU.`)
    }

    if (hasWashout === 'yes' && washout.apw !== null) {
      parts.push(`Washout absoluto (APW): ${washout.apw.toFixed(1)}%.`)
    }
    if (hasWashout === 'yes' && washout.rpw !== null) {
      parts.push(`Washout relativo (RPW): ${washout.rpw.toFixed(1)}%.`)
    }

    if (signalDrop === 'yes') {
      parts.push('Queda de sinal na sequencia fora de fase (chemical shift) presente na RM.')
    } else if (signalDrop === 'no') {
      parts.push('Sem queda de sinal na sequencia fora de fase (chemical shift) na RM.')
    }
    if (indiaInk === 'yes') {
      parts.push('Sinal de India ink presente.')
    }

    if (growing === 'yes') {
      parts.push('Lesao em crescimento em relacao a exame previo.')
    }
    if (irregular === 'yes') {
      parts.push('Contornos irregulares / aspectos morfologicos atipicos.')
    }

    parts.push(`Classificacao: ${result.category}.`)
    parts.push(`Conduta sugerida: ${result.recommendation}`)

    if (functioning === 'yes') {
      parts.push('Nota: avaliacao funcional positiva relatada - encaminhamento endocrinologico recomendado.')
    } else if (functioning !== 'yes' && parseFloat(size) >= 1) {
      parts.push('Recomenda-se avaliacao funcional hormonal conforme diretrizes (ESE/ENSAT 2016).')
    }

    return parts.join(' ')
  }, [result, size, unenhancedHU, washout, hasWashout, signalDrop, indiaInk, growing, irregular, functioning])

  return (
    <CalculatorLayout
      title="Incidentaloma Adrenal"
      subtitle="Manejo de nodulos adrenais incidentais - ACR White Paper / Diretrizes Europeias"
      references={[
        {
          text: 'Mayo-Smith WW et al. Management of Incidental Adrenal Masses: A White Paper of the ACR Incidental Findings Committee. J Am Coll Radiol. 2017;14(8):1038-1044.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/28609279/',
        },
        {
          text: 'Fassnacht M et al. European Society of Endocrinology Clinical Practice Guidelines on the management of adrenal incidentalomas. Eur J Endocrinol. 2016;175(2):G1-G34.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/27390021/',
        },
      ]}
    >
      {/* ── 1. Tamanho ── */}
      <Section title="1. Tamanho do Nodulo Adrenal">
        <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
          Maior dimensao axial do nodulo adrenal.
        </p>
        <div className="max-w-xs">
          <label className={labelCls} style={labelStyle}>Tamanho (cm)</label>
          <input
            type="number"
            className={inputCls}
            placeholder="Ex: 2.5"
            value={size}
            onChange={e => setSize(e.target.value)}
            min={0}
            step={0.1}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>Inserir em centimetros</p>
        </div>
      </Section>

      {/* ── 2. TC sem contraste ── */}
      {parseFloat(size) >= 1 && (
        <Section title="2. Caracteristicas na TC">
          <div className="space-y-4">
            <div>
              <label className={labelCls} style={labelStyle}>Atenuacao em fase sem contraste (HU)</label>
              <div className="max-w-xs">
                <input
                  type="number"
                  className={inputCls}
                  placeholder="Ex: 5"
                  value={unenhancedHU}
                  onChange={e => setUnenhancedHU(e.target.value)}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                &le; 10 HU = adenoma rico em lipidos (especificidade &gt; 98%)
              </p>
            </div>

            {/* Washout section - only show if > 10 HU */}
            {parseFloat(unenhancedHU) > 10 && (
              <div>
                <label className={labelCls} style={labelStyle}>Protocolo de washout disponivel?</label>
                <OptionGrid options={yesNoOptions} value={hasWashout} onChange={setHasWashout} columns={2} />
              </div>
            )}

            {hasWashout === 'yes' && parseFloat(unenhancedHU) > 10 && (
              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text)' }}>
                  Calculo de Washout (fase tardia aos 15 minutos)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls} style={labelStyle}>Pre-contraste (HU)</label>
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="Ex: 25"
                      value={preHU}
                      onChange={e => setPreHU(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Fase portal / realce (HU)</label>
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="Ex: 120"
                      value={enhancedHU}
                      onChange={e => setEnhancedHU(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Fase tardia 15 min (HU)</label>
                    <input
                      type="number"
                      className={inputCls}
                      placeholder="Ex: 50"
                      value={delayedHU}
                      onChange={e => setDelayedHU(e.target.value)}
                    />
                  </div>
                </div>

                {(washout.apw !== null || washout.rpw !== null) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <ResultBadge
                      label="Washout Absoluto (APW)"
                      value={washout.apw !== null ? `${washout.apw.toFixed(1)}%` : '\u2014'}
                      color={washout.apwAdenoma ? GREEN : washout.apw !== null ? RED : undefined}
                    />
                    <ResultBadge
                      label="Washout Relativo (RPW)"
                      value={washout.rpw !== null ? `${washout.rpw.toFixed(1)}%` : '\u2014'}
                      color={washout.rpwAdenoma ? GREEN : washout.rpw !== null ? RED : undefined}
                    />
                  </div>
                )}

                <div className="mt-3">
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>
                    APW = (EN - DEL) / (EN - PRE) &times; 100 &mdash; &ge; 60% = adenoma
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text3)' }}>
                    RPW = (EN - DEL) / EN &times; 100 &mdash; &ge; 40% = adenoma
                  </p>
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── 3. RM (opcional) ── */}
      {parseFloat(size) >= 1 && (
        <Section title="3. Caracteristicas na RM (opcional)" defaultOpen={false}>
          <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
            Preencha se ressonancia magnetica com chemical shift foi realizada.
          </p>
          <div className="space-y-4">
            <div>
              <label className={labelCls} style={labelStyle}>RM com chemical shift realizada?</label>
              <OptionGrid options={yesNoOptions} value={hasMRI} onChange={setHasMRI} columns={2} />
            </div>

            {hasMRI === 'yes' && (
              <>
                <div>
                  <label className={labelCls} style={labelStyle}>Queda de sinal na sequencia fora de fase (out-of-phase)?</label>
                  <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>
                    Reducao de intensidade de sinal na imagem fora de fase em relacao a imagem em fase indica lipido intracelular
                  </p>
                  <OptionGrid options={yesNoOptions} value={signalDrop} onChange={setSignalDrop} columns={2} />
                </div>

                <div>
                  <label className={labelCls} style={labelStyle}>Sinal de India ink (borda escura na interface)?</label>
                  <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>
                    Artefato de cancelamento quimico na interface entre a lesao e o tecido adjacente
                  </p>
                  <OptionGrid options={yesNoNaOptions} value={indiaInk} onChange={setIndiaInk} columns={3} />
                </div>
              </>
            )}
          </div>
        </Section>
      )}

      {/* ── 4. Caracteristicas adicionais ── */}
      {parseFloat(size) >= 1 && (
        <Section title="4. Caracteristicas Adicionais" defaultOpen={false}>
          <p className="text-xs mb-3" style={{ color: 'var(--text3)' }}>
            Fatores que aumentam a suspeicao para malignidade ou alteram a conduta.
          </p>
          <div className="space-y-4">
            <div>
              <label className={labelCls} style={labelStyle}>Lesao em crescimento em relacao a exame previo?</label>
              <OptionGrid options={yesNoNaOptions} value={growing} onChange={setGrowing} columns={3} />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Contornos irregulares / aspectos morfologicos atipicos?</label>
              <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>
                Margens mal definidas, realce heterogeneo, necrose, invasao de estruturas adjacentes
              </p>
              <OptionGrid options={yesNoNaOptions} value={irregular} onChange={setIrregular} columns={3} />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Avaliacao funcional positiva?</label>
              <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>
                Hipercortisolismo subclinico, feocromocitoma, hiperaldosteronismo, excesso androgenico
              </p>
              <OptionGrid options={yesNoNaOptions} value={functioning} onChange={setFunctioning} columns={3} />
            </div>
          </div>
        </Section>
      )}

      {/* ── 5. Resultado / Classificacao ── */}
      {result && (
        <Section title="Resultado e Conduta">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <ResultBadge
              label="Classificacao"
              value={classLabel(result.classification)}
              color={classColor(result.classification)}
              large
            />
            <ResultBadge
              label="Categoria"
              value={result.category}
              color={classColor(result.classification)}
            />
          </div>

          {/* Washout results inline if calculated */}
          {hasWashout === 'yes' && (washout.apw !== null || washout.rpw !== null) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <ResultBadge
                label="Washout Absoluto (APW)"
                value={washout.apw !== null ? `${washout.apw.toFixed(1)}%` : '\u2014'}
                color={washout.apwAdenoma ? GREEN : washout.apw !== null ? RED : undefined}
              />
              <ResultBadge
                label="Washout Relativo (RPW)"
                value={washout.rpw !== null ? `${washout.rpw.toFixed(1)}%` : '\u2014'}
                color={washout.rpwAdenoma ? GREEN : washout.rpw !== null ? RED : undefined}
              />
            </div>
          )}

          {/* Recommendation */}
          <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: classColor(result.classification) + '44' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Recomendacao de Conduta</p>
            <p className="text-sm font-semibold" style={{ color: classColor(result.classification) }}>
              {result.recommendation}
            </p>
          </div>

          {/* Details */}
          {result.details.length > 0 && (
            <div className="rounded-lg border p-4 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Detalhes e Justificativa</p>
              <ul className="space-y-1">
                {result.details.map((d, i) => (
                  <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text3)' }}>
                    {'\u2022'} {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Functioning reminder */}
          {functioning !== 'yes' && parseFloat(size) >= 1 && (
            <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'rgba(234,179,8,0.08)', borderColor: YELLOW + '44' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: YELLOW }}>Lembrete: Avaliacao Funcional</p>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>
                Conforme as diretrizes europeias (ESE/ENSAT 2016), todos os nodulos adrenais &ge; 1 cm devem ser avaliados quanto a funcionalidade hormonal:
              </p>
              <ul className="mt-1 space-y-0.5">
                <li className="text-xs" style={{ color: 'var(--text3)' }}>{'\u2022'} Teste de supressao com dexametasona 1 mg (excluir sindrome de Cushing subclinica)</li>
                <li className="text-xs" style={{ color: 'var(--text3)' }}>{'\u2022'} Metanefrinas plasmaticas ou urinarias (excluir feocromocitoma)</li>
                <li className="text-xs" style={{ color: 'var(--text3)' }}>{'\u2022'} Relacao aldosterona/renina se hipertensao (excluir hiperaldosteronismo)</li>
              </ul>
            </div>
          )}

          {/* Algorithm summary */}
          <div className="rounded-lg border p-3 mb-3" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Algoritmo de Caracterizacao por Imagem</p>
            <div className="space-y-1">
              <p className="text-xs" style={{ color: GREEN }}>
                {'\u2713'} TC sem contraste &le; 10 HU &rarr; Adenoma rico em lipidos &rarr; Sem seguimento
              </p>
              <p className="text-xs" style={{ color: GREEN }}>
                {'\u2713'} Queda de sinal no chemical shift (RM) &rarr; Adenoma &rarr; Sem seguimento
              </p>
              <p className="text-xs" style={{ color: GREEN }}>
                {'\u2713'} APW &ge; 60% ou RPW &ge; 40% &rarr; Adenoma &rarr; Sem seguimento
              </p>
              <p className="text-xs" style={{ color: YELLOW }}>
                ? TC &gt; 10 HU sem washout/RM &rarr; Indeterminado &rarr; Completar investigacao
              </p>
              <p className="text-xs" style={{ color: RED }}>
                {'\u2717'} &gt; 4 cm, crescimento, margens irregulares &rarr; Suspeito &rarr; Cirurgia/biopsia
              </p>
            </div>
          </div>

          {/* Texto para Laudo */}
          {laudoText && (
            <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Texto para Laudo</p>
                <button
                  onClick={() => navigator.clipboard.writeText(laudoText)}
                  className="text-xs px-2 py-1 rounded border"
                  style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
                >
                  Copiar
                </button>
              </div>
              <p className="text-xs leading-relaxed font-mono p-3 rounded-lg" style={{ backgroundColor: 'var(--surface2)', color: 'var(--text)', whiteSpace: 'pre-wrap', userSelect: 'all' }}>
                {laudoText}
              </p>
            </div>
          )}
        </Section>
      )}
    </CalculatorLayout>
  )
}
