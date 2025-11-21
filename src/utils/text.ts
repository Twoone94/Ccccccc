export function splitChineseSentences(text: string): string[] {
  const src = String(text || '').replace(/\r/g, '')
  const lines = src.split(/\n+/).map(s => s.trim()).filter(Boolean)
  const out: string[] = []
  for (const ln of lines) {
    let buf = ''
    for (const ch of ln) {
      buf += ch
      if (/^[。！？；…]$/.test(ch)) {
        const tail = buf[buf.length - 1]
        if (tail) { out.push(buf.trim()); buf = '' }
      }
    }
    if (buf.trim()) out.push(buf.trim())
  }
  return out
}