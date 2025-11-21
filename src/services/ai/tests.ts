export async function testOpenAIKey(key: string, base?: string): Promise<boolean> {
  try {
    const url = ((base && base.trim()) || 'https://api.openai.com') + '/v1/models'
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } })
    return res.ok
  } catch {
    return false
  }
}

export async function testKimiKey(key: string, base?: string): Promise<boolean> {
  try {
    const url = ((base && base.trim()) || 'https://api.moonshot.cn') + '/v1/models'
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } })
    return res.ok
  } catch {
    return false
  }
}

export async function testDeepSeekKey(key: string, base?: string): Promise<boolean> {
  try {
    const url = ((base && base.trim()) || 'https://api.deepseek.com') + '/v1/models'
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } })
    return res.ok
  } catch {
    return false
  }
}