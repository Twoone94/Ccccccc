import * as React from 'react'
import { cn } from '../../../lib/utils'

export function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'placeholder:text-secondary h-9 w-full min-w-0 rounded-md border border-app bg-transparent px-3 py-1 text-sm text-primary shadow-xs outline-none focus:border-[var(--color-primary-default)] focus:ring-[3px] focus:ring-[rgba(0,120,212,0.25)]',
        className
      )}
      {...props}
    />
  )
}