'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-text mb-3">Algo deu errado</h1>
        <p className="text-text2 mb-6 text-sm">
          Ocorreu um erro inesperado. Tente recarregar a página.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent2 transition-all font-semibold text-sm"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="px-6 py-2 bg-surface2 text-text border border-border rounded-lg hover:border-accent/50 transition-all font-semibold text-sm"
          >
            Ir para Home
          </a>
        </div>
      </div>
    </div>
  )
}
