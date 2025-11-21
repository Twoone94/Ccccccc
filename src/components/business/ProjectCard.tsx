import { MouseEventHandler, useEffect, useRef, useState } from 'react'

export default function ProjectCard({
  id,
  title,
  date,
  size,
  onClick,
  onDoubleClick,
  onRename,
  onDelete,
  selected,
}: {
  id: string
  title: string
  date: string
  size: string
  onClick: MouseEventHandler<HTMLDivElement>
  onDoubleClick?: MouseEventHandler<HTMLDivElement>
  onRename?: (id: string, newTitle: string) => void
  onDelete?: (id: string) => void
  selected?: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current) return
      const target = e.target as Node
      if (!menuRef.current.contains(target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleRenameClick = () => {
    setMenuOpen(false)
    setIsEditing(true)
    setEditTitle(title)
  }

  const handleSaveRename = () => {
    if (editTitle.trim() && editTitle !== title) {
      onRename?.(id, editTitle.trim())
    }
    setIsEditing(false)
  }

  const handleCancelRename = () => {
    setIsEditing(false)
    setEditTitle(title)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveRename()
    } else if (e.key === 'Escape') {
      handleCancelRename()
    }
  }
  return (
    <div
      className={`flex flex-col items-start self-start rounded-[8px] border h-[214px] overflow-hidden transition-colors cursor-pointer w-[172px] max-w-[172px] ${selected ? 'border-app ring-1 ring-app' : 'border-app hover:border-focus'}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e.currentTarget as HTMLDivElement).click() } }}
    >
      <div className="relative flex-shrink-0 z-[1] overflow-hidden" style={{ width: '172px', height: '128px' }}>
        <img src="/image/mi0cnlcx-fsf70u8.png" alt="" style={{ width: '170.8px', height: '128px', objectFit: 'cover' } as React.CSSProperties} />
        <div className="inline-flex absolute top-[8px] right-[6px] flex-shrink-0 items-start rounded-[8px] bg-[#00000099] px-[6px] py-[2px] w-[36px] h-[20px]">
          <p className="flex-shrink-0 brand-body-xs text-white">项目</p>
        </div>
      </div>
      <div className="relative flex flex-col flex-shrink-0 items-start self-stretch z-[2] bg-app p-[12px] h-[86px]">
        <div className="h-[20px] mb-[4px]">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveRename}
              onKeyDown={handleKeyDown}
            className="w-full brand-body-md font-medium text-primary bg-app border border-app rounded-[4px] px-[6px] py-[2px] outline-none focus-ring-primary truncate"
            />
          ) : (
            <p className="flex-shrink-0 self-stretch brand-title-md text-primary truncate">{title}</p>
          )}
        </div>
        <div className="mt-auto">
          <p className="flex-shrink-0 brand-body-xs text-secondary">{date}</p>
          <p className="flex flex-grow items-center flex-shrink-0 brand-body-xs nums-tabular text-secondary w-[94px] h-[17px]">{size}</p>
        </div>
        <button
          type="button"
          aria-label="更多"
          className="absolute bottom-[6px] right-[6px] inline-flex items-center justify-center w-[24px] h-[24px] text-secondary hover:text-primary"
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen((v) => !v)
          }}
        >
          ⋯
        </button>
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute bottom-[36px] right-[6px] z-10 w-[140px] rounded-[8px] bg-app border border-app shadow-card overflow-hidden"
            role="menu"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => { if (e.key === 'Escape') setMenuOpen(false) }}
          >
            <button className="block w-full text-left px-[10px] py-[8px] brand-body-xs text-primary hover:bg-app" onClick={handleRenameClick}>
              重命名
            </button>
            <button className="block w-full text-left px-[10px] py-[8px] brand-body-xs text-error hover:bg-app" onClick={() => { setMenuOpen(false); onDelete?.(id) }}>
              删除
            </button>
          </div>
        )}
      </div>
    </div>
  )
}