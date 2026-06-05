import type { TaskType, LeadStatus } from '../../types'

const TASK_COLORS: Record<TaskType, string> = {
  positioning: 'bg-blue-100 text-blue-700',
  interview: 'bg-green-100 text-green-700',
  landing_page: 'bg-orange-100 text-orange-700',
  prototype: 'bg-purple-100 text-purple-700',
  sales: 'bg-pink-100 text-pink-700',
  review: 'bg-gray-100 text-gray-700',
}

const LEAD_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  trial: 'bg-purple-100 text-purple-700',
  paying: 'bg-green-100 text-green-700',
  churned: 'bg-red-100 text-red-700',
}

const TASK_LABELS: Record<TaskType, string> = {
  positioning: '定位',
  interview: '访谈',
  landing_page: '落地页',
  prototype: '原型',
  sales: '销售',
  review: '复盘',
}

const LEAD_LABELS: Record<LeadStatus, string> = {
  new: '新线索',
  contacted: '已沟通',
  trial: '试用中',
  paying: '愿意付费',
  churned: '流失',
}

interface BadgeProps {
  variant?: 'default' | 'purple' | TaskType | LeadStatus
  children?: React.ReactNode
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  const classes =
    variant === 'default'
      ? 'bg-gray-100 text-gray-700'
      : variant === 'purple'
      ? 'bg-purple-100 text-purple-700'
      : variant in TASK_COLORS
      ? TASK_COLORS[variant as TaskType]
      : variant in LEAD_COLORS
      ? LEAD_COLORS[variant as LeadStatus]
      : 'bg-gray-100 text-gray-700'

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {children}
    </span>
  )
}

export function TaskTypeBadge({ type }: { type: TaskType }) {
  return <Badge variant={type}>{TASK_LABELS[type]}</Badge>
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant={status}>{LEAD_LABELS[status]}</Badge>
}
