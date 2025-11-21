import React from 'react'

type MessageType = 'success' | 'warning' | 'error' | 'info'

export default function MessageBar({ type = 'info', title, children, className }: { type?: MessageType; title?: string; children?: React.ReactNode; className?: string }) {
  const bg = type === 'success' ? 'bg-success-subtle' : type === 'warning' ? 'bg-warning-subtle' : type === 'error' ? 'bg-error-subtle' : 'bg-info-subtle'
  const text = type === 'success' ? 'text-success' : type === 'warning' ? 'text-warning' : type === 'error' ? 'text-error' : 'text-info'
  const stripe = type === 'success' ? 'bg-success-subtle' : type === 'warning' ? 'bg-warning-subtle' : type === 'error' ? 'bg-error-subtle' : 'bg-info-subtle'
  return (
    <div className={`relative pl-[12px] pr-[12px] py-[8px] rounded-[8px] ${bg} ${text} ${className || ''}`}>
      <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${stripe}`} />
      {title && <div className="brand-title-sm font-medium">{title}</div>}
      {children && <div className="brand-body-xs">{children}</div>}
    </div>
  )
}