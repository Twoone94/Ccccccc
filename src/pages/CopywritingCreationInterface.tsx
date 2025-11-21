import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import ConversationSettings, { type ConversationSettings as ConvS } from '../components/business/ConversationSettings'
import SettingsDialog from '../components/business/SettingsDialog'
import { type AIProvider } from '../store/settings'
import Toolbar from '../components/ui/Toolbar'
import SplitColumns from '../components/ui/SplitColumns'
 
import type { Message } from '../services/ai/gemini'
import { streamChat, sendChat } from '../services/ai/gemini'
 
import { loadChat, saveChat, loadChatSessions, saveNewSession, loadSessionMessages, deleteSession, loadSessionSettings, saveSessionSettings, saveSessionMessages } from '../store/chat'
import { loadSettings, saveSettings, getAgentModelList } from '../store/settings'
import { buildPrompt } from '../prompts/copywriting'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { providerConfig } from '../services/ai/config'

import icoLogo from '/image/mi1liw3x-gvrfryy.svg'
import { FileText, Home, Settings as SettingsIcon, Maximize2, X, Plus, Send } from 'lucide-react'
 

export default function CopywritingCreationInterface() {
  const [activeButtons, setActiveButtons] = useState<Set<string>>(new Set())
  const [sourceText, setSourceText] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [mainCopyText, setMainCopyText] = useState('')
  const [tabs, setTabs] = useState<{ id: string; name: string }[]>([{ id: 'main', name: '分镜' }])
  const [activeTabId, setActiveTabId] = useState<string>('main')
  const [tabText, setTabText] = useState<Record<string, string>>({ main: '' })
  const [tabMenu, setTabMenu] = useState<{ show: boolean; x: number; y: number; id: string }>({ show: false, x: 0, y: 0, id: '' })
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null)
  const dragTabId = useRef<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [sending, setSending] = useState(false)
  const [errorText, setErrorText] = useState<string|undefined>(undefined)
  const streamCtlRef = useRef<{ canceled: boolean } | null>(null)
  const messagesViewRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLTextAreaElement>(null)
  const sourceRef = useRef<HTMLTextAreaElement>(null)
  const mainRef = useRef<HTMLTextAreaElement>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const inputWrapRef = useRef<HTMLDivElement>(null)
  const asideRef = useRef<HTMLDivElement>(null)
  const [chatHeight, _setChatHeight] = useState(129)
  const _chatDragRef = useRef<{ startY: number; startH: number } | null>(null)
  const [_chatBar, setChatBar] = useState({ visible: false, active: false, h: 0, top: 0 })
  const [_srcBar, setSrcBar] = useState({ visible: false, active: false, h: 0, top: 0 })
  const [_mainBar, setMainBar] = useState({ visible: false, active: false, h: 0, top: 0 })
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false)
  const historyBtnRef = useRef<HTMLButtonElement | null>(null)
  const historyMenuRef = useRef<HTMLDivElement | null>(null)
  const [showHistoryMenu, setShowHistoryMenu] = useState(false)
  const [historyMenuStyle, setHistoryMenuStyle] = useState<{ top: number; left: number; minW: number }>({ top: 0, left: 0, minW: 240 })
  const [provider, setProvider] = useState(loadSettings().ai.agentPlatform)
  const [sessionList, setSessionList] = useState<{ id: string; name: string; createdAt: string }[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')
  const defaults = loadSettings()
  const [activeModel, setActiveModel] = useState<string>(() => {
    const list = getAgentModelList(defaults.ai.agentPlatform, defaults)
    return list[0] || defaults.ai.agentModel
  })
  const [_showModelMenu, setShowModelMenu] = useState(false)
  const [_modelMenuStyle, _setModelMenuStyle] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const modelMenuBtnRef = useRef<HTMLButtonElement | null>(null)
  const [_showProviderMenu, setShowProviderMenu] = useState(false)
  const [_providerMenuStyle, _setProviderMenuStyle] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const providerMenuBtnRef = useRef<HTMLButtonElement | null>(null)
  const [showOriginal, setShowOriginal] = useState(true)
  const tabMenuRef = useRef<HTMLDivElement | null>(null)
  const genConfirmRef = useRef<HTMLDivElement | null>(null)
  const undoConfirmRef = useRef<HTMLDivElement | null>(null)
  const [genConfirm, setGenConfirm] = useState<{ show: boolean; x: number; y: number }>({ show: false, x: 0, y: 0 })
  const [undoConfirm, setUndoConfirm] = useState<{ show: boolean; x: number; y: number; msgIndex: number; preview: string }>({ show: false, x: 0, y: 0, msgIndex: -1, preview: '' })
  const [hoverUserMsgIndex, setHoverUserMsgIndex] = useState<number | null>(null)
  const [history, setHistory] = useState<{ msgIndex: number; tabId: string; before: string; after: string }[]>([])
  const modelOptions = useMemo(() => {
    const s = loadSettings()
    const fromStore = getAgentModelList(provider as AIProvider, s)
    const fromDefaults = providerConfig[provider as AIProvider]?.defaultModels || []
    return Array.from(new Set([...(fromStore || []), ...fromDefaults]))
  }, [provider])

  useEffect(() => {
  const onDocClick = (e: globalThis.MouseEvent) => {
      const t = e.target as Node
      const inProviderBtn = providerMenuBtnRef.current && providerMenuBtnRef.current.contains(t as Node)
      const inModelBtn = modelMenuBtnRef.current && modelMenuBtnRef.current.contains(t as Node)
      const inHistoryBtn = historyBtnRef.current && historyBtnRef.current.contains(t)
      const inHistoryMenu = historyMenuRef.current && historyMenuRef.current.contains(t)
      const inTabMenu = tabMenuRef.current && tabMenuRef.current.contains(t)
      const inGenConfirm = genConfirmRef.current && genConfirmRef.current.contains(t)
      const inUndoConfirm = undoConfirmRef.current && undoConfirmRef.current.contains(t)
      if (!inProviderBtn) setShowProviderMenu(false)
      if (!inModelBtn) setShowModelMenu(false)
      if (!inHistoryBtn && !inHistoryMenu) setShowHistoryMenu(false)
      if (!inTabMenu) setTabMenu(s => ({ ...s, show: false }))
      if (!inGenConfirm) setGenConfirm(s => ({ ...s, show: false }))
      if (!inUndoConfirm) setUndoConfirm(s => ({ ...s, show: false }))
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setShowProviderMenu(false); setShowModelMenu(false); setShowHistoryMenu(false) } }
    const onScroll = () => { setShowProviderMenu(false); setShowModelMenu(false); setShowHistoryMenu(false) }
    document.addEventListener('mousedown', onDocClick)
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  const [convSettings, setConvSettings] = useState<ConvS>({
    temperature: defaults.ai.agentTemperature,
    contextCount: 10,
    maxOutputTokens: defaults.ai.agentMaxTokens,
    useStream: true,
    topP: 1,
    toolMode: 'prompt',
    systemPrompts: [
      {
        id: 'storyboard',
        name: '分镜',
        content:
          'Role\n你是一位好莱坞顶级的AI视频分镜导演，精通镜头语言、视觉叙事以及AI绘画/视频生成工具（如Midjourney, Runway, Sora2）的提示词工程。\n\nTask\n我将提供一段故事文本。请你将其拆解为详细的视频分镜脚本。\n\nOutput Format Requirements\n严格按照以下 Markdown 格式输出，不要输出任何多余的解释性文字：\n\n**分镜 [序号]**\n* **视频提示词 (English):** [镜头景别] + [光影/风格] + [主体描述（外貌、衣着必须保持一致）] + [具体的动作或环境细节].\n* **音频提示词 (English):** [环境音效] + [情绪/氛围描述].\n* **台词 (Chinese):** 【[角色名/特征]】：[台词内容]\n\nConstraints & Style Guide\n1. 语言规则：视频提示词与音频提示词必须使用英文，台词保留中文。\n2. 镜头语言：视频提示词必须包含专业摄影术语，例如：Shot types: Extreme Close-up, Medium Shot, Wide Shot, Low Angle, Overhead Shot, Dutch Angle；Camera Movement: Pan, Zoom in/out, Tracking shot, Static。\n3. 角色一致性：首次出现角色时，详细给出英文外貌与服饰描述（示例：A young man with silver hair wearing a yellow sweater）。在后续分镜中重复这些核心关键词以确保一致性。\n4. 画面风格：默认为 "Cinematic lighting, highly detailed, 4k, anime style"，可根据故事适当调整但保持统一风格。'
      },
    ],
    activeSystemPromptId: 'storyboard',
  })
  useEffect(() => {
    // 切换 provider 时不自动覆盖会话设置，仅作为显示默认值参考
  }, [provider])
  useEffect(() => {
    if (!selectedSessionId) return
    const s = loadSessionSettings(selectedSessionId)
    if (s) setConvSettings(s)
  }, [selectedSessionId])
  
  // 移除文案创作页设置弹窗开关，统一使用主设置弹窗

  const THUMB_HEIGHT = 100
  const CHAT_BOTTOM_ROW = 44
  const CHAT_TOP_PAD = 16
  const MIN_W = 100
  const GRID_GAP = 8
  
  // 移除主文案区的拖拽条
  const handleSend = async () => {
    if (sending) { setErrorText('正在生成中，请稍候或点击暂停'); return }
    const v = chatInput.trim()
    if (!v) return
    if (!sourceText.trim()) { setErrorText('请先输入原文'); return }
    const curr = messages
    const act = tabs.find(t => t.id === activeTabId)
    const typeId = act?.name?.includes('分镜') ? 'storyboard' : act?.name?.includes('角色') ? 'character' : act?.name?.includes('剧本') ? 'script' : 'generic'
    if (typeId) {
      if (!selectedSessionId) { const ss = saveNewSession('', []); setSelectedSessionId(ss.id); setSessionList(prev => [{ id: ss.id, name: ss.name, createdAt: ss.createdAt }, ...prev]) }
      setErrorText(undefined)
      setChatInput('')
      setMessages(prev => ([...prev, { role: 'user', content: v }, { role: 'assistant', content: '正在生成中…' }]))
      setSending(true)
      streamCtlRef.current = { canceled: false }
      try {
        setConvSettings(prev => ({ ...prev, activeSystemPromptId: typeId }))
        const sys = (() => { const id = typeId || convSettings.activeSystemPromptId || 'storyboard'; const list = convSettings.systemPrompts || []; const it = list.find(x=>x.id===id); const txt = (it?.content || '').trim(); return txt || '你是一名资深中文广告文案助手，回答简洁且符合品牌语调。' })()
        const targetId = activeTabId
        const currentText = tabText[targetId] || ''
        const base = typeId==='storyboard' ? '请严格保持分镜的 Markdown 格式（分镜编号、视频提示词 (English)、音频提示词 (English)、台词 (Chinese)），仅输出修改后的完整分镜文本，不要任何解释。不得删除未涉及的分镜，不得仅输出部分分镜，除非用户明确提出删除/重排要求；默认仅对指定分镜进行局部修改并保留其他分镜原样。' : '请仅输出修改后的完整文本，不要解释。'
        const _editPrompt = `任务：根据用户指令修改当前${typeId==='storyboard'?'分镜':typeId==='character'?'角色':'剧本'}内容并保持格式一致。\n${base}\n原文：${sourceText.trim()}\n当前文本：\n${currentText}\n用户指令：${v}`
        const contextCount = Math.max(0, convSettings.contextCount)
        const trimmed = contextCount > 0 ? curr.slice(Math.max(0, curr.length - contextCount)) : []
        const loadingIdx = curr.length + 1
        if (typeId === 'storyboard') {
          const shotIdx = parseShotIndex(v)
          if (shotIdx !== null && currentText.trim()) {
            const opsPrompt = `只输出严格 JSON，不要任何其他文字\n对象结构：{\n  "target": "storyboard",\n  "ops": [\n    { "op": "text_replace", "index": <从1开始的分镜序号>, "field": "dialogue|title|video|audio|all", "value": { "from": "...", "to": "..." } },\n    { "op": "replace", "index": <从1开始的分镜序号>, "shot": { "title": "分镜 <序号>", "video": "...", "audio": "...", "dialogue": "..." } },\n    { "op": "insert", "index": <插入到该位置>, "shot": { ... } },\n    { "op": "delete", "index": <从1开始的分镜序号> },\n    { "op": "reorder", "order": [<重新排序的序号列表>] }\n  ]\n}\n约束：\n- 默认仅允许修改目标分镜 ${shotIdx} 的内容，除非用户明确说明范围。\n- 未涉及分镜必须保持不变；索引从 1 开始。\n- 默认字段为 dialogue；只有出现删除词时才允许 delete。\n当前文本：\n${currentText}\n用户指令：${v}`
            let jsonText = ''
            if (convSettings.useStream) {
              for await (const chunk of streamChat([...trimmed, { role: 'user', content: opsPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })) {
                if (streamCtlRef.current?.canceled) break
                jsonText += chunk
              }
            } else {
              const res = await sendChat([...trimmed, { role: 'user', content: opsPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })
              jsonText = res.text
            }
            let nextText = ''
            try {
              const obj = extractJsonFromText(jsonText)
              nextText = applyStoryboardOps(currentText, obj)
            } catch {
              const repairPrompt = `将下面内容严格转换为上面定义的 JSON 结构，确保可被 JSON.parse 解析：\n${jsonText}`
              let repaired = ''
              if (convSettings.useStream) {
                for await (const chunk of streamChat([...trimmed, { role: 'user', content: repairPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })) {
                  if (streamCtlRef.current?.canceled) break
                  repaired += chunk
                }
              } else {
                const res2 = await sendChat([...trimmed, { role: 'user', content: repairPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })
                repaired = res2.text
              }
              const obj2 = extractJsonFromText(repaired)
              nextText = applyStoryboardOps(currentText, obj2)
            }
            setMainCopyText(nextText)
            setTabText(prev => ({ ...prev, [targetId]: nextText }))
            setMessages(prev => { const copy = [...prev]; copy[loadingIdx] = { role: 'assistant', content: `已更新分镜${shotIdx}` }; return copy })
            setHistory(prev => ([...prev, { msgIndex: loadingIdx, tabId: targetId, before: currentText, after: nextText }]))
          } else {
            const opsPromptNoIdx = `只输出严格 JSON，不要任何其他文字\n对象结构：{\n  "target": "storyboard",\n  "ops": [\n    { "op": "text_replace", "index": <从1开始的分镜序号>, "field": "dialogue|title|video|audio|all", "value": { "from": "...", "to": "..." } },\n    { "op": "replace", "index": <从1开始的分镜序号>, "shot": { "title": "分镜 <序号>", "video": "...", "audio": "...", "dialogue": "..." } },\n    { "op": "insert", "index": <插入到该位置>, "shot": { ... } },\n    { "op": "delete", "index": <从1开始的分镜序号> },\n    { "op": "reorder", "order": [<重新排序的序号列表>] }\n  ]\n}\n约束：\n- 根据用户指令自行识别目标分镜序号并仅对其进行局部修改。\n- 未涉及分镜必须保持不变；索引从 1 开始。\n- 默认字段为 dialogue；只有出现删除词时才允许 delete。\n当前文本：\n${currentText}\n用户指令：\n${v}`
            let jsonText = ''
            if (convSettings.useStream) {
              for await (const chunk of streamChat([...trimmed, { role: 'user', content: opsPromptNoIdx }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })) {
                if (streamCtlRef.current?.canceled) break
                jsonText += chunk
              }
            } else {
              const res = await sendChat([...trimmed, { role: 'user', content: opsPromptNoIdx }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })
              jsonText = res.text
            }
            let nextText = ''
            try { const obj = extractJsonFromText(jsonText); nextText = applyStoryboardOps(currentText, obj) }
            catch {
              const repairPrompt = `将下面内容严格转换为上面定义的 JSON 结构，确保可被 JSON.parse 解析：\n${jsonText}`
              let repaired = ''
              if (convSettings.useStream) {
                for await (const chunk of streamChat([...trimmed, { role: 'user', content: repairPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })) { if (streamCtlRef.current?.canceled) break; repaired += chunk }
              } else { const res2 = await sendChat([...trimmed, { role: 'user', content: repairPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel }); repaired = res2.text }
              const obj2 = extractJsonFromText(repaired); nextText = applyStoryboardOps(currentText, obj2)
            }
            setMainCopyText(nextText)
            setTabText(prev => ({ ...prev, [targetId]: nextText }))
            setHistory(prev => ([...prev, { msgIndex: loadingIdx, tabId: targetId, before: currentText, after: nextText }]))
            setMessages(prev => { const copy = [...prev]; copy[loadingIdx] = { role: 'assistant', content: '已局部更新分镜' }; return copy })
          }
        }
        if (typeId !== 'storyboard') {
          const isChar = typeId==='character'
          const isScript = typeId==='script'
          const opsPrompt = `只输出严格 JSON，不要任何其他文字\n对象结构：{\n  "target": "${isChar?'character':isScript?'script':'generic'}",\n  "ops": [\n    { "op": "text_replace", "index": <段落序号，可省略表示全篇>, "value": { "from": "...", "to": "..." } },\n    { "op": "replace", "index": <段落序号>, "value": "段落新文本" },\n    { "op": "insert", "index": <插入位置>, "value": "段落文本" },\n    { "op": "delete", "index": <段落序号> },\n    { "op": "reorder", "order": [<新的段落顺序索引列表> ] }\n  ]\n}\n段落定义：以空行分割的文本块。未涉及段落必须保持不变。默认仅允许局部修改，不得重写全篇，除非用户明确要求。\n当前文本：\n${currentText}\n用户指令：${v}`
          let jsonText = ''
          if (convSettings.useStream) {
            for await (const chunk of streamChat([...trimmed, { role: 'user', content: opsPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })) {
              if (streamCtlRef.current?.canceled) break
              jsonText += chunk
            }
          } else {
            const res = await sendChat([...trimmed, { role: 'user', content: opsPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })
            jsonText = res.text
          }
          let nextText = ''
          try {
            const obj = extractJsonFromText(jsonText)
            nextText = applyTextOps(currentText, obj)
          } catch {
            const repairPrompt = `将下面内容严格转换为可解析的 JSON：\n${jsonText}`
            let repaired = ''
            if (convSettings.useStream) {
              for await (const chunk of streamChat([...trimmed, { role: 'user', content: repairPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })) {
                if (streamCtlRef.current?.canceled) break
                repaired += chunk
              }
            } else {
              const res2 = await sendChat([...trimmed, { role: 'user', content: repairPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })
              repaired = res2.text
            }
            const obj2 = extractJsonFromText(repaired)
            nextText = applyTextOps(currentText, obj2)
          }
          setMainCopyText(nextText)
          setTabText(prev => ({ ...prev, [targetId]: nextText }))
          setHistory(prev => ([...prev, { msgIndex: loadingIdx, tabId: targetId, before: currentText, after: nextText }]))
          setMessages(prev => { const copy = [...prev]; copy[loadingIdx] = { role: 'assistant', content: `已更新${isChar?'角色':isScript?'剧本':'内容'}` }; return copy })
        }
      } catch (e: unknown) {
        setErrorText(e instanceof Error ? e.message : '发送失败')
      } finally {
        setSending(false)
      }
      return
    }
    if (!selectedSessionId) { const ss = saveNewSession('', []); setSelectedSessionId(ss.id); setSessionList(prev => [{ id: ss.id, name: ss.name, createdAt: ss.createdAt }, ...prev]) }
    setErrorText(undefined)
    setChatInput('')
    const userMsg: Message = { role: 'user', content: v }
    const assistantMsg: Message = { role: 'assistant', content: '' }
    const next = [...curr, userMsg, assistantMsg]
    const idx = next.length - 1
    setMessages(next)
    setSending(true)
    streamCtlRef.current = { canceled: false }
    try {
      const sys = (() => { const id = convSettings.activeSystemPromptId || 'storyboard'; const list = convSettings.systemPrompts || []; const it = list.find(x=>x.id===id); const txt = (it?.content || '').trim(); return txt || '你是一名资深中文广告文案助手，回答简洁且符合品牌语调。' })()
      const contextCount = Math.max(0, convSettings.contextCount)
      const trimmed = contextCount > 0 ? curr.slice(Math.max(0, curr.length - contextCount)) : []
      if (convSettings.useStream) {
        for await (const chunk of streamChat([...trimmed, userMsg], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })) {
          if (streamCtlRef.current?.canceled) break
          setMessages((prev) => {
            const copy = [...prev]
            copy[idx] = { ...copy[idx], content: copy[idx].content + chunk }
            return copy
          })
        }
      } else {
        const res = await sendChat([...trimmed, userMsg], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })
        setMessages((prev) => {
          const copy = [...prev]
          copy[idx] = { ...copy[idx], content: res.text }
          return copy
        })
      }
    } catch (e: unknown) {
      setErrorText(e instanceof Error ? e.message : '发送失败')
    } finally {
      setSending(false)
    }
  }
  const stopStreaming = () => { streamCtlRef.current = { canceled: true }; setSending(false) }
  const _prefillFromMessageIndex = (msgIdx: number) => {
    const mm = messages
    let inTxt = ''
    if (mm[msgIdx]?.role === 'user') { inTxt = String(mm[msgIdx]?.content || '') }
    else { for (let i = msgIdx - 1; i >= 0; i--) { if (mm[i]?.role === 'user') { inTxt = String(mm[i]?.content || ''); break } } }
    if (inTxt) { setChatInput(inTxt); window.setTimeout(() => chatRef.current?.focus(), 0) }
  }
  const retryMessage = async (msgIdx: number) => {
    if (sending) { setErrorText('正在生成中，请稍候或点击暂停'); return }
    const mm = messages
    let v = ''
    if (mm[msgIdx]?.role === 'user') v = String(mm[msgIdx]?.content || '')
    else { for (let i = msgIdx - 1; i >= 0; i--) { if (mm[i]?.role === 'user') { v = String(mm[i]?.content || ''); break } } }
    const noUserInstruction = !v.trim()
    const h = [...history].reverse().find(x => x.msgIndex === msgIdx) || [...history].reverse().find(x => x.tabId === activeTabId)
    const targetId = h?.tabId || activeTabId
    const act = tabs.find(t => t.id === targetId)
    const typeId = act?.name?.includes('分镜') ? 'storyboard' : act?.name?.includes('角色') ? 'character' : act?.name?.includes('剧本') ? 'script' : 'generic'
    const currentText = tabText[targetId] || ''
    const curr = messages
    const contextCount = Math.max(0, convSettings.contextCount)
    const trimmed = contextCount > 0 ? curr.slice(Math.max(0, curr.length - contextCount)) : []
    const sys = (() => { const id = typeId || convSettings.activeSystemPromptId || 'storyboard'; setConvSettings(prev => ({ ...prev, activeSystemPromptId: id })); const list = convSettings.systemPrompts || []; const it = list.find(x=>x.id===id); const txt = (it?.content || '').trim(); return txt || '你是一名资深中文广告文案助手，回答简洁且符合品牌语调。' })()
    setErrorText(undefined)
    setSending(true)
    streamCtlRef.current = { canceled: false }
    setMessages(prev => { const copy = [...prev]; copy[msgIdx] = { role: 'assistant', content: '正在生成中…' }; return copy })
    try {
      if (noUserInstruction) {
        const toolName: '生成分镜'|'生成角色'|'生成剧本' = typeId==='character' ? '生成角色' : typeId==='script' ? '生成剧本' : '生成分镜'
        const genPrompt = buildPrompt(toolName, sourceText, mainCopyText)
        const tabId = targetId
        const _loadingLabel = toolName==='生成角色' ? '角色' : toolName==='生成剧本' ? '剧本' : '分镜'
        let out = ''
        if (convSettings.useStream) {
          for await (const chunk of streamChat([...trimmed, { role: 'user', content: genPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })) {
            if (streamCtlRef.current?.canceled) break
            out += chunk
          }
        } else {
          const res = await sendChat([...trimmed, { role: 'user', content: genPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })
          out = res.text
        }
        setMainCopyText(out)
        setTabText(prev => ({ ...prev, [tabId]: out }))
        setMessages(prev => { const copy = [...prev]; copy[msgIdx] = { role: 'assistant', content: toolName==='生成角色' ? '已为你生成角色设定' : toolName==='生成剧本' ? '已为你生成剧本文案' : '已为你生成分镜大纲' }; return copy })
        setHistory(prev => ([...prev, { msgIndex: msgIdx, tabId, before: currentText, after: out }]))
      } else if (typeId === 'storyboard') {
        const shotIdx = parseShotIndex(v)
        const opsPrompt = `只输出严格 JSON，不要任何其他文字\n对象结构：{\n  "target": "storyboard",\n  "ops": [\n    { "op": "text_replace", "index": <从1开始的分镜序号>, "field": "dialogue|title|video|audio|all", "value": { "from": "...", "to": "..." } },\n    { "op": "replace", "index": <从1开始的分镜序号>, "shot": { "title": "分镜 <序号>", "video": "...", "audio": "...", "dialogue": "..." } },\n    { "op": "insert", "index": <插入到该位置>, "shot": { ... } },\n    { "op": "delete", "index": <从1开始的分镜序号> },\n    { "op": "reorder", "order": [<重新排序的序号列表>] }\n  ]\n}\n约束：\n- 默认仅允许修改目标分镜 ${shotIdx ?? ''} 的内容，除非用户明确说明范围。\n- 未涉及分镜必须保持不变；索引从 1 开始。\n- 默认字段为 dialogue；只有出现删除词时才允许 delete。\n当前文本：\n${currentText}\n用户指令：\n${v}`
        let jsonText = ''
        if (convSettings.useStream) {
          for await (const chunk of streamChat([...trimmed, { role: 'user', content: opsPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })) {
            if (streamCtlRef.current?.canceled) break
            jsonText += chunk
          }
        } else {
          const res = await sendChat([...trimmed, { role: 'user', content: opsPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })
          jsonText = res.text
        }
        let nextText = ''
        try {
          const obj = extractJsonFromText(jsonText)
          nextText = applyStoryboardOps(currentText, obj)
        } catch {
          const repairPrompt = `将下面内容严格转换为上面定义的 JSON 结构，确保可被 JSON.parse 解析：\n${jsonText}`
          let repaired = ''
          if (convSettings.useStream) {
            for await (const chunk of streamChat([...trimmed, { role: 'user', content: repairPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })) {
              if (streamCtlRef.current?.canceled) break
              repaired += chunk
            }
          } else {
            const res2 = await sendChat([...trimmed, { role: 'user', content: repairPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })
            repaired = res2.text
          }
          const obj2 = extractJsonFromText(repaired)
          nextText = applyStoryboardOps(currentText, obj2)
        }
        setMainCopyText(nextText)
        setTabText(prev => ({ ...prev, [targetId]: nextText }))
        setMessages(prev => { const copy = [...prev]; copy[msgIdx] = { role: 'assistant', content: `已更新分镜${shotIdx ?? ''}` }; return copy })
        setHistory(prev => ([...prev, { msgIndex: msgIdx, tabId: targetId, before: currentText, after: nextText }]))
      } else {
        const isChar = typeId==='character'
        const isScript = typeId==='script'
        const opsPrompt = `只输出严格 JSON，不要任何其他文字\n对象结构：{\n  "target": "${isChar?'character':isScript?'script':'generic'}",\n  "ops": [\n    { "op": "text_replace", "index": <段落序号，可省略表示全篇>, "value": { "from": "...", "to": "..." } },\n    { "op": "replace", "index": <段落序号>, "value": "段落新文本" },\n    { "op": "insert", "index": <插入位置>, "value": "段落文本" },\n    { "op": "delete", "index": <段落序号> },\n    { "op": "reorder", "order": [<新的段落顺序索引列表> ] }\n  ]\n}\n段落定义：以空行分割的文本块。未涉及段落必须保持不变。默认仅允许局部修改，不得重写全篇，除非用户明确要求。\n当前文本：\n${currentText}\n用户指令：\n${v}`
        let jsonText = ''
        if (convSettings.useStream) {
          for await (const chunk of streamChat([...trimmed, { role: 'user', content: opsPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })) {
            if (streamCtlRef.current?.canceled) break
            jsonText += chunk
          }
        } else {
          const res = await sendChat([...trimmed, { role: 'user', content: opsPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })
          jsonText = res.text
        }
        let nextText = ''
        try { const obj = extractJsonFromText(jsonText); nextText = applyTextOps(currentText, obj) }
        catch {
          const repairPrompt = `将下面内容严格转换为可解析的 JSON：\n${jsonText}`
          let repaired = ''
          if (convSettings.useStream) {
            for await (const chunk of streamChat([...trimmed, { role: 'user', content: repairPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })) { if (streamCtlRef.current?.canceled) break; repaired += chunk }
          } else { const res2 = await sendChat([...trimmed, { role: 'user', content: repairPrompt }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel }); repaired = res2.text }
          const obj2 = extractJsonFromText(repaired)
          nextText = applyTextOps(currentText, obj2)
        }
        setMainCopyText(nextText)
        setTabText(prev => ({ ...prev, [targetId]: nextText }))
        setHistory(prev => ([...prev, { msgIndex: msgIdx, tabId: targetId, before: currentText, after: nextText }]))
        setMessages(prev => { const copy = [...prev]; copy[msgIdx] = { role: 'assistant', content: `已更新${isChar?'角色':isScript?'剧本':'内容'}` }; return copy })
      }
    } catch (e: unknown) {
      setErrorText(e instanceof Error ? e.message : '发送失败')
    } finally {
      setSending(false)
    }
  }
  const undoByMessageIndex = (msgIdx: number) => {
    setHistory(prev => {
      let targetIndex = -1
      for (let i = prev.length - 1; i >= 0; i--) { if (prev[i].msgIndex === msgIdx) { targetIndex = i; break } }
      if (targetIndex < 0) { for (let i = prev.length - 1; i >= 0; i--) { if (prev[i].tabId === activeTabId) { targetIndex = i; break } } }
      if (targetIndex < 0) return prev
      const h = prev[targetIndex]
      let nextText = h.before || ''
      let hasPrevForTab = false
      for (let i = 0; i < targetIndex; i++) { if (prev[i].tabId === h.tabId) { hasPrevForTab = true; break } }
      if (!hasPrevForTab && !(h.before || '').trim() && (h.after || '').trim()) { nextText = h.after }
      if (!nextText.trim()) {
        for (let i = targetIndex - 1; i >= 0; i--) {
          const it = prev[i]
          if (it.tabId === h.tabId && (it.after || '').trim()) { nextText = it.after; break }
        }
      }
      setTabText(s => ({ ...s, [h.tabId]: nextText }))
      if (activeTabId === h.tabId) setMainCopyText(nextText)
      const mm = messages
      let inTxt = ''
      if (mm[msgIdx]?.role === 'user') { inTxt = String(mm[msgIdx]?.content || '') } else { for (let i = msgIdx - 1; i >= 0; i--) { if (mm[i]?.role === 'user') { inTxt = String(mm[i]?.content || ''); break } } }
      if (inTxt) { setChatInput(inTxt); window.setTimeout(() => chatRef.current?.focus(), 0) }
      setMessages(prevMsg => prevMsg.slice(0, Math.max(0, msgIdx)))
      return prev.slice(0, targetIndex)
    })
  }
  const ensureTab = (baseName: string): string => {
    const act = tabs.find(t => t.id === activeTabId)
    if (act && (act.name === baseName || act.name.includes(baseName))) return act.id
    const ex = tabs.find(t => t.name === baseName || t.name.includes(baseName))
    if (ex) { setActiveTabId(ex.id); setMainCopyText(tabText[ex.id] || ''); return ex.id }
    const id = 'tab-' + Math.random().toString(36).slice(2)
    setTabs(prev => [...prev, { id, name: baseName }])
    setTabText(prev => ({ ...prev, [id]: '' }))
    setActiveTabId(id)
    return id
  }
  const parseShotIndex = (instruction: string): number | null => {
    const m1 = instruction.match(/分镜\s*(\d+)/)
    if (m1) return Number(m1[1])
    const m2 = instruction.match(/镜头\s*(\d+)/)
    if (m2) return Number(m2[1])
    return null
  }
  const parseStoryboard = (md: string) => {
    const lines = md.split('\n')
    const shots: { title: string, video: string, audio: string, dialogue: string }[] = []
    let buf: string[] = []
    const flush = () => {
      if (buf.length === 0) return
      const b = buf.join('\n')
      const tMatch = b.match(/\*\*分镜[^\n]*\*\*/)
      const title = tMatch ? tMatch[0].replace(/\*\*/g, '') : '分镜'
      const vMatch = b.match(/\*\s\*\*视频提示词 \(English\):\*\*\s*([^\n]+)/)
      const aMatch = b.match(/\*\s\*\*音频提示词 \(English\):\*\*\s*([^\n]+)/)
      const dMatch = b.match(/\*\s\*\*台词 \(Chinese\):\*\*\s*([^\n]+)/)
      shots.push({ title, video: vMatch ? vMatch[1] : '', audio: aMatch ? aMatch[1] : '', dialogue: dMatch ? dMatch[1] : '' })
      buf = []
    }
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i]
      if (/^\*\*分镜/.test(ln)) {
        flush()
        buf.push(ln)
      } else {
        buf.push(ln)
      }
    }
    flush()
    return shots
  }
  const serializeStoryboard = (shots: { title: string, video: string, audio: string, dialogue: string }[]) => {
    return shots.map((s, idx) => {
      const tt = s.title.includes('分镜') ? s.title : `分镜 ${idx + 1}`
      return `**${tt}**\n* **视频提示词 (English):** ${s.video}\n* **音频提示词 (English):** ${s.audio}\n* **台词 (Chinese):** ${s.dialogue}`
    }).join('\n\n')
  }
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const _parseLocalReplaceInstruction = (instruction: string): { index: number, from: string, to: string } | null => {
    const m1 = instruction.match(/修改分镜\s*(\d+)\s*(\S+)\s*为\s*(\S+)/)
    if (m1) return { index: Number(m1[1]), from: m1[2], to: m1[3] }
    const m2 = instruction.match(/分镜\s*(\d+).*?(?:将|把)\s*(\S+)\s*(?:改为|替换为)\s*(\S+)/)
    if (m2) return { index: Number(m2[1]), from: m2[2], to: m2[3] }
    const m3 = instruction.match(/将\s*(\S+)\s*(?:改为|替换为)\s*(\S+)\s*在分镜\s*(\d+)/)
    if (m3) return { index: Number(m3[3]), from: m3[1], to: m3[2] }
    return null
  }
  const _applyStoryboardLocalReplace = (md: string, index: number, from: string, to: string) => {
    const shots = parseStoryboard(md)
    if (shots.length === 0) return md
    const idx = Math.max(0, Math.min(shots.length - 1, index - 1))
    const s = shots[idx]
    const re = new RegExp(escapeRegExp(from), 'g')
    const reBracket = new RegExp(escapeRegExp(`【${from}】`), 'g')
    const title = String(s.title || '').replace(re, to)
    const video = String(s.video || '').replace(re, to)
    const audio = String(s.audio || '').replace(re, to)
    const dialogue = String(s.dialogue || '').replace(reBracket, `【${to}】`).replace(re, to)
    shots[idx] = { ...s, title, video, audio, dialogue }
    return serializeStoryboard(shots)
  }
  const applyStoryboardOps = (md: string, ops: unknown) => {
    type Shot = { title: string; video: string; audio: string; dialogue: string }
    type ReplaceOp = { type?: string; op: 'replace'; index: number; shot?: Partial<Shot> }
    type TextReplaceOp = { type?: string; op: 'text_replace'; index: number; field?: 'dialogue' | 'title' | 'video' | 'audio' | 'all'; value?: { from?: string; to?: string } }
    type InsertOp = { type?: string; op: 'insert'; index: number; shot?: Partial<Shot> }
    type DeleteOp = { type?: string; op: 'delete'; index: number }
    type ReorderOp = { type?: string; op: 'reorder'; order?: Array<number | string> }
    type OpsPayload = { ops?: Array<ReplaceOp | TextReplaceOp | InsertOp | DeleteOp | ReorderOp> }
    const typed: OpsPayload = ops as OpsPayload
    let shots = parseStoryboard(md)
    const arr = Array.isArray(typed?.ops) ? typed.ops : []
    for (const op of arr) {
      const type = String(op?.type || op?.op || '').toLowerCase()
      if (!type) continue
      if (type === 'replace') {
        const idx = Math.max(0, Number((op as ReplaceOp)?.index ?? 0) - 1)
        if (!shots[idx]) continue
        const cur = shots[idx]
        const ns = (op as ReplaceOp)?.shot || {}
        shots[idx] = { title: String(ns?.title || cur.title), video: String(ns?.video ?? cur.video), audio: String(ns?.audio ?? cur.audio), dialogue: String(ns?.dialogue ?? cur.dialogue) }
      } else if (type === 'text_replace') {
        const idx = Math.max(0, Number((op as TextReplaceOp)?.index ?? 0) - 1)
        if (!shots[idx]) continue
        const from = String((op as TextReplaceOp)?.value?.from ?? '')
        const to = String((op as TextReplaceOp)?.value?.to ?? '')
        if (!from) continue
        const f = String((op as TextReplaceOp)?.field || 'dialogue').toLowerCase()
        const re = new RegExp(escapeRegExp(from), 'g')
        const reBracket = new RegExp(escapeRegExp(`【${from}】`), 'g')
        const s = shots[idx]
        const rep = (txt: string) => String(txt || '').replace(reBracket, `【${to}】`).replace(re, to)
        shots[idx] = {
          title: f==='title'||f==='all' ? rep(s.title) : s.title,
          video: f==='video'||f==='all' ? rep(s.video) : s.video,
          audio: f==='audio'||f==='all' ? rep(s.audio) : s.audio,
          dialogue: f==='dialogue'||f==='all' ? rep(s.dialogue) : s.dialogue,
        }
      } else if (type === 'insert') {
        const idx = Math.max(0, Math.min(shots.length, Number((op as InsertOp)?.index ?? 0) - 1))
        const ns = (op as InsertOp)?.shot || { title: `分镜 ${idx + 1}`, video: '', audio: '', dialogue: '' }
        shots.splice(idx, 0, { title: String(ns?.title || `分镜 ${idx + 1}`), video: String(ns?.video || ''), audio: String(ns?.audio || ''), dialogue: String(ns?.dialogue || '') })
      } else if (type === 'delete') {
        const idx = Math.max(0, Number((op as DeleteOp)?.index ?? 0) - 1)
        if (shots[idx]) shots.splice(idx, 1)
      } else if (type === 'reorder') {
        const orderSource = (op as ReorderOp)?.order || []
        const order = Array.isArray(orderSource) ? orderSource.map((x) => Number(x) - 1) : []
        if (order.length === shots.length) {
          shots = order.map((i: number) => shots[i])
        }
      }
    }
    shots = shots.map((s, i) => ({ ...s, title: `分镜 ${i + 1}` }))
    return serializeStoryboard(shots)
  }
  const extractJsonFromText = (txt: string) => {
    const first = txt.indexOf('{')
    const last = txt.lastIndexOf('}')
    if (first >= 0 && last > first) {
      const cand = txt.slice(first, last + 1)
      return JSON.parse(cand)
    }
    return JSON.parse(txt)
  }
  const applyTextOps = (text: string, ops: { ops?: Array<{ op?: string; type?: string; value?: { from?: string; to?: string } | string; index?: number; order?: Array<number | string> }> }) => {
    const blocks = text.split(/\n\n+/)
    const arr = Array.isArray(ops?.ops) ? ops.ops : []
    const safeIdx = (n: number) => Math.max(0, Math.min(blocks.length - 1, n))
    for (const op of arr) {
      const t = String(op?.op || op?.type || '').toLowerCase()
      if (!t) continue
      if (t === 'text_replace') {
        const val = op?.value
        const from = typeof val === 'object' && val && 'from' in val ? String(val.from ?? '') : ''
        const to = typeof val === 'object' && val && 'to' in val ? String(val.to ?? '') : ''
        if (!from) continue
        const re = new RegExp(escapeRegExp(from), 'g')
        const idx = Number(op?.index)
        if (Number.isFinite(idx)) {
          const i = safeIdx(idx - 1)
          blocks[i] = String(blocks[i] || '').replace(re, to)
        } else {
          const joined = blocks.join('\n\n')
          const replaced = joined.replace(re, to)
          const next = replaced.split(/\n\n+/)
          blocks.length = 0
          blocks.push(...next)
        }
      } else if (t === 'replace') {
        const idx = safeIdx(Number(op?.index) - 1)
        const val = String(op?.value ?? '')
        blocks[idx] = val
      } else if (t === 'insert') {
        const idx = Math.max(0, Math.min(blocks.length, Number(op?.index) - 1))
        const val = String(op?.value ?? '')
        blocks.splice(idx, 0, val)
      } else if (t === 'delete') {
        const idx = safeIdx(Number(op?.index) - 1)
        if (blocks[idx] !== undefined) blocks.splice(idx, 1)
      } else if (t === 'reorder') {
        const orderSrc = op?.order || []
        const order = Array.isArray(orderSrc) ? orderSrc.map((x) => Number(x) - 1) : []
        if (order.length === blocks.length) {
          const next = order.map((i: number) => blocks[safeIdx(i)])
          blocks.length = 0
          blocks.push(...next)
        }
      }
    }
    return blocks.join('\n\n')
  }
  const sendTool = async (t: '生成分镜'|'生成角色'|'生成剧本', targetTabId?: string) => {
    if (sending) { setErrorText('正在生成中，请稍候或点击暂停'); return }
    if (!sourceText.trim()) { setErrorText('请先输入原文'); return }
    const v = buildPrompt(t, sourceText, mainCopyText)
    if (!v.trim()) return
    if (!selectedSessionId) { const ss = saveNewSession('', []); setSelectedSessionId(ss.id); setSessionList(prev => [{ id: ss.id, name: ss.name, createdAt: ss.createdAt }, ...prev]) }
    setErrorText(undefined)
    const curr = messages
    setSending(true)
    streamCtlRef.current = { canceled: false }
    try {
      const sys = (() => { const id = t==='生成角色' ? 'character' : t==='生成剧本' ? 'script' : 'storyboard'; setConvSettings(prev => ({ ...prev, activeSystemPromptId: id })); const list = convSettings.systemPrompts || []; const it = list.find(x=>x.id===id); const txt = (it?.content || '').trim(); return txt || '你是一名资深中文广告文案助手，回答简洁且符合品牌语调。' })()
      const tabName = t==='生成角色' ? '角色' : t==='生成剧本' ? '剧本' : '分镜'
      const tabId = targetTabId || ensureTab(tabName)
      const contextCount = Math.max(0, convSettings.contextCount)
      const trimmed = contextCount > 0 ? curr.slice(Math.max(0, curr.length - contextCount)) : []
      const loadingIdx = curr.length
      setMessages(prev => ([...prev, { role: 'assistant', content: `正在生成${tabName}… 0%` }]))
      if (convSettings.useStream) {
        let out = ''
        for await (const chunk of streamChat([...trimmed, { role: 'user', content: v }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })) {
          if (streamCtlRef.current?.canceled) break
          out += chunk
          setMainCopyText(out)
          setTabText(prev => ({ ...prev, [tabId]: out }))
          const total = Math.max(1, Number(convSettings.maxOutputTokens) * 3)
          const pct = Math.min(99, Math.floor((out.length / total) * 100))
          setMessages(prev => { const copy = [...prev]; copy[loadingIdx] = { role: 'assistant', content: `正在生成${tabName}… ${pct}%` }; return copy })
        }
        setHistory(prev => ([...prev, { msgIndex: loadingIdx, tabId, before: tabText[tabId] || '', after: out }]))
      } else {
        const res = await sendChat([...trimmed, { role: 'user', content: v }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })
        setMainCopyText(res.text)
        setTabText(prev => ({ ...prev, [tabId]: res.text }))
        setHistory(prev => ([...prev, { msgIndex: loadingIdx, tabId, before: tabText[tabId] || '', after: res.text }]))
      }
      setMessages(prev => { const copy = [...prev]; copy[loadingIdx] = { role: 'assistant', content: t==='生成角色' ? '已为你生成角色设定' : t==='生成剧本' ? '已为你生成剧本文案' : '已为你生成分镜大纲' }; return copy })
    } catch (e: unknown) {
      setErrorText(e instanceof Error ? e.message : '发送失败')
    } finally {
      setSending(false)
    }
  }
  const sendCustomPrompt = async (id: string, name: string) => {
    const base = '请基于提供的原文与当前主文案进行中文输出，保持品牌语调与清晰结构。'
    const v = `${base}\n任务：${name}\n原文：${sourceText.trim()}\n主文案：${mainCopyText.trim()}`
    if (!v.trim()) return
    if (!selectedSessionId) { const ss = saveNewSession('', []); setSelectedSessionId(ss.id); setSessionList(prev => [{ id: ss.id, name: ss.name, createdAt: ss.createdAt }, ...prev]) }
    setErrorText(undefined)
    const curr = messages
    setSending(true)
    try {
      const sys = (() => { setConvSettings(prev => ({ ...prev, activeSystemPromptId: id })); const list = convSettings.systemPrompts || []; const it = list.find(x=>x.id===id); const txt = (it?.content || '').trim(); return txt || '你是一名资深中文广告文案助手，回答简洁且符合品牌语调。' })()
      const tabId = ensureTab(name || '自定义')
      const contextCount = Math.max(0, convSettings.contextCount)
      const trimmed = contextCount > 0 ? curr.slice(Math.max(0, curr.length - contextCount)) : []
      const loadingIdx = curr.length
      setMessages(prev => ([...prev, { role: 'assistant', content: `正在生成${name}… 0%` }]))
      if (convSettings.useStream) {
        let out = ''
        for await (const chunk of streamChat([...trimmed, { role: 'user', content: v }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })) {
          out += chunk
          setMainCopyText(out)
          setTabText(prev => ({ ...prev, [tabId]: out }))
          const total = Math.max(1, Number(convSettings.maxOutputTokens) * 3)
          const pct = Math.min(99, Math.floor((out.length / total) * 100))
          setMessages(prev => { const copy = [...prev]; copy[loadingIdx] = { role: 'assistant', content: `正在生成${name}… ${pct}%` }; return copy })
        }
      } else {
        const res = await sendChat([...trimmed, { role: 'user', content: v }], { systemPrompt: sys, temperature: convSettings.temperature, topP: convSettings.topP, maxOutputTokens: convSettings.maxOutputTokens, modelName: activeModel })
        setMainCopyText(res.text)
        setTabText(prev => ({ ...prev, [tabId]: res.text }))
      }
      setMessages(prev => { const copy = [...prev]; copy[loadingIdx] = { role: 'assistant', content: `已为你生成${name}` }; return copy })
    } catch (e: unknown) {
      setErrorText(e instanceof Error ? e.message : '发送失败')
    } finally {
      setSending(false)
    }
  }
  const handleButtonClick = (buttonName: string) => {
    setActiveButtons(prev => {
      const newSet = new Set(prev)
      if (newSet.has(buttonName)) {
        newSet.delete(buttonName)
      } else {
        newSet.add(buttonName)
      }
      return newSet
    })
  }
  const _saveDraft = () => {
    const payload = { sourceText, mainCopyText, savedAt: new Date().toISOString() }
    try { localStorage.setItem('copywritingDraft', JSON.stringify(payload)) } catch { void 0 }
    setDraftSavedAt(new Date().toLocaleTimeString())
    window.setTimeout(() => setDraftSavedAt(null), 2000)
  }
  const resizeChat = useCallback(() => {
    const el = chatRef.current
    if (!el) return
    const ch = Math.max(100, Math.min(chatHeight, 320))
    const viewH = Math.max(0, ch - CHAT_BOTTOM_ROW - CHAT_TOP_PAD)
    el.style.height = viewH + 'px'
    const overflow = el.scrollHeight > viewH
    el.style.overflowY = overflow ? 'auto' : 'hidden'
    const hasOverflow = el.scrollHeight > el.clientHeight
    if (!hasOverflow) { setChatBar(s => ({ ...s, visible: false })); return }
    const viewH2 = el.clientHeight
    const _ratio = viewH2 / el.scrollHeight
    const th = THUMB_HEIGHT
    const track = viewH2 - th
    const tt = Math.floor((el.scrollTop / (el.scrollHeight - viewH2)) * track)
    setChatBar({ visible: true, active: false, h: th, top: isFinite(tt) ? tt : 0 })
  }, [chatHeight])
  useEffect(() => { resizeChat() }, [resizeChat])
  useEffect(() => { setMessages(loadChat()) }, [])
  useEffect(() => { if (selectedSessionId) saveSessionMessages(selectedSessionId, messages); else saveChat(messages) }, [messages, selectedSessionId])
  useEffect(() => { const v = messagesViewRef.current; if (v) v.scrollTo({ top: v.scrollHeight }) }, [messages])
  useEffect(() => { setSessionList(loadChatSessions().map(s => ({ id: s.id, name: s.name, createdAt: s.createdAt }))) }, [])
  useEffect(() => { resizeChat() }, [resizeChat])
  useEffect(() => {
    const el = chatRef.current
    if (!el) return
    const onScroll = () => resizeChat()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [resizeChat])
  useEffect(() => {
    const s = sourceRef.current
    if (!s) return
    const compute = () => {
      const overflow = s.scrollHeight > s.clientHeight
      if (!overflow) { setSrcBar(v => ({ ...v, visible: false })); return }
      const _ratio = s.clientHeight / s.scrollHeight
      const th = THUMB_HEIGHT
      const track = s.clientHeight - th
      const tt = Math.floor((s.scrollTop / (s.scrollHeight - s.clientHeight)) * track)
      setSrcBar({ visible: true, active: false, h: th, top: isFinite(tt) ? tt : 0 })
    }
    compute()
    const onScroll = () => compute()
    s.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(() => compute())
    ro.observe(s)
    return () => { s.removeEventListener('scroll', onScroll); ro.disconnect() }
  }, [sourceText])
  useEffect(() => {
    const m = mainRef.current
    if (!m) return
    const compute = () => {
      const overflow = m.scrollHeight > m.clientHeight
      m.style.overflowY = overflow ? 'auto' : 'hidden'
      if (!overflow) { setMainBar(v => ({ ...v, visible: false })); return }
      const _ratio = m.clientHeight / m.scrollHeight
      const th = THUMB_HEIGHT
      const track = m.clientHeight - th
      const tt = Math.floor((m.scrollTop / (m.scrollHeight - m.clientHeight)) * track)
      setMainBar({ visible: true, active: false, h: th, top: isFinite(tt) ? tt : 0 })
    }
    compute()
    const onScroll = () => compute()
    m.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(() => compute())
    ro.observe(m)
    return () => { m.removeEventListener('scroll', onScroll); ro.disconnect() }
  }, [mainCopyText])
  useEffect(() => {
    const check = () => {
      const a = toolsRef.current
      const b = inputWrapRef.current
      if (!a || !b) return
      const ar = a.getBoundingClientRect()
      const br = b.getBoundingClientRect()
      const gap = Math.round(br.top - ar.bottom)
      if (gap !== 4) b.style.marginTop = '4px'
    }
    check()
    const onResize = () => check()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  
  return (
    <div className="flex flex-col h-screen w-full bg-surface">
      <Toolbar dragRegion>
        <div className="flex items-center gap-[8px]">
          <img src={icoLogo} alt="Logo" className="w-[24px] h-[24px]" />
        </div>
        <p className="w-full brand-body-sm font-medium text-primary text-center truncate">文案创作</p>
        <>
          <button
            className={(showOriginal ? 'bg-app text-primary' : 'bg-surface text-secondary') + ' inline-flex items-center rounded-[6px] h-[28px] px-[8px] hover:bg-app'}
            onClick={() => setShowOriginal(v => !v)}
            aria-label="原文"
            title="原文"
            type="button"
          >
            <FileText className="w-[16px] h-[16px]" />
            <span className="ml-[6px] brand-body-xs">原文</span>
          </button>
          
          
          <Link to="/" className="flex flex-col items-center w-[28px] cursor-pointer"><div className="inline-flex flex-col pt-[3px] pb-[3px]"><Home className="w-[18px] h-[22px]" /></div></Link>
          <button
            className="flex items-center justify-center p-[4px] w-[28px] h-[28px] rounded-[6px] hover:bg-app"
            onClick={() => setGlobalSettingsOpen(true)}
            aria-label="打开设置"
            title="打开设置"
            type="button"
          >
            <SettingsIcon className="w-[18px] h-[18px]" />
          </button>
          
          <div className="px-[4px]"><div className="w-px h-[16px] border border-app" /></div>
          <button type="button" aria-label="最小化窗口" className="inline-flex flex-shrink-0 items-center justify-center rounded-[6px] w-[28px] h-[28px] p-[5px]" onClick={() => { const desktop = (window as unknown as { desktop?: { window?: { minimize?: () => void } } }).desktop; desktop?.window?.minimize?.() }}>
            <div className="flex-shrink-0 w-[10px] h-[2px] rounded-[1px]" style={{ backgroundColor: 'var(--color-text-secondary)' }}></div>
          </button>
          {draftSavedAt && (
            <div className="inline-flex items-center rounded-[6px] h-[28px] px-[10px]">
              <span className="brand-body-xs text-secondary">已保存 {draftSavedAt}</span>
            </div>
          )}
          <button type="button" aria-label="全屏页面" className="inline-flex flex-shrink-0 items-center justify-center rounded-[6px] w-[28px] h-[28px] p-[5px]" onClick={() => { if (!document.fullscreenElement) { void document.documentElement.requestFullscreen() } else { void document.exitFullscreen() } }}>
            <Maximize2 className="flex-shrink-0 w-[18px] h-[18px]" />
          </button>
          <button type="button" aria-label="关闭窗口" className="inline-flex flex-shrink-0 items-center justify-center rounded-[6px] w-[28px] h-[28px] p-[5px]" onClick={() => { const desktop = (window as unknown as { desktop?: { window?: { close?: () => void } } }).desktop; desktop?.window?.close?.() }}>
            <X className="flex-shrink-0 w-[18px] h-[18px]" />
          </button>
        </>
      </Toolbar>
      <div className="bg-app p-[8px] h-[calc(100vh-48px)] overflow-hidden">
        <SplitColumns initialMiddle={628} minColumn={MIN_W} gap={GRID_GAP} desktopMinWidth={1280} collapseLeft={!showOriginal} showHandles={true}>
          <section id="original-section" className={`flex flex-col rounded-[8px] bg-surface p-[16px] h-full min-h-0 ${showOriginal ? '' : 'hidden'}`} style={{ minWidth: MIN_W }}>
            <h3 className="text-primary brand-title-md">原文</h3>
            <div className="pt-[12px] flex-grow min-h-0">
              <div className="relative bg-app rounded-[6px] p-[8px] w-full h-full min-w-0">
                <textarea
                  ref={sourceRef}
                  value={sourceText}
                  onChange={(e)=>setSourceText(e.target.value)}
                  placeholder="请输入原文..."
                  className="w-full h-full bg-transparent outline-none brand-body-md text-primary placeholder:text-secondary resize-none no-scrollbar"
                  style={{ overflowAnchor: 'none' } as CSSProperties}
                />
              </div>
            </div>
          </section>
          <section className="flex flex-col rounded-[8px] bg-surface p-[16px] h-full min-h-0" style={{ minWidth: MIN_W }}>
            <div className="flex items-center justify-between flex-shrink-0 flex-nowrap overflow-hidden">
              <div className="flex items-center gap-[6px] flex-1 min-w-0 overflow-hidden">
                <h2 className="text-primary brand-title-md">文案创作</h2>
              </div>
              <div className="inline-flex flex-wrap items-center gap-[8px]">
                {['撤销','重做','配音格式化','导出文本','转到配音','转到项目'].map(t=> (
                  <button
                    key={t}
                    onClick={() => handleButtonClick(t)}
                    className={`inline-flex items-center justify-center rounded-[6px] p-[4px_12px] brand-body-xs text-primary transition-all duration-200 cursor-pointer select-none
                      ${activeButtons.has(t) 
                        ? 'bg-layer1 text-on-light font-medium' 
                        : 'bg-surface-hover hover:bg-surface-active active:bg-surface-active border border-app focus:outline-none focus-ring-primary'
                      }`}
                    tabIndex={0}
                    aria-pressed={activeButtons.has(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-[12px] flex flex-col flex-grow min-h-0">
              <div className="flex items-center gap-[6px] w-full overflow-x-auto">
                {tabs.map(t => (
                  renaming?.id === t.id ? (
                    <input
                      key={t.id}
                      value={renaming.name}
                      onChange={(e)=> setRenaming({ id: t.id, name: e.target.value })}
                      onKeyDown={(e)=>{
                        if (e.key === 'Enter') {
                          const nm = (renaming.name || '').trim() || '自定义'
                          setTabs(prev => prev.map(x => x.id===t.id ? { ...x, name: nm } : x))
                          setRenaming(null)
                        }
                        if (e.key === 'Escape') {
                          setRenaming(null)
                        }
                      }}
                      onBlur={()=>{
                        const nm = (renaming?.name || '').trim() || '自定义'
                        setTabs(prev => prev.map(x => x.id===t.id ? { ...x, name: nm } : x))
                        setRenaming(null)
                      }}
                      className="h-[28px] px-[12px] brand-body-xs rounded-[6px] bg-app text-primary outline-none border border-app focus-ring-primary"
                      placeholder="标签名称"
                      
                    />
                  ) : (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { setActiveTabId(t.id); setMainCopyText(tabText[t.id] || '') }}
                      onContextMenu={(e)=>{ e.preventDefault(); setTabMenu({ show: true, x: e.clientX, y: e.clientY, id: t.id }) }}
                      draggable
                      onDragStart={()=>{ dragTabId.current = t.id }}
                      onDragOver={(e)=> e.preventDefault()}
                      onDrop={(e)=>{
                        e.preventDefault()
                        const from = dragTabId.current
                        const to = t.id
                        if (!from || from === to) return
                        const idxFrom = tabs.findIndex(x => x.id === from)
                        const idxTo = tabs.findIndex(x => x.id === to)
                        if (idxFrom < 0 || idxTo < 0) return
                        const next = [...tabs]
                        const [item] = next.splice(idxFrom, 1)
                        next.splice(idxTo, 0, item)
                        setTabs(next)
                        dragTabId.current = null
                      }}
                      className={(activeTabId===t.id ? 'bg-app text-primary font-medium' : 'bg-app text-secondary hover:bg-surface') + ' inline-flex items-center justify-center h-[28px] rounded-[6px] px-[12px] brand-body-xs select-none'}
                    >
                      {t.name}
                    </button>
                  )
                ))}
                <button type="button" className="inline-flex items-center justify-center p-[6px] w-[28px] h-[28px]" onClick={() => {
                  const id = 'tab-' + Math.random().toString(36).slice(2)
                  setTabs(prev => [...prev, { id, name: '自定义' }])
                  setTabText(prev => ({ ...prev, [id]: '' }))
                  setActiveTabId(id)
                  setMainCopyText('')
                  setRenaming({ id, name: '自定义' })
                }} title="新增标签">
                  <Plus className="w-[20px] h-[20px]" />
                </button>
                {tabMenu.show && (
                  <div ref={tabMenuRef} className="fixed z-[200] rounded-[8px] bg-app border border-app shadow-card" style={{ left: Math.max(8, Math.min(window.innerWidth-160, tabMenu.x)), top: Math.min(window.innerHeight-120, tabMenu.y) }}>
                    <button type="button" className="w-full text-left px-[10px] h-[32px] brand-body-xs text-primary hover:bg-surface-hover" onClick={()=>{
                      const curr = tabs.find(x=>x.id===tabMenu.id)
                      setRenaming(curr ? { id: curr.id, name: curr.name } : { id: tabMenu.id, name: '' })
                      setTabMenu(s=>({ ...s, show: false }))
                    }}>重命名</button>
                    <button type="button" className="w-full text-left px-[10px] h-[32px] brand-body-xs text-primary hover:bg-app" onClick={()=>{
                      setTabs(prev => prev.filter(x => x.id !== tabMenu.id))
                      setTabText(prev => { const next = { ...prev }; delete next[tabMenu.id]; return next })
                      if (activeTabId === tabMenu.id) {
                        const nextActive = (tabs.find(x => x.id !== tabMenu.id)?.id) || 'main'
                        setActiveTabId(nextActive)
                        setMainCopyText(tabText[nextActive] || '')
                      }
                      setTabMenu(s=>({ ...s, show: false }))
                    }}>删除</button>
                  </div>
                )}
              </div>
              <div className="relative rounded-bl-[6px] rounded-br-[6px] bg-app p-[12px] w-full flex-grow min-h-0 h-full overflow-hidden">
                <textarea
                  ref={mainRef}
                  value={mainCopyText}
                  onChange={(e)=>{ setMainCopyText(e.target.value); setTabText(prev => ({ ...prev, [activeTabId]: e.target.value })) }}
                  placeholder="请输入文案..."
                  className="w-full h-full bg-transparent outline-none brand-body-md text-primary placeholder:text-secondary resize-none no-scrollbar"
                  style={{ overflowAnchor: 'none' } as CSSProperties}
                />
                {/* 移除主文案区的拖拽条 */}
                <p className="absolute bottom-[12px] right-[12px] brand-body-xs nums-tabular text-secondary whitespace-nowrap">{Array.from(mainCopyText).length} 字符</p>
              </div>
            </div>
          </section>
          <aside ref={asideRef} className="relative flex flex-col rounded-[8px] bg-surface p-[16px] h-full min-h-0 justify-between" style={{ minWidth: MIN_W }}>
            <div className="flex items-center justify-between flex-shrink-0 flex-nowrap overflow-hidden">
              <div className="flex items-center gap-[6px] flex-1 min-w-0 overflow-hidden">
                <div className="w-[72px] sm:w-[84px] md:w-[96px] shrink-0">
                  <Select value={provider} onValueChange={(v)=>{
                    const nextProvider = v as AIProvider
                    const ss = loadSettings()
                    ss.ai.agentPlatform = nextProvider
                    const listFromStore = getAgentModelList(nextProvider, ss) || []
                    const listFromDefault = providerConfig[nextProvider]?.defaultModels || []
                    const merged = Array.from(new Set([...(listFromStore || []), ...listFromDefault]))
                    const nextModel = merged.includes(activeModel) ? activeModel : (merged[0] || activeModel)
                    ss.ai.agentModel = nextModel
                    saveSettings(ss)
                    setProvider(nextProvider)
                    setActiveModel(nextModel)
                  }}>
                    <SelectTrigger disabled={sending} size="sm" className="w-full [&>span]:truncate">
                      <SelectValue placeholder="选择平台" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(providerConfig).map(([k, cfg]) => (
                        <SelectItem key={k} value={k}>{cfg.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[92px] sm:w-[104px] md:w-[120px] shrink-0">
                  <Select value={activeModel} onValueChange={(v)=>{ setActiveModel(v); const ss = loadSettings(); ss.ai.agentModel = v; saveSettings(ss) }}>
                    <SelectTrigger disabled={sending} size="sm" className="w-full [&>span]:truncate">
                      <SelectValue placeholder="选择模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="inline-flex items-center gap-[6px] shrink-0">
                <button
                  type="button"
                  className="flex items-center justify-center p-[4px] w-[28px] h-[28px] rounded-[6px] hover:bg-app"
                  aria-label="新建会话"
                  title="新建会话"
                  onClick={() => { const ss = saveNewSession('', []); setSessionList(v=>[{ id: ss.id, name: ss.name, createdAt: ss.createdAt }, ...v]); setSelectedSessionId(ss.id); setMessages([]) }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H9l-3 3v-3H8a4 4 0 0 1-4-4V8z" stroke="#fafafa" strokeWidth="1.6" fill="none"/>
                    <path d="M12 9v6M9 12h6" stroke="#fafafa" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </button>
                <button
                  type="button"
                  ref={historyBtnRef}
                  className="flex items-center justify-center p-[4px] w-[28px] h-[28px] rounded-[6px] hover:bg-app"
                  aria-label="历史记录"
                  title="历史记录"
                  onClick={() => {
                    const el = historyBtnRef.current
                    if (!el) return
                    const r = el.getBoundingClientRect()
                    const left = Math.max(8, Math.min(window.innerWidth - 280, r.left - 4))
                    const top = Math.min(window.innerHeight - 300, r.bottom + 6)
                    setHistoryMenuStyle({ top, left, minW: 260 })
                    setShowHistoryMenu(v => !v)
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3a9 9 0 1 0 9 9" stroke="#fafafa" strokeWidth="1.6" fill="none"/>
                    <path d="M12 7v6l4 2" stroke="#fafafa" strokeWidth="1.6" strokeLinecap="round"/>
                    <path d="M4 20h16" stroke="#fafafa" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center p-[4px] w-[28px] h-[28px] rounded-[6px] hover:bg-app"
                  aria-label="会话设置"
                  title="会话设置"
                  onClick={() => setSettingsOpen(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g stroke="#fafafa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="21" y1="6" x2="14" y2="6" />
                      <line x1="10" y1="6" x2="3" y2="6" />
                      <circle cx="12" cy="6" r="2" fill="none" />
                      <line x1="21" y1="12" x2="16" y2="12" />
                      <line x1="8" y1="12" x2="3" y2="12" />
                      <circle cx="12" cy="12" r="2" fill="none" />
                      <line x1="21" y1="18" x2="12" y2="18" />
                      <line x1="8" y1="18" x2="3" y2="18" />
                      <circle cx="10" cy="18" r="2" fill="none" />
                    </g>
                  </svg>
                </button>
          </div>
          
            </div>
              <div className="flex flex-col py-[12px] flex-grow min-h-0 overflow-hidden">
              <div ref={messagesViewRef} className="flex-1 overflow-auto rounded-[6px] bg-transparent p-[8px]">
                {messages.length === 0 ? (
                  <p className="text-center brand-body-md text-secondary">请先将原文输入后开始与 AI 助手对话</p>
                ) : (
                  <div className="space-y-[8px]">
                {messages.map((m, i) => (
                  <div key={i} className={((m?.role === 'user') ? 'justify-end' : 'justify-start') + ' flex items-start gap-[8px]'}>
                    {m?.role === 'user' ? (
                      <div className="flex items-start gap-[8px]">
                        <div className="inline-flex items-center gap-[6px] opacity-80 flex-row-reverse" onMouseEnter={() => setHoverUserMsgIndex(i)} onMouseLeave={() => setHoverUserMsgIndex(s => s===i ? null : s)}>
                          <button type="button" className="w-[24px] h-[24px] rounded-md bg-surface text-primary flex items-center justify-center hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" onClick={(e: React.MouseEvent<HTMLButtonElement>) => { const x = e.clientX; const y = e.clientY; const prevTxt = String(m?.content || ''); setUndoConfirm({ show: true, x, y, msgIndex: i, preview: prevTxt }) }} title="回退到本轮对话发起前" aria-label="回退到本轮对话发起前">
                            <svg width="16" height="16" viewBox="0 0 1072 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M103.294731 320.444559a31.979793 31.979793 0 1 1 0-63.959585h571.862654C893.707289 256.484974 1071.323058 428.056562 1071.323058 640.242487S893.707289 1024 675.157385 1024H47.969689a31.979793 31.979793 0 1 1 0-63.959586h627.187696C858.881294 960.040414 1007.363472 816.611044 1007.363472 640.242487s-148.482178-319.797928-332.206087-319.797928H103.294731z" />
                              <path d="M80.748977 296.459715l276.001601 239.688546a31.979793 31.979793 0 1 1-41.925508 48.289487l-303.808031-263.83329a31.979793 31.979793 0 0 1 0-48.289487l303.808031-263.83329a31.979793 31.979793 0 1 1 41.925508 48.289487L80.764967 296.459715z" />
                            </svg>
                          </button>
                          <div className={(hoverUserMsgIndex===i ? 'inline-flex' : 'hidden') + ' items-center gap-[6px]'}>
                            <button type="button" className="w-[24px] h-[24px] rounded-[6px] bg-surface flex items-center justify-center" onClick={() => navigator.clipboard.writeText(String(m?.content || ''))} title="复制">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="10" height="10" rx="2" stroke="#fafafa" strokeWidth="1.6"/><rect x="5" y="5" width="10" height="10" rx="2" stroke="#fafafa" strokeWidth="1.6"/></svg>
                            </button>
                            <button type="button" className="w-[24px] h-[24px] rounded-[6px] bg-surface flex items-center justify-center" onClick={() => setMessages(prev => prev.filter((_, idx) => idx !== i))} title="删除">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16" stroke="#fafafa" strokeWidth="1.6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#fafafa" strokeWidth="1.6"/><path d="M10 11v6M14 11v6" stroke="#fafafa" strokeWidth="1.6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="#fafafa" strokeWidth="1.6"/></svg>
                            </button>
                          </div>
                        </div>
                        <div className={'bg-surface text-primary max-w-[72ch] brand-body-md inline-block px-[8px] py-[6px] rounded-[6px] whitespace-pre-wrap'}>
                          {m?.content || ''}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-[8px]">
                        <div className={'bg-surface text-secondary max-w-[72ch] brand-body-md inline-block px-[8px] py-[6px] rounded-[6px] whitespace-pre-wrap'}>
                          {m?.content || ''}
                        </div>
                        <div className="inline-flex items-center gap-[6px] opacity-80">
                          <button type="button" className="w-[24px] h-[24px] rounded-[6px] bg-surface flex items-center justify-center" onClick={() => retryMessage(i)} title="刷新">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4v6h6" stroke="#fafafa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 20v-6h-6" stroke="#fafafa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 15a7 7 0 0 0 12 2M19 9a7 7 0 0 0-12-2" stroke="#fafafa" strokeWidth="1.6" strokeLinecap="round"/></svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {undoConfirm.show && (
                  <div ref={undoConfirmRef} className="fixed z-[210] rounded-md bg-popover border border-border shadow-card p-[10px] w-[280px]" style={{ left: Math.max(8, Math.min(window.innerWidth-300, undoConfirm.x-140)), top: Math.min(window.innerHeight-220, undoConfirm.y+8) }}>
                    <div className="flex items-start gap-[8px] pb-[8px]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#60a5fa" strokeWidth="1.6"/><path d="M12 7v6" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="#60a5fa"/></svg>
                      <div className="brand-body-xs text-primary">确定要回退至此次对话发起前吗？</div>
                    </div>
                    <div className="max-h-[80px] overflow-auto rounded-md bg-popover border border-border brand-body-xs text-secondary p-[6px] mb-[8px] whitespace-pre-wrap">{undoConfirm.preview}</div>
                    <div className="flex items-center justify-end gap-[8px]">
                      <button type="button" className="inline-flex items-center rounded-md bg-popover border border-border text-secondary px-2 py-1 brand-body-xs" onClick={()=> setUndoConfirm(s=>({ ...s, show: false }))}>取消</button>
                      <button type="button" className="inline-flex items-center rounded-sm bg-primary text-text-inverse px-2 py-1 brand-body-xs" onClick={()=>{ undoByMessageIndex(undoConfirm.msgIndex); setUndoConfirm(s=>({ ...s, show: false })) }}>确定</button>
                    </div>
                  </div>
                )}
                    {sending && (
                      <p className="brand-body-xs text-secondary">正在生成…</p>
                    )}
                  </div>
                )}
              </div>
              {errorText && (
                <div className="mt-[8px] brand-body-xs text-error">{errorText}</div>
              )}
            </div>
            <div className="flex flex-col">
              <div ref={toolsRef} className="flex flex-wrap items-center gap-[4px] min-h-[30px]">
                {['生成分镜','生成角色','生成剧本'].map(t => (
                  <button
                    key={t}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => { if (sending) return; if (t === '生成分镜') { const curr = tabs.find(x => x.id === activeTabId); if (!curr || !curr.name.includes('分镜')) { setGenConfirm({ show: true, x: e.clientX, y: e.clientY }); return } } sendTool(t as '生成分镜'|'生成角色'|'生成剧本') }}
                    disabled={sending}
                    className={(sending ? 'opacity-50 cursor-not-allowed ' : '') + 'inline-flex items-center justify-center rounded-[6px] p-[4px_12px] brand-body-xs text-primary bg-surface-hover hover:bg-surface-active active:bg-surface-active border border-app focus:outline-none focus-ring-primary'}
                  >
                    {t}
                  </button>
                ))}
                {genConfirm.show && (
                  <div ref={genConfirmRef} className="fixed z-[200] rounded-[8px] bg-app border border-app shadow-card p-[6px]" style={{ left: Math.max(8, Math.min(window.innerWidth-220, genConfirm.x)), top: Math.min(window.innerHeight-140, genConfirm.y) }}>
                    <div className="px-[8px] py-[6px] brand-body-xs text-primary">当前标签不是分镜，选择生成目标</div>
                    <div className="flex items-center gap-[6px] px-[8px] pb-[6px]">
                      <button type="button" className="inline-flex items-center rounded-sm bg-primary text-text-inverse px-2 py-1 brand-body-xs" onClick={()=>{ ensureTab('分镜'); setGenConfirm(s=>({ ...s, show: false })); sendTool('生成分镜') }}>切换到分镜并生成</button>
                      <button type="button" className="inline-flex items-center rounded-[6px] bg-app border border-app text-primary px-2 py-1 brand-body-xs" onClick={()=>{ const id = activeTabId; setGenConfirm(s=>({ ...s, show: false })); sendTool('生成分镜', id) }}>在当前标签生成</button>
                      <button type="button" className="inline-flex items-center rounded-[6px] bg-app border border-app text-secondary px-2 py-1 brand-body-xs" onClick={()=> setGenConfirm(s=>({ ...s, show: false }))}>取消</button>
                    </div>
                  </div>
                )}
                {((convSettings.systemPrompts || []).filter(p => String(p.id).startsWith('custom-'))).map(p => (
                  <button
                    key={p.id}
                    onClick={() => sendCustomPrompt(p.id, p.name || '自定义')}
                    className="inline-flex items-center justify-center rounded-[6px] p-[4px_12px] brand-body-xs text-primary bg-surface hover:bg-app active:bg-app focus-ring-primary"
                  >
                    {p.name ?? '自定义'}
                  </button>
                ))}
              </div>
              <div
                ref={inputWrapRef}
                className="relative border border-app rounded-[6px] bg-app pt-[16px] px-[11px] pb-[44px] w-full overflow-hidden min-w-0 mt-[4px]"
                style={{ height: chatHeight, transition: 'height 220ms ease' }}
              >
                <textarea
                  ref={chatRef}
                  value={chatInput}
                  onChange={(e)=>setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Enter your message..."
                  className="w-full h-full bg-transparent outline-none brand-body-md text-primary placeholder:text-secondary resize-none no-scrollbar pr-[8px]"
                  style={{ overflowAnchor: 'none' } as CSSProperties}
                  />
                
                <div className="absolute left-[12px] right-[12px] bottom-[8px] flex items-center justify-end z-[2]">
                  <div className="inline-flex items-center gap-[8px]">
              <button
                type="button"
                onClick={() => { if (sending) { stopStreaming() } else { handleSend() } }}
                disabled={!sending && !chatInput.trim()}
                className={(sending ? 'bg-error text-text-inverse' : (chatInput.trim() ? 'bg-success text-text-inverse' : 'bg-surface opacity-50 cursor-not-allowed')) + ' rounded-sm w-[28px] h-[28px] flex items-center justify-center'}
                title={sending ? '暂停' : '发送'}
                aria-label={sending ? '暂停' : '发送'}
              >
                {sending ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="7" y="5" width="3" height="14" fill="currentColor"/><rect x="14" y="5" width="3" height="14" fill="currentColor"/></svg>
                ) : (
                  <Send className="w-[16px] h-[16px]" />
                )}
              </button>
                  </div>
                </div>
                
              </div>
              
            </div>
          </aside>
        </SplitColumns>
      </div>
      <ConversationSettings
        open={settingsOpen}
        initial={convSettings}
        onSave={(s)=>{ setConvSettings(s); if (selectedSessionId) saveSessionSettings(selectedSessionId, s) }}
        onProviderModelChange={(p)=>{ setProvider(p as AIProvider); const ss = loadSettings(); ss.ai.agentPlatform = p as AIProvider; saveSettings(ss) }}
        onClose={()=>setSettingsOpen(false)}
      />

      <SettingsDialog open={globalSettingsOpen} onClose={() => setGlobalSettingsOpen(false)} />

      {showHistoryMenu && createPortal(
        <div ref={historyMenuRef} className="fixed z-[120] rounded-[10px] border border-app bg-app shadow-card" style={{ top: historyMenuStyle.top, left: historyMenuStyle.left, minWidth: historyMenuStyle.minW }}>
          <div className="max-h-[300px] overflow-y-auto p-[8px]">
            {sessionList.length === 0 ? (
              <div className="px-[8px] py-[6px]"><span className="text-secondary brand-body-xs">暂无历史会话</span></div>
            ) : (
              <div className="space-y-[6px]">
                {(() => {
                  const now = new Date()
                  const isSameDay = (a: Date, b: Date) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
                  const yesterday = new Date(now.getTime() - 24*60*60*1000)
                  const todayList = sessionList.filter(s => isSameDay(new Date(s.createdAt), now))
                  const yesterdayList = sessionList.filter(s => isSameDay(new Date(s.createdAt), yesterday))
                  const olderList = sessionList.filter(s => !isSameDay(new Date(s.createdAt), now) && !isSameDay(new Date(s.createdAt), yesterday))
                  const sections: { label: string; items: typeof sessionList }[] = []
                  if (todayList.length) sections.push({ label: '今天', items: todayList })
                  if (yesterdayList.length) sections.push({ label: '昨天', items: yesterdayList })
                  if (olderList.length) {
                    const byDate: Record<string, typeof sessionList> = {}
                    olderList.forEach(s => { const d = new Date(s.createdAt); const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; (byDate[k] ||= []).push(s) })
                    Object.keys(byDate).sort((a,b)=> b.localeCompare(a)).forEach(k => sections.push({ label: k, items: byDate[k] }))
                  }
                  return sections.map((sec, si) => (
                    <div key={si} className="space-y-[4px]">
                      <div className="flex items-center gap-[8px] px-[8px] w-full"><span className="text-secondary brand-body-xs">{sec.label}</span></div>
                      {sec.label !== '今天' && (<div className="w-full h-px border-t border-app" />)}
                      <div className="flex flex-col">
                        {sec.items.map(s => (
                          <button
                            type="button"
                            key={s.id}
                            className="group flex items-center justify-between rounded-md px-[8px] h-[32px] hover:bg-muted"
                            onClick={(e)=>{ e.stopPropagation(); setSelectedSessionId(s.id); const msgs = loadSessionMessages(s.id); if (msgs && msgs.length) { setMessages(msgs) } else { const global = loadChat(); if (global && global.length) { saveSessionMessages(s.id, global); setMessages(global) } else { setMessages([]) } } setShowHistoryMenu(false) }}
                            onKeyDown={(e)=>{ if (e.key==='Enter' || e.key===' ') { e.preventDefault(); e.currentTarget.click() } }}
                          >
                            <button type="button" className={(selectedSessionId===s.id ? 'font-medium' : '') + ' text-primary brand-body-sm truncate text-left w-full'}>{getSessionTitle(s.id, s.name)}</button>
                            <button type="button" className="opacity-0 group-hover:opacity-100 transition-opacity w-[24px] h-[24px] rounded-md bg-popover text-secondary flex items-center justify-center hover:bg-muted" onMouseDown={(e)=>{ e.stopPropagation(); deleteSession(s.id); setSessionList(v=>v.filter(e=>e.id!==s.id)); if (selectedSessionId===s.id) { setSelectedSessionId(''); setMessages([]) } }} title="删除">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16" stroke="#fafafa" strokeWidth="1.6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#fafafa" strokeWidth="1.6"/><path d="M10 11v6M14 11v6" stroke="#fafafa" strokeWidth="1.6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="#fafafa" strokeWidth="1.6"/></svg>
                            </button>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
        </div>, document.body)}

    </div>
  )
}
  const getSessionTitle = (id: string, fallback: string): string => {
    try {
      const msgs = loadSessionMessages(id)
      const first = msgs.find(m => m.role === 'user')
      const txt = (first?.content || '').trim().replace(/\s+/g, ' ')
      if (!txt) return fallback || `会话 ${id.slice(-5)}`
      const slice = txt.slice(0, 8)
      return txt.length > 8 ? slice + '…' : slice
    } catch {
      return fallback || `会话 ${id.slice(-5)}`
    }
  }
