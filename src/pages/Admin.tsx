import { Card, Badge } from '../components/ui'

export default function AdminPage() {
  // Mock 5 test users for admin view
  const mockUsers = [
    { id: '1', name: '张三', stage: 'positioning', streak: 5, interviews: 3, leads: 1, risk: 'medium', note: '方向清晰，执行力强' },
    { id: '2', name: '李四', stage: 'validation', streak: 2, interviews: 1, leads: 0, risk: 'high', note: '访谈进度落后' },
    { id: '3', name: '王五', stage: 'mvp', streak: 7, interviews: 8, leads: 2, risk: 'low', note: '进展良好' },
    { id: '4', name: '赵六', stage: 'sales', streak: 0, interviews: 5, leads: 3, risk: 'medium', note: '连续2天未打卡' },
    { id: '5', name: '钱七', stage: 'positioning', streak: 3, interviews: 2, leads: 0, risk: 'high', note: '卡在产品定义' },
  ]

  const RISK_COLOR = { low: 'text-green-600', medium: 'text-orange-600', high: 'text-red-600' }
  const STAGE_LABELS: Record<string, string> = {
    positioning: '定位', validation: '验证', mvp: 'MVP', sales: '销售', review: '复盘',
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">管理后台</h1>
        <p className="text-sm text-gray-500">5个测试用户执行情况</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {mockUsers.map(u => (
          <Card key={u.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{u.name}</span>
              <Badge>{STAGE_LABELS[u.stage]}</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>连续打卡</span>
                <span className={u.streak === 0 ? 'text-red-500 font-medium' : 'text-gray-700'}>{u.streak}天</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>访谈数</span>
                <span className="text-gray-700">{u.interviews}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>线索数</span>
                <span className="text-gray-700">{u.leads}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>风险等级</span>
                <span className={`font-medium ${RISK_COLOR[u.risk as keyof typeof RISK_COLOR]}`}>{u.risk}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 border-t border-gray-100 pt-2">{u.note}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
