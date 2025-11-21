import React from 'react'

export default function Toolbar({ children, className, dragRegion }: { children: React.ReactNode; className?: string; dragRegion?: boolean }) {
  const slots = Array.isArray(children) ? children : [children]
  return (
    <div className={(className ? className + ' ' : '') + 'w-full grid grid-cols-[auto_1fr_auto] items-center border-b border-app bg-app h-[48px] px-[16px] py-[6px]'} style={dragRegion ? ({ WebkitAppRegion: 'drag' } as React.CSSProperties) : undefined}>
      <div className="flex items-center gap-[8px]" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {slots[0]}
      </div>
      <div className="flex items-center min-w-0" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <div className="w-full truncate">{slots[1]}</div>
      </div>
      <div className="inline-flex items-center gap-[4px] h-[36px] justify-end justify-self-end" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {slots[2]}
      </div>
    </div>
  )
}