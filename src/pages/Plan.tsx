import { useState } from 'react'
import { useStore } from '../store'
import { Card, Badge, TaskTypeBadge } from '../components/ui'

const WEEK_LABELS = ['第1周：定位和用户访谈', '第2周：落地页和MVP原型', '第3周：真实测试和线索获取', '第4周：复盘与下一阶段']

export default function PlanPage() {
  const dailyTasks = useStore(s => s.dailyTasks)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1)

  const tasksByWeek = [1, 2, 3, 4].map(week => {
    const dayStart = (week - 1) * 7 + 1
    const dayEnd = week * 7
    return {
      week,
      label: WEEK_LABELS[week - 1],
      tasks: dailyTasks.filter(t => t.dayNumber >= dayStart && t.dayNumber <= dayEnd),
    }
  })

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">30天执行计划</h1>
        <p className="text-sm text-gray-500">点击每周展开查看每日任务详情</p>
      </div>

      {tasksByWeek.map(({ week, label, tasks }) => (
        <Card key={week} className="overflow-hidden">
          <button
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            onClick={() => setExpandedWeek(expandedWeek === week ? null : week)}
          >
            <div className="flex items-center gap-3">
              <Badge>{week}</Badge>
              <span className="font-medium text-gray-900">{label}</span>
            </div>
            <span className="text-gray-400 text-sm">
              {tasks.length > 0 ? `${tasks.filter(t => t.status === 'completed').length}/${tasks.length} 完成` : '无任务'}
            </span>
          </button>

          {expandedWeek === week && (
            <div className="border-t border-gray-100">
              {tasks.length === 0 ? (
                <p className="px-5 py-3 text-sm text-gray-400">完成Onboarding后生成计划</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {tasks.map(task => (
                    <div key={task.id} className="px-5 py-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <TaskTypeBadge type={task.taskType} />
                        <span className="text-sm font-medium text-gray-800">Day{task.dayNumber}：{task.title}</span>
                        {task.status === 'completed' && <span className="text-green-500 text-xs">✓</span>}
                      </div>
                      <p className="text-xs text-gray-500">{task.description}</p>
                      <p className="text-xs text-gray-400">成功标准：{task.successCriteria}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
