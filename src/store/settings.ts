export type AIProvider = 'openai' | 'gemini' | 'deepseek' | 'kimi' | 'gfastai'
export type Settings = {
  ai: {
    recommendPlatform: AIProvider
    agentPlatform: AIProvider
    agentModel: string
    agentEnableThinking: boolean
    agentForceTool: boolean
    agentTemperature: number
    agentMaxTokens: number
    useStream: boolean
    keys: {
      openai?: string
      gemini?: string
      deepseek?: string
      kimi?: string
      gfastai?: string
    }
    keysList: {
      openai: string[]
      gemini: string[]
      kimi: string[]
      deepseek?: string[]
      gfastai?: string[]
    }
    base: {
      openai?: string
      gemini?: string
      kimi?: string
      deepseek?: string
      gfastai?: string
    }
    baseAlt?: {
      openai?: string
      gemini?: string
      kimi?: string
      deepseek?: string
      gfastai?: string
    }
    modelsList: {
      openai: string[]
      gemini: string[]
      kimi: string[]
      deepseek?: string[]
      gfastai?: string[]
    }
    useBff: boolean
  }
  tts: { provider?: string; apiKey?: string }
  translate: { provider?: string; apiKey?: string }
  shortcuts: { [k: string]: string }
}

const KEY = 'app:settings'

const defaultSettings: Settings = {
  ai: {
    recommendPlatform: 'openai',
    agentPlatform: 'gemini',
    agentModel: 'gemini-2.0-pro',
    agentEnableThinking: false,
    agentForceTool: false,
    agentTemperature: 0.7,
    agentMaxTokens: 8000,
    useStream: false,
    keys: {},
    keysList: {
      openai: [],
      gemini: [],
      kimi: [],
    },
    base: {
      openai: 'https://api.openai.com',
      gemini: 'https://generativelanguage.googleapis.com',
      deepseek: 'https://api.deepseek.com',
    },
    baseAlt: {},
    modelsList: {
      openai: [],
      gemini: ['gemini-2.0-pro', 'gemini-2.0-flash'],
      kimi: [],
    }
    ,
    useBff: false
  },
  tts: {},
  translate: {},
  shortcuts: {}
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultSettings
    const data = JSON.parse(raw)
    const merged: Settings = {
      ...defaultSettings,
      ...data,
      ai: {
        ...defaultSettings.ai,
        ...(data?.ai || {}),
        useStream: (data?.ai?.useStream ?? defaultSettings.ai.useStream),
        keys: { ...(defaultSettings.ai.keys || {}), ...((data?.ai?.keys) || {}) },
        keysList: {
          openai: data?.ai?.keysList?.openai ?? [],
          gemini: data?.ai?.keysList?.gemini ?? [],
          kimi: data?.ai?.keysList?.kimi ?? [],
          deepseek: data?.ai?.keysList?.deepseek ?? [],
          gfastai: data?.ai?.keysList?.gfastai ?? [],
        },
        base: { ...(defaultSettings.ai.base || {}), ...((data?.ai?.base) || {}) },
        baseAlt: { ...(defaultSettings.ai.baseAlt || {}), ...((data?.ai?.baseAlt) || {}) },
        modelsList: {
          openai: data?.ai?.modelsList?.openai ?? [],
          gemini: (data?.ai?.modelsList?.gemini ?? ['gemini-2.0-pro', 'gemini-2.0-flash']).filter((m: string) => m !== 'gemini-1.5-pro'),
          kimi: data?.ai?.modelsList?.kimi ?? [],
          deepseek: data?.ai?.modelsList?.deepseek ?? [],
          gfastai: data?.ai?.modelsList?.gfastai ?? [],
        },
      }
    }
    if (merged.ai.agentPlatform === 'gemini' && merged.ai.agentModel === 'gemini-1.5-pro') {
      merged.ai.agentModel = 'gemini-2.0-pro'
    }
    return merged
  } catch {
    void 0
    return defaultSettings
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch { void 0 }
}

export function getAgentKey(provider: AIProvider, s?: Settings): string | undefined {
  const ss = s || loadSettings()
  const listMap: Record<AIProvider, string[] | undefined> = {
    openai: ss.ai.keysList.openai,
    gemini: ss.ai.keysList.gemini,
    deepseek: ss.ai.keysList.deepseek,
    kimi: ss.ai.keysList.kimi,
    gfastai: ss.ai.keysList.gfastai,
  }
  const singleMap: Record<AIProvider, string | undefined> = {
    openai: ss.ai.keys.openai,
    gemini: ss.ai.keys.gemini,
    deepseek: ss.ai.keys.deepseek,
    kimi: ss.ai.keys.kimi,
    gfastai: ss.ai.keys.gfastai,
  }
  const p = provider
  const arr = listMap[p] || []
  return arr && arr.length > 0 ? arr[0] : singleMap[p]
}

export function getAgentModel(provider: AIProvider, s?: Settings): string | undefined {
  const ss = s || loadSettings()
  const listMap: Record<AIProvider, string[] | undefined> = {
    openai: ss.ai.modelsList.openai,
    gemini: ss.ai.modelsList.gemini,
    kimi: ss.ai.modelsList.kimi,
    deepseek: ss.ai.modelsList.deepseek,
    gfastai: ss.ai.modelsList.gfastai,
  }
  const p = provider
  const arr = listMap[p] || []
  return ss.ai.agentModel || (arr && arr.length > 0 ? arr[0] : undefined)
}

export function getAgentModelList(provider: AIProvider, s?: Settings): string[] {
  const ss = s || loadSettings()
  const listMap: Record<AIProvider, string[] | undefined> = {
    openai: ss.ai.modelsList.openai,
    gemini: ss.ai.modelsList.gemini,
    kimi: ss.ai.modelsList.kimi,
    deepseek: ss.ai.modelsList.deepseek,
    gfastai: ss.ai.modelsList.gfastai,
  }
  return listMap[provider] || []
}

export function getAgentKeyList(provider: AIProvider, s?: Settings): string[] {
  const ss = s || loadSettings()
  const listMap: Record<AIProvider, string[] | undefined> = {
    openai: ss.ai.keysList.openai,
    gemini: ss.ai.keysList.gemini,
    kimi: ss.ai.keysList.kimi,
    deepseek: ss.ai.keysList.deepseek,
    gfastai: ss.ai.keysList.gfastai,
  }
  const arr = listMap[provider] || []
  const single = getAgentKey(provider, ss)
  const merged = [...arr]
  if (single && !merged.includes(single)) merged.unshift(single)
  return merged
}