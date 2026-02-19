/**
 * Converts legacy RadioHub markup to standard Markdown.
 * Handles: IMG:/LEGENDA:, bullet points (•), pipe tables, **bold** headings, # headings
 */
export function preprocessContent(text: string): string {
  if (!text) return ''

  const lines = text.split('\n')
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // IMG: → Markdown image
    if (trimmed.startsWith('IMG:')) {
      const url = trimmed.slice(4).trim()
      let caption = ''
      if (i + 1 < lines.length && lines[i + 1].trim().startsWith('LEGENDA:')) {
        caption = lines[i + 1].trim().slice(8).trim()
        i++ // skip LEGENDA line
      }
      result.push(`![${caption || 'Imagem do conteúdo'}](${url})`)
      if (caption) {
        result.push(`*${caption}*`)
      }
      result.push('')
      continue
    }

    // • bullet → - bullet (standard Markdown)
    if (trimmed.startsWith('•')) {
      result.push(`- ${trimmed.slice(1).trim()}`)
      continue
    }

    // @@TITLE → ## TITLE (centered heading — handled via custom component)
    if (trimmed.startsWith('@@')) {
      result.push(`## ${trimmed.slice(2).trim()}`)
      result.push('')
      continue
    }

    // **Full line bold** → ### heading (only if the entire line is bold)
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      result.push(`### ${trimmed.slice(2, -2)}`)
      continue
    }

    // Lines with pipes that aren't horizontal rules — already valid Markdown table syntax
    // Pass through as-is

    // Everything else passes through unchanged
    result.push(line)
  }

  return result.join('\n')
}

/**
 * Cleans up Notion Markdown exports.
 * - Removes the first H1 if it duplicates the title
 * - Normalizes excessive blank lines (3+ → 2)
 * - Trims leading/trailing whitespace
 */
export function processNotionExport(md: string, titleHint?: string): string {
  if (!md) return ''

  let cleaned = md.trim()

  // Remove Notion's duplicated H1 title at the top
  if (titleHint) {
    const h1Pattern = new RegExp(`^# ${escapeRegex(titleHint.trim())}\\s*\\n`, 'i')
    cleaned = cleaned.replace(h1Pattern, '')
  } else {
    // If no title hint, remove the first H1 anyway (Notion always adds it)
    cleaned = cleaned.replace(/^# .+\n+/, '')
  }

  // Normalize excessive blank lines (3+ consecutive → 2)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')

  return cleaned.trim()
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
