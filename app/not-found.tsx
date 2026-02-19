import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-accent/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-text mb-3">Página não encontrada</h1>
        <p className="text-text2 mb-6 text-sm">
          A página que você procura não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent2 transition-all font-semibold text-sm"
        >
          ← Voltar para Home
        </Link>
      </div>
    </div>
  )
}
