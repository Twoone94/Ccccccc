"use client"
import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../../lib/utils'

export function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col gap-2', className)} {...props} />
}

export function TabsList({ className, variant = 'capsule', ...props }: React.ComponentProps<typeof TabsPrimitive.List> & { variant?: 'capsule' | 'underline' }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        variant === 'underline'
          ? 'inline-flex h-9 w-fit items-center justify-center gap-2'
          : 'bg-surface inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]'
        , className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, variant = 'capsule', ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger> & { variant?: 'capsule' | 'underline' }) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        variant === 'underline'
          ? 'inline-flex items-center justify-center gap-1.5 border-b-2 border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none text-secondary hover:text-primary data-[state=active]:text-primary data-[state=active]:border-b-[var(--color-primary-default)] rounded-none'
          : 'inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none data-[state=active]:bg-app data-[state=active]:text-primary text-secondary'
        , className
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn('flex-1 outline-none', className)} {...props} />
}