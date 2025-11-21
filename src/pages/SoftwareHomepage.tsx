import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { loadProjects, saveProjects, ProjectSummary, loadProject, saveProject } from '../store/project'
import ScrollArea from '../components/ui/ScrollArea'
import Toolbar from '../components/ui/Toolbar'
import SettingsDialog from '../components/business/SettingsDialog'
 
import ProjectCard from '../components/business/ProjectCard'
import NewProjectDialog from '../components/business/NewProjectDialog'
import { Home, Image as ImageIcon, Wrench, Puzzle, Bot, PlusCircle, Clapperboard, FileText, Mic, Search, LayoutGrid, List, Settings, Maximize2, X, Bell, Info } from 'lucide-react'
 
 

export default function SoftwareHomepage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [activeNav, setActiveNav] = useState<'home' | 'gallery' | 'tools' | 'extensions' | 'agent'>('home')
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [figmaSettingsOpen, setFigmaSettingsOpen] = useState(false)
  
  
  useEffect(() => {
    const data = loadProjects()
    setProjects(data)
  }, [])
  useEffect(() => {
    if (showSearch) searchInputRef.current?.focus()
  }, [showSearch])
  const displayedProjects = (searchQuery ? projects.filter(p => p.title?.toLowerCase().includes(searchQuery.trim().toLowerCase())) : projects)
  const handleNewProject = () => { setNewProjectOpen(true) }
  const handleRename = (id: string, newTitle: string) => {
    // 更新项目列表中的标题
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, title: newTitle } : p)
      saveProjects(next as ProjectSummary[])
      return next
    })
    
    // 同时更新项目数据中的名称
    const projectData = loadProject(id)
    if (projectData) {
      const updatedProjectData = { ...projectData, name: newTitle }
      saveProject(id, updatedProjectData)
    }
  }
  const handleDelete = (id: string) => {
    setProjects(prev => {
      const next = prev.filter(p => p.id !== id)
      saveProjects(next as ProjectSummary[])
      return next
    })
  }
  return (
    <div className="flex items-start bg-surface text-primary w-full h-screen min-w-[1280px] min-h-[800px] relative">
      {/* 左侧边栏 */}
      <aside className="flex flex-col flex-shrink-0 items-start self-stretch border-r border-app bg-surface p-[16px] w-[256px] min-w-[256px] flex">
        {/* Logo区域 */}
        <div className="flex flex-shrink-0 items-center self-stretch gap-[8px] pb-[32px]">
          <div className="inline-flex flex-col flex-shrink-0 items-start py-[4px]">
            <img src="/image/mi0cnlbq-sh4drqu.svg" alt="" className="flex-shrink-0 w-[24px] h-[24px]" />
          </div>
          <p className="flex-shrink-0 brand-title-md text-primary">
            BananaGO AI
          </p>
        </div>

        {/* 登录卡片 */}
        <div className="flex flex-col items-center self-stretch rounded-md bg-surface p-[17px]">
          <div className="flex items-center justify-center w-[64px] h-[76px] pb-[12px]">
            <img src="/image/mi0cnlbq-5lp7f01.svg" alt="" className="w-[64px] h-[64px] rounded-full" />
          </div>
          <p className="flex-shrink-0 brand-title-md text-primary mb-[4px]">
            点击登录
          </p>
          <p className="flex-shrink-0 brand-body-xs text-secondary pt-[4px]">
            登录以体验功能
          </p>
        </div>

        <nav className="flex flex-col flex-shrink-0 items-start self-stretch pt-[32px] h-[422px] gap-2">
          <button
            type="button"
            onClick={() => setActiveNav('home')}
            className={`flex flex-shrink-0 items-center self-stretch gap-3 rounded-md px-[16px] py-[10px] ${activeNav === 'home' ? 'bg-layer1' : ''}`}
          >
            <Home className={`w-[20px] h-[20px] ${activeNav === 'home' ? 'text-primary' : 'text-secondary'}`} />
            <span
              className={`flex-shrink-0 brand-body-sm ${activeNav === 'home' ? 'text-on-light font-medium' : 'text-secondary'}`}
            >
              首页
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('gallery')}
            className={`flex flex-shrink-0 items-center self-stretch gap-3 rounded-md px-[16px] py-[10px] ${activeNav === 'gallery' ? 'bg-layer1' : ''}`}
          >
            <ImageIcon className={`w-[20px] h-[20px] ${activeNav === 'gallery' ? 'text-primary' : 'text-secondary'}`} />
            <span
              className={`flex-shrink-0 brand-body-sm ${activeNav === 'gallery' ? 'text-on-light font-medium' : 'text-secondary'}`}
            >
              图库
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('tools')}
            className={`flex flex-shrink-0 items-center self-stretch gap-3 rounded-md px-[16px] py-[10px] ${activeNav === 'tools' ? 'bg-layer1' : ''}`}
          >
            <Wrench className={`w-[20px] h-[20px] ${activeNav === 'tools' ? 'text-primary' : 'text-secondary'}`} />
            <span
              className={`flex-shrink-0 brand-body-sm ${activeNav === 'tools' ? 'text-on-light font-medium' : 'text-secondary'}`}
            >
              工具
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('extensions')}
            className={`flex flex-shrink-0 items-center self-stretch gap-3 rounded-md px-[16px] py-[10px] ${activeNav === 'extensions' ? 'bg-layer1' : ''}`}
          >
            <Puzzle className={`w-[20px] h-[20px] ${activeNav === 'extensions' ? 'text-primary' : 'text-secondary'}`} />
            <span
              className={`flex-shrink-0 brand-body-sm ${activeNav === 'extensions' ? 'text-on-light font-medium' : 'text-secondary'}`}
            >
              扩展
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('agent')}
            className={`flex flex-shrink-0 items-center self-stretch gap-3 rounded-md px-[16px] py-[10px] ${activeNav === 'agent' ? 'bg-layer1' : ''}`}
          >
            <Bot className={`w-[20px] h-[20px] ${activeNav === 'agent' ? 'text-primary' : 'text-secondary'}`} />
            <span
              className={`flex-shrink-0 brand-body-sm ${activeNav === 'agent' ? 'text-on-light font-medium' : 'text-secondary'}`}
            >
              Agent
            </span>
          </button>
        </nav>

        {/* 底部教程 */}
        <div className="relative flex flex-col items-start self-stretch rounded-md overflow-hidden mt-auto">
          <img src="/image/mi0cnlc4-mr6dgiq.png" alt="" className="flex-shrink-0 self-stretch w-[223px] h-[128px] max-w-[223px] overflow-hidden" />
          <div className="absolute bottom-0 left-0 flex flex-col flex-shrink-0 items-start justify-end self-stretch bg-background/40 p-[12px] w-[224px] h-[128px] gap-3">
            <p className="flex-shrink-0 brand-body-sm text-white font-medium">
              Drawing Pad | 用户教程
            </p>
          </div>
        </div>
      </aside>

      
      
      {/* 主内容区域 */}
      <main className="flex flex-col flex-grow items-start self-stretch bg-app min-w-0 w-full">
        {/* 顶部标题栏 */}
        <Toolbar dragRegion>
          <p className="flex-shrink-0 brand-body-xs text-secondary text-left truncate">
            公测版本不代表最终质量
          </p>
          {null}
          <>
            <div className="inline-flex flex-shrink-0 items-center justify-center rounded-sm w-[28px] h-[28px] p-[5px] overflow-hidden focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background">
              <Info className="w-[18px] h-[18px]" />
            </div>
            <div className="inline-flex flex-shrink-0 items-center justify-center rounded-sm w-[28px] h-[28px] p-[5px] overflow-hidden focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background">
              <Bell className="w-[18px] h-[18px]" />
            </div>
            <button type="button" aria-label="打开设置" className="inline-flex flex-shrink-0 items-center justify-center rounded-sm w-[28px] h-[28px] p-[5px] overflow-hidden focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background" onClick={() => setFigmaSettingsOpen(true)}>
              <Settings className="w-[18px] h-[18px]" />
            </button>
            <div className="inline-flex flex-shrink-0 items-center px-[4px]">
              <div className="flex-shrink-0 border-app w-[1px] h-[16px] border"></div>
            </div>
            <button
              type="button"
              aria-label="最小化窗口"
              className="inline-flex flex-shrink-0 items-center justify-center rounded-sm w-[28px] h-[28px] p-[5px] overflow-hidden focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background"
              onClick={() => {
                const desktop = (window as unknown as { desktop?: { window?: { minimize?: () => void } } }).desktop;
                desktop?.window?.minimize?.();
              }}
            >
              <div className="flex-shrink-0 bg-muted w-[10px] h-[2px] rounded-[1px]"></div>
            </button>
            <button
              type="button"
              aria-label="全屏页面"
              className="inline-flex flex-shrink-0 items-center justify-center rounded-sm w-[28px] h-[28px] p-[5px] overflow-hidden focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background"
              onClick={() => {
                if (!document.fullscreenElement) {
                  void document.documentElement.requestFullscreen();
                } else {
                  void document.exitFullscreen();
                }
              }}
            >
              <Maximize2 className="w-[18px] h-[18px]" />
            </button>
            <button
              type="button"
              aria-label="关闭窗口"
              className="inline-flex flex-shrink-0 items-center justify-center rounded-sm w-[28px] h-[28px] p-[5px] overflow-hidden"
              onClick={() => {
                const desktop = (window as unknown as { desktop?: { window?: { close?: () => void } } }).desktop;
                desktop?.window?.close?.();
              }}
            >
              <X className="w-[18px] h-[18px]" />
            </button>
            
          </>
        </Toolbar>

        {/* 主内容 */}
        <section className="flex flex-col flex-shrink-0 items-start self-stretch p-[32px_31px] h-[calc(100vh-48px)] overflow-hidden gap-[27px]">
          {/* Hero横幅 */}
          <div className="flex flex-shrink-0 items-center self-stretch rounded-lg overflow-hidden">
            <div 
              className="relative flex flex-col flex-grow items-start justify-center self-stretch px-[31px] pt-[62px] h-[192px]"
              style={{
                backgroundImage: 'linear-gradient(90deg, #000000b2 0%, #00000033 100%), url(/image/mi0cnlcx-s8st8re.png)',
                backgroundPosition: '0px -384px',
                backgroundSize: '100% 500%',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <h1 className="flex-shrink-0 self-stretch brand-h1 font-bold text-white pb-[8px]">
                人工智能赋能你的创作，引领视频制作的新时代
              </h1>
              <p className="flex-shrink-0 self-stretch brand-body-md text-secondary">
                专业级AI视频创作平台，让每一帧都充满创意与智慧。
              </p>
              <div className="inline-flex absolute right-[16px] bottom-[16px] flex-shrink-0 items-start rounded-md bg-background/50 px-[8px] py-[4px] w-[170px] h-[24px]">
                <p className="flex-shrink-0 brand-body-xs text-white">
                  _21 工作室 - BananaGO 1.0.9
                </p>
              </div>
            </div>
          </div>

          {/* 快速操作按钮 */}
          <div className="w-full">
            <div className="grid grid-cols-5 gap-3 w-[960px] self-stretch">
              <Button variant="secondary" onClick={handleNewProject} className="h-[50px] w-full min-w-[184px] gap-[8px]">
                <PlusCircle className="w-[24px] h-[24px]" />
                <span className="brand-body-md">新建项目</span>
              </Button>
              <Button variant="secondary" type="button" className="h-[50px] w-full min-w-[184px] gap-[8px]">
                <Clapperboard className="w-[24px] h-[24px]" />
                <span className="brand-body-md">剪辑器</span>
              </Button>
              <Button asChild variant="secondary" className="h-[50px] w-full min-w-[184px] gap-[8px]">
                <Link to="/copywriting">
                  <FileText className="w-[24px] h-[24px]" />
                  <span className="brand-body-md">文案创作</span>
                </Link>
              </Button>
              <Button variant="secondary" type="button" className="h-[50px] w-full min-w-[184px] gap-[8px]">
                <Mic className="w-[24px] h-[24px]" />
                <span className="brand-body-md">配音字幕</span>
              </Button>
              <Button variant="secondary" type="button" className="h-[50px] w-full min-w-[184px] gap-[8px]">
                <Puzzle className="w-[24px] h-[24px]" />
                <span className="brand-body-md">插件模式</span>
              </Button>
            </div>
          </div>

        {/* 作品标题和工具栏 */}
        <div className="flex flex-shrink-0 items-center justify-between self-stretch h-[32px]">
          <h2 className="flex-shrink-0 brand-title-md text-primary">
              作品 ({displayedProjects.length})
          </h2>
          <div className="inline-flex flex-shrink-0 items-center gap-[8px]">
              <div
                className="overflow-hidden"
                style={{ width: showSearch ? 220 : 0, transition: 'width 200ms ease' }}
              >
                <div className="flex items-center h-[32px] rounded-sm bg-surface px-[8px] gap-[6px]">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Escape') { setShowSearch(false); setSearchQuery('') }
                    }}
                    placeholder="搜索作品名称"
                    className="flex-grow bg-transparent outline-none text-primary brand-body-sm placeholder:text-secondary"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="flex items-center justify-center w-[20px] h-[20px] rounded-[4px]"
                    >
                      <span className="text-secondary brand-body-xs">清</span>
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSearch(v => !v)}
                className={`flex flex-col flex-shrink-0 items-start justify-center rounded-sm h-[32px] px-[6px] ${showSearch ? 'bg-surface' : ''} focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background`}
                aria-label="搜索"
                aria-pressed={showSearch}
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties }
              >
                <Search className={`w-[20px] h-[20px] ${showSearch ? 'text-primary' : 'text-secondary'}`} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex flex-col flex-shrink-0 items-start justify-center rounded-sm h-[32px] px-[6px] ${viewMode === 'grid' ? 'bg-surface' : ''} focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background`}
                aria-label="卡片视图"
                aria-pressed={viewMode === 'grid'}
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties }
              >
                <LayoutGrid className={`w-[20px] h-[20px] ${viewMode === 'grid' ? 'text-primary' : 'text-secondary'}`} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex flex-col flex-shrink-0 items-start justify-center rounded-sm h-[32px] px-[6px] ${viewMode === 'list' ? 'bg-surface' : ''} focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background`}
                aria-label="列表视图"
                aria-pressed={viewMode === 'list'}
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties }
              >
                <List className={`w-[20px] h-[20px] ${viewMode === 'list' ? 'text-primary' : 'text-secondary'}`} />
              </button>
          </div>
        </div>

          {/* 项目网格 */}
          <ScrollArea className="flex-grow self-stretch">
              <div className={viewMode === 'grid' ? 'flex flex-wrap items-start content-start self-stretch gap-x-[24px] gap-y-[24px]' : 'flex flex-col items-stretch self-stretch gap-[8px]'}>
            {/* 项目卡片 */}
            {displayedProjects.length === 0 ? (
              <div className="text-secondary brand-body-sm">暂无作品</div>
            ) : (
              (viewMode === 'grid'
                ? displayedProjects.map((project, i) => (
                    <ProjectCard
                      key={project.id ?? i}
                      id={project.id}
                      title={project.title}
                      date={project.date}
                      size={project.size}
                      selected={selectedProjectId === project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      onDoubleClick={() => navigate(`/project?pid=${project.id}`)}
                      onRename={handleRename}
                      onDelete={handleDelete}
                    />
                  ))
                : displayedProjects.map((project, i) => (
                    <button type="button"
                      key={project.id ?? i}
                      className={`flex items-center justify-between self-stretch rounded-md border p-[12px] h-[64px] cursor-pointer ${selectedProjectId === project.id ? 'border-border ring-1' : 'border-border'} focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background`}
                      onClick={() => setSelectedProjectId(project.id)}
                      onDoubleClick={() => navigate(`/project?pid=${project.id}`)}
                    >
                      <div className="flex flex-col">
                        <p className="brand-title-md font-medium text-primary">{project.title}</p>
                        <p className="brand-body-xs text-secondary">{project.date}</p>
                      </div>
                      <p className="brand-body-xs text-secondary">{project.size}</p>
                    </button>
                  )))
            )}
            </div>
          </ScrollArea>
        </section>
      </main>
      <NewProjectDialog open={newProjectOpen} onClose={() => setNewProjectOpen(false)} />
      <SettingsDialog open={figmaSettingsOpen} onClose={() => setFigmaSettingsOpen(false)} />
    </div>
  )
}