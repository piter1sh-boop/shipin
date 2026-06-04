import { useStore } from '../store'
import { Card } from '../components/ui'

export default function ReviewPage() {
  const { checkins, interviews, leads, getCompletedTasksCount, getCurrentDay } = useStore()
  const currentDay = getCurrentDay()

  // Group checkins by week
  const weekNumber = Math.ceil(currentDay / 7)
  const weeklyCheckins = checkins.slice(-7)

  const avgValue = weeklyCheckins.length
    ? Math.round(weeklyCheckins.reduce((sum, c) => sum + c.valueScore, 0) / weeklyCheckins.length * 10) / 10
    : 0

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">复盘</h1>
        <p className="text-sm text-gray-500">第{weekNumber}周 · 已执行{currentDay}天</p>
      </div>

      {/* Weekly Review */}
      <Card title={`第${weekNumber}周进展`}>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xl font-bold text-gray-900">{getCompletedTasksCount()}</div>
              <div className="text-xs text-gray-500">完成任务</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xl font-bold text-gray-900">{interviews.length}</div>
              <div className="text-xs text-gray-500">用户访谈</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xl font-bold text-gray-900">{leads.length}</div>
              <div className="text-xs text-gray-500">潜在线索</div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">本周平均价值评分：<strong className="text-gray-900">{avgValue}</strong>/5</p>
          </div>
        </div>
      </Card>

      {/* Daily Check-ins */}
      <Card title="最近打卡记录">
        {weeklyCheckins.length === 0 ? (
          <p className="text-gray-400 text-sm">暂无打卡记录</p>
        ) : (
          <div className="space-y-3">
            {weeklyCheckins.slice().reverse().map(checkin => (
              <div key={checkin.id} className="p-3 bg-gray-50 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{checkin.taskDate}</span>
                  <span className="text-xs text-gray-400">价值{checkin.valueScore}/5 · 精力{checkin.energyScore}/5</span>
                </div>
                {checkin.completedText && (
                  <p className="text-sm text-gray-600">完成：{checkin.completedText}</p>
                )}
                {checkin.blockedText && (
                  <p className="text-sm text-gray-400">卡点：{checkin.blockedText}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Key Insight */}
      <Card title="本周关键洞察">
        {weeklyCheckins.length === 0 ? (
          <p className="text-gray-400 text-sm">开始打卡后这里会显示你的执行洞察</p>
        ) : (
          <div className="space-y-2 text-sm text-gray-700">
            <p>✓ 保持执行节奏是核心，不要因为感觉不好就停下来。</p>
            <p>✓ 访谈数量是验证的关键指标，争取每天至少1次真实对话。</p>
            <p>⚠ 价值评分下降时要调整任务难度或方向。</p>
          </div>
        )}
      </Card>
    </div>
  )
}
