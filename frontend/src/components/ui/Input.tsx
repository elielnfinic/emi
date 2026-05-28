import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2.5 rounded-lg text-sm border transition-all duration-150
          bg-white dark:bg-zinc-900
          text-zinc-900 dark:text-zinc-100
          placeholder-zinc-400 dark:placeholder-zinc-600
          focus:outline-none focus:ring-2 focus:ring-emi-violet/30 focus:border-emi-violet
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 dark:border-red-500' : 'border-zinc-200 dark:border-zinc-700'}
          ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-zinc-400">{hint}</p>}
    </div>
  )
}
