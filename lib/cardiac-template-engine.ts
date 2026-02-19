/**
 * Cardiac Report Template Engine
 *
 * Substitutes $VARIABLE placeholders with computed values
 * and #block placeholders with auto-generated text sections.
 */

export function renderTemplate(
  template: string,
  variables: Record<string, string | number>,
  blockGenerators: Record<string, () => string>
): string {
  let result = template

  // Replace #block placeholders (longer match first to avoid partial matches)
  const blockKeys = Object.keys(blockGenerators).sort((a, b) => b.length - a.length)
  for (const block of blockKeys) {
    const regex = new RegExp(escapeRegex(block), 'gi')
    result = result.replace(regex, () => {
      try {
        return blockGenerators[block]()
      } catch {
        return block // keep placeholder on error
      }
    })
  }

  // Replace $VARIABLE placeholders (longer match first)
  const varKeys = Object.keys(variables).sort((a, b) => b.length - a.length)
  for (const varName of varKeys) {
    const regex = new RegExp(escapeRegex(varName), 'g')
    const value = variables[varName]
    result = result.replace(regex, value != null && value !== '' ? String(value) : '[  ]')
  }

  return result
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
