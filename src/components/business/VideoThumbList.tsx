import React from 'react'

export default function VideoThumbList({
  setContainerRef,
  options,
  bar,
  setBarActive,
  onScroll,
  onWheel,
  thumbWidth,
  dataKey,
  selected: _selected,
  onSelect,
}: {
  setContainerRef: (el: HTMLDivElement | null) => void
  options: (string | null)[]
  bar?: { visible: boolean; active: boolean; h: number; top: number }
  setBarActive: (active: boolean) => void
  onScroll: () => void
  onWheel: (e: React.WheelEvent) => void
  thumbWidth?: number
  dataKey: number
  selected?: string | null
  onSelect?: (value: string | null, idx: number) => void
}) {
  const hasMany = options.length > 1
  return (
    <div className="basis-[20%] min-w-[180px] h-full px-3 py-2 border-r border-app relative">
      <div
        ref={setContainerRef}
        data-vsel={dataKey}
        className={hasMany ? 'h-full w-full overflow-y-auto no-scrollbar overscroll-contain' : 'h-full w-full flex items-center justify-center'}
        onScroll={onScroll}
        onWheel={onWheel}
      >
        <div className={hasMany ? 'flex flex-col items-center gap-2 py-1 w-full px-1' : 'w-full px-1'}>
          {options.filter(v => v !== null).map((v, idx) => (
            <div
              key={idx}
              className={'bg-black rounded mx-auto cursor-pointer'}
              style={{ width: thumbWidth ? `${thumbWidth}px` : '100%', maxWidth: 'calc(100% - 8px)', aspectRatio: '16 / 9' }}
              onClick={() => onSelect?.(v ?? null, idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect?.(v ?? null, idx) }}
            />
          ))}
        </div>
      </div>
      {bar && bar.visible && (
        <div
          className="absolute right-[2px] top-[2px] bottom-[2px]"
          style={{ width: 4 }}
          onMouseEnter={() => setBarActive(true)}
          onMouseLeave={() => setBarActive(false)}
          onPointerDown={(e) => {
            const el = (e.currentTarget.parentElement?.querySelector('[data-vsel]') as HTMLDivElement) || null
            if (!el || !bar) return
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
            const track = el.clientHeight - bar.h
            const top0 = Math.max(0, Math.min(track, (e.clientY - rect.top) - bar.h / 2))
            el.scrollTop = (top0 / Math.max(1, track)) * (el.scrollHeight - el.clientHeight)
            const onMove = (ev: PointerEvent) => {
              const top = Math.max(0, Math.min(track, (ev.clientY - rect.top) - bar.h / 2))
              el.scrollTop = (top / Math.max(1, track)) * (el.scrollHeight - el.clientHeight)
            }
            const onUp = () => {
              window.removeEventListener('pointermove', onMove)
              window.removeEventListener('pointerup', onUp)
            }
            window.addEventListener('pointermove', onMove, { passive: true })
            window.addEventListener('pointerup', onUp, { passive: true })
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            const el = (e.currentTarget.parentElement?.querySelector('[data-vsel]') as HTMLDivElement) || null
            if (!el || !bar) return
            if (e.key === 'Home') el.scrollTop = 0
            if (e.key === 'End') el.scrollTop = el.scrollHeight - el.clientHeight
          }}
        >
          <div className="relative h-full w-[4px]">
            <div className="absolute right-0 w-[4px] rounded-[2px]" style={{ height: bar.h, transform: `translateY(${bar.top}px)`, backgroundColor: 'var(--color-border)', opacity: bar.active ? 0.6 : 0.4 }} />
          </div>
        </div>
      )}
    </div>
  )
}