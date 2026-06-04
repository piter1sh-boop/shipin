import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'gray'
  icon?: ReactNode
}

const COLOR_MAP = {
  blue: 'text-blue-600 bg-blue-50',
  green: 'text-green-600 bg-green-50',
  orange: 'text-orange-600 bg-orange-50',
  purple: 'text-purple-600 bg-purple-50',
  gray: 'text-gray-600 bg-gray-50',
}

export function StatCard({ label, value, sub, color = 'blue', icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1">
      <div className="flex items-center gap-2">
        {icon && <span className={`p-1.5 rounded-lg ${COLOR_MAP[color]}`}>{icon}</span>}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}
