import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  action?: ReactNode
}

export function Card({ children, className = '', title, action }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  color?: 'violet' | 'green' | 'red' | 'blue' | 'yellow'
}

export function StatCard({ title, value, icon, color = 'violet' }: StatCardProps) {
  const colors = {
    violet: 'bg-emi-violet-light text-emi-violet',
    green: 'bg-emi-green-light text-emi-green',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  }
  const accents = {
    violet: 'border-l-emi-violet',
    green: 'border-l-emi-green',
    red: 'border-l-red-500',
    blue: 'border-l-blue-500',
    yellow: 'border-l-yellow-500',
  }
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${accents[color]} p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && <div className={`p-2.5 rounded-lg ${colors[color]}`}>{icon}</div>}
      </div>
    </div>
  )
}
