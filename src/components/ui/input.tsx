import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm",
        "text-foreground placeholder:text-muted-foreground",
        // Transitions
        "transition-all duration-200",
        // Focus states
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-ring",
        // Hover state
        "hover:border-ring/50",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        // Invalid/Error state
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "focus-visible:aria-invalid:ring-destructive/30 focus-visible:aria-invalid:border-destructive",
        // File input styles
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Selection styles
        "selection:bg-primary selection:text-primary-foreground",
        // Dark mode adjustments
        "dark:bg-input/50 dark:hover:bg-input/70 dark:focus-visible:bg-input/70",
        className
      )}
      {...props}
    />
  )
}

export { Input }
