'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'
import { preprocessContent } from '@/lib/markdown-utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

function isSafeImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const processed = preprocessContent(content)

  return (
    <div className={`markdown-content prose prose-sm max-w-none ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) => {
            if (!src || !isSafeImageUrl(src)) return null
            return (
              <figure className="my-4 bg-surface2 rounded-lg overflow-hidden border border-border">
                <Image
                  src={src}
                  alt={alt || 'Imagem do conteúdo'}
                  width={800}
                  height={500}
                  className="w-full h-auto !my-0"
                />
                {alt && alt !== 'Imagem do conteúdo' && (
                  <figcaption className="px-4 py-2 bg-surface border-t border-border text-sm text-text3 italic">
                    {alt}
                  </figcaption>
                )}
              </figure>
            )
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-border text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface2">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-border px-3 py-2 text-left font-bold text-accent text-xs">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2 text-text2 text-xs">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-accent bg-accent/5 px-4 py-2 my-3 text-text2 italic">
              {children}
            </blockquote>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName
            if (isInline) {
              return (
                <code className="bg-surface2 text-accent px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                  {children}
                </code>
              )
            }
            return (
              <pre className="bg-surface2 border border-border rounded-lg p-4 overflow-x-auto my-4">
                <code className={`${codeClassName || ''} text-xs font-mono text-text`} {...props}>
                  {children}
                </code>
              </pre>
            )
          },
          pre: ({ children }) => <>{children}</>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent2 underline transition-colors"
            >
              {children}
            </a>
          ),
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-text mt-6 mb-3">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-text mt-5 mb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold text-accent mt-4 mb-2">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-bold text-text mt-3 mb-1">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="text-text2 text-sm mb-3 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1 text-text2 text-sm">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1 text-text2 text-sm">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          hr: () => <hr className="my-6 border-border" />,
          strong: ({ children }) => (
            <strong className="font-bold text-text">{children}</strong>
          ),
          input: ({ checked, ...props }) => (
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mr-2 accent-accent"
              {...props}
            />
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}
