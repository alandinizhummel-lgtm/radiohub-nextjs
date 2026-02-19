import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.radiologyhub.app'),
  title: {
    default: 'Radiologyhub — Ferramentas de Radiologia',
    template: '%s | Radiologyhub',
  },
  description: 'Sistema completo de ferramentas para radiologia: resumos, máscaras de laudo, calculadoras médicas, checklists e mais. Organizado por especialidade radiológica.',
  keywords: ['radiologia', 'laudo', 'máscara', 'resumo', 'checklist', 'calculadora médica', 'neurorradiologia', 'radiologista'],
  openGraph: {
    title: 'Radiologyhub — Ferramentas de Radiologia',
    description: 'Resumos, máscaras de laudo, calculadoras médicas e checklists para radiologistas.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Radiologyhub',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Inline script to prevent theme flash - runs before React hydration
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light') document.documentElement.classList.add('light-mode');
  } catch(e) {}
})();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
      </head>
      <body className={dmSans.className}>{children}</body>
    </html>
  )
}
