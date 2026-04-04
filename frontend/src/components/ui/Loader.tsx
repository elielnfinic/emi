export function Loader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-zinc-200 dark:border-zinc-700" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emi-violet animate-spin" />
      </div>
    </div>
  )
}

export function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div className={`h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
      <SkeletonLine className="w-1/3 h-3" />
      <SkeletonLine className="w-2/3 h-7" />
      <SkeletonLine className="w-1/4 h-3" />
    </div>
  )
}
