import type { RefParam } from './cardiac-references'

// ── Mascara de laudo ─────────────────────────────────────
export interface CardiacMask {
  id: string
  nome: string           // ex: "Hospital X - Padrao"
  instituicao: string    // ex: "Hospital X"
  template: string       // texto com $VAR e #bloco
  createdAt: string
  updatedAt: string
}

// ── Tabela de referencia customizada ─────────────────────
export interface CardiacReferenceTable {
  id: string
  nome: string           // ex: "ESC 2020 Ajustado"
  descricao?: string
  ageRange?: { min: number; max: number }
  parametros: {
    M: Record<string, RefParam>
    F: Record<string, RefParam>
  }
  createdAt: string
  updatedAt: string
}

// ── Variaveis de template ($VAR) ─────────────────────────
export const TEMPLATE_VARIABLES: Record<string, string> = {
  // VE
  '$VEVDF': 'VE Volume Diastolico Final (ml)',
  '$VEVSF': 'VE Volume Sistolico Final (ml)',
  '$VEVDFI': 'VE Volume Diastolico Final Indexado (ml/m2)',
  '$VEVSFI': 'VE Volume Sistolico Final Indexado (ml/m2)',
  '$VEVE': 'VE Volume Ejetado (ml)',
  '$VEVEI': 'VE Volume Ejetado Indexado (ml/m2)',
  '$VEFE': 'VE Fracao de Ejecao (%)',
  '$VEMASSA': 'VE Massa (g)',
  '$VEMASSAI': 'VE Massa Indexada (g/m2)',
  '$VEDDF': 'VE Diametro Diastolico Final (cm)',
  '$VEESPSEPTO': 'VE Espessura Septo (cm)',
  '$VEESPINFERIOR': 'VE Espessura Parede Inferior (cm)',
  // VD
  '$VDVDF': 'VD Volume Diastolico Final (ml)',
  '$VDVSF': 'VD Volume Sistolico Final (ml)',
  '$VDVDFI': 'VD Volume Diastolico Final Indexado (ml/m2)',
  '$VDVSFI': 'VD Volume Sistolico Final Indexado (ml/m2)',
  '$VDVE': 'VD Volume Ejetado (ml)',
  '$VDVEI': 'VD Volume Ejetado Indexado (ml/m2)',
  '$VDFE': 'VD Fracao de Ejecao (%)',
  '$VDMASSA': 'VD Massa (g)',
  '$VDMASSAI': 'VD Massa Indexada (g/m2)',
  // AE
  '$AEVOLINDEX': 'AE Volume Indexado (ml/m2)',
  '$AEAREA4CHI': 'AE Area 4CH Indexada (cm2/m2)',
  '$AEAREA2CHI': 'AE Area 2CH Indexada (cm2/m2)',
  '$AEDIAMAP': 'AE Diametro AP (cm)',
  // AD
  '$ADAREA4CHI': 'AD Area 4CH Indexada (cm2/m2)',
  '$ADAREA2CHI': 'AD Area 2CH Indexada (cm2/m2)',
  // Mapas
  '$T1MIOPRE': 'T1 Miocardio Pre (ms)',
  '$T1SANGUEPRE': 'T1 Sangue Pre (ms)',
  '$T1MIOPOS': 'T1 Miocardio Pos (ms)',
  '$T1SANGUEPOS': 'T1 Sangue Pos (ms)',
  '$ECV': 'Volume Extracelular (%)',
  '$HTSINTETICO': 'Hematocrito Sintetico',
  '$T2NATIVO': 'T2 Nativo (ms)',
  '$T2ESTRELA': 'T2* (ms)',
  '$CAMPOMAG': 'Campo Magnetico (T)',
  // Paciente
  '$ASC': 'Area de Superficie Corporal (m2)',
  '$SEXO': 'Sexo do Paciente',
  '$DELTAVEVD': 'Diferenca Volume Ejetado VE-VD (ml)',
}

// ── Blocos de texto automatico (#bloco) ──────────────────
export const TEMPLATE_BLOCKS: Record<string, string> = {
  // Camaras e funcao
  '#ventrículoesquerdo': 'Texto automatico VE (dimensoes, funcao, contratilidade)',
  '#ventrículodireito': 'Texto automatico VD',
  '#átrioesquerdo': 'Texto automatico AE',
  '#átriodireito': 'Texto automatico AD',
  '#átrios': 'Texto automatico Atrios (AE + AD combinados)',
  '#mapasparamétricos': 'Texto automatico mapas (T1, T2, ECV)',
  '#conclusão': 'Conclusao automatica',
  // Achados adicionais
  '#perfusao': 'Perfusao miocardica (normal: sem sinais de isquemia)',
  '#realcetardio': 'Realce tardio miocardico (normal: ausente)',
  '#anmiocardio': 'Analise do miocardio (doencas e alteracoes de realce tardio)',
  '#conclusaomiocardio': 'Conclusao automatica do miocardio (gerada a partir das doencas selecionadas)',
  '#valvas': 'Valvas cardiacas (normal: sem alteracoes)',
  '#pericardio': 'Pericardio (normal: sem espessamento/derrame)',
  '#aortaepulmonar': 'Aorta toracica e tronco pulmonar (normal: calibre normal)',
}

// ── Chaves dos parametros de referencia ──────────────────
export const REFERENCE_PARAM_KEYS = {
  VE: ['VE_EDV', 'VE_ESV', 'VE_EDV_INDEX', 'VE_ESV_INDEX', 'VE_EF', 'VE_VOL_EJETADO', 'VE_VOL_EJETADO_INDEX', 'VE_MASSA', 'VE_MASSA_INDEX'],
  VD: ['VD_EDV', 'VD_ESV', 'VD_EDV_INDEX', 'VD_ESV_INDEX', 'VD_EF', 'VD_VOL_EJETADO', 'VD_VOL_EJETADO_INDEX', 'VD_MASSA', 'VD_MASSA_INDEX'],
  AE: ['AE_VOL_INDEX'],
  AD: ['AD_AREA_4CH_INDEX', 'AD_VOL_INDEX'],
} as const
