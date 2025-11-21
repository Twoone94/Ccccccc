type SecretsApi = {
  get: (account: string) => Promise<string | null>
  set: (account: string, value: string) => Promise<boolean>
  remove: (account: string) => Promise<boolean>
  list: () => Promise<string[]>
}

function api(): SecretsApi | null {
  const w = window as unknown as { desktop?: { secrets?: SecretsApi } }
  return w.desktop?.secrets || null
}

export async function secretsGet(account: string): Promise<string | null> {
  const a = api()
  if (!a) return null
  return a.get(account)
}

export async function secretsSet(account: string, value: string): Promise<boolean> {
  const a = api()
  if (!a) return false
  await a.set(account, value)
  return true
}

export async function secretsRemove(account: string): Promise<boolean> {
  const a = api()
  if (!a) return false
  await a.remove(account)
  return true
}

export async function secretsList(): Promise<string[]> {
  const a = api()
  if (!a) return []
  return a.list()
}