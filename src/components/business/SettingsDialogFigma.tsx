import React, { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import Button from '@/components/ui/Button'
import { loadSettings, saveSettings, type Settings, type AIProvider } from '../../store/settings'

export default function SettingsDialogFigma({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [s, setS] = useState<Settings>(loadSettings())
  const provider: AIProvider = s.ai.agentPlatform
  const keysText = useMemo(() => {
    const list = s.ai.keysList[provider] || []
    const single = s.ai.keys[provider]
    const arr = single ? [single, ...list] : list
    return arr.join(', ')
  }, [s, provider])
  const modelsText = useMemo(() => {
    const list = s.ai.modelsList[provider] || []
    return list.join(', ')
  }, [s, provider])
  const baseText = useMemo(() => s.ai.base[provider] || '', [s, provider])
  const setAI = (next: Partial<Settings['ai']>) => setS(prev => ({ ...prev, ai: { ...prev.ai, ...next } }))
  const setProviderBase = (url: string) => setS(prev => ({ ...prev, ai: { ...prev.ai, base: { ...prev.ai.base, [provider]: url } } }))
  const setProviderKeys = (text: string) => {
    const arr = text.split(/[,\s]+/).map(t => t.trim()).filter(Boolean)
    setS(prev => ({ ...prev, ai: { ...prev.ai, keysList: { ...prev.ai.keysList, [provider]: arr } } }))
  }
  const setProviderModels = (text: string) => {
    const arr = text.split(/[,\s]+/).map(t => t.trim()).filter(Boolean)
    setS(prev => ({ ...prev, ai: { ...prev.ai, modelsList: { ...prev.ai.modelsList, [provider]: arr } } }))
  }
  const handleSave = () => { saveSettings(s); onClose() }
  return (
    <Dialog open={open} onOpenChange={(v)=>{ if(!v) onClose() }}>
      <DialogContent className="sm:max-w-[768px]">
        <DialogHeader>
          <DialogTitle>全局设置</DialogTitle>
          <DialogDescription>shadcn 风格</DialogDescription>
        </DialogHeader>
        <div className="w-full">
        <div className="flex">
          <aside className="w-[180px] bg-surface px-4 py-5 border-r border-app">
            <div className="text-secondary brand-body-xs px-3 py-1">基础设置</div>
            <div className="mt-2 space-y-1">
            <button className="w-full text-left brand-body-sm text-primary px-3 py-2 rounded-[6px] bg-app">官方API</button>
              <button className="w-full text-left brand-body-sm text-secondary px-3 py-2 rounded-sm">第三方API</button>
              <button className="w-full text-left brand-body-sm text-secondary px-3 py-2 rounded-sm">TTS</button>
              <button className="w-full text-left brand-body-sm text-secondary px-3 py-2 rounded-sm">翻译</button>
              <button className="w-full text-left brand-body-sm text-secondary px-3 py-2 rounded-sm">快捷键</button>
            </div>
          </aside>
          <section className="flex-1 p-6 space-y-6">
            <div className="border-b border-app pb-4 w-full max-w-[560px]">
              <div className="flex items-center gap-4">
                <span className="text-secondary brand-body-xs">平台</span>
                <select value={s.ai.agentPlatform} onChange={(e)=>setAI({ agentPlatform: e.target.value as AIProvider })} className="h-[32px] rounded-[6px] bg-surface border border-app px-[8px] brand-body-xs text-primary">
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Gemini</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="kimi">Kimi</option>
                </select>
              </div>
            </div>
            <div className="space-y-2 w-full max-w-[560px]">
              <div className="flex items-center justify-between">
                <span className="text-primary brand-title-md">API 密钥</span>
                <span className="text-secondary brand-body-xs">多个密钥可用逗号或空格分隔</span>
              </div>
              <div className="flex items-center border border-app rounded-[6px] bg-surface">
                <input value={keysText} onChange={(e)=>setProviderKeys(e.target.value)} className="flex-1 bg-transparent outline-none text-primary brand-body-sm rounded-[6px] px-[12px] h-[36px]" placeholder="粘贴或输入密钥" />
                <Button type="button" variant="outline" size="default" className="h-[36px] border-l border-app rounded-l-none">检测</Button>
              </div>
            </div>
            <div className="space-y-2 w-full max-w-[560px]">
              <div className="flex items-center justify-between">
                <span className="text-primary brand-title-md">API 地址</span>
              </div>
              <div className="flex items-center border border-app rounded-[6px] bg-surface">
                <input value={baseText} onChange={(e)=>setProviderBase(e.target.value)} className="flex-1 bg-transparent outline-none text-primary brand-body-sm rounded-[6px] px-[12px] h-[36px]" placeholder="https://api.example.com" />
              </div>
            </div>
            <div className="space-y-2 w-full max-w-[560px]">
              <div className="flex items-center justify-between">
                <span className="text-primary brand-title-md">模型列表</span>
                <span className="text-secondary brand-body-xs">逗号或空格分隔</span>
              </div>
              <div className="flex items-center border border-app rounded-[6px] bg-surface">
                <input value={modelsText} onChange={(e)=>setProviderModels(e.target.value)} className="flex-1 bg-transparent outline-none text-primary brand-body-sm rounded-[6px] px-[12px] h-[36px]" placeholder="model-a, model-b" />
              </div>
              <div className="flex items-center justify-between gap-[8px]">
                <span className="text-primary brand-title-md">当前模型</span>
                <input value={s.ai.agentModel} onChange={(e)=>setAI({ agentModel: e.target.value })} className="flex-1 bg-app outline-none text-primary brand-body-md rounded-[6px] border border-app px-[12px] h-[36px] focus-ring-primary" placeholder="gemini-1.5-pro" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-[560px]">
              <div className="flex items-center justify-between gap-[8px]">
                <span className="text-primary brand-title-md">温度</span>
                <input type="number" step="0.1" min={0} max={2} value={s.ai.agentTemperature} onChange={(e)=>setAI({ agentTemperature: Number(e.target.value) })} className="w-[160px] bg-app outline-none text-primary brand-body-md rounded-[6px] border border-app px-[12px] h-[36px] focus-ring-primary" />
              </div>
              <div className="flex items-center justify-between gap-[8px]">
                <span className="text-primary brand-title-md">最大Tokens</span>
                <input type="number" min={512} max={32000} value={s.ai.agentMaxTokens} onChange={(e)=>setAI({ agentMaxTokens: Number(e.target.value) })} className="w-[160px] bg-app outline-none text-primary brand-body-md rounded-[6px] border border-app px-[12px] h-[36px] focus-ring-primary" />
              </div>
              <div className="flex items-center justify-between gap-[8px] col-span-2">
                <span className="text-primary brand-title-md">使用后端BFF</span>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={s.ai.useBff} onChange={(e)=>setAI({ useBff: e.target.checked })} />
                  <span className="text-secondary brand-body-xs">通过后端转发请求</span>
                </label>
              </div>
            </div>
          </section>
        </div>
        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={onClose}>取消</Button>
          <Button variant="default" size="sm" onClick={handleSave}>保存</Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}