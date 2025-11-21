import * as React from 'react'
import { cn } from '../../../lib/utils'

type Variant = 'default' | 'secondary' | 'destructive' | 'outline'

export function Badge({ className, variant = 'default', ...props }: React.ComponentProps<'span'> & { variant?: Variant }) {
  const map: Record<Variant, string> = {
    default: 'bg-surface text-primary border-transparent',
    secondary: 'bg-surface text-secondary border-transparent',
    destructive: 'bg-error-subtle text-error border-transparent',
    outline: 'bg-transparent text-primary border border-app',
  }
  return (
    <span
      data-slot="badge"
      className={cn('inline-flex items-center justify-center rounded-full px-2 py-0.5 brand-label-xs font-medium', map[variant], className)}
      {...props}
    />
  )
}