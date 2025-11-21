import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from './dialog'

interface DialogShellProps {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  contentClassName?: string
  bodyClassName?: string
  hideClose?: boolean
  headerRight?: ReactNode
}

export function DialogShell({
  title,
  description,
  children,
  footer,
  contentClassName,
  bodyClassName,
  hideClose = false,
  headerRight,
}: DialogShellProps) {
  return (
    <DialogContent className={cn('sm:max-w-[720px] space-y-6 p-6 sm:p-7', contentClassName)}>
      <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
        <div className="space-y-1">
          <DialogTitle className="text-lg font-semibold leading-tight text-primary">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-secondary">{description}</DialogDescription>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
          {!hideClose && (
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-secondary hover:text-primary"
                aria-label="关闭弹窗"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          )}
        </div>
      </div>

      <div className={cn('space-y-4', bodyClassName)}>{children}</div>

      {footer ? (
        <DialogFooter className="border-t border-border pt-4">{footer}</DialogFooter>
      ) : null}
    </DialogContent>
  )
}

export default DialogShell
