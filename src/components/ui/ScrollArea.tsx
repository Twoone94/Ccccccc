import { useEffect, useRef, useState } from 'react'

export default function ScrollArea({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState(false)
  const [thumbH, setThumbH] = useState(0)
  const [thumbTop, setThumbTop] = useState(0)
  const [rectTop, setRectTop] = useState(0)
  const [rectHeight, setRectHeight] = useState(0)
  const dragRef = useRef<{ startY: number; startTop: number } | null>(null)
  const hideTimer = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const resizeTimer = useRef<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const compute = () => {
      const ch = el.clientHeight
      const sh = el.scrollHeight
      const overflow = sh > ch
      setVisible(overflow)
      if (!overflow) return
      const rect = el.getBoundingClientRect()
      setRectTop(Math.floor(rect.top))
      setRectHeight(Math.floor(rect.height))
      const ratio = ch / sh
      const h = Math.max(40, Math.floor(ch * ratio))
      setThumbH(h)
      const track = (rect.height || ch) - h
      const t = Math.floor((el.scrollTop / (sh - ch)) * track)
      setThumbTop(isFinite(t) ? t : 0)
    }
    compute()
    const ro = new ResizeObserver(() => {
      if (resizeTimer.current) window.clearTimeout(resizeTimer.current)
      resizeTimer.current = window.setTimeout(compute, 200)
    })
    ro.observe(el)
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const ch = el.clientHeight
        const sh = el.scrollHeight
        const h = thumbH || Math.max(40, Math.floor(ch * (ch / sh)))
        const track = (rectHeight || ch) - h
        const t = Math.floor((el.scrollTop / (sh - ch)) * track)
        setThumbH(h)
        setThumbTop(isFinite(t) ? t : 0)
        setActive(true)
        if (hideTimer.current) window.clearTimeout(hideTimer.current)
        hideTimer.current = window.setTimeout(() => setActive(false), 2000)
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
      if (resizeTimer.current) window.clearTimeout(resizeTimer.current)
    }
  }, [rectHeight, thumbH])

  const onThumbDown = (e: React.MouseEvent) => {
    dragRef.current = { startY: e.clientY, startTop: thumbTop }
    setActive(true)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    const onMove = (ev: MouseEvent) => {
      const el = ref.current
      if (!el || !dragRef.current) return
      const ch = el.clientHeight
      const sh = el.scrollHeight
      const track = (rectHeight || ch) - thumbH
      const delta = ev.clientY - dragRef.current.startY
      const nextTop = Math.min(Math.max(0, dragRef.current.startTop + delta), track)
      const scrollRange = sh - ch
      const nextScroll = Math.floor((nextTop / track) * scrollRange)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        el.scrollTop = nextScroll
      })
    }
    const onUp = () => {
      dragRef.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      hideTimer.current = window.setTimeout(() => setActive(false), 2000)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div ref={ref} className={(className ? className + ' ' : '') + 'relative overflow-auto no-scrollbar'}>
      {children}
      {visible && rectHeight > 0 && (
        <div className="fixed z-[50]" style={{ top: rectTop, right: 8, height: rectHeight, width: 8, opacity: active ? 1 : 0.3, transition: 'opacity 200ms ease' }}>
          <div
            className="relative h-full w-[8px] bg-transparent"
            role="button"
            tabIndex={0}
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => (hideTimer.current = window.setTimeout(() => setActive(false), 2000))}
          >
            <div
              className="absolute right-0 w-[8px] rounded-[4px]"
              style={{ height: thumbH, transform: `translateY(${thumbTop}px)`, backgroundColor: 'var(--color-border)' }}
              role="button"
              tabIndex={0}
              onMouseDown={onThumbDown}
            />
          </div>
        </div>
      )}
    </div>
  )
}