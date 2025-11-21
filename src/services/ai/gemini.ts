import { GoogleGenAI } from '@google/genai'
import { loadSettings, getAgentKeyList, getAgentModelList } from '../../store/settings'
import { secretsList, secretsGet } from '../../services/secrets'

export type Role = 'user' | 'assistant' | 'system'
export interface Message {
  role: Role
  content: string
  meta?: Record<string, unknown>
}

const ENV_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
const ENV_MODEL = (import.meta.env.VITE_GEMINI_MODEL as string | undefined)

function toHistory(messages: Message[]): Array<{ role: 'user' | 'model'; parts: { text: string }[] }> {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }))
}

export async function sendChat(
  messages: Message[],
  options?: { systemPrompt?: string; temperature?: number; topP?: number; maxOutputTokens?: number; modelName?: string }
): Promise<{ text: string }> {
  const s = loadSettings()
  const keys = [...getAgentKeyList(s.ai.agentPlatform, s)]
  try {
    const accounts = await secretsList()
    const prefix = `${s.ai.agentPlatform}:key:`
    for (const acc of accounts) {
      if (!String(acc).startsWith(prefix)) continue
      const val = await secretsGet(acc)
      if (val && !keys.includes(val)) keys.push(val)
    }
  } catch { void 0 }
  if (ENV_KEY) keys.push(ENV_KEY)
  const models = getAgentModelList(s.ai.agentPlatform, s)
  const temps = options?.temperature ?? s.ai.agentTemperature
  const maxTokens = options?.maxOutputTokens ?? s.ai.agentMaxTokens
  const candidateModels = Array.from(new Set([
    options?.modelName,
    ...(models || []),
    ENV_MODEL,
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.0-pro',
    'gemini-2.0-flash',
  ].filter(Boolean)))
  let lastErr: unknown
  for (const key of keys) {
    if (!key) continue
    try {
      const ai = new GoogleGenAI({ apiKey: key })
      let lastModelErr: unknown
      for (const m of candidateModels) {
        try {
          const firstUserIdx = messages.findIndex(ms => ms.role === 'user')
          const fallbackContent = ((messages[messages.length - 1]?.content || '').trim()) || '请生成'
          const normalized: Message[] = firstUserIdx >= 0 ? messages.slice(firstUserIdx) : [{ role: 'user', content: fallbackContent }]
          const payload = { model: String(m), contents: toHistory(normalized), config: { temperature: temps, maxOutputTokens: maxTokens, topP: options?.topP }, ...(options?.systemPrompt ? { systemInstruction: options.systemPrompt } : {}) }
          const stream = await ai.models.generateContentStream(payload)
          let buf = ''
          for await (const chunk of stream as unknown as { text?: string }[]) {
            const t = (chunk as unknown as { text?: string }).text
            if (t) buf += t
          }
          return { text: buf }
        } catch (me) {
          lastModelErr = me
          continue
        }
      }
      throw lastModelErr
    } catch (e) {
      lastErr = e
      continue
    }
  }
  throw (lastErr instanceof Error ? lastErr : new Error('所有密钥失败'))
}

export async function* streamChat(
  messages: Message[],
  options?: { systemPrompt?: string; temperature?: number; topP?: number; maxOutputTokens?: number; modelName?: string }
): AsyncGenerator<string, void, unknown> {
  const s = loadSettings()
  if (s.ai.useBff) {
    const res = await fetch('/api/agent/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt: options?.systemPrompt, temperature: options?.temperature ?? s.ai.agentTemperature, maxOutputTokens: options?.maxOutputTokens ?? s.ai.agentMaxTokens })
    })
    const reader = res.body?.getReader()
    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = new TextDecoder().decode(value)
        yield chunk
      }
      return
    }
  }
  const keys = [...getAgentKeyList(s.ai.agentPlatform, s)]
  try {
    const accounts = await secretsList()
    const prefix = `${s.ai.agentPlatform}:key:`
    for (const acc of accounts) {
      if (!String(acc).startsWith(prefix)) continue
      const val = await secretsGet(acc)
      if (val && !keys.includes(val)) keys.push(val)
    }
  } catch { void 0 }
  if (ENV_KEY) keys.push(ENV_KEY)
  const models = getAgentModelList(s.ai.agentPlatform, s)
  const lastMsg = messages[messages.length - 1]
  const prompt = ((lastMsg?.content ?? '').trim()) || '请生成'
  const candidateModels = Array.from(new Set([
    options?.modelName,
    ...(models || []),
    ENV_MODEL,
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.0-pro',
    'gemini-2.0-flash',
  ].filter(Boolean)))
  let lastErr: unknown
  for (const key of keys) {
    if (!key) continue
    try {
      const ai = new GoogleGenAI({ apiKey: key })
      let lastModelErr: unknown
      for (const m of candidateModels) {
        try {
          const prev = messages.slice(0, -1)
          const firstUserIdx = prev.findIndex(ms => ms.role === 'user')
          const historyMsgs = firstUserIdx >= 0 ? prev.slice(firstUserIdx) : []
          const chat = ai.chats.create({ model: m as string, history: toHistory(historyMsgs) })
          const stream = await chat.sendMessageStream({ message: prompt, config: { temperature: options?.temperature ?? s.ai.agentTemperature, maxOutputTokens: options?.maxOutputTokens ?? s.ai.agentMaxTokens, topP: options?.topP } })
          for await (const chunk of stream as unknown as { text?: string }[]) {
            const t = (chunk as unknown as { text?: string }).text
            if (t) yield t
          }
          return
        } catch (me) {
          lastModelErr = me
          continue
        }
      }
      throw lastModelErr
    } catch (e) {
      lastErr = e
      continue
    }
  }
  throw (lastErr instanceof Error ? lastErr : new Error('所有密钥失败'))
}

export async function testGeminiKey(key: string, modelName?: string): Promise<boolean> {
  try {
    const ai = new GoogleGenAI({ apiKey: key })
    const stream = await ai.models.generateContentStream({ model: modelName || 'gemini-2.0-pro', contents: 'ping' })
    for await (const chunk of stream as unknown as { text?: string }[]) {
      const t = (chunk as unknown as { text?: string }).text
      if (t && t.length > 0) return true
    }
    return false
  } catch {
    return false
  }
}