import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import Button from '@/components/ui/Button'
import { Switch } from '@/components/ui/switch'
 
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Check, X } from 'lucide-react'
import type { AIProvider } from '../../store/settings'
 

export type ConversationSettings = {
  temperature: number
  contextCount: number
  maxOutputTokens: number
  useStream: boolean
  topP?: number
  toolMode?: 'prompt' | 'force' | 'none'
  systemPrompts?: { id: string; name: string; content: string }[]
  activeSystemPromptId?: string
}

export default function ConversationSettings({
  open,
  initial,
  onSave,
  onClose,
  onProviderModelChange: _onProviderModelChange,
}: {
  open: boolean
  initial: ConversationSettings
  onSave: (s: ConversationSettings) => void
  onClose: () => void
  onProviderModelChange?: (p: AIProvider, m: string) => void
}) {
  const [s, setS] = useState<ConversationSettings>(initial)
  useEffect(() => { setS(initial) }, [initial])
  const setField = <K extends keyof ConversationSettings,>(k: K, v: ConversationSettings[K]) => setS(prev => ({ ...prev, [k]: v }))
  
  const [section, setSection] = useState<'params' | 'prompt'>('params')
  const [_collapsed, _setCollapsed] = useState<Record<string, boolean>>({})
  const handleSave = () => { onSave(s); onClose() }
  return (
    <Dialog open={open} onOpenChange={(v)=>{ if(!v) onClose() }}>
      <DialogContent className="sm:max-w-[840px]">
        <DialogHeader>
          <DialogTitle>会话设置</DialogTitle>
        </DialogHeader>
        <div className="w-full">
          <div className="flex gap-[12px]">
            <aside className="block w-[180px] bg-surface px-4 py-5 border-r border-app">
              <div className="text-secondary brand-body-xs px-2 py-1">设置项</div>
              <div className="mt-2 space-y-1">
                <button
                  type="button"
                  className={(section==='params' ? 'bg-app text-primary font-medium' : 'text-secondary hover:bg-app') + ' w-full text-left brand-body-sm px-3 py-2 rounded-[6px] focus-ring-primary'}
                  onClick={()=>setSection('params')}
                >参数设置</button>
                <button
                  type="button"
                  className={(section==='prompt' ? 'bg-app text-primary font-medium' : 'text-secondary hover:bg-app') + ' w-full text-left brand-body-sm px-3 py-2 rounded-[6px] focus-ring-primary'}
                  onClick={()=>setSection('prompt')}
                >提示词设置</button>
              </div>
            </aside>
            <div className="flex-1 min-w-0">
              {section === 'params' ? (
            <div className="space-y-4">
              <>
                <div className="mt-3 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-primary brand-body-sm">模型温度</span>
                        <svg className="w-[14px] h-[14px] text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><circle cx="12" cy="16" r="1"/></svg>
                      </div>
                      <div className="flex items-center gap-3">
                        <Slider value={[s.temperature]} min={0} max={2} step={0.1} onValueChange={(vals: number[])=>setField('temperature', Number(vals[0]))} />
                        <span className="text-secondary brand-body-xs w-[48px] text-right nums-tabular">{s.temperature.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-primary brand-body-sm">Top-P</span>
                        <svg className="w-[14px] h-[14px] text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><circle cx="12" cy="16" r="1"/></svg>
                      </div>
                      <div className="flex items-center gap-3">
                        <Slider value={[s.topP ?? 1]} min={0} max={1} step={0.01} onValueChange={(vals: number[])=>setField('topP', Number(vals[0]))} />
                        <span className="text-secondary brand-body-xs w-[48px] text-right nums-tabular">{(s.topP ?? 1).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-primary brand-body-sm">上下文数</span>
                        <svg className="w-[14px] h-[14px] text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><circle cx="12" cy="16" r="1"/></svg>
                      </div>
                      <div className="flex items-center gap-3">
                        <Slider value={[s.contextCount]} min={0} max={100} step={1} onValueChange={(vals: number[])=>setField('contextCount', Math.max(0, Math.min(100, Number(vals[0]))))} />
                        <span className="text-secondary brand-body-xs w-[48px] text-right nums-tabular">{s.contextCount}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-primary brand-body-sm">最大 Token 数</span>
                        <svg className="w-[14px] h-[14px] text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><circle cx="12" cy="16" r="1"/></svg>
                      </div>
                      <div className="flex items-center gap-3">
                        <Slider value={[s.maxOutputTokens]} min={128} max={32768} step={128} onValueChange={(vals: number[])=>setField('maxOutputTokens', Math.max(128, Number(vals[0])))} />
                        <span className="text-secondary brand-body-xs w-[64px] text-right nums-tabular">{s.maxOutputTokens}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-primary brand-body-sm">流式输出</span>
                        <svg className="w-[14px] h-[14px] text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><circle cx="12" cy="16" r="1"/></svg>
                      </div>
                      <div className="relative inline-grid h-7 grid-cols-[1fr_1fr] items-center text-sm font-medium">
                        <Switch
                          checked={s.useStream}
                          onCheckedChange={(v)=>setField('useStream', v)}
                          className="peer data-[state=unchecked]:bg-input/50 absolute inset-0 h-[inherit] w-14 [&_span]:z-10 [&_span]:size-[26px] [&_span]:transition-transform [&_span]:duration-300 [&_span]:ease-[cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-7 [&_span]:data-[state=checked]:rtl:-translate-x-7"
                          aria-label="流式输出切换"
                        />
                        <span className="pointer-events-none relative ml-0.5 flex min-w-8 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-6 peer-data-[state=unchecked]:rtl:-translate-x-6">
                          <X className="size-4" aria-hidden="true" />
                        </span>
                        <span className="peer-data-[state=checked]:text-background pointer-events-none relative flex min-w-8 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:-translate-x-full peer-data-[state=unchecked]:invisible peer-data-[state=checked]:rtl:translate-x-full">
                          <Check className="size-4" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-primary brand-body-sm">工具调用方式</span>
                        <svg className="w-[14px] h-[14px] text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><circle cx="12" cy="16" r="1"/></svg>
                      </div>
                      <Select value={s.toolMode ?? 'prompt'} onValueChange={(v)=>setField('toolMode', v as ConversationSettings['toolMode'])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prompt">提示词</SelectItem>
                          <SelectItem value="force">强制</SelectItem>
                          <SelectItem value="none">禁止</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
              </>
            </div>
              ) : (
            
            <>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-[6px] items-center">
                    {[
                      { id: 'storyboard', name: '分镜' },
                      { id: 'character', name: '角色' },
                      { id: 'script', name: '剧本' },
                    ].map(it => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={()=> setS(prev => ({ ...prev, activeSystemPromptId: it.id }))}
                        className={(s.activeSystemPromptId===it.id || (!s.activeSystemPromptId && it.id==='storyboard') ? 'bg-app text-primary font-medium' : 'bg-app text-secondary hover:bg-surface') + ' inline-flex items-center rounded-sm px-[10px] h-[28px] brand-body-xs'}
                      >
                        {it.name}
                      </button>
                    ))}
                    {(s.systemPrompts || []).filter(x => String(x.id).startsWith('custom-')).map(it => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={()=> setS(prev => ({ ...prev, activeSystemPromptId: it.id }))}
                        className={(s.activeSystemPromptId===it.id ? 'bg-app text-primary font-medium' : 'bg-app text-secondary hover:bg-surface') + ' inline-flex items-center rounded-sm px-[10px] h-[28px] brand-body-xs'}
                      >
                        {it.name ?? '自定义'}
                      </button>
                    ))}
                    <button type="button" aria-label="新增自定义提示词" className="inline-flex items-center justify-center w-[28px] h-[28px] rounded-sm bg-surface text-secondary" onClick={()=>{
                      const id = 'custom-' + Math.random().toString(36).slice(2)
                      const list = [...(s.systemPrompts || []), { id, name: '自定义', content: '' }]
                      setS(prev => ({ ...prev, systemPrompts: list, activeSystemPromptId: id }))
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="#fafafa" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(() => {
                      const activeId = s.activeSystemPromptId || 'storyboard'
                      const mapLabel: Record<string, string> = { storyboard: '分镜', character: '角色', script: '剧本' }
                      const list = s.systemPrompts || []
                      const idx = list.findIndex(x => x.id === activeId)
                      const item = idx >= 0 ? list[idx] : { id: activeId, name: mapLabel[activeId], content: '' }
                      return (
                        <div className={(s.activeSystemPromptId===activeId ? 'bg-app' : 'bg-app') + ' rounded-sm p-3 space-y-2'}>
                          <div className="flex items-center gap-[8px]">
                            {String(activeId).startsWith('custom-') ? (
                              <input value={(item.name ?? '')} onChange={(e)=>{
                                const next = [...list]
                                if (idx >= 0) next[idx] = { ...item, name: e.target.value }
                                else next.push({ ...item, name: e.target.value })
                                setS(prev => ({ ...prev, systemPrompts: next }))
                              }} className="flex-1 bg-app rounded-sm h-[30px] px-3 brand-body-sm text-primary outline-none border border-app focus-ring-primary" placeholder="名称" />
                            ) : (
                              <span className="text-primary brand-body-sm">{mapLabel[activeId]}</span>
                            )}
                          </div>
                          <textarea value={item.content} onChange={(e)=>{
                            const next = [...list]
                            if (idx >= 0) next[idx] = { ...item, content: e.target.value }
                            else next.push({ ...item, content: e.target.value })
                            setS(prev => ({ ...prev, systemPrompts: next }))
                          }} placeholder="请输入系统提示词..." className="w-full min-h-[120px] bg-app rounded-sm p-3 brand-body-sm text-primary outline-none border border-app focus-ring-primary" />
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </>
              )}
            </div>
          </div>
            <DialogFooter>
              <Button size="sm" variant="secondary" onClick={onClose}>取消</Button>
              <Button size="sm" variant="default" onClick={()=>{ handleSave() }}>保存</Button>
            </DialogFooter>
          </div>
      </DialogContent>
    </Dialog>
  )
}