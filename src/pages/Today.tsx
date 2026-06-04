import { useState } from 'react'
import { useStore } from '../store'
import { Card, Button, Textarea, TaskTypeBadge } from '../components/ui'

export default function TodayPage() {
  const { getTodayTasks, completeTask, submitCheckin } = useStore()
  const todayTasks = getTodayTasks()
  const todayStr = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })

  const today = new Date().toISOString().split('T')[0]

  const [checkin, setCheckin] = useState({
    taskDate: today,
    completedText: '',
    blockedText: '',
    interviewCount: 0,
    leadCount: 0,
    valueScore: 3,
    energyScore: 3,
  })
  const [submitted, setSubmitted] = useState(false)

  function handleComplete(taskId: string) {
    completeTask(taskId)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await submitCheckin(checkin)
    setSubmitted(true)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">今日执行</h1>
        <p className="text-sm text-gray-500">{todayStr}</p>
      </div>

      {/* Tasks */}
      <Card title="今日任务">
        {todayTasks.length === 0 ? (
          <p className="text-gray-400 text-sm">今日暂无任务，请在Dashboard查看。</p>
        ) : (
          <div className="space-y-3">
            {todayTasks.map(task => (
              <div key={task.id} className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <TaskTypeBadge type={task.taskType} />
                  <span className="font-medium text-gray-900">{task.title}</span>
                </div>
                <p className="text-sm text-gray-600">{task.description}</p>
                <p className="text-xs text-gray-400">
                  完成标准：{task.successCriteria}
                </p>
                <Button
                  variant={task.status === 'completed' ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleComplete(task.id)}
                >
                  {task.status === 'completed' ? '✓ 已完成' : '标记完成'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Check-in */}
      <Card title="今日打卡">
        {submitted ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-green-600 font-medium">✓ 今日打卡完成</p>
            <p className="text-sm text-gray-500">明天继续加油，保持执行节奏。</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              label="今天完成了什么？"
              placeholder="列出你完成的任务，用数字量化"
              rows={2}
              value={checkin.completedText}
              onChange={e => setCheckin(p => ({ ...p, completedText: e.target.value }))}
              required
            />

            <Textarea
              label="没完成什么？为什么？"
              placeholder="分析未完成的原因，是否有卡点"
              rows={2}
              value={checkin.blockedText}
              onChange={e => setCheckin(p => ({ ...p, blockedText: e.target.value }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">今日访谈次数</label>
                <input
                  type="number"
                  min={0}
                  value={checkin.interviewCount}
                  onChange={e => setCheckin(p => ({ ...p, interviewCount: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">获得线索条数</label>
                <input
                  type="number"
                  min={0}
                  value={checkin.leadCount}
                  onChange={e => setCheckin(p => ({ ...p, leadCount: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">今日价值评分（1-5）</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCheckin(p => ({ ...p, valueScore: n }))}
                      className={`w-8 h-8 rounded text-sm font-medium ${
                        checkin.valueScore >= n
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">今日精力评分（1-5）</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCheckin(p => ({ ...p, energyScore: n }))}
                      className={`w-8 h-8 rounded text-sm font-medium ${
                        checkin.energyScore >= n
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              提交今日打卡
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
