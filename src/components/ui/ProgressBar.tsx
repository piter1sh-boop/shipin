interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showLabel?: boolean
}

export function ProgressBar({ value, max = 100, label, showLabel = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        {label && <span className="text-sm text-gray-600">{label}</span>}
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            {value} / {max}
          </span>
        )}
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

interface DayProgressProps {
  currentDay: number
  totalDays?: number
}

export function DayProgress({ currentDay, totalDays = 30 }: DayProgressProps) {
  const pct = Math.min(100, Math.round((currentDay / totalDays) * 100))

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">30天进度</span>
        <span className="text-gray-500">
          第 {currentDay} 天 / 共 {totalDays} 天
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 text-right">{pct}%</p>
    </div>
  )
}
