import type { Message } from '../services/ai/gemini'

const KEY = 'copywritingAgentChat'
const SESSIONS_KEY = 'copywritingAgentChat:sessions'

export function loadChat(): Message[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) return arr as Message[]
    return []
  } catch {
    return []
  }
}

export function saveChat(list: Message[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch { void 0 }
}

export type ChatSession = { id: string; name: string; createdAt: string }

export function loadChatSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr as ChatSession[] : []
  } catch {
    return []
  }
}

export function saveChatSessions(list: ChatSession[]): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(list))
  } catch { void 0 }
}

export function saveNewSession(name: string, messages: Message[]): ChatSession {
  const id = Date.now().toString()
  const createdAt = new Date().toISOString()
  const session: ChatSession = { id, name: name || `会话 ${id.slice(-5)}`, createdAt }
  const list = loadChatSessions()
  const next = [session, ...list]
  try {
    localStorage.setItem(`copywritingAgentChat:session:${id}`, JSON.stringify(messages))
  } catch { void 0 }
  saveChatSessions(next)
  return session
}

export function loadSessionMessages(id: string): Message[] {
  try {
    const raw = localStorage.getItem(`copywritingAgentChat:session:${id}`)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr as Message[] : []
  } catch {
    return []
  }
}

export function deleteSession(id: string): void {
  try {
    const list = loadChatSessions().filter(s => s.id !== id)
    saveChatSessions(list)
    localStorage.removeItem(`copywritingAgentChat:session:${id}`)
  } catch { void 0 }
}

export function saveSessionMessages(id: string, list: Message[]): void {
  try {
    localStorage.setItem(`copywritingAgentChat:session:${id}`, JSON.stringify(list))
  } catch { void 0 }
}

export type ChatSessionSettings = {
  temperature: number
  contextCount: number
  maxOutputTokens: number
  useStream: boolean
  topP?: number
  toolMode?: 'prompt' | 'force' | 'none'
  systemPrompts?: { id: string; name: string; content: string }[]
  activeSystemPromptId?: string
}

export function loadSessionSettings(id: string): ChatSessionSettings | null {
  if (!id) return null
  try {
    const raw = localStorage.getItem(`copywritingAgentChat:session:${id}:settings`)
    if (!raw) return null
    const obj = JSON.parse(raw)
    if (obj && typeof obj === 'object') return obj as ChatSessionSettings
    return null
  } catch {
    return null
  }
}

export function saveSessionSettings(id: string, s: ChatSessionSettings): void {
  if (!id) return
  try {
    localStorage.setItem(`copywritingAgentChat:session:${id}:settings`, JSON.stringify(s))
  } catch { void 0 }
}