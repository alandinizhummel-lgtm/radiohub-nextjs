export const SPECS = {
  neuro: {
    label: 'Neurorradiologia',
    icon: '🧠',
    subs: ['Encéfalo', 'AVC/Isquemia', 'Neoplasias Intracranianas', 'Infecção/Inflamação', 'Trauma Craniano', 'Malformações Vasculares', 'Coluna Cervical', 'Coluna Torácica', 'Coluna Lombossacra', 'Vascular Cerebral', 'Nervos Cranianos', 'Pediatria Neuro']
  },
  cn: {
    label: 'Cabeça e Pescoço',
    icon: '🦷',
    subs: ['Tireoide/Paratireoide', 'Laringe/Faringe', 'Cavidade Oral/Mandíbula', 'Órbita/Globo Ocular', 'Ouvido/Mastoide', 'Glândulas Salivares', 'Espaços Cervicais', 'Linfonodos Cervicais']
  },
  torax: {
    label: 'Tórax',
    icon: '🫁',
    subs: ['Parênquima Pulmonar', 'Nódulo/Massa Pulmonar', 'Infecção/Pneumonia', 'Interstício/Fibrose', 'DPOC/Enfisema', 'Derrame Pleural/Empiema', 'Mediastino', 'Pleura', 'Trauma Torácico', 'Pediatria Tórax']
  },
  cardio: {
    label: 'Cardiovascular',
    icon: '❤️',
    subs: ['Aorta Torácica', 'Aorta Abdominal', 'Cardíaco/Coração', 'Coronárias', 'Artérias Periféricas', 'Veias/TEP', 'Dissecção Aórtica', 'Aneurismas', 'Malformações Vasculares']
  },
  gi: {
    label: 'Abdome · Digestivo',
    icon: '🩺',
    subs: ['Fígado', 'Vias Biliares/Vesícula', 'Pâncreas', 'Baço', 'Estômago/Esôfago', 'Intestino Delgado', 'Cólon/Reto', 'Peritônio/Mesentério', 'Abdome Agudo']
  },
  gu: {
    label: 'Abdome · Geniturinário',
    icon: '🔵',
    subs: ['Rins', 'Adrenal', 'Bexiga', 'Ureter/Pelve Renal', 'Próstata', 'Testículo/Epidídimo', 'Pênis', 'Útero/Ovários', 'Retroperitônio']
  },
  msk: {
    label: 'Músculo-Esquelética',
    icon: '🦴',
    subs: ['Ombro', 'Cotovelo', 'Punho/Mão', 'Quadril', 'Joelho', 'Tornozelo/Pé', 'Coluna MSK', 'Partes Moles/Músculo', 'Tumores Ósseos/Partes Moles']
  },
  mama: {
    label: 'Mamária',
    icon: '🎀',
    subs: ['Mamografia', 'US Mama', 'RM Mama', 'BI-RADS', 'Mama Masculina', 'Intervenção/Biópsia Mama']
  },
  us: {
    label: 'Ultrassonografia',
    icon: '🔊',
    subs: ['Abdome Geral', 'Cervical/Tireoide', 'Ginecologia', 'Obstetrícia', 'Doppler', 'Músculo-esquelético US', 'Rins/Vias/Próstata', 'Testículo/Pênis', 'Tórax US', 'Globo Ocular', 'Transfontanelar', 'Procedimentos US', 'Pediatria US']
  },
  interv: {
    label: 'Intervenção',
    icon: '💉',
    subs: ['Embolização', 'Drenagem/Biópsia', 'Intervenção Vascular Arterial', 'Intervenção Vascular Venosa', 'Neuro Intervenção', 'Procedimentos Oncológicos', 'Acesso Vascular']
  },
  contraste: {
    label: 'Contraste',
    icon: '💊',
    subs: ['Iodado', 'Gadolínio', 'Reações/Profilaxia']
  }
} as const

export type SpecKey = keyof typeof SPECS

export const VALID_ESPECIALIDADES = Object.keys(SPECS) as SpecKey[]

export const VALID_CONTENT_TYPES = ['resumos', 'artigos', 'mascaras', 'frases', 'checklists', 'tutoriais', 'videos'] as const

export type ContentType = typeof VALID_CONTENT_TYPES[number]

export const TYPE_SINGULAR: Record<ContentType, string> = {
  resumos: 'resumo',
  artigos: 'artigo',
  mascaras: 'mascara',
  frases: 'frase',
  checklists: 'checklist',
  tutoriais: 'tutorial',
  videos: 'video',
}

export const TYPE_LABELS: Record<ContentType, string> = {
  resumos: 'Resumo',
  artigos: 'Artigo',
  mascaras: 'Máscara',
  frases: 'Frase',
  checklists: 'Checklist',
  tutoriais: 'Tutorial',
  videos: 'Vídeo',
}
