import { useEffect, useRef, useState } from 'react'

export function useScrollbar(elRef: React.RefObject<HTMLElement>, thumbHeight = 100) {
  const [bar, setBar] = useState<{ visible: boolean; active: boolean; h: number; top: number }>({ visible: false, active: false, h: 0, top: 0 })
  const resizeTimer = useRef<number | null>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const overflow = el.scrollHeight > el.clientHeight
    if (!overflow) { setBar(v => ({ ...v, visible: false })); return }
    const th = thumbHeight
    const track = el.clientHeight - th
    const tt = Math.floor((el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)) * track)
    setBar(v => ({ ...v, visible: true, h: th, top: isFinite(tt) ? tt : 0 }))
  }, [thumbHeight, elRef])

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const computeLocal = () => {
      const overflow = el.scrollHeight > el.clientHeight
      if (!overflow) { setBar(v => ({ ...v, visible: false })); return }
      const th = thumbHeight
      const track = el.clientHeight - th
      const tt = Math.floor((el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)) * track)
      setBar(v => ({ ...v, visible: true, h: th, top: isFinite(tt) ? tt : 0 }))
    }
    computeLocal()
    const onScroll = () => computeLocal()
    el.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(() => {
      if (resizeTimer.current) window.clearTimeout(resizeTimer.current)
      resizeTimer.current = window.setTimeout(computeLocal, 150)
    })
    ro.observe(el)
    return () => { el.removeEventListener('scroll', onScroll); ro.disconnect(); if (resizeTimer.current) window.clearTimeout(resizeTimer.current) }
  }, [elRef, thumbHeight])

  return { bar, setBar }
}

export function ScrollbarOverlay({ elRef, bar, setBar }: { elRef: React.RefObject<HTMLElement>; bar: { visible: boolean; active: boolean; h: number; top: number }; setBar: React.Dispatch<React.SetStateAction<{ visible: boolean; active: boolean; h: number; top: number }>> }) {
  const [rect, setRect] = useState<{ top: number; height: number }>({ top: 0, height: 0 })
  const hideTimer = useRef<number | null>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setRect({ top: Math.floor(r.top), height: Math.floor(r.height) })
  }, [elRef])

  if (!bar || !bar.visible || rect.height <= 0) return null
  return (
    <div className="fixed z-[50]" style={{ top: rect.top, right: 8, height: rect.height, width: 8, opacity: bar.active ? 1 : 0.3, transition: 'opacity 200ms ease' }}>
      <div className="relative h-full w-[8px] bg-transparent"
        onMouseEnter={() => setBar((s) => ({ ...s, active: true }))}
        onMouseLeave={() => { if (hideTimer.current) window.clearTimeout(hideTimer.current); hideTimer.current = window.setTimeout(() => setBar((s) => ({ ...s, active: false })), 2000) }}
        onPointerDown={(e) => {
          const el = elRef.current
          if (!el) return
          const rectEl = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
          const track = el.clientHeight - bar.h
          const top0 = Math.max(0, Math.min(track, (e.clientY - rectEl.top) - bar.h / 2))
          el.scrollTop = (top0 / Math.max(1, track)) * (el.scrollHeight - el.clientHeight)
          const onMove = (ev: PointerEvent) => {
            const top = Math.max(0, Math.min(track, (ev.clientY - rectEl.top) - bar.h / 2))
            el.scrollTop = (top / Math.max(1, track)) * (el.scrollHeight - el.clientHeight)
          }
          const onUp = () => {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
          }
          window.addEventListener('pointermove', onMove, { passive: true })
          window.addEventListener('pointerup', onUp, { passive: true })
        }}
      >
        <div className="absolute right-0 w-[8px] rounded-[4px]" style={{ height: bar.h, transform: `translateY(${bar.top}px)`, backgroundColor: 'var(--color-border)' }} />
      </div>
    </div>
  )
}