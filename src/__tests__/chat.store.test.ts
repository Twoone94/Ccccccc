import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadChat,
  saveChat,
  loadChatSessions,
  saveNewSession,
  loadSessionMessages,
  deleteSession,
  saveSessionMessages,
} from '../store/chat'

const KEY_PREFIX = 'copywritingAgentChat'

describe('chat store', () => {
  beforeEach(() => {
    Object.keys(localStorage).forEach((k) => localStorage.removeItem(k))
  })

  it('save/load chat messages', () => {
    const msgs: Array<{ role: 'user'|'assistant'; content: string }> = [{ role: 'user', content: 'hi' }]
    saveChat(msgs)
    expect(loadChat()).toEqual(msgs)
  })

  it('create session and CRUD messages', () => {
    const s = saveNewSession('测试会话', [])
    const list = loadChatSessions()
    expect(list[0]?.id).toBe(s.id)

    const msgs: Array<{ role: 'user'|'assistant'; content: string }> = [{ role: 'assistant', content: 'ok' }]
    saveSessionMessages(s.id, msgs)
    expect(loadSessionMessages(s.id)).toEqual(msgs)

    deleteSession(s.id)
    expect(loadChatSessions().find((x) => x.id === s.id)).toBeUndefined()
    expect(localStorage.getItem(`${KEY_PREFIX}:session:${s.id}`)).toBeNull()
  })
})