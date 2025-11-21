export type ProjectSummary = { id: string; title: string; date: string; size: string }

export type ProjectItem = {
  id: number
  type: 'transition' | 'scene'
  description: string
  characters: string[]
  script?: string
  scriptLines?: string[]
  imagePrompt?: string
  videoPrompt?: string
  currentImage?: string
  imageOptions?: string[]
  currentVideo?: string
  videoOptions?: string[]
  status: 'pending' | 'generated' | 'generating'
  imageStatus?: 'pending' | 'generated' | 'generating'
  videoStatus?: 'pending' | 'generated' | 'generating'
}

export type ProjectData = {
  name: string
  totalScenes: number
  generated: number
  pending: number
  generating: number
  aiVersion: string
  lastSaved: string
  items: ProjectItem[]
  hdEnabled?: boolean
  exportDir?: string
}

const PROJECTS_KEY = 'projects'

export function loadProjects(): ProjectSummary[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    const list = raw ? JSON.parse(raw) : []
    if (Array.isArray(list)) return list
    return []
  } catch {
    return []
  }
}

export function saveProjects(list: ProjectSummary[]): void {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(list))
  } catch { void 0 }
}

export function createProject(): ProjectSummary {
  const id = Date.now().toString()
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  return { id, title: `未命名项目 ${id.slice(-5)}`, date, size: '0 MB' }
}

function projectKey(id: string): string {
  return `project:${id}`
}

export function loadProject(id: string): ProjectData | null {
  try {
    const raw = localStorage.getItem(projectKey(id))
    if (!raw) return null
    const data = JSON.parse(raw)
    return data as ProjectData
  } catch {
    return null
  }
}

export function saveProject(id: string, data: ProjectData): void {
  try {
    localStorage.setItem(projectKey(id), JSON.stringify(data))
  } catch { void 0 }
}