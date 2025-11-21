import * as DialogPrimitive from '@radix-ui/react-dialog'
import React from 'react'

export default function Modal({ open, onClose, children, title, description, showHeader = true, scrollable = true, size = 'md', closeOnOverlayClick = true, hideScrollbar = true }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string; description?: string; showHeader?: boolean; scrollable?: boolean; size?: 'sm' | 'md' | 'lg'; closeOnOverlayClick?: boolean; hideScrollbar?: boolean }) {
  const w = size === 'sm' ? 'w-[480px]' : size === 'lg' ? 'w-[840px]' : 'w-[640px]'
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content onInteractOutside={closeOnOverlayClick ? undefined : (e) => e.preventDefault()} className={`fixed left-1/2 top-1/2 z-[101] ${w} max-w-[96vw] -translate-x-1/2 -translate-y-1/2 rounded-[12px] border border-app bg-surface shadow-dialog focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0`}>
          {showHeader && (
            <div className="flex items-start justify-between border-b border-app px-[16px] py-[12px]">
              <div className="flex flex-col gap-[4px]">
                <DialogPrimitive.Title className="text-primary brand-title-md font-semibold">{title || '预览'}</DialogPrimitive.Title>
                {description && <DialogPrimitive.Description className="text-secondary brand-body-xs">{description}</DialogPrimitive.Description>}
              </div>
              <DialogPrimitive.Close asChild>
                <button type="button" aria-label="关闭" className="inline-flex items-center justify-center rounded-sm p-[5px] text-secondary hover:bg-app">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </DialogPrimitive.Close>
            </div>
          )}
          <div className={(scrollable ? `p-[16px] max-h-[80vh] overflow-y-auto${hideScrollbar ? ' no-scrollbar' : ''}` : `p-[16px] max-h-[80vh] overflow-hidden${hideScrollbar ? ' no-scrollbar' : ''}`) + ' brand-body-md text-primary'}>
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}