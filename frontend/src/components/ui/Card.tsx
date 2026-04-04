import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  action?: ReactNode
  noPadding?: boolean
}

export function Card({ children, className = '', title, action, noPadding = false }: CardProps) {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          {title && <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>}
          {action}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  color?: 'violet' | 'green' | 'red' | 'blue' | 'amber'
  trend?: { value: number; label?: string }
  subtitle?: string
}

export function StatCard({ title, value, icon, color = 'violet', trend, subtitle }: StatCardProps) {
  const iconColors = {
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
    green:  'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    red:    'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
    blue:   'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
    amber:  'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{title}</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-none truncate">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-zinc-400">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {trend.value >= 0
                  ? <path d="M18 15l-6-6-6 6" />
                  : <path d="M6 9l6 6 6-6" />
                }
              </svg>
              {Math.abs(trend.value)}%{trend.label && ` ${trend.label}`}
            </div>
          )}
        </div>
        {icon && (
          <div className={`shrink-0 p-2.5 rounded-xl ${iconColors[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
