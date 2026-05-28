interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'violet'
  children: string
  dot?: boolean
  className?: string
}

export function Badge({ variant = 'default', children, dot = false, className }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
    danger:  'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400',
    info:    'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400',
    violet:  'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400',
    default: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  }
  const dots = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger:  'bg-red-500',
    info:    'bg-sky-500',
    violet:  'bg-violet-500',
    default: 'bg-zinc-400',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}${className ? ` ${className}` : ''}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dots[variant]}`} />}
      {children}
    </span>
  )
}
