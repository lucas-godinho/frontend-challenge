import type * as React from "react"
import { cn } from "@/lib/cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("block animate-[skeleton-shimmer_1.8s_ease-in-out_infinite] bg-[linear-gradient(100deg,var(--muted)_20%,rgb(210_138_76_/_18%)_50%,var(--muted)_80%)] bg-[length:200%_100%] motion-reduce:animate-none", className)}
      {...props}
    />
  )
}

export { Skeleton }
