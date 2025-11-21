import type { AIProvider } from '../../store/settings'

type ProviderConfig = {
  name: string
  getKeyUrl: string
  defaultBase: string
  authType: 'queryKey' | 'bearer'
  detectEndpoint: string
  defaultModels: string[]
}

export const providerConfig: Record<AIProvider, ProviderConfig> = {
  gemini: {
    name: 'Gemini',
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
    defaultBase: 'https://generativelanguage.googleapis.com',
    authType: 'queryKey',
    detectEndpoint: '/v1/models',
    defaultModels: ['gemini-2.5-pro', 'gemini-2.0-pro', 'gemini-2.0-flash'],
  },
  openai: {
    name: 'OpenAI',
    getKeyUrl: 'https://platform.openai.com/api-keys',
    defaultBase: 'https://api.openai.com',
    authType: 'bearer',
    detectEndpoint: '/v1/models',
    defaultModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
  },
  deepseek: {
    name: 'DeepSeek',
    getKeyUrl: 'https://platform.deepseek.com/api-keys',
    defaultBase: 'https://api.deepseek.com',
    authType: 'bearer',
    detectEndpoint: '/v1/models',
    defaultModels: ['deepseek-chat', 'deepseek-reasoner'],
  },
  kimi: {
    name: 'Kimi',
    getKeyUrl: 'https://platform.moonshot.cn/api-keys',
    defaultBase: 'https://api.moonshot.cn',
    authType: 'bearer',
    detectEndpoint: '/v1/models',
    defaultModels: ['moonshot-v1-8k', 'moonshot-v1-32k'],
  },
  gfastai: {
    name: 'Gfastai',
    getKeyUrl: '',
    defaultBase: '',
    authType: 'bearer',
    detectEndpoint: '/v1/models',
    defaultModels: [],
  },
}