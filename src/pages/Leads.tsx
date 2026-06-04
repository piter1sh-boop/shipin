import { useState } from 'react'
import { useStore } from '../store'
import { Card, Button, Input, Textarea, LeadStatusBadge } from '../components/ui'
import type { Lead, LeadStatus } from '../types'

const STATUS_OPTIONS: LeadStatus[] = ['new', 'contacted', 'trial', 'paying', 'churned']
const STATUS_LABELS: Record<LeadStatus, string> = {
  new: '新线索',
  contacted: '已沟通',
  trial: '试用中',
  paying: '愿意付费',
  churned: '流失',
}

export default function LeadsPage() {
  const { leads, addLead, updateLead, deleteLead } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<Lead, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>({
    name: '',
    source: '',
    personType: '',
    painPoint: '',
    budgetSignal: '',
    status: 'new',
    nextStep: '',
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) return
    addLead(form)
    setForm({ name: '', source: '', personType: '', painPoint: '', budgetSignal: '', status: 'new', nextStep: '' })
    setShowForm(false)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">潜在线索</h1>
          <p className="text-sm text-gray-500">已记录 {leads.length} 条线索 · 目标3条</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? '取消' : '+ 新增线索'}</Button>
      </div>

      {showForm && (
        <Card title="新增线索">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="线索名称" value={form.name} onChange={e => set('name', e.target.value)} placeholder="公司名或联系人" required />
              <Input label="来源" value={form.source} onChange={e => set('source', e.target.value)} placeholder="怎么认识的" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="用户类型" value={form.personType} onChange={e => set('personType', e.target.value)} placeholder="目标用户类型" />
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">状态</label>
                <div className="flex flex-wrap gap-1">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} type="button" onClick={() => set('status', s)}
                      className={`px-2 py-1 rounded text-xs font-medium ${form.status === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Textarea label="痛点" value={form.painPoint} onChange={e => set('painPoint', e.target.value)} placeholder="这个线索的核心痛点" rows={2} />
            <Textarea label="预算/付费信号" value={form.budgetSignal} onChange={e => set('budgetSignal', e.target.value)} placeholder="是否有预算信号或付费意愿" rows={1} />
            <Textarea label="下一步行动" value={form.nextStep} onChange={e => set('nextStep', e.target.value)} placeholder="下一步要做什么" rows={1} />
            <Button type="submit" className="w-full">保存线索</Button>
          </form>
        </Card>
      )}

      {leads.length === 0 ? (
        <Card>
          <p className="text-gray-400 text-sm text-center py-6">还没有线索记录，开始收集吧。</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => (
            <Card key={lead.id}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{lead.name}</span>
                    <LeadStatusBadge status={lead.status} />
                  </div>
                  {lead.painPoint && <p className="text-sm text-gray-600">痛点：{lead.painPoint}</p>}
                  {lead.budgetSignal && <p className="text-sm text-gray-500">预算信号：{lead.budgetSignal}</p>}
                  {lead.nextStep && <p className="text-xs text-gray-400">下一步：{lead.nextStep}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>来源：{lead.source || '未知'}</span>
                  </div>
                </div>
                <button onClick={() => deleteLead(lead.id)} className="text-gray-300 hover:text-red-400 text-sm">删除</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
