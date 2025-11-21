import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoThumbList from '../components/business/VideoThumbList'
import ImageThumbList from '../components/business/ImageThumbList'
import Toolbar from '../components/ui/Toolbar'
import Button from '../components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { loadProject, saveProject, ProjectData, ProjectItem } from '../store/project'
import { parseStoryboardText } from '../utils/storyboard'
import { splitChineseSentences } from '../utils/text'
import SettingsDialog from '../components/business/SettingsDialog'
import { loadSettings, saveSettings, Settings, type AIProvider } from '../store/settings'
import { Home, Settings as SettingsIcon, Maximize2, X } from 'lucide-react'

export default function ProjectInterface() {
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState<string>('')
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '项目名称',
    totalScenes: 0,
    generated: 0,
    pending: 0,
    generating: 0,
    aiVersion: 'Sora2',
    lastSaved: '已保存至本地',
    items: [],
    hdEnabled: false,
    exportDir: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const topSectionRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState<number | undefined>(undefined);
  const [rowHeight, setRowHeight] = useState(180);
  const [_scrollThumb, setScrollThumb] = useState({ visible: false, active: false, h: 0, top: 0 });
  const [scrollIndex, setScrollIndex] = useState(1);
  const listRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [listBars, setListBars] = useState<Record<number, { visible: boolean; active: boolean; h: number; top: number }>>({});
  const currentVideoRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [thumbWByRow, setThumbWByRow] = useState<Record<number, number>>({});
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTarget, setPreviewTarget] = useState<{ id: number; video?: string } | null>(null)
  const [figmaSettingsOpen, setFigmaSettingsOpen] = useState(false)
  const imageTriggerRef = useRef<HTMLButtonElement | null>(null)
  const projectTriggerRef = useRef<HTMLButtonElement | null>(null)
  const saveTimerRef = useRef<number | null>(null)
  const saveLatestRef = useRef<ProjectData | null>(null)

  // 计算真实的统计数据
  const calculateStats = (items: ProjectItem[]) => {
    const totalScenes = items.length
    const generated = items.filter(item => item.status === 'generated').length
    const generating = items.filter(item => item.status === 'generating').length
    const pending = items.filter(item => item.status === 'pending').length
    return { totalScenes, generated, generating, pending }
  }

  const smartWheel = (el: HTMLElement | null, e: React.WheelEvent, exclusive?: boolean) => {
    if (!el) return;
    const ch = el.clientHeight;
    const sh = el.scrollHeight;
    const st = el.scrollTop;
    const delta = e.deltaY;
    if (exclusive) {
      if (sh > ch) {
        const next = Math.max(0, Math.min(st + delta, sh - ch));
        el.scrollTop = next;
      }
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (sh <= ch) return;
    const atTop = st <= 0;
    const atBottom = st + ch >= sh - 1;
    const canUp = delta < 0 && !atTop;
    const canDown = delta > 0 && !atBottom;
    if (canUp || canDown) {
      el.scrollTop = Math.max(0, Math.min(st + delta, sh - ch));
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // 加载本地保存的项目数据（按 pid）
  useEffect(() => {
    const loadProjectData = () => {
      try {
        const qs = new URLSearchParams(window.location.search)
        const pid = qs.get('pid')
        if (!pid) return
        
        setProjectId(pid)
        
        // 首先检查项目列表中的最新标题
        const projectsRaw = localStorage.getItem('projects')
        let projectTitle = '项目名称'
        if (projectsRaw) {
          const projects = JSON.parse(projectsRaw) as Array<{ id: string; title: string }>
          const projectSummary = projects.find((p) => p.id === pid)
          if (projectSummary) {
            projectTitle = projectSummary.title
          }
        }
        
        const data = loadProject(pid)
        if (data) {
          // 使用最新的项目名称
          const projectWithUpdatedName = { ...data, name: projectTitle }
          // 计算真实统计数据
          const stats = calculateStats(data.items)
          setProjectData({ ...projectWithUpdatedName, ...stats })
          
          // 如果项目数据中的名称与项目列表不一致，更新项目数据
          if (data.name !== projectTitle) {
            saveProject(pid, projectWithUpdatedName)
          }
        } else {
          // 如果没有项目数据，创建一个默认的
          setProjectData(prev => ({ ...prev, name: projectTitle }))
        }
      } catch (error) {
        console.error('加载项目数据失败:', error)
      }
    }
    
    loadProjectData()
  }, []);

  // 监听项目标题变化并同步更新
  useEffect(() => {
    const checkProjectTitle = () => {
      try {
        const qs = new URLSearchParams(window.location.search)
        const pid = qs.get('pid')
        if (!pid) return
        
        // 从项目列表获取最新标题
        const projectsRaw = localStorage.getItem('projects')
        if (projectsRaw) {
          const projects = JSON.parse(projectsRaw) as Array<{ id: string; title: string }>
          const projectSummary = projects.find((p) => p.id === pid)
          
          if (projectSummary && projectSummary.title !== projectData.name) {
            console.log('检测到标题变化:', projectData.name, '->', projectSummary.title)
            // 直接更新显示的标题，不等待保存完成
            setProjectData(prev => ({ ...prev, name: projectSummary.title }))
            
            // 异步更新项目数据中的名称
            setTimeout(() => {
              const currentProjectData = loadProject(pid)
              if (currentProjectData) {
                const updatedData = { ...currentProjectData, name: projectSummary.title }
                saveProject(pid, updatedData)
              }
            }, 0)
          }
        }
      } catch (error) {
        console.error('检查项目标题失败:', error)
      }
    }

    // 立即检查一次
    checkProjectTitle()
    
    // 设置定时器定期检查（每2000毫秒检查一次，降低频率）
    const interval = setInterval(checkProjectTitle, 2000)
    
    // 监听页面可见性变化，当页面变为可见时立即检查
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkProjectTitle()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // 监听窗口获得焦点事件
    const handleFocus = () => {
      checkProjectTitle()
    }
    
    window.addEventListener('focus', handleFocus)
    
    // 移除高频鼠标移动检查，改为仅在焦点与可见性变化时检查
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      
    }
  }, [projectId, projectData.name]);

  const computeLayout = useCallback(() => {
    const el = tableRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const avail = Math.max(0, window.innerHeight - rect.top);
    setTableHeight(avail);
    const count = projectData.items.length || 1;
    const base = 180;
    const minH = 140;
    const maxH = 260;
    const fillH = Math.max(minH, Math.min(maxH, Math.floor(avail / count)));
    const useFill = count * base < avail;
    setRowHeight(useFill ? fillH : base);
  }, [projectData.items.length]);

  const computeScroll = useCallback(() => {
    const el = tableRef.current;
    if (!el) return;
    const visible = el.scrollHeight > el.clientHeight;
    const thumbH = Math.max(40, Math.floor((el.clientHeight / el.scrollHeight) * el.clientHeight));
    const track = el.clientHeight - thumbH;
    const top = Math.floor((el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)) * track);
    setScrollThumb({ visible, active: false, h: thumbH, top: isFinite(top) ? top : 0 });
    const idx = Math.floor(el.scrollTop / Math.max(1, rowHeight)) + 1;
    setScrollIndex(Math.min(projectData.items.length, Math.max(1, idx)));
  }, [rowHeight, projectData.items.length]);

  

  useEffect(() => {
    computeLayout();
    computeScroll();
  }, [computeLayout, computeScroll]);

  useEffect(() => {
    computeLayout();
    computeScroll();
  }, [computeLayout, computeScroll, projectData.items.length]);

  useEffect(() => {
    const onResize = () => {
      computeLayout();
      computeScroll();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [computeLayout, computeScroll]);

  useEffect(() => {
    computeScroll();
  }, [computeScroll, rowHeight, tableHeight]);

  const computeThumbWidth = (id: number) => {
    const curr = currentVideoRefs.current[id];
    const sel = listRefs.current[id];
    const currW = curr ? curr.clientWidth : 0;
    const selW = sel ? sel.clientWidth : 0;
    let w = currW;
    if (selW > 0 && w > 0) w = Math.min(w, selW - 8);
    if (!w || w <= 0) w = Math.max(160, selW ? Math.min(selW - 8, 220) : 220);
    setThumbWByRow(prev => ({ ...prev, [id]: w }));
  };

  useEffect(() => {
    projectData.items.forEach(it => computeThumbWidth(it.id));
  }, [projectData.items, rowHeight, tableHeight]);

  useEffect(() => {
    const onResize = () => { projectData.items.forEach(it => computeThumbWidth(it.id)); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [projectData.items]);

  const computeListBar = (id: number) => {
    const el = listRefs.current[id];
    if (!el) return;
    const visible = el.scrollHeight > el.clientHeight;
    const th = Math.max(40, Math.floor((el.clientHeight / el.scrollHeight) * el.clientHeight));
    const track = el.clientHeight - th;
    const top = Math.floor((el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)) * track);
    setListBars(prev => ({ ...prev, [id]: { visible, active: false, h: th, top: isFinite(top) ? top : 0 } }));
  };

  useEffect(() => {
    projectData.items.forEach(it => computeListBar(it.id));
  }, [projectData.items, rowHeight, tableHeight]);

  // 保存项目数据到本地（按 pid）
  const _onSaveProject = () => {
    const qs = new URLSearchParams(window.location.search)
    const pid = qs.get('pid')
    if (!pid) return
    saveProject(pid, projectData)
    setProjectData(prev => ({
      ...prev,
      lastSaved: new Date().toLocaleTimeString()
    }))
  };

  const scheduleSave = (next: ProjectData) => {
    saveLatestRef.current = next
    if (saveTimerRef.current != null) return
    saveTimerRef.current = window.setTimeout(() => {
      const pid = new URLSearchParams(window.location.search).get('pid')
      const data = saveLatestRef.current
      if (pid && data) saveProject(pid, data)
      saveTimerRef.current = null
      setProjectData(prev => ({ ...prev, lastSaved: new Date().toLocaleTimeString() }))
    }, 500)
  }

  

  // 文件拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => ['.txt', '.md', '.doc'].some(ext => file.name.toLowerCase().endsWith(ext)));
    if (validFiles.length > 0) {
      const f = validFiles[0];
      setSelectedFile(f);
      if (f.name.toLowerCase().endsWith('.txt') || f.name.toLowerCase().endsWith('.md')) {
        const t = await f.text();
        importStoryboardText(t);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md')) {
        const t = await file.text();
        importStoryboardText(t);
      }
    }
  };

  // 生成视频
  const generateVideo = (itemId: number) => {
    setProjectData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === itemId ? { ...item, status: 'generating' as const } : item)
    }))
    setTimeout(() => {
      setProjectData(prev => {
        const updatedItems = prev.items.map(item => item.id === itemId ? { ...item, status: 'generated' as const } : item)
        const stats = calculateStats(updatedItems)
        const next = {
          ...prev,
          items: updatedItems,
          ...stats
        }
        scheduleSave(next)
        return next
      })
    }, 3000)
  };

  // 优化分镜
  const optimizeScene = (itemId: number) => {
    console.log('优化分镜:', itemId);
    // 这里可以添加优化逻辑
  };

  // 导入分镜
  const importStoryboard = () => {
    if (selectedFile) {
      if (selectedFile.name.toLowerCase().endsWith('.txt') || selectedFile.name.toLowerCase().endsWith('.md')) {
        selectedFile.text().then(t => importStoryboardText(t));
        return;
      }
    }
    const input = document.getElementById('file-input') as HTMLInputElement | null;
    if (input) input.click();
  };

  const importStoryboardText = (text: string) => {
    const parsed = parseStoryboardText(text)
    const items: ProjectItem[] = parsed.map(p => ({
      id: p.id,
      type: p.type,
      description: p.description,
      script: p.script,
      scriptLines: splitChineseSentences(p.script || p.description),
      characters: [],
      status: 'pending',
      imageStatus: 'pending',
      videoStatus: 'pending',
    }))
    setProjectData(prev => {
      const stats = calculateStats(items)
      const next = { ...prev, items, ...stats }
      scheduleSave(next)
      return next
    })
    setTimeout(() => { computeLayout(); computeScroll(); }, 0)
  };

  // 批量生成视频
  const batchGenerateVideos = () => {
    const pendingItems = projectData.items.filter(item => item.status === 'pending');
    pendingItems.forEach(item => generateVideo(item.id));
  };

  // 批量生成分镜图描述词（占位实现）
  const batchInferImagePrompts = () => {
    const nextItems = projectData.items.map(it => ({
      ...it,
      imagePrompt: it.imagePrompt || `镜头描述：${it.description}`
    }))
    const stats = calculateStats(nextItems)
    const next = { ...projectData, items: nextItems, ...stats }
    scheduleSave(next)
    setProjectData(next)
  }

  // 批量生图（占位实现，使用内置资源占位）
  const batchGenerateImages = () => {
    const placeholder = '/image/mi0cnlbq-sh4drqu.svg'
    const nextItems = projectData.items.map(it => ({
      ...it,
      imageOptions: it.imageOptions && it.imageOptions.length > 0 ? it.imageOptions : [placeholder, placeholder],
      currentImage: it.currentImage || placeholder,
      imageStatus: 'generated' as const
    }))
    const stats = calculateStats(nextItems)
    const next = { ...projectData, items: nextItems, ...stats }
    scheduleSave(next)
    setProjectData(next)
  }

  // 批量推理角色
  const batchInferCharacters = () => {
    console.log('批量推理角色');
    // 这里可以添加批量推理逻辑
  };

  // 批量推理分镜
  const batchInferScenes = () => {
    console.log('批量推理分镜');
    // 这里可以添加批量推理逻辑
  };

  // 获取状态颜色
  const _getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'text-success';
      case 'generating': return 'text-warning';
      default: return 'text-primary';
    }
  };

  // 获取类型标签颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'transition': return 'bg-yellow-500/20 text-yellow-400';
      case 'scene': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-app text-primary">
      <Toolbar dragRegion>
        <div className="flex items-center gap-[8px]">
          <img src="/image/mi0cnlbq-sh4drqu.svg" alt="" className="w-[24px] h-[24px]" />
        </div>
        <p className="w-full brand-title-md text-primary text-center truncate">{projectData.name}</p>
        <div className="inline-flex items-center gap-[4px] h-[36px]" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button type="button" aria-label="返回首页" className="flex flex-col items-start justify-center rounded-sm p-[5px]" onClick={() => navigate('/')}> 
            <Home className="w-[18px] h-[22px]" />
          </button>
          <button type="button" aria-label="打开设置" className="flex flex-col items-start justify-center rounded-sm p-[5px]" onClick={() => setFigmaSettingsOpen(true)}>
            <SettingsIcon className="w-[18px] h-[18px]" />
          </button>
          <div className="flex flex-col items-start px-[4px]">
            <div className="border-app w-[1px] h-[16px] border"></div>
          </div>
          <button type="button" aria-label="最小化窗口" className="inline-flex flex-shrink-0 items-center justify-center rounded-sm w-[28px] h-[28px] p-[5px]" onClick={() => { const desktop = (window as unknown as { desktop?: { window?: { minimize?: () => void } } }).desktop; desktop?.window?.minimize?.() }}>
            <div className="flex-shrink-0 w-[10px] h-[2px] rounded-[1px]" style={{ backgroundColor: 'var(--color-text-secondary)' }}></div>
          </button>
          <button type="button" aria-label="全屏页面" className="inline-flex flex-shrink-0 items-center justify-center rounded-sm w-[28px] h-[28px] p-[5px]" onClick={() => { if (!document.fullscreenElement) { void document.documentElement.requestFullscreen() } else { void document.exitFullscreen() } }}>
            <Maximize2 className="w-[18px] h-[18px]" />
          </button>
          <button type="button" aria-label="关闭窗口" className="inline-flex flex-shrink-0 items-center justify-center rounded-sm w-[28px] h-[28px] p-[5px]" onClick={() => { const desktop = (window as unknown as { desktop?: { window?: { close?: () => void } } }).desktop; desktop?.window?.close?.() }}>
            <X className="w-[18px] h-[18px]" />
          </button>
    <Dialog open={previewOpen} onOpenChange={(v)=>{ if(!v) setPreviewOpen(false) }}>
      <DialogContent className="sm:max-w-[840px]">
        <DialogHeader>
          <DialogTitle>{previewTarget?.video ? `预览 ${previewTarget.video}` : '预览'}</DialogTitle>
        </DialogHeader>
        <div className="bg-black rounded w-full" style={{ aspectRatio: '16 / 9' }} />
        <p className="mt-[8px] text-xs text-white/70">行号: {previewTarget?.id} {previewTarget?.video ? `视频: ${previewTarget.video}` : '未选择视频'}</p>
      </DialogContent>
    </Dialog>
    
    <SettingsDialog open={figmaSettingsOpen} onClose={() => setFigmaSettingsOpen(false)} />
  </div>
      </Toolbar>

      {/* 统计信息栏 */}
      <div ref={topSectionRef} className="flex flex-col gap-3 p-3 border-b border-app bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface">
              <span className="brand-body-xs text-secondary">总分镜:</span>
              <span className="brand-body-xs font-semibold text-primary nums-tabular">{projectData.totalScenes}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface">
              <span className="brand-body-xs text-secondary">已生成:</span>
              <span className="brand-body-xs font-semibold text-success nums-tabular">{projectData.generated}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface">
              <span className="brand-body-xs text-secondary">未生成:</span>
              <span className="brand-body-xs font-semibold text-primary nums-tabular">{projectData.pending}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface">
              <span className="brand-body-xs text-secondary">生成中:</span>
              <span className="brand-body-xs font-semibold text-warning nums-tabular">{projectData.generating}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center px-2 py-1 rounded bg-surface">
              <span className="text-xs text-secondary">自动保存: {projectData.lastSaved}</span>
            </div>
            <div className="flex items-center px-2 py-1 rounded bg-surface">
              <span className="text-xs text-secondary">AI ver: {projectData.aiVersion}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="col-span-1 w-full">
            <div 
              className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors ${
                isDragOver ? 'border-focus bg-primary-subtle' : 'border-app bg-surface'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <svg className="w-6 h-6 mb-1 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium text-secondary mb-1">选择或拖拽文件到此区域</p>
              <p className="text-xs text-secondary">支持 .txt, .doc, .md</p>
              <input
                type="file"
                accept=".txt,.doc,.md"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="mt-2 px-3 py-1 text-xs bg-surface hover:bg-surface-hover active:bg-surface-active rounded cursor-pointer transition-colors"
              >
                选择文件
              </label>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
              <Button variant="secondary" size="sm" onClick={importStoryboard}>导入分镜</Button>
              <Button variant="default" size="sm" onClick={batchGenerateVideos}>批量生成视频</Button>
              <Button variant="secondary" size="sm" onClick={batchInferCharacters}>批量推理角色</Button>
              <Button variant="secondary" size="sm" onClick={batchInferScenes}>批量推理分镜</Button>
            </div>
          </div>
          <div className="col-span-1 w-full flex flex-col gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button ref={imageTriggerRef} variant="outline" size="sm" className="w-full justify-between">
                  <span className="text-sm">生图设置</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-0 p-0 rounded-md border bg-popover text-popover-foreground shadow-md" style={{ width: imageTriggerRef.current?.offsetWidth }}>
                <div className="w-full max-h-[420px] overflow-y-auto px-1 pb-1" onWheel={(e)=>smartWheel(e.currentTarget, e, true)}>
                  <ImageSettings onClose={()=>{}} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button ref={projectTriggerRef} variant="outline" size="sm" className="w-full justify-between">
                  <span className="text-sm">项目设置</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-0 p-0 rounded-md border bg-popover text-popover-foreground shadow-md" style={{ width: projectTriggerRef.current?.offsetWidth }}>
                <div className="w-full max-h-[420px] overflow-y-auto px-1 pb-1" onWheel={(e)=>smartWheel(e.currentTarget, e, true)}>
                  <ProjectSettings pid={projectId} projectData={projectData} setProjectData={setProjectData} onClose={()=>{}} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* 表格区域 */}
      <div ref={tableRef} className="overflow-auto scroll-smooth relative bg-app no-scrollbar overscroll-contain" style={tableHeight ? { height: tableHeight } : undefined} onScroll={computeScroll} onWheel={(e) => {
        const target = e.target as HTMLElement;
        if (target && target.closest('[data-vsel]')) return;
        smartWheel(tableRef.current, e);
        computeScroll();
      }}>
        <div className="min-w-[1280px]">
        {/* 表头 */}
        <div className="flex items-stretch bg-surface border-b border-app sticky top-0 z-10">
          <div className="flex items-center justify-center basis-[60px] shrink-0 px-3 py-2 border-r border-app">
            <span className="text-xs font-semibold text-secondary uppercase">编号</span>
          </div>
          <div className="flex items-center justify-between basis-[120px] shrink-0 px-3 py-2 border-r border-app">
            <span className="text-xs font-semibold text-secondary uppercase">预设</span>
            
          </div>
          <div className="flex items-center justify-between flex-1 min-w-[300px] px-3 py-2 border-r border-app">
            <span className="text-xs font-semibold text-secondary uppercase">剧本</span>
            <div className="flex gap-1">
              <Button variant="secondary" size="sm">操作</Button>
              <Button variant="secondary" size="sm">替换</Button>
            </div>
          </div>
          <div className="flex items-center justify-between basis-[20%] min-w-[220px] px-3 py-2 border-r border-app">
            <span className="text-xs font-semibold text-secondary uppercase">分镜图描述词</span>
            <Button variant="secondary" size="sm" onClick={batchInferImagePrompts}>批量生成</Button>
          </div>
          <div className="flex items-center justify-between basis-[20%] min-w-[220px] px-3 py-2 border-r border-app">
            <span className="text-xs font-semibold text-secondary uppercase">视频描述词</span>
          </div>
          <div className="flex items-center justify-between basis-[18%] min-w-[180px] px-3 py-2 border-r border-app">
            <span className="text-xs font-semibold text-secondary uppercase">角色选择</span>
            <Button variant="secondary" size="sm">操作</Button>
          </div>
          <div className="flex items-center justify-between basis-[18%] min-w-[180px] px-3 py-2 border-r border-app">
            <span className="text-xs font-semibold text-secondary uppercase">当前分镜</span>
            <Button variant="secondary" size="sm">操作</Button>
          </div>
          <div className="flex items-center justify-between basis-[20%] min-w-[180px] px-3 py-2 border-r border-app">
            <span className="text-xs font-semibold text-secondary uppercase">分镜选择</span>
            <Button variant="secondary" size="sm" onClick={batchGenerateImages}>批量生图</Button>
          </div>
          <div className="flex items-center justify-between basis-[18%] min-w-[180px] px-3 py-2 border-r border-app">
            <span className="text-xs font-semibold text-secondary uppercase">当前视频</span>
            <Button variant="secondary" size="sm">操作</Button>
          </div>
          <div className="flex items-center justify-between basis-[20%] min-w-[180px] px-3 py-2 border-r border-app">
            <span className="text-xs font-semibold text-secondary uppercase">视频选择</span>
            <Button variant="secondary" size="sm">操作</Button>
          </div>
          <div className="flex items-center justify-center basis-[120px] shrink-0 px-3 py-2">
            <span className="text-xs font-semibold text-secondary uppercase">操作</span>
          </div>
        </div>

        {/* 表格内容 */}
        {projectData.items.map((item) => (
          <div key={item.id} className="flex items-stretch border-b border-app bg-app" style={{ height: rowHeight }}>
            <div className="flex items-center justify-center basis-[60px] shrink-0 px-3 border-r border-app">
              <span className="text-xs text-secondary">{item.id}</span>
            </div>
            <div className="flex items-start basis-[120px] shrink-0 px-3 py-2 border-r border-app">
              <div className={`px-2 py-0.5 text-xs rounded ${getTypeColor(item.type)}`}>{item.type === 'scene' ? '场景' : '转场'}</div>
            </div>
            <div className="flex-1 min-w-[300px] px-3 py-3 border-r border-app flex items-start">
              <div className="flex flex-col gap-1 w-full">
                <p className="text-xs text-primary leading-relaxed">{item.script ?? item.description}</p>
                <div className="mt-2">
                  {(item.scriptLines && item.scriptLines.length>0 ? item.scriptLines : splitChineseSentences(item.script ?? item.description)).map((line, idx) => (
                    <p key={idx} className="text-xs text-secondary leading-relaxed">{line}</p>
                  ))}
                </div>
                <div className="inline-flex gap-2 mt-2">
                  <Button variant="secondary" size="sm" onClick={() => {
                    setProjectData(prev => {
                      const items = [...prev.items]
                      const curIdx = items.findIndex(it => it.id === item.id)
                      if (curIdx<=0) return prev
                      const cur = items[curIdx]
                      const prv = items[curIdx-1]
                      const lines = (cur.scriptLines && cur.scriptLines.length>0 ? cur.scriptLines : splitChineseSentences(cur.script ?? cur.description))
                      const plines = (prv.scriptLines && prv.scriptLines.length>0 ? prv.scriptLines : splitChineseSentences(prv.script ?? prv.description))
                      items[curIdx-1] = { ...prv, scriptLines: [...plines, ...lines] }
                      items.splice(curIdx,1)
                      items.forEach((it,i)=>{ it.id = i+1 })
                      const stats = calculateStats(items)
                      const next = { ...prev, items, ...stats }
                      scheduleSave(next)
                      return next
                    })
                  }}>并入上一行</Button>
                  <Button variant="secondary" size="sm" onClick={() => {
                    setProjectData(prev => {
                      const items = [...prev.items]
                      const curIdx = items.findIndex(it => it.id === item.id)
                      if (curIdx<0 || curIdx>=items.length-1) return prev
                      const cur = items[curIdx]
                      const nxt = items[curIdx+1]
                      const lines = (cur.scriptLines && cur.scriptLines.length>0 ? cur.scriptLines : splitChineseSentences(cur.script ?? cur.description))
                      const nlines = (nxt.scriptLines && nxt.scriptLines.length>0 ? nxt.scriptLines : splitChineseSentences(nxt.script ?? nxt.description))
                      items[curIdx+1] = { ...nxt, scriptLines: [...lines, ...nlines] }
                      items.splice(curIdx,1)
                      items.forEach((it,i)=>{ it.id = i+1 })
                      const stats = calculateStats(items)
                      const next = { ...prev, items, ...stats }
                      scheduleSave(next)
                      return next
                    })
                  }}>并入下一行</Button>
                  <Button variant="default" size="sm" onClick={() => {
                    setProjectData(prev => {
                      const items = [...prev.items]
                      const curIdx = items.findIndex(it => it.id === item.id)
                      const cur = items[curIdx]
                      const lines = (cur.scriptLines && cur.scriptLines.length>0 ? cur.scriptLines : splitChineseSentences(cur.script ?? cur.description))
                      if (lines.length<=1) return prev
                      const first = lines[0]
                      const rest = lines.slice(1)
                      items[curIdx] = { ...cur, scriptLines: [first] }
                      const inserts = rest.map((ln, i) => ({ ...cur, id: cur.id + i + 1, scriptLines: [ln], script: (cur.script ?? cur.description) }))
                      items.splice(curIdx+1,0,...inserts)
                      items.forEach((it,i)=>{ it.id = i+1 })
                      const stats = calculateStats(items)
                      const next = { ...prev, items, ...stats }
                      scheduleSave(next)
                      return next
                    })
                  }}>拆为多分镜</Button>
                </div>
              </div>
            </div>
            <div className="basis-[20%] min-w-[220px] px-3 py-2 border-r border-app flex items-start">
              <Input value={item.imagePrompt ?? ''} onChange={(e)=>{
                const v = e.target.value
                setProjectData(prev => ({
                  ...prev,
                  items: prev.items.map(it => it.id === item.id ? { ...it, imagePrompt: v } : it)
                }))
              }} className="w-full bg-app text-primary border border-app h-[30px]" placeholder="图像描述词" />
            </div>
            <div className="basis-[20%] min-w-[220px] px-3 py-2 border-r border-app flex items-start">
              <Input value={item.videoPrompt ?? ''} onChange={(e)=>{
                const v = e.target.value
                setProjectData(prev => ({
                  ...prev,
                  items: prev.items.map(it => it.id === item.id ? { ...it, videoPrompt: v } : it)
                }))
              }} className="w-full bg-app text-primary border border-app h-[30px]" placeholder="视频描述词" />
            </div>
            <div className="basis-[18%] min-w-[180px] px-3 py-2 border-r border-app flex items-center justify-center">
              {item.characters && item.characters.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {[0,1,2,3].map((i) => (
                    <div key={i} className="w-[74px] h-[74px] bg-black rounded" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="w-[74px] h-[74px] bg-black rounded" />
                  <div className="w-[74px] h-[74px] bg-black rounded" />
                </div>
              )}
            </div>
            <div className="basis-[18%] min-w-[180px] px-3 py-2 border-r border-app flex items-center justify-center">
              <div className="bg-black rounded w-full max-w-[220px]" style={{ aspectRatio: '16 / 9', overflow: 'hidden' }}>
                {item.currentImage && (<img src={item.currentImage} alt="当前分镜" className="w-full h-full object-cover" />)}
              </div>
            </div>
            <ImageThumbList
              setContainerRef={(el) => { listRefs.current[item.id] = el; }}
              options={(Array.isArray(item.imageOptions) && item.imageOptions.length > 0 ? item.imageOptions : [null]) as (string | null)[]}
              bar={listBars[item.id]}
              setBarActive={(active) => {
                const b = listBars[item.id];
                if (!b) return;
                setListBars(prev => ({ ...prev, [item.id]: { ...b, active } }));
              }}
              onScroll={() => computeListBar(item.id)}
              onWheel={(e) => {
                smartWheel(listRefs.current[item.id] as HTMLElement | null, e, true);
                computeListBar(item.id);
              }}
              thumbWidth={thumbWByRow[item.id]}
              dataKey={item.id}
              selected={item.currentImage ?? null}
              onSelect={(value) => {
                setProjectData(prev => ({
                  ...prev,
                  items: prev.items.map(it => it.id === item.id ? { ...it, currentImage: value ?? undefined } : it)
                }))
              }}
            />
            <div className="basis-[18%] min-w-[180px] px-3 py-2 border-r border-app flex items-center justify-center">
              <div
                ref={(el) => { currentVideoRefs.current[item.id] = el; }}
                className="bg-black rounded w-full max-w-[220px]"
                style={{ aspectRatio: '16 / 9' }}
                onDoubleClick={() => { setPreviewTarget({ id: item.id, video: item.currentVideo }); setPreviewOpen(true) }}
              />
            </div>
            <VideoThumbList
              setContainerRef={(el) => { listRefs.current[item.id] = el; }}
              options={(Array.isArray(item.videoOptions) && item.videoOptions.length > 0 ? item.videoOptions : [null]) as (string | null)[]}
              bar={listBars[item.id]}
              setBarActive={(active) => {
                const b = listBars[item.id];
                if (!b) return;
                setListBars(prev => ({ ...prev, [item.id]: { ...b, active } }));
              }}
              onScroll={() => computeListBar(item.id)}
              onWheel={(e) => {
                smartWheel(listRefs.current[item.id] as HTMLElement | null, e, true);
                computeListBar(item.id);
              }}
              thumbWidth={thumbWByRow[item.id]}
              dataKey={item.id}
              selected={item.currentVideo ?? null}
              onSelect={(value) => {
                setProjectData(prev => ({
                  ...prev,
                  items: prev.items.map(it => it.id === item.id ? { ...it, currentVideo: value ?? undefined } : it)
                }))
              }}
            />
            <div className="basis-[120px] shrink-0 px-3 py-2 flex flex-col items-center justify-center gap-2">
              <button
                onClick={() => generateVideo(item.id)}
                disabled={item.status === 'generating'}
                className={`w-full px-2 py-1 text-xs rounded-sm transition-colors ${
                  item.status === 'generating'
                    ? 'bg-warning-subtle text-warning cursor-not-allowed'
                    : item.status === 'generated'
                    ? 'bg-success-subtle text-success'
                    : 'bg-surface hover:bg-surface-hover text-primary'
                }`}
              >
                {item.status === 'generating' ? '生成中...' : '生成视频'}
              </button>
              <Button size="sm" variant="secondary" onClick={() => optimizeScene(item.id)} className="w-full">优化分镜</Button>
            </div>
          </div>
        ))}
        <div className="absolute right-[12px] top-[8px] brand-body-xs nums-tabular text-secondary">{scrollIndex} / {projectData.items.length || 1}</div>
        </div>
      </div>
    </div>
  );
};

