import { useStore } from '../store'
import { usePageTracking } from '../hooks/useBehaviorTracking'
import { Card, DayProgress, StatCard, Badge, TaskTypeBadge, Button } from '../components/ui'
import { MessageSquare, AlertTriangle } from 'lucide-react'

function getDynamicRiskWarning(
  persona: { avgTaskCompleteRate: number; strengths: string[]; weaknesses: string[] } | null,
  checkins: { valueScore: number }[]
): string | null {
  if (!persona) return null;

  if (persona.avgTaskCompleteRate < 50) {
    return '你最近任务完成率偏低，建议先减少任务数量，确保完成质量。';
  }
  if (persona.strengths?.includes('coding') && !persona.strengths?.includes('sales')) {
    return '你擅长技术，但用户访谈和销售是验证的关键。不要只做产品。';
  }
  if (checkins.slice(-3).every(c => c.valueScore < 3)) {
    return '连续几天价值评分较低，考虑是否方向出了问题，或者任务太难。';
  }
  return null;
}

export default function DashboardPage() {
  usePageTracking('dashboard')
  const startupProfile = useStore(s => s.startupProfile)
  const dailyTasks = useStore(s => s.dailyTasks)
  const interviews = useStore(s => s.interviews)
  const leads = useStore(s => s.leads)
  const checkins = useStore(s => s.checkins)
  const completeTask = useStore(s => s.completeTask)
  const submitCheckin = useStore(s => s.submitCheckin)

  const dynamicWarning = getDynamicRiskWarning(null, checkins)

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = dailyTasks.filter(t => t.taskDate === today)
  const completedCount = dailyTasks.filter(t => t.status === 'completed').length
  const currentDay = Math.min(30, Math.max(1, checkins.length + 1))
  const hasLandingPage = interviews.length >= 3
  const hasPrototype = completedCount >= 10

  const STAGE_LABELS: Record<string, string> = {
    positioning: '定位', validation: '验证', mvp: 'MVP', sales: '销售', review: '复盘',
  }

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">主驾驶舱</h1>
          <p className="text-sm text-gray-500 mt-0.5">{startupProfile?.productIdea || '你的创业想法'}</p>
        </div>
        {startupProfile && (
          <Badge>{STAGE_LABELS[startupProfile.currentStage] || '定位'}</Badge>
        )}
      </div>

      <Card>
        <DayProgress currentDay={currentDay} />
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="已完成任务" value={completedCount} sub={`${dailyTasks.length > 0 ? Math.round((completedCount / dailyTasks.length) * 100) : 0}% 完成率`} color="blue" />
        <StatCard label="用户访谈" value={interviews.length} sub="目标20次" color="green" />
        <StatCard label="潜在线索" value={leads.length} sub="目标3条" color="orange" />
        <StatCard label="MVP状态" value={hasPrototype ? '可演示' : '进行中'} sub={hasLandingPage ? '落地页已上线' : '落地页待完成'} color={hasPrototype ? 'green' : 'gray'} />
      </div>

      <Card title="今日任务" footer={<a href="/today" className="text-sm text-blue-600 hover:text-blue-700 font-medium">查看全部 →</a>}>
        {todayTasks.length === 0 ? (
          <p className="text-gray-400 text-sm">今日暂无任务，请在Dashboard查看。</p>
        ) : (
          <div className="space-y-3">
            {todayTasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <TaskTypeBadge type={task.taskType} />
                    <span className="font-medium text-gray-900 text-sm">{task.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                  <p className="text-xs text-gray-400 mt-1">完成标准：{task.successCriteria}</p>
                </div>
                <Button
                  variant={task.status === 'completed' ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => completeTask(task.id)}
                >
                  {task.status === 'completed' ? '✓ 已完成' : '完成'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {dynamicWarning ? 'AI风险提醒' : '本周风险提醒'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {dynamicWarning || (interviews.length < 5
                ? '用户访谈数量不足，建议尽快开始第一轮访谈。访谈是验证假设的核心动作。'
                : '保持当前执行节奏，注意收集用户原话证据。')}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <MessageSquare size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">AI教练建议</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {startupProfile?.riskLevel === 'high'
                ? '你的产品方向风险较高，建议这周重点做用户访谈，收集足够的证据再推进MVP。'
                : '今天最重要的动作是完成一次真实用户访谈。不是为了宣传产品，而是理解他们当前怎么解决这个问题。'}
            </p>
          </div>
        </div>
      </Card>

      {startupProfile?.aiSummary && (
        <Card title="AI对你的分析">
          <p className="text-sm text-gray-700">{startupProfile.aiSummary}</p>
        </Card>
      )}
    </div>
  )
}
