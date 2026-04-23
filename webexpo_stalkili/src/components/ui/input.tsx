import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-white/10 bg-white/5 px-3 py-1 text-sm text-white placeholder:text-gray-600 shadow-xs transition-colors outline-none",
        "focus-visible:border-orange-500/50 focus-visible:ring-2 focus-visible:ring-orange-500/20",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
