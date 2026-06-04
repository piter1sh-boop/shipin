import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Card, Button, Textarea } from '../components/ui'
import type { Stage } from '../types'

const STAGES: Stage[] = ['positioning', 'validation', 'mvp', 'sales', 'review']
const STAGE_LABELS: Record<Stage, string> = {
  positioning: '定位阶段',
  validation: '验证阶段',
  mvp: 'MVP阶段',
  sales: '销售阶段',
  review: '复盘阶段',
}

const TIME_OPTIONS = ['30分钟', '1小时', '2小时', '3小时以上']
const BLOCKER_OPTIONS = [
  '不知道该做什么',
  '方向不清晰',
  '用户太少找不到',
  '有产品但没有用户',
  '没有动力持续执行',
  '其他',
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { submitOnboarding } = useStore()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    productIdea: '',
    targetUser: '',
    problemStatement: '',
    currentStage: 'positioning' as Stage,
    dailyTimeBudget: '',
    mainBlocker: '',
    desiredOutcome: '',
    hasPrototype: false,
    hasLandingPage: false,
    hasInterviews: false,
    hasLeads: false,
  })

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.productIdea || !form.targetUser || !form.dailyTimeBudget) return

    setLoading(true)
    try {
      await submitOnboarding(form)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">开始你的30天创业执行</h1>
          <p className="text-gray-500">填写你的创业想法，帮助AI更好地推动你执行</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Card title="产品想法">
            <Textarea
              label="你想做什么产品？"
              placeholder="一句话描述你的产品或创业想法"
              rows={3}
              value={form.productIdea}
              onChange={e => update('productIdea', e.target.value)}
              required
            />
            <Textarea
              label="你认为目标用户有什么痛点？"
              placeholder="目标用户遇到的最大问题是什么？"
              rows={2}
              value={form.problemStatement}
              onChange={e => update('problemStatement', e.target.value)}
              required
            />
          </Card>

          <Card title="目标用户">
            <Textarea
              label="你的目标用户是谁？"
              placeholder="描述你的理想用户：职业、技能水平、所在行业等"
              rows={2}
              value={form.targetUser}
              onChange={e => update('targetUser', e.target.value)}
              required
            />
          </Card>

          <Card title="当前阶段">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">现在进展到哪一步？</label>
              <div className="flex flex-wrap gap-2">
                {STAGES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update('currentStage', s)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      form.currentStage === s
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {STAGE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <label className="block text-sm font-medium text-gray-700">每天能投入多少时间？</label>
              <div className="flex flex-wrap gap-2">
                {TIME_OPTIONS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update('dailyTimeBudget', t)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      form.dailyTimeBudget === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card title="卡点和目标">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">你最容易卡在哪里？</label>
              <div className="flex flex-wrap gap-2">
                {BLOCKER_OPTIONS.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => update('mainBlocker', b)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      form.mainBlocker === b
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="你希望30天后拿到什么结果？"
              placeholder="最想实现的1-3个目标"
              rows={2}
              value={form.desiredOutcome}
              onChange={e => update('desiredOutcome', e.target.value)}
              className="mt-4"
            />
          </Card>

          <Card title="已有资源">
            <div className="space-y-2">
              {[
                { key: 'hasPrototype', label: '已有原型或Demo' },
                { key: 'hasLandingPage', label: '已有落地页' },
                { key: 'hasInterviews', label: '已有访谈记录' },
                { key: 'hasLeads', label: '已有潜在用户线索' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key as keyof typeof form] as boolean}
                    onChange={e => update(key as keyof typeof form, e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'AI分析中...' : '开始30天执行 →'}
          </Button>
        </form>
      </div>
    </div>
  )
}
