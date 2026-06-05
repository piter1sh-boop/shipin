import { useState, useEffect } from 'react'
import { Card, Badge } from '../components/ui'

interface UserData {
  userId: string
  name: string | null
  email: string | null
  productIdea: string | null
  targetUser: string | null
  currentStage: string | null
  aiSummary: string | null
  traits: Record<string, string>
  behavior_patterns: {
    avg_task_complete_rate?: number
    preferred_task_types?: string[]
    weakest_task_types?: string[]
    [key: string]: unknown
  }
  taskStats: {
    totalTasks: number
    completedTasks: number
    skippedTasks: number
  }
  interviewCount: number
  leadCount: number
  personaUpdatedAt: string | null
}

interface EvolutionLog {
  id: string
  event_type: string
  description: string
  trigger: string
  metric_change: string
  created_at: string
}

const STAGE_LABELS: Record<string, string> = {
  positioning: '定位', validation: '验证', mvp: 'MVP', sales: '销售', review: '复盘',
}

const RISK_COLOR = { low: 'text-green-600', medium: 'text-orange-600', high: 'text-red-600' }

function calculateRisk(user: UserData): 'low' | 'medium' | 'high' {
  const rate = user.behavior_patterns?.avg_task_complete_rate || 0
  if (rate >= 0.7) return 'low'
  if (rate >= 0.4) return 'medium'
  return 'high'
}

function getRiskWarning(user: UserData): string {
  const rate = user.behavior_patterns?.avg_task_complete_rate
  if (rate === undefined) return '暂无数据'
  if (rate < 0.3) return '任务完成率过低，建议调整任务难度'
  if (rate < 0.5) return '完成率偏低，注意推动执行'
  if (user.interviewCount === 0) return '尚未开始访谈'
  if (user.leadCount === 0) return '暂无线索，注意收集'
  return '进度正常'
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [logs, setLogs] = useState<EvolutionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'users' | 'evolution'>('users')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [usersRes, logsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/evolution-logs'),
      ])
      const usersData = await usersRes.json()
      const logsData = await logsRes.json()
      setUsers(usersData.users || [])
      setLogs(logsData.logs || [])
    } catch (e) {
      console.error('Failed to fetch admin data:', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">管理后台</h1>
          <p className="text-sm text-gray-500">{users.length}个用户</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('users')}
            className={`px-3 py-1 rounded text-sm ${tab === 'users' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          >
            用户列表
          </button>
          <button
            onClick={() => setTab('evolution')}
            className={`px-3 py-1 rounded text-sm ${tab === 'evolution' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          >
            进化日志 {logs.length > 0 && <span className="ml-1 text-xs bg-red-500 text-white px-1.5 rounded">{logs.length}</span>}
          </button>
        </div>
      </div>

      {tab === 'users' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.length === 0 ? (
            <p className="text-gray-500 col-span-2">暂无用户数据</p>
          ) : (
            users.map(user => {
              const risk = calculateRisk(user)
              const rate = user.behavior_patterns?.avg_task_complete_rate
              return (
                <Card key={user.userId} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{user.name || '未命名用户'}</span>
                    <Badge>{STAGE_LABELS[user.currentStage || 'positioning'] || '未知'}</Badge>
                  </div>

                  {user.productIdea && (
                    <p className="text-xs text-gray-600 line-clamp-1">{user.productIdea}</p>
                  )}

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">任务完成率</span>
                      <span className={rate !== undefined ? (rate >= 0.5 ? 'text-green-600' : 'text-orange-600') : 'text-gray-400'}>
                        {rate !== undefined ? `${(rate * 100).toFixed(0)}%` : '无数据'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">任务进度</span>
                      <span className="text-gray-700">{user.taskStats?.completedTasks || 0}/{user.taskStats?.totalTasks || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">访谈数</span>
                      <span className="text-gray-700">{user.interviewCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">线索数</span>
                      <span className="text-gray-700">{user.leadCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">风险等级</span>
                      <span className={`font-medium ${RISK_COLOR[risk]}`}>{risk}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 border-t border-gray-100 pt-2">{getRiskWarning(user)}</p>
                </Card>
              )
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <p className="text-gray-500">暂无进化日志</p>
          ) : (
            logs.map(log => (
              <Card key={log.id} className="text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        log.event_type === 'hit_rate_low' ? 'bg-red-100 text-red-700' :
                        log.event_type === 'persona_drift' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {log.event_type === 'hit_rate_low' ? '命中率低' :
                         log.event_type === 'persona_drift' ? '画像漂移' : log.event_type}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 mt-1">{log.description}</p>
                    {log.metric_change && (
                      <p className="text-xs text-gray-500 mt-1">指标: {log.metric_change}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
