import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emi-violet/60 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary:
      'bg-emi-violet text-white hover:bg-emi-violet-dark active:scale-[.98] shadow-sm shadow-emi-violet/20 hover:shadow-emi-violet/30',
    secondary:
      'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 active:scale-[.98] dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:scale-[.98] shadow-sm shadow-red-600/20',
    ghost:
      'bg-transparent text-zinc-600 hover:bg-zinc-100 active:scale-[.98] dark:text-zinc-400 dark:hover:bg-zinc-800',
    outline:
      'bg-transparent border border-zinc-200 text-zinc-700 hover:bg-zinc-50 active:scale-[.98] dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}
