export type ParsedStoryboardItem = {
  id: number
  type: 'transition' | 'scene'
  description: string
  script?: string
}

export function parseStoryboardText(text: string): ParsedStoryboardItem[] {
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  return lines.map((line, idx) => {
    let type: 'transition' | 'scene' = 'scene'
    if (/^转场/.test(line)) type = 'transition'
    if (/^场景/.test(line)) type = 'scene'
    const desc = line.replace(/^(转场|场景)\s*[:：]?\s*/, '')
    return { id: idx + 1, type, description: desc || line, script: line }
  })
}