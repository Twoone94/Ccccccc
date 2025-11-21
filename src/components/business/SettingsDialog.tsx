import React, { useMemo, useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/shadcn/Tabs'
import Button from '../../components/ui/Button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { loadSettings, saveSettings, type Settings, type AIProvider } from '../../store/settings'
import { Eye, Settings as SettingsIcon, Trash } from 'lucide-react'
import { detectProvider } from '../../services/ai/detect'
import { testGeminiKey } from '../../services/ai/gemini'
import { providerConfig } from '../../services/ai/config'
import { secretsSet } from '../../services/secrets'

export default function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [s, setS] = useState<Settings>(loadSettings())
  const [active, setActive] = useState<AIProvider>(s.ai.agentPlatform)
  const [section, setSection] = useState<'ai'|'draw'|'video'|'capcut'|'tts'|'translate'|'third'|'hotkeys'>('ai')
  const provider: AIProvider = active
  const keysText = useMemo(() => {
    const list = s.ai.keysList[provider] || []
    const single = s.ai.keys[provider]
    const arr = single ? [single, ...list] : list
    return arr.join(', ')
  }, [s, provider])
  const baseText = useMemo(() => s.ai.base[provider] || '', [s, provider])
  
  const setAI = (next: Partial<Settings['ai']>) => setS(prev => ({ ...prev, ai: { ...prev.ai, ...next } }))
  const setProviderBase = (url: string) => setS(prev => ({ ...prev, ai: { ...prev.ai, base: { ...prev.ai.base, [provider]: url } } }))
  const setProviderKeys = (text: string) => {
    const arr = text.split(/[\s,]+/).map(t => t.trim()).filter(Boolean)
    setS(prev => ({ ...prev, ai: { ...prev.ai, keysList: { ...prev.ai.keysList, [provider]: arr } } }))
  }
  
  const handleSave = async () => {
    const list = s.ai.keysList[provider] || []
    for (const k of list) {
      if (k && typeof k === 'string') await secretsSet(`${provider}:key:${list.indexOf(k)}`, k)
    }
    if (s.ai.keys[provider]) await secretsSet(`${provider}:key:primary`, String(s.ai.keys[provider]))
    saveSettings({ ...s, ai: { ...s.ai, agentPlatform: provider } }); onClose()
  }
  const providerTabs = useMemo(() => ([
    { key: 'openai', label: 'OpenAI' },
    { key: 'kimi', label: 'Kimi' },
    { key: 'deepseek', label: 'DeepSeek' },
    { key: 'gemini', label: 'Gemini' },
  ] as { key: AIProvider; label: string }[]), [])
  useEffect(() => {
    const keys = providerTabs.map(t => t.key)
    if (!keys.includes(active)) setActive('gemini')
  }, [active, providerTabs])
  const [hideKeys, setHideKeys] = useState(true)
  
  const [manageOpen, setManageOpen] = useState(false)
  const [showKeyList, setShowKeyList] = useState<boolean[]>(() => (s.ai.keysList[provider] || []).map(() => false))
  const setKeysList = (list: string[]) => setS(prev => ({ ...prev, ai: { ...prev.ai, keysList: { ...prev.ai.keysList, [provider]: list } } }))
  const [detectStatusByProvider, setDetectStatusByProvider] = useState<Record<AIProvider, string>>({} as Record<AIProvider, string>)
  const testStatus = detectStatusByProvider[provider] || ''
  useEffect(() => {
    setDetectStatusByProvider(prev => ({ ...prev, [provider]: '' }))
  }, [provider])
  const isAllowed = (p: AIProvider): p is ('openai'|'gemini'|'deepseek'|'kimi') => (
    p === 'openai' || p === 'gemini' || p === 'deepseek' || p === 'kimi'
  )
  const runDetect = async () => {
    setDetectStatusByProvider(prev => ({ ...prev, [provider]: '测试中…' }))
    const firstKey = (keysText.split(/[\s,]+/).map(t=>t.trim()).filter(Boolean)[0]) || s.ai.keys[provider]
    const base = s.ai.base[provider] || baseText || providerConfig[provider]?.defaultBase || ''
    if (provider === 'gemini') {
      try {
        const ok = firstKey ? await testGeminiKey(firstKey, s.ai.agentModel) : false
        setDetectStatusByProvider(prev => ({ ...prev, [provider]: ok ? '连接正常' : '连接失败' }))
      } catch {
        setDetectStatusByProvider(prev => ({ ...prev, [provider]: '连接失败' }))
      }
      return
    }
    if (!isAllowed(provider)) {
      setDetectStatusByProvider(prev => ({ ...prev, [provider]: '连接失败' }))
      return
    }
    const r = await detectProvider({ provider, base, key: firstKey, useBff: s.ai.useBff, model: s.ai.agentModel })
    setDetectStatusByProvider(prev => ({ ...prev, [provider]: r.status }))
  }
  type DrawSettings = {
    platform: 'sd' | 'flux' | 'mj' | 'dall-e'
    base: string
    key: string
    model: string
    width: number
    height: number
    steps: number
    cfg: number
    sampler: string
    seed: number
  }
  const [draw, setDraw] = useState<DrawSettings>({ platform: 'sd', base: '', key: '', model: '', width: 1024, height: 1024, steps: 28, cfg: 7, sampler: 'DPM++ 2M', seed: 0 })
  const setDrawField = <K extends keyof DrawSettings,>(k: K, v: DrawSettings[K]) => setDraw(prev => ({ ...prev, [k]: v }))
  const [hideDrawKey, setHideDrawKey] = useState(true)
  return (
    <>
    <Dialog open={open} onOpenChange={(v)=>{ if(!v) onClose() }}>
      <DialogContent className="sm:max-w-[768px]">
        <DialogHeader>
          <DialogTitle>全局设置</DialogTitle>
          <DialogDescription>系统配置</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row md:gap-6">
          <aside className="block w-[180px] bg-surface px-4 py-5 md:border-r md:border-app">
            <div className="text-secondary brand-body-xs px-3 py-1">系统</div>
            <div className="mt-2 space-y-1">
              <button className={`${section==='ai' ? 'bg-app text-primary' : 'text-secondary'} w-full text-left brand-body-sm px-3 py-2 rounded-[6px]`} onClick={()=>setSection('ai')}>AI</button>
              <button className={`${section==='draw' ? 'bg-app text-primary' : 'text-secondary'} w-full text-left brand-body-sm px-3 py-2 rounded-[6px]`} onClick={()=>setSection('draw')}>绘画</button>
              <button className={`${section==='video' ? 'bg-app text-primary' : 'text-secondary'} w-full text-left brand-body-sm px-3 py-2 rounded-[6px]`} onClick={()=>setSection('video')}>视频</button>
              <button className={`${section==='capcut' ? 'bg-app text-primary' : 'text-secondary'} w-full text-left brand-body-sm px-3 py-2 rounded-[6px]`} onClick={()=>setSection('capcut')}>剪映</button>
              <button className={`${section==='tts' ? 'bg-app text-primary' : 'text-secondary'} w-full text-left brand-body-sm px-3 py-2 rounded-[6px]`} onClick={()=>setSection('tts')}>TTS</button>
              <button className={`${section==='translate' ? 'bg-app text-primary' : 'text-secondary'} w-full text-left brand-body-sm px-3 py-2 rounded-[6px]`} onClick={()=>setSection('translate')}>翻译</button>
              <button className={`${section==='third' ? 'bg-app text-primary' : 'text-secondary'} w-full text-left brand-body-sm px-3 py-2 rounded-[6px]`} onClick={()=>setSection('third')}>第三方</button>
              <button className={`${section==='hotkeys' ? 'bg-app text-primary' : 'text-secondary'} w-full text-left brand-body-sm px-3 py-2 rounded-[6px]`} onClick={()=>setSection('hotkeys')}>快捷键</button>
            </div>
          </aside>
          <section className="flex-1 min-w-0 p-6 space-y-6">
          {section === 'ai' && (<>
          <div className="border-b border-app pb-2 w-full">
            <Tabs defaultValue={active} onValueChange={(v)=>setActive(v as AIProvider)}>
              <TabsList variant="underline" className="gap-3">
                {providerTabs.map(t => (
                  <TabsTrigger key={t.key} value={t.key} variant="underline" className="brand-body-sm">{t.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
            <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-primary brand-title-md" htmlFor="settings-keys">API 密钥</label>
              {testStatus && (
                <span className={`brand-body-xs ${testStatus==='连接正常' ? 'text-success' : testStatus==='测试中…' ? 'text-warning' : 'text-error'}`}>{testStatus}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={()=>setManageOpen(true)} className="inline-flex items-center text-secondary brand-body-xs px-2 py-1 rounded-[6px] border border-app">
                <SettingsIcon className="w-[14px] h-[14px]" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Input id="settings-keys" value={keysText} onChange={(e)=>setProviderKeys(e.target.value)} type={hideKeys ? 'password' : 'text'} placeholder="输入API秘钥" />
            <button type="button" onClick={()=>setHideKeys(v=>!v)} className="absolute right-[58px] top-1/2 -translate-y-1/2 text-secondary">
              <Eye className="w-[16px] h-[16px]" />
            </button>
            <Button type="button" variant="outline" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 brand-body-xs" onClick={runDetect}>检测</Button>
          </div>
          <div className="flex items-center justify-between">
            {providerConfig[provider]?.getKeyUrl ? (
              <a href={providerConfig[provider].getKeyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 brand-body-xs">点击这里获取密钥</a>
            ) : (
              <span className="text-secondary brand-body-xs">当前平台暂不提供密钥获取链接</span>
            )}
            <span className="text-secondary brand-body-xs">多个密钥使用逗号或空格分隔</span>
          </div>
          
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
              <label className="text-primary brand-title-md" htmlFor="settings-base">API 地址</label>
          </div>
          <Input id="settings-base" value={baseText} onChange={(e)=>setProviderBase(e.target.value)} placeholder="https://api.example.com" />
        </div>


            <div className="space-y-2">
              <div className="flex items-center justify-start">
                <label className="text-primary brand-title-md" htmlFor="settings-model">模型</label>
              </div>
              <Select value={s.ai.agentModel} onValueChange={(v)=>setAI({ agentModel: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择模型" />
                </SelectTrigger>
                <SelectContent>
                  {( 
                    (s.ai.modelsList[provider] && s.ai.modelsList[provider].length > 0
                      ? Array.from(new Set([...(s.ai.modelsList[provider] || []), ...((providerConfig[provider]?.defaultModels) || [])]))
                      : (providerConfig[provider]?.defaultModels || [])
                    ).filter(m => provider === 'gemini' ? m !== 'gemini-1.5-pro' : true)
                  ).map(m => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            </>)}
            {section === 'draw' && (<>
              <div className="border-b border-app pb-2 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-primary brand-title-md">绘画平台</span>
                  <span className="text-secondary brand-body-xs">选择用于生成图片的引擎</span>
                </div>
                <div className="mt-2 w-full max-w-[560px]">
                  <Select value={draw.platform} onValueChange={(v)=>setDrawField('platform', v as DrawSettings['platform'])}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择平台" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sd">Stable Diffusion</SelectItem>
                      <SelectItem value="flux">Flux</SelectItem>
                      <SelectItem value="mj">Midjourney</SelectItem>
                      <SelectItem value="dall-e">DALL·E</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 w-full max-w-[560px]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-primary brand-title-md" htmlFor="draw-base">API 地址</label>
                    <span className="text-secondary brand-body-xs">示例：https://api.example.com</span>
                  </div>
                  <Input id="draw-base" value={draw.base} onChange={(e)=>setDrawField('base', e.target.value)} placeholder="https://api.example.com" />
                </div>
                <div className="relative">
                  <label className="sr-only" htmlFor="draw-key">API 密钥</label>
                  <Input id="draw-key" value={draw.key} onChange={(e)=>setDrawField('key', e.target.value)} type={hideDrawKey ? 'password' : 'text'} placeholder="输入API秘钥" />
                  <button type="button" onClick={()=>setHideDrawKey(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary">
                    <Eye className="w-[16px] h-[16px]" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 w-full max-w-[560px]">
                <div className="flex items-center justify-between">
                  <span className="text-primary brand-title-md">默认参数</span>
                  <span className="text-secondary brand-body-xs">用于图片生成的基础参数</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between gap-[8px]">
                    <span className="text-primary brand-body-md">宽度</span>
                    <input type="number" min={64} step={64} value={draw.width} onChange={(e)=>setDrawField('width', Number(e.target.value))} className="w-[160px] bg-app outline-none text-primary brand-body-md rounded-[6px] border border-app px-[12px] h-[36px] focus-ring-primary" />
                  </div>
                  <div className="flex items-center justify-between gap-[8px]">
                    <span className="text-primary brand-body-md">高度</span>
                    <input type="number" min={64} step={64} value={draw.height} onChange={(e)=>setDrawField('height', Number(e.target.value))} className="w-[160px] bg-app outline-none text-primary brand-body-md rounded-[6px] border border-app px-[12px] h-[36px] focus-ring-primary" />
                  </div>
                  <div className="flex items-center justify-between gap-[8px]">
                    <span className="text-primary brand-body-md">步数</span>
                    <input type="number" min={1} max={100} value={draw.steps} onChange={(e)=>setDrawField('steps', Number(e.target.value))} className="w-[160px] bg-app outline-none text-primary brand-body-md rounded-[6px] border border-app px-[12px] h-[36px] focus-ring-primary" />
                  </div>
                  <div className="flex items-center justify-between gap-[8px]">
                    <span className="text-primary brand-body-md">CFG</span>
                    <input type="number" min={1} max={30} step={0.5} value={draw.cfg} onChange={(e)=>setDrawField('cfg', Number(e.target.value))} className="w-[160px] bg-app outline-none text-primary brand-body-md rounded-[6px] border border-app px-[12px] h-[36px] focus-ring-primary" />
                  </div>
                  <div className="flex items-center justify-between gap-[8px]">
                    <span className="text-primary brand-body-md">采样器</span>
                    <div className="w-[160px]">
                      <Select value={draw.sampler} onValueChange={(v)=>setDrawField('sampler', v)}>
                        <SelectTrigger className="w-full h-[36px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DPM++ 2M">DPM++ 2M</SelectItem>
                          <SelectItem value="Euler">Euler</SelectItem>
                          <SelectItem value="UniPC">UniPC</SelectItem>
                          <SelectItem value="LCM">LCM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-[8px]">
                    <span className="text-primary brand-body-md">Seed</span>
                    <input type="number" min={0} value={draw.seed} onChange={(e)=>setDrawField('seed', Number(e.target.value))} className="w-[160px] bg-app outline-none text-primary brand-body-md rounded-[6px] border border-app px-[12px] h-[36px] focus-ring-primary" />
                  </div>
                </div>
              </div>
            </>)}
            {section !== 'ai' && section !== 'draw' && (
              <div className="text-secondary brand-body-xs">此分组暂未配置，请稍后</div>
            )}

          <DialogFooter>
            <Button variant="secondary" size="sm" onClick={onClose}>取消</Button>
            <Button variant="default" size="sm" onClick={handleSave}>保存</Button>
          </DialogFooter>
          </section>
        </div>
      </DialogContent>
    </Dialog>
    {manageOpen && (
      <Dialog open={manageOpen} onOpenChange={(v)=>{ if(!v) setManageOpen(false) }}>
        <DialogContent className="sm:max-w-[640px] p-4 space-y-3">
          <DialogHeader>
            <DialogTitle className="text-primary brand-title-md">{`${provider.toUpperCase()} API 密钥管理`}</DialogTitle>
          </DialogHeader>
          {(s.ai.keysList[provider] || []).map((k, i) => (
            <div key={i} className="flex items-center justify-between rounded-sm bg-app border border-app px-3 py-2">
              <span className="brand-body-sm text-primary">{showKeyList[i] ? k : (k?.slice(0,6) + '****' + k?.slice(-4))}</span>
              <div className="flex items-center gap-3">
                <button type="button" className="text-secondary" onClick={()=>setShowKeyList(prev=>{ const next=[...prev]; next[i]=!next[i]; return next })}>
                  <Eye className="w-[14px] h-[14px]" />
                </button>
                
                <button type="button" className="text-secondary" onClick={()=>{
                  const list = (s.ai.keysList[provider] || []).filter((_,idx)=>idx!==i); setKeysList(list)
                }}>
                  <Trash className="w-[14px] h-[14px]" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <span className="text-secondary brand-body-xs">多个密钥使用逗号或空格分隔</span>
            <button type="button" className="inline-flex items-center gap-2 rounded-sm bg-primary text-text-inverse px-3 py-2 brand-body-sm" onClick={()=>{
              const nv = prompt('新增密钥')
              if (nv && nv.trim()) setKeysList([...(s.ai.keysList[provider] || []), nv.trim()])
            }}>添加</button>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  )
}