import { useState } from 'react'
import { useStore } from '../store'
import { Card, Button, Input, Textarea } from '../components/ui'
import type { Interview } from '../types'

export default function InterviewsPage() {
  const { interviews, addInterview, deleteInterview } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<Interview, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>({
    interviewDate: new Date().toISOString().split('T')[0],
    personName: '',
    personType: '',
    contact: '',
    currentSolution: '',
    painPoints: '',
    verbatimQuotes: '',
    willingnessToPay: 3,
    followUpStatus: '',
    notes: '',
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.personName) return
    addInterview(form)
    setForm({
      ...form,
      personName: '',
      contact: '',
      currentSolution: '',
      painPoints: '',
      verbatimQuotes: '',
      followUpStatus: '',
      notes: '',
    })
    setShowForm(false)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">用户访谈</h1>
          <p className="text-sm text-gray-500">已记录 {interviews.length} 次访谈 · 目标20次</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? '取消' : '+ 新增访谈'}</Button>
      </div>

      {showForm && (
        <Card title="新增访谈记录">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="访谈对象姓名" value={form.personName} onChange={e => set('personName', e.target.value)} required />
              <Input label="用户类型/职业" value={form.personType} onChange={e => set('personType', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="联系方式（可选）" value={form.contact} onChange={e => set('contact', e.target.value)} />
              <Input label="访谈日期" type="date" value={form.interviewDate} onChange={e => set('interviewDate', e.target.value)} />
            </div>
            <Textarea label="当前替代方案" placeholder="他们现在怎么解决这个问题的？" rows={2} value={form.currentSolution} onChange={e => set('currentSolution', e.target.value)} />
            <Textarea label="最强痛点" placeholder="用户反馈的最大痛点是什么？" rows={2} value={form.painPoints} onChange={e => set('painPoints', e.target.value)} />
            <Textarea label="原话证据" placeholder="用户原话，直接引用" rows={2} value={form.verbatimQuotes} onChange={e => set('verbatimQuotes', e.target.value)} />
            <Textarea label="下一步行动" placeholder="下一步要做什么？" rows={1} value={form.followUpStatus} onChange={e => set('followUpStatus', e.target.value)} />
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">付费意愿（1-5分）</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => set('willingnessToPay', n)}
                    className={`w-8 h-8 rounded text-sm font-medium ${form.willingnessToPay >= n ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full">保存访谈记录</Button>
          </form>
        </Card>
      )}

      {interviews.length === 0 ? (
        <Card>
          <p className="text-gray-400 text-sm text-center py-6">
            还没有访谈记录。点击右上角「新增访谈」开始记录。
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {interviews.map(interview => (
            <Card key={interview.id}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{interview.personName}</span>
                    {interview.personType && (
                      <span className="text-xs text-gray-400">{interview.personType}</span>
                    )}
                  </div>
                  {interview.painPoints && (
                    <p className="text-sm text-gray-600">痛点：{interview.painPoints}</p>
                  )}
                  {interview.verbatimQuotes && (
                    <p className="text-sm text-gray-400 italic">"{interview.verbatimQuotes}"</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{interview.interviewDate}</span>
                    <span>付费意愿：{interview.willingnessToPay}/5</span>
                  </div>
                </div>
                <button onClick={() => deleteInterview(interview.id)} className="text-gray-300 hover:text-red-400 text-sm">删除</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