function ImageSettings({ onClose }: { onClose: () => void }) {
  const [s, setS] = useState<Settings>(loadSettings())
  const setAI = (next: Partial<Settings['ai']>) => setS(prev => ({ ...prev, ai: { ...prev.ai, ...next } }))
  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex items-center justify-between gap-[8px]">
        <label className="brand-title-md text-primary" htmlFor="img-platform">平台</label>
        <Select value={s.ai.agentPlatform} onValueChange={(v)=>setAI({ agentPlatform: v as AIProvider })}>
          <SelectTrigger id="img-platform" size="sm" className="w-[180px]">
            <SelectValue placeholder="选择平台" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="gemini">Gemini</SelectItem>
            <SelectItem value="deepseek">DeepSeek</SelectItem>
            <SelectItem value="kimi">Kimi</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between gap-[8px]">
        <label className="brand-title-md text-primary" htmlFor="img-model">模型</label>
        <Input
          id="img-model"
          value={s.ai.agentModel}
          onChange={(e)=>setAI({ agentModel: e.target.value })}
          className="flex-1"
          placeholder="模型名称"
        />
      </div>
      <DialogFooter>
        <Button variant="secondary" size="sm" onClick={onClose}>取消</Button>
        <Button variant="default" size="sm" onClick={()=>{ try { saveSettings(s) } finally { onClose() } }}>保存</Button>
      </DialogFooter>
    </div>
  )
}

