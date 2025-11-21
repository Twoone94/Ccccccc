export type DetectInput = {
  provider: 'openai' | 'gemini' | 'deepseek' | 'kimi'
  base: string
  key?: string
  useBff?: boolean
  model?: string
}

export type DetectResult = {
  ok: boolean
  status: '连接正常' | '连接失败' | '请求超时' | '未配置密钥' | '未配置地址'
  httpStatus?: number
}

const timeoutMs = 8000

export async function detectProvider({ provider, base, key, useBff, model }: DetectInput): Promise<DetectResult> {
  if (!base) return { ok: false, status: '未配置地址' }
  if (!key && (provider === 'openai' || provider === 'gemini' || provider === 'deepseek' || provider === 'kimi')) {
    return { ok: false, status: '未配置密钥' }
  }

  const ctrl = new AbortController()
  const to = setTimeout(() => ctrl.abort(), timeoutMs)
  const urlBase = base.replace(/\/$/, '')

  try {
    let url = ''
    const init: RequestInit = { signal: ctrl.signal }

    if (useBff) {
      url = `/api/proxy/detect?provider=${encodeURIComponent(provider)}&base=${encodeURIComponent(urlBase)}`
      if (key) url += `&key=${encodeURIComponent(key)}`
      if (model) url += `&model=${encodeURIComponent(model)}`
    } else {
      switch (provider) {
        case 'gemini': {
          url = `${urlBase}/v1/models?key=${encodeURIComponent(key || '')}`
          break
        }
        case 'openai': {
          if (model) {
            url = `${urlBase}/v1/chat/completions`
            init.method = 'POST'
            init.headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }
            init.body = JSON.stringify({ model, messages: [{ role: 'user', content: 'ping' }], max_tokens: 1 })
          } else {
            url = `${urlBase}/v1/models`
            init.headers = { Authorization: `Bearer ${key}` }
          }
          break
        }
        case 'deepseek': {
          if (model) {
            url = `${urlBase}/v1/chat/completions`
            init.method = 'POST'
            init.headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }
            init.body = JSON.stringify({ model, messages: [{ role: 'user', content: 'ping' }], max_tokens: 1 })
          } else {
            url = `${urlBase}/v1/models`
            init.headers = { Authorization: `Bearer ${key}` }
          }
          break
        }
        case 'kimi': {
          if (model) {
            url = `${urlBase}/v1/chat/completions`
            init.method = 'POST'
            init.headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }
            init.body = JSON.stringify({ model, messages: [{ role: 'user', content: 'ping' }], max_tokens: 1 })
          } else {
            url = `${urlBase}/v1/models`
            init.headers = { Authorization: `Bearer ${key}` }
          }
          break
        }
        default: {
          url = urlBase
        }
      }
    }

    const res = await fetch(url, init)
    clearTimeout(to)
    return { ok: res.ok, status: res.ok ? '连接正常' : '连接失败', httpStatus: res.status }
  } catch (e: unknown) {
    clearTimeout(to)
    const name = (e as { name?: string } | null)?.name
    return { ok: false, status: name === 'AbortError' ? '请求超时' : '连接失败' }
  }
}
