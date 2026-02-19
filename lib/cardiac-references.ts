// ESC 2020 (Petersen et al.) Reference Values for Cardiac MRI
// Source: Petersen et al. Eur Heart J Cardiovasc Imaging. 2019 Dec 1;20(12):1321-1331.

export type Sexo = 'Masculino' | 'Feminino'
export type TipoRef = 'ESC' | 'ESC_AJUSTADO'
export type Classificacao = 'normal' | 'discreto' | 'moderado' | 'acentuado'

interface RefRange {
  min: number
  max: number
}

export interface RefParam {
  nome: string
  unidade: string
  normal: RefRange | null
  discreto: RefRange | null
  moderado: RefRange | null
  acentuado: RefRange | null
  tipo: 'aumentado' | 'reduzido'
}

type RefTable = Record<string, RefParam>
type RefBySex = Record<Sexo, RefTable>
export type Referencias = Record<TipoRef, RefBySex>

export const referencias: Referencias = {
  ESC: {
    Masculino: {
      VE_EDV: { nome: "VE Volume diastólico final (EDV)", unidade: "mL", normal: { min: 106, max: 214 }, discreto: { min: 215, max: 241 }, moderado: { min: 242, max: 268 }, acentuado: { min: 268, max: 999999 }, tipo: "aumentado" },
      VE_ESV: { nome: "VE Volume sistólico final (ESV)", unidade: "mL", normal: { min: 26, max: 82 }, discreto: { min: 83, max: 96 }, moderado: { min: 97, max: 110 }, acentuado: { min: 110, max: 999999 }, tipo: "aumentado" },
      VE_EDV_INDEX: { nome: "VE Volume diastólico final indexado (EDV/BSA)", unidade: "mL/m²", normal: { min: 57, max: 105 }, discreto: { min: 106, max: 117 }, moderado: { min: 118, max: 129 }, acentuado: { min: 129, max: 999999 }, tipo: "aumentado" },
      VE_ESV_INDEX: { nome: "VE Volume sistólico final indexado (ESV/BSA)", unidade: "mL/m²", normal: { min: 14, max: 38 }, discreto: { min: 39, max: 44 }, moderado: { min: 45, max: 50 }, acentuado: { min: 50, max: 999999 }, tipo: "aumentado" },
      VE_EF: { nome: "VE Fração de ejeção (EF)", unidade: "%", normal: { min: 57, max: 77 }, discreto: { min: 41, max: 56 }, moderado: { min: 30, max: 40 }, acentuado: { min: 0, max: 30 }, tipo: "reduzido" },
      VE_VOL_EJETADO: { nome: "VE Volume ejetado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VE_VOL_EJETADO_INDEX: { nome: "VE Volume ejetado Indexado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VE_MASSA: { nome: "VE Massa ventricular esquerda", unidade: "g", normal: { min: 92, max: 176 }, discreto: { min: 177, max: 197 }, moderado: { min: 198, max: 218 }, acentuado: { min: 218, max: 999999 }, tipo: "aumentado" },
      VE_MASSA_INDEX: { nome: "VE Massa indexada (Massa/BSA)", unidade: "g/m²", normal: { min: 49, max: 85 }, discreto: { min: 86, max: 94 }, moderado: { min: 95, max: 103 }, acentuado: { min: 103, max: 999999 }, tipo: "aumentado" },
      VD_EDV: { nome: "VD Volume diastólico final (EDV)", unidade: "mL", normal: { min: 118, max: 250 }, discreto: { min: 251, max: 283 }, moderado: { min: 284, max: 316 }, acentuado: { min: 316, max: 999999 }, tipo: "aumentado" },
      VD_ESV: { nome: "VD Volume sistólico final (ESV)", unidade: "mL", normal: { min: 41, max: 117 }, discreto: { min: 118, max: 136 }, moderado: { min: 137, max: 155 }, acentuado: { min: 155, max: 999999 }, tipo: "aumentado" },
      VD_EDV_INDEX: { nome: "VD Volume diastólico final indexado (EDV/BSA)", unidade: "mL/m²", normal: { min: 61, max: 121 }, discreto: { min: 122, max: 136 }, moderado: { min: 137, max: 151 }, acentuado: { min: 151, max: 999999 }, tipo: "aumentado" },
      VD_ESV_INDEX: { nome: "VD Volume sistólico final indexado (ESV/BSA)", unidade: "mL/m²", normal: { min: 19, max: 59 }, discreto: { min: 60, max: 69 }, moderado: { min: 70, max: 79 }, acentuado: { min: 79, max: 999999 }, tipo: "aumentado" },
      VD_EF: { nome: "VD Fração de ejeção (EF)", unidade: "%", normal: { min: 52, max: 72 }, discreto: { min: 41, max: 52 }, moderado: { min: 30, max: 40 }, acentuado: { min: 0, max: 30 }, tipo: "reduzido" },
      VD_VOL_EJETADO: { nome: "VD Volume ejetado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VD_VOL_EJETADO_INDEX: { nome: "VD Volume ejetado Indexado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VD_MASSA: { nome: "VD Massa ventricular direita", unidade: "g", normal: { min: 25, max: 57 }, discreto: { min: 58, max: 65 }, moderado: { min: 66, max: 73 }, acentuado: { min: 73, max: 999999 }, tipo: "aumentado" },
      VD_MASSA_INDEX: { nome: "VD Massa indexada (Massa/BSA)", unidade: "g/m²", normal: { min: 13, max: 29 }, discreto: { min: 30, max: 33 }, moderado: { min: 34, max: 37 }, acentuado: { min: 37, max: 999999 }, tipo: "aumentado" },
      AE_VOL_INDEX: { nome: "Volume máximo indexado por área corporal", unidade: "mL/m²", normal: { min: 26, max: 52 }, discreto: { min: 53, max: 59 }, moderado: { min: 60, max: 66 }, acentuado: { min: 66, max: 999999 }, tipo: "aumentado" },
      AD_VOL_INDEX: { nome: "Volume máximo indexado por área corporal", unidade: "mL/m²", normal: { min: 18, max: 90 }, discreto: { min: 91, max: 108 }, moderado: { min: 109, max: 126 }, acentuado: { min: 126, max: 999999 }, tipo: "aumentado" },
      AD_AREA_4CH_INDEX: { nome: "Área máxima 4 câmaras indexada", unidade: "cm²/m²", normal: { min: 8, max: 16 }, discreto: { min: 17, max: 18 }, moderado: { min: 19, max: 20 }, acentuado: { min: 20, max: 999999 }, tipo: "aumentado" },
    },
    Feminino: {
      VE_EDV: { nome: "VE Volume diastólico final (EDV)", unidade: "mL", normal: { min: 86, max: 178 }, discreto: { min: 179, max: 201 }, moderado: { min: 202, max: 224 }, acentuado: { min: 224, max: 999999 }, tipo: "aumentado" },
      VE_ESV: { nome: "VE Volume sistólico final (ESV)", unidade: "mL", normal: { min: 22, max: 66 }, discreto: { min: 67, max: 77 }, moderado: { min: 78, max: 88 }, acentuado: { min: 88, max: 999999 }, tipo: "aumentado" },
      VE_EDV_INDEX: { nome: "VE Volume diastólico final indexado (EDV/BSA)", unidade: "mL/m²", normal: { min: 56, max: 96 }, discreto: { min: 97, max: 106 }, moderado: { min: 107, max: 116 }, acentuado: { min: 116, max: 999999 }, tipo: "aumentado" },
      VE_ESV_INDEX: { nome: "VE Volume sistólico final indexado (ESV/BSA)", unidade: "mL/m²", normal: { min: 14, max: 34 }, discreto: { min: 35, max: 39 }, moderado: { min: 40, max: 44 }, acentuado: { min: 44, max: 999999 }, tipo: "aumentado" },
      VE_EF: { nome: "VE Fração de ejeção (EF)", unidade: "%", normal: { min: 57, max: 77 }, discreto: { min: 41, max: 56 }, moderado: { min: 30, max: 40 }, acentuado: { min: 0, max: 30 }, tipo: "aumentado" },
      VE_VOL_EJETADO: { nome: "VE Volume ejetado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VE_VOL_EJETADO_INDEX: { nome: "VE Volume ejetado Indexado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VE_MASSA: { nome: "VE Massa ventricular esquerda", unidade: "g", normal: { min: 56, max: 140 }, discreto: { min: 141, max: 161 }, moderado: { min: 162, max: 182 }, acentuado: { min: 182, max: 999999 }, tipo: "aumentado" },
      VE_MASSA_INDEX: { nome: "VE Massa indexada (Massa/BSA)", unidade: "g/m²", normal: { min: 41, max: 81 }, discreto: { min: 82, max: 91 }, moderado: { min: 92, max: 101 }, acentuado: { min: 101, max: 999999 }, tipo: "aumentado" },
      VD_EDV: { nome: "VD Volume diastólico final (EDV)", unidade: "mL", normal: { min: 77, max: 201 }, discreto: { min: 202, max: 232 }, moderado: { min: 233, max: 263 }, acentuado: { min: 263, max: 999999 }, tipo: "aumentado" },
      VD_ESV: { nome: "VD Volume sistólico final (ESV)", unidade: "mL", normal: { min: 24, max: 84 }, discreto: { min: 85, max: 99 }, moderado: { min: 100, max: 114 }, acentuado: { min: 114, max: 999999 }, tipo: "aumentado" },
      VD_EDV_INDEX: { nome: "VD Volume diastólico final indexado (EDV/BSA)", unidade: "mL/m²", normal: { min: 48, max: 112 }, discreto: { min: 113, max: 128 }, moderado: { min: 129, max: 144 }, acentuado: { min: 144, max: 999999 }, tipo: "aumentado" },
      VD_ESV_INDEX: { nome: "VD Volume sistólico final indexado (ESV/BSA)", unidade: "mL/m²", normal: { min: 12, max: 52 }, discreto: { min: 53, max: 62 }, moderado: { min: 63, max: 72 }, acentuado: { min: 72, max: 999999 }, tipo: "aumentado" },
      VD_EF: { nome: "VD Fração de ejeção (EF)", unidade: "%", normal: { min: 51, max: 71 }, discreto: { min: 41, max: 51 }, moderado: { min: 30, max: 40 }, acentuado: { min: 0, max: 30 }, tipo: "reduzido" },
      VD_VOL_EJETADO: { nome: "VD Volume ejetado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VD_VOL_EJETADO_INDEX: { nome: "VD Volume ejetado Indexado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VD_MASSA: { nome: "VD Massa ventricular direita", unidade: "g", normal: { min: 21, max: 49 }, discreto: { min: 50, max: 56 }, moderado: { min: 57, max: 63 }, acentuado: { min: 63, max: 999999 }, tipo: "aumentado" },
      VD_MASSA_INDEX: { nome: "VD Massa indexada (Massa/BSA)", unidade: "g/m²", normal: { min: 12, max: 28 }, discreto: { min: 29, max: 32 }, moderado: { min: 33, max: 36 }, acentuado: { min: 36, max: 999999 }, tipo: "aumentado" },
    },
  },
  ESC_AJUSTADO: {
    Masculino: {
      VE_EDV: { nome: "VE Volume diastólico final (EDV)", unidade: "mL", normal: { min: 106, max: 214 }, discreto: { min: 215, max: 241 }, moderado: { min: 242, max: 268 }, acentuado: { min: 268, max: 999999 }, tipo: "aumentado" },
      VE_ESV: { nome: "VE Volume sistólico final (ESV)", unidade: "mL", normal: { min: 26, max: 82 }, discreto: { min: 83, max: 96 }, moderado: { min: 97, max: 110 }, acentuado: { min: 110, max: 999999 }, tipo: "aumentado" },
      VE_EDV_INDEX: { nome: "VE Volume diastólico final indexado (EDV/BSA)", unidade: "mL/m²", normal: { min: 57, max: 105 }, discreto: { min: 106, max: 117 }, moderado: { min: 118, max: 129 }, acentuado: { min: 129, max: 999999 }, tipo: "aumentado" },
      VE_ESV_INDEX: { nome: "VE Volume sistólico final indexado (ESV/BSA)", unidade: "mL/m²", normal: { min: 14, max: 38 }, discreto: { min: 39, max: 44 }, moderado: { min: 45, max: 50 }, acentuado: { min: 50, max: 999999 }, tipo: "aumentado" },
      VE_EF: { nome: "VE Fração de ejeção (EF)", unidade: "%", normal: { min: 50, max: 77 }, discreto: { min: 41, max: 49 }, moderado: { min: 30, max: 40 }, acentuado: { min: 0, max: 30 }, tipo: "reduzido" },
      VE_VOL_EJETADO: { nome: "VE Volume ejetado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VE_VOL_EJETADO_INDEX: { nome: "VE Volume ejetado Indexado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VE_MASSA: { nome: "VE Massa ventricular esquerda", unidade: "g", normal: { min: 92, max: 176 }, discreto: { min: 177, max: 197 }, moderado: { min: 198, max: 218 }, acentuado: { min: 218, max: 999999 }, tipo: "aumentado" },
      VE_MASSA_INDEX: { nome: "VE Massa indexada (Massa/BSA)", unidade: "g/m²", normal: { min: 49, max: 85 }, discreto: { min: 86, max: 94 }, moderado: { min: 95, max: 103 }, acentuado: { min: 103, max: 999999 }, tipo: "aumentado" },
      VD_EDV: { nome: "VD Volume diastólico final (EDV)", unidade: "mL", normal: { min: 118, max: 250 }, discreto: { min: 251, max: 283 }, moderado: { min: 284, max: 316 }, acentuado: { min: 316, max: 999999 }, tipo: "aumentado" },
      VD_ESV: { nome: "VD Volume sistólico final (ESV)", unidade: "mL", normal: { min: 41, max: 117 }, discreto: { min: 118, max: 136 }, moderado: { min: 137, max: 155 }, acentuado: { min: 155, max: 999999 }, tipo: "aumentado" },
      VD_EDV_INDEX: { nome: "VD Volume diastólico final indexado (EDV/BSA)", unidade: "mL/m²", normal: { min: 61, max: 121 }, discreto: { min: 122, max: 136 }, moderado: { min: 137, max: 151 }, acentuado: { min: 151, max: 999999 }, tipo: "aumentado" },
      VD_ESV_INDEX: { nome: "VD Volume sistólico final indexado (ESV/BSA)", unidade: "mL/m²", normal: { min: 19, max: 59 }, discreto: { min: 60, max: 69 }, moderado: { min: 70, max: 79 }, acentuado: { min: 79, max: 999999 }, tipo: "aumentado" },
      VD_EF: { nome: "VD Fração de ejeção (EF)", unidade: "%", normal: { min: 45, max: 72 }, discreto: { min: 41, max: 45 }, moderado: { min: 30, max: 40 }, acentuado: { min: 0, max: 30 }, tipo: "reduzido" },
      VD_VOL_EJETADO: { nome: "VD Volume ejetado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VD_VOL_EJETADO_INDEX: { nome: "VD Volume ejetado Indexado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VD_MASSA: { nome: "VD Massa ventricular direita", unidade: "g", normal: { min: 25, max: 57 }, discreto: { min: 58, max: 65 }, moderado: { min: 66, max: 73 }, acentuado: { min: 73, max: 999999 }, tipo: "aumentado" },
      VD_MASSA_INDEX: { nome: "VD Massa indexada (Massa/BSA)", unidade: "g/m²", normal: { min: 13, max: 29 }, discreto: { min: 30, max: 33 }, moderado: { min: 34, max: 37 }, acentuado: { min: 37, max: 999999 }, tipo: "aumentado" },
      AE_VOL_INDEX: { nome: "Volume máximo indexado por área corporal", unidade: "mL/m²", normal: { min: 26, max: 52 }, discreto: { min: 53, max: 59 }, moderado: { min: 60, max: 66 }, acentuado: { min: 66, max: 999999 }, tipo: "aumentado" },
      AD_VOL_INDEX: { nome: "Volume máximo indexado por área corporal", unidade: "mL/m²", normal: { min: 18, max: 90 }, discreto: { min: 91, max: 108 }, moderado: { min: 109, max: 126 }, acentuado: { min: 126, max: 999999 }, tipo: "aumentado" },
      AD_AREA_4CH_INDEX: { nome: "Área máxima 4 câmaras indexada", unidade: "cm²/m²", normal: { min: 8, max: 16 }, discreto: { min: 17, max: 18 }, moderado: { min: 19, max: 20 }, acentuado: { min: 20, max: 999999 }, tipo: "aumentado" },
    },
    Feminino: {
      VE_EDV: { nome: "VE Volume diastólico final (EDV)", unidade: "mL", normal: { min: 86, max: 178 }, discreto: { min: 179, max: 201 }, moderado: { min: 202, max: 224 }, acentuado: { min: 224, max: 999999 }, tipo: "aumentado" },
      VE_ESV: { nome: "VE Volume sistólico final (ESV)", unidade: "mL", normal: { min: 22, max: 66 }, discreto: { min: 67, max: 77 }, moderado: { min: 78, max: 88 }, acentuado: { min: 88, max: 999999 }, tipo: "aumentado" },
      VE_EDV_INDEX: { nome: "VE Volume diastólico final indexado (EDV/BSA)", unidade: "mL/m²", normal: { min: 56, max: 96 }, discreto: { min: 97, max: 106 }, moderado: { min: 107, max: 116 }, acentuado: { min: 116, max: 999999 }, tipo: "aumentado" },
      VE_ESV_INDEX: { nome: "VE Volume sistólico final indexado (ESV/BSA)", unidade: "mL/m²", normal: { min: 14, max: 34 }, discreto: { min: 35, max: 39 }, moderado: { min: 40, max: 44 }, acentuado: { min: 44, max: 999999 }, tipo: "aumentado" },
      VE_EF: { nome: "VE Fração de ejeção (EF)", unidade: "%", normal: { min: 50, max: 77 }, discreto: { min: 41, max: 49 }, moderado: { min: 30, max: 40 }, acentuado: { min: 0, max: 30 }, tipo: "aumentado" },
      VE_VOL_EJETADO: { nome: "VE Volume ejetado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VE_VOL_EJETADO_INDEX: { nome: "VE Volume ejetado Indexado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VE_MASSA: { nome: "VE Massa ventricular esquerda", unidade: "g", normal: { min: 56, max: 140 }, discreto: { min: 141, max: 161 }, moderado: { min: 162, max: 182 }, acentuado: { min: 182, max: 999999 }, tipo: "aumentado" },
      VE_MASSA_INDEX: { nome: "VE Massa indexada (Massa/BSA)", unidade: "g/m²", normal: { min: 41, max: 81 }, discreto: { min: 82, max: 91 }, moderado: { min: 92, max: 101 }, acentuado: { min: 101, max: 999999 }, tipo: "aumentado" },
      VD_EDV: { nome: "VD Volume diastólico final (EDV)", unidade: "mL", normal: { min: 77, max: 201 }, discreto: { min: 202, max: 232 }, moderado: { min: 233, max: 263 }, acentuado: { min: 263, max: 999999 }, tipo: "aumentado" },
      VD_ESV: { nome: "VD Volume sistólico final (ESV)", unidade: "mL", normal: { min: 24, max: 84 }, discreto: { min: 85, max: 99 }, moderado: { min: 100, max: 114 }, acentuado: { min: 114, max: 999999 }, tipo: "aumentado" },
      VD_EDV_INDEX: { nome: "VD Volume diastólico final indexado (EDV/BSA)", unidade: "mL/m²", normal: { min: 48, max: 112 }, discreto: { min: 113, max: 128 }, moderado: { min: 129, max: 144 }, acentuado: { min: 144, max: 999999 }, tipo: "aumentado" },
      VD_ESV_INDEX: { nome: "VD Volume sistólico final indexado (ESV/BSA)", unidade: "mL/m²", normal: { min: 12, max: 52 }, discreto: { min: 53, max: 62 }, moderado: { min: 63, max: 72 }, acentuado: { min: 72, max: 999999 }, tipo: "aumentado" },
      VD_EF: { nome: "VD Fração de ejeção (EF)", unidade: "%", normal: { min: 45, max: 71 }, discreto: { min: 41, max: 45 }, moderado: { min: 30, max: 40 }, acentuado: { min: 0, max: 30 }, tipo: "reduzido" },
      VD_VOL_EJETADO: { nome: "VD Volume ejetado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VD_VOL_EJETADO_INDEX: { nome: "VD Volume ejetado Indexado", unidade: "", normal: null, discreto: null, moderado: null, acentuado: null, tipo: "aumentado" },
      VD_MASSA: { nome: "VD Massa ventricular direita", unidade: "g", normal: { min: 21, max: 49 }, discreto: { min: 50, max: 56 }, moderado: { min: 57, max: 63 }, acentuado: { min: 63, max: 999999 }, tipo: "aumentado" },
      VD_MASSA_INDEX: { nome: "VD Massa indexada (Massa/BSA)", unidade: "g/m²", normal: { min: 12, max: 28 }, discreto: { min: 29, max: 32 }, moderado: { min: 33, max: 36 }, acentuado: { min: 36, max: 999999 }, tipo: "aumentado" },
    },
  },
}

export function classificarValor(valor: number, param: string, sexo: Sexo, tipoRef: TipoRef): Classificacao | null {
  if (!sexo || !tipoRef) return null
  const ref = referencias[tipoRef]?.[sexo]?.[param]
  if (!ref || !ref.normal) return null
  return classificarValorFromRef(valor, ref)
}

/** Classify a value using any arbitrary RefParam (not just built-in ESC tables) */
export function classificarValorFromRef(valor: number, ref: RefParam): Classificacao | null {
  if (!ref || !ref.normal) return null

  if (ref.tipo === 'aumentado') {
    if (valor >= ref.normal.min && valor <= ref.normal.max) return 'normal'
    if (ref.discreto && valor >= ref.discreto.min && valor <= ref.discreto.max) return 'discreto'
    if (ref.moderado && valor >= ref.moderado.min && valor <= ref.moderado.max) return 'moderado'
    if (ref.acentuado && valor >= ref.acentuado.min) return 'acentuado'
  } else {
    if (ref.acentuado && valor <= ref.acentuado.max) return 'acentuado'
    if (ref.moderado && valor >= ref.moderado.min && valor <= ref.moderado.max) return 'moderado'
    if (ref.discreto && valor >= ref.discreto.min && valor <= ref.discreto.max) return 'discreto'
    if (valor >= ref.normal.min && valor <= ref.normal.max) return 'normal'
  }
  return null
}

export function arredondarABNT(valor: number): number {
  if (isNaN(valor)) return valor
  const parteInteira = Math.floor(valor)
  const decimal = valor - parteInteira
  const primeiroDecimal = Math.floor(decimal * 10)

  if (primeiroDecimal >= 6) return Math.ceil(valor)
  if (primeiroDecimal <= 4) return Math.floor(valor)
  // .5: even goes down, odd goes up
  return parteInteira % 2 === 0 ? parteInteira : parteInteira + 1
}

export function formatarResultado(valor: number, casas: number, useABNT: boolean): string {
  if (isNaN(valor)) return '-'
  if (useABNT) return arredondarABNT(valor).toFixed(0)
  return valor.toFixed(casas)
}

export function calcularASC(alturaCm: number, pesoKg: number): number {
  return 0.007184 * Math.pow(alturaCm, 0.725) * Math.pow(pesoKg, 0.425)
}
