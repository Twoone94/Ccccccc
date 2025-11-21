import React, { useEffect, useRef, useState } from 'react'

export default function SplitColumns({
  children,
  initialMiddle = 628,
  minColumn = 100,
  gap = 8,
  desktopMinWidth = 1280,
  collapseLeft = false,
  showHandles = false,
}: {
  children: [React.ReactNode, React.ReactNode, React.ReactNode]
  initialMiddle?: number
  minColumn?: number
  gap?: number
  desktopMinWidth?: number
  collapseLeft?: boolean
  showHandles?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pane, setPane] = useState({ left: 0, middle: initialMiddle, right: 0 })
  const [isDesktop, setIsDesktop] = useState(false)
  const [dragging, setDragging] = useState<null | 'l' | 'r'>(null)
  const dragRef = useRef<{ type: 'l' | 'r'; startX: number; snapshot: { left: number; middle: number; right: number }; trackW: number } | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const init = () => {
      const w = el.clientWidth
      const track = Math.max(0, w - gap * 2)
      const mid = Math.max(minColumn, Math.min(initialMiddle, track - minColumn * 2))
      const rest = track - mid
      const left = Math.max(minColumn, Math.floor(rest / 2))
      const right = Math.max(minColumn, rest - left)
      setPane({ left, middle: mid, right })
      setIsDesktop(window.matchMedia(`(min-width: ${desktopMinWidth}px)`).matches)
    }
    init()
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      const track = Math.max(0, w - (collapseLeft ? gap : gap * 2))
      setPane(prev => {
        if (collapseLeft) {
          const totalMR = prev.middle + prev.right
          const ratioM = totalMR ? prev.middle / totalMR : 0.5
          const middle = Math.max(minColumn, Math.round(track * ratioM))
          const right = Math.max(minColumn, track - middle)
          return { left: 0, middle, right }
        } else {
          const totalLR = prev.left + prev.right
          const ratioL = totalLR ? prev.left / totalLR : 0.5
          const mid = Math.max(minColumn, Math.min(prev.middle, track - minColumn * 2))
          const rest = track - mid
          const left = Math.max(minColumn, Math.round(rest * ratioL))
          const right = Math.max(minColumn, rest - left)
          return { left, middle: mid, right }
        }
      })
      setIsDesktop(window.matchMedia(`(min-width: ${desktopMinWidth}px)`).matches)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [initialMiddle, minColumn, gap, desktopMinWidth, collapseLeft])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (collapseLeft) {
      const w = el.clientWidth
      const track = Math.max(0, w - gap)
      const half = Math.max(minColumn, Math.floor(track / 2))
      const other = Math.max(minColumn, track - half)
      setPane({ left: 0, middle: half, right: other })
    }
  }, [collapseLeft, gap, minColumn])

  const startDrag = (type: 'l' | 'r', x0: number) => {
    const el = ref.current
    if (!el) return
    const w = el.clientWidth
    const track = Math.max(0, w - (collapseLeft ? gap : gap * 2))
    dragRef.current = { type, startX: x0, snapshot: { ...pane }, trackW: track }
    setDragging(type)
    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current
      if (!d) return
      const dx = ev.clientX - d.startX
      if (d.type === 'l') {
        let left = d.snapshot.left + dx
        let middle = d.snapshot.middle - dx
        const snap = 12
        if (Math.abs(left - minColumn) <= snap) left = minColumn
        if (Math.abs(middle - minColumn) <= snap) middle = minColumn
        left = Math.max(minColumn, Math.min(left, d.trackW - minColumn - d.snapshot.right))
        middle = d.trackW - d.snapshot.right - left
        middle = Math.max(minColumn, middle)
        setPane({ left, middle, right: d.snapshot.right })
      } else {
        let middle = d.snapshot.middle + dx
        let right = d.snapshot.right - dx
        const snap = 12
        if (Math.abs(middle - minColumn) <= snap) middle = minColumn
        if (Math.abs(right - minColumn) <= snap) right = minColumn
        middle = Math.max(minColumn, Math.min(middle, d.trackW - minColumn - d.snapshot.left))
        right = d.trackW - d.snapshot.left - middle
        right = Math.max(minColumn, right)
        setPane({ left: d.snapshot.left, middle, right })
      }
    }
    const end = () => {
      setDragging(null)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', end)
      window.dispatchEvent(new Event('resize'))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', end, { passive: true })
  }

  const [left, middle, right] = children

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-[8px] h-full relative"
      style={isDesktop ? (
        collapseLeft
          ? { gridTemplateColumns: `${pane.middle}px ${pane.right}px`, transition: dragging ? 'none' : 'grid-template-columns 200ms ease' }
          : { gridTemplateColumns: `${pane.left}px ${pane.middle}px ${pane.right}px`, transition: dragging ? 'none' : 'grid-template-columns 200ms ease' }
      ) : undefined}
    >
      <section className="min-h-0" style={{ minWidth: collapseLeft ? 0 : minColumn, display: collapseLeft ? 'none' : undefined }}>{left}</section>
      <section className="min-h-0" style={{ minWidth: minColumn }}>{middle}</section>
      <aside className="min-h-0" style={{ minWidth: minColumn }}>{right}</aside>
      {showHandles && isDesktop && !collapseLeft && (
        <div
          className="absolute z-[50] top-0 bottom-0 w-[8px] cursor-col-resize"
          style={{ left: pane.left, width: gap }}
          onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => startDrag('l', e.clientX)}
        />
      )}
      {showHandles && isDesktop && (
        <div
          className="absolute z-[50] top-0 bottom-0 w-[8px] cursor-col-resize"
          style={{ left: collapseLeft ? pane.middle : (pane.left + gap + pane.middle), width: gap }}
          onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => startDrag('r', e.clientX)}
        />
      )}
    </div>
  )
}