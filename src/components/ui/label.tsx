"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        // Base styles
        "text-sm font-medium leading-none",
        "text-foreground",
        // Layout
        "flex items-center gap-2",
        // Interaction
        "select-none cursor-default",
        // Transitions
        "transition-colors duration-200",
        // Disabled states
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        // Error state (when used with forms)
        "data-[error=true]:text-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Label }