function ProjectSettings({ pid, projectData, setProjectData, onClose }: { pid: string; projectData: ProjectData; setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>; onClose: () => void }) {
  const [hdEnabled, setHdEnabled] = useState<boolean>(projectData.hdEnabled ?? false)
  const [exportDir, setExportDir] = useState<string>(projectData.exportDir ?? '')
  const onSave = () => {
    const next = { ...projectData, hdEnabled, exportDir }
    if (pid) saveProject(pid, next)
    setProjectData(next)
    onClose()
  }
  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex items-center justify-between gap-[8px]">
        <label className="brand-title-md text-primary" htmlFor="proj-hd">开启高清功能</label>
        <input id="proj-hd" type="checkbox" checked={hdEnabled} onChange={(e)=>setHdEnabled(e.target.checked)} />
      </div>
      <div className="flex items-center justify-between gap-[8px]">
        <label className="brand-title-md text-primary" htmlFor="proj-export">导出地址</label>
        <input
          id="proj-export"
          value={exportDir}
          onChange={(e)=>setExportDir(e.target.value)}
          className="flex-1 bg-app outline-none text-primary brand-body-md rounded-[6px] border border-app px-[12px] h-[36px] focus-ring-primary"
          placeholder="如：C:/Users/me/Exports 或 https://example.com/webhook"
        />
      </div>
      <DialogFooter>
        <Button variant="secondary" size="sm" onClick={onClose}>取消</Button>
        <Button variant="default" size="sm" onClick={onSave}>保存</Button>
      </DialogFooter>
    </div>
  )
}