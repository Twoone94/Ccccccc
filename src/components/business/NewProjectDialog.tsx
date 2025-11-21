import { useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import Button from '../ui/Button'
import { createProject, loadProjects, saveProjects, saveProject, type ProjectItem } from '../../store/project'
import { parseStoryboardText } from '../../utils/storyboard'
import { splitChineseSentences } from '../../utils/text'
import { useNavigate } from 'react-router-dom'

type Props = { open: boolean; onClose: () => void }

export default function NewProjectDialog({ open, onClose }: Props) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const MAX_NAME = 50
  const MAX_SIZE = 500 * 1024 * 1024
  const _remain = Math.max(0, MAX_NAME - name.length)
  const totalSize = useMemo(() => files.reduce((acc, f) => acc + f.size, 0), [files])

  useEffect(() => {
    if (!open) return
    const raw = localStorage.getItem('newProjectDraft')
    if (raw) {
      try {
        const d = JSON.parse(raw)
        if (typeof d?.name === 'string') setName(d.name)
      } catch { void 0 }
    }
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const data = { name }
    try { localStorage.setItem('newProjectDraft', JSON.stringify(data)) } catch { void 0 }
  }, [name, open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const acceptExt = ['.txt', '.csv', '.xlsx']

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list).filter(f => acceptExt.some(ext => f.name.toLowerCase().endsWith(ext)))
    const nextSize = incoming.reduce((acc, f) => acc + f.size, totalSize)
    if (nextSize > MAX_SIZE) {
      setToast({ type: 'error', text: '文件总大小超过 500MB 限制' })
      return
    }
    setFiles(prev => [...prev, ...incoming])
  }

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false) }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    e.currentTarget.value = ''
  }

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const formatSize = (n: number) => {
    if (n >= 1024 * 1024 * 1024) return (n / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
    if (n >= 1024 * 1024) return (n / (1024 * 1024)).toFixed(2) + ' MB'
    if (n >= 1024) return (n / 1024).toFixed(2) + ' KB'
    return n + ' B'
  }

  const onSubmit = async () => {
    if (!name.trim()) { setToast({ type: 'error', text: '请输入作品名称' }); return }
    if (name.trim().length > MAX_NAME) { setToast({ type: 'error', text: '作品名称长度不可超过 50 字符' }); return }
    setSubmitting(true)
    try {
      const summary = createProject()
      const list = loadProjects()
      const updated = { ...summary, title: name.trim(), size: formatSize(totalSize) }
      const next = [...list, updated]
      saveProjects(next)
      
      // 创建项目数据文件
      let projectData: { name: string; totalScenes: number; generated: number; pending: number; generating: number; aiVersion: string; lastSaved: string; items: ProjectItem[] } = {
        name: name.trim(),
        totalScenes: 0,
        generated: 0,
        pending: 0,
        generating: 0,
        aiVersion: 'Sora2',
        lastSaved: '已保存至本地',
        items: []
      }
      if (files[0] && (files[0].name.toLowerCase().endsWith('.txt') || files[0].name.toLowerCase().endsWith('.md'))) {
        const t = await files[0].text()
        const parsed = parseStoryboardText(t)
        const items: ProjectItem[] = parsed.map(p => ({ id: p.id, type: p.type, description: p.description, script: p.script, scriptLines: splitChineseSentences(p.script || p.description), characters: [], status: 'pending', imageStatus: 'pending', videoStatus: 'pending' }))
        projectData = { ...projectData, items, totalScenes: items.length, pending: items.length }
      }
      saveProject(summary.id, projectData)
      
      localStorage.removeItem('newProjectDraft')
      setToast({ type: 'success', text: '创建成功' })
      setTimeout(() => { navigate(`/project?pid=${summary.id}`) }, 300)
    } catch {
      setToast({ type: 'error', text: '创建失败' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v)=>{ if(!v) onClose() }}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>新建作品</DialogTitle>
          <DialogDescription>填写作品名称并上传分镜文件</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[8px]">
          <label className="brand-title-md font-medium text-primary" htmlFor="new-project-name">作品名称</label>
          <div className="relative">
            <input
              ref={inputRef}
              id="new-project-name"
              value={name}
              onChange={e => {
                const value = e.target.value
                if (value.length <= MAX_NAME) {
                  setName(value)
                }
              }}
              placeholder="请输入作品名称(中文、英文、数字，无空格，50字内)"
              className="w-full bg-app outline-none text-primary brand-body-md rounded-[6px] border border-app px-[12px] pr-[60px] h-[36px] focus-ring-primary transition-colors"
            />
            <span className={`absolute right-[12px] top-1/2 -translate-y-1/2 brand-body-xs nums-tabular ${name.length >= MAX_NAME - 5 ? 'text-red-400' : 'text-secondary'}`}>
              {name.length}/{MAX_NAME}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-[8px]">
          <p className="brand-title-md font-medium text-primary">选择分镜文件</p>
          <div
            className={`flex flex-col items-center justify-center rounded-[8px] border-2 border-dashed p-[24px] transition-colors cursor-pointer ${dragOver ? 'border-focus bg-app' : 'border-app bg-app hover:border-focus/50'}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById('new-project-file')?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('new-project-file')?.click() }}
          >
            <div className="flex flex-col items-center gap-[8px]">
              <svg className="w-[32px] h-[32px] text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="brand-title-md text-primary font-medium">点击或拖拽上传文件</p>
              <p className="brand-body-xs text-secondary">支持 TXT、CSV、XLSX 格式</p>
              <input id="new-project-file" type="file" multiple accept=".txt,.csv,.xlsx" className="hidden" onChange={onSelect} />
            </div>
          </div>

          {files.length > 0 && (
            <div className="flex flex-col gap-[8px]">
              <div className="flex items-center justify-between">
                <span className="brand-body-xs text-secondary">总大小 {formatSize(totalSize)}</span>
                <span className={`brand-body-xs ${totalSize > MAX_SIZE ? 'text-red-400' : 'text-secondary'}`}>上限 500MB</span>
              </div>
              <div className="grid grid-cols-1 gap-[8px]">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-[12px] rounded-[8px] border border-app p-[12px] bg-app hover:bg-surface transition-colors">
                    <div className="flex items-center justify-center w-[40px] h-[40px] rounded-sm bg-success-subtle">
                      <span className="brand-body-xs text-primary font-medium uppercase">{f.name.split('.').pop()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="brand-title-md text-primary font-medium truncate">{f.name}</p>
                      <p className="brand-body-xs nums-tabular text-secondary">{formatSize(f.size)}</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => removeFile(i)}>删除</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" size="sm" disabled={submitting} onClick={onClose}>取消</Button>
          <Button variant="default" size="sm" disabled={submitting || !name.trim()} onClick={onSubmit}>{submitting ? '创建中...' : '创建项目'}</Button>
        </DialogFooter>

        {toast && (
          <div className="fixed bottom-[20px] left-1/2 -translate-x-1/2 z-[200]">
            <div className={`px-[12px] py-[8px] rounded-[8px] ${toast.type === 'success' ? 'bg-success-subtle text-success' : 'bg-error-subtle text-error'}`}>{toast.text}</div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  )
}