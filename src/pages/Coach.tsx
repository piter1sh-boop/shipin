import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store'
import { Button } from '../components/ui'
import { Send, Bot, User, ChevronDown, ChevronUp } from 'lucide-react'
import type { CoachMessage } from '../types'

// 解析 AI 回复，提取 thinking 和正文
function parseMessage(content: string): { thinking: string | null; text: string } {
  const thinkingMatch = content.match(/<think>([\s\S]*?)<\/think>/g)
  if (thinkingMatch) {
    const thinking = thinkingMatch[0].replace(/<\/?think>/g, '').trim()
    const text = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
    return { thinking, text }
  }
  return { thinking: null, text: content }
}

// 单条消息组件
function MessageBubble({ msg }: { msg: CoachMessage }) {
  const [showThinking, setShowThinking] = useState(false)
  const { thinking, text } = parseMessage(msg.content)

  return (
    <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        msg.role === 'coach' ? 'bg-blue-100' : 'bg-gray-100'
      }`}>
        {msg.role === 'coach' ? <Bot size={16} className="text-blue-600" /> : <User size={16} className="text-gray-500" />}
      </div>
      <div className={`max-w-[70%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
        msg.role === 'coach' ? 'bg-blue-50 text-gray-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {/* Thinking 折叠区域 */}
        {thinking && (
          <div className="mb-2">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showThinking ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>AI思考过程</span>
            </button>
            {showThinking && (
              <div className="mt-1 p-2 bg-gray-100 rounded text-xs text-gray-500 whitespace-pre-wrap border border-gray-200">
                {thinking}
              </div>
            )}
          </div>
        )}
        {/* 正文内容 */}
        <div className="whitespace-pre-wrap">{text}</div>
      </div>
    </div>
  )
}

export default function CoachPage() {
  const { coachMessages, sendCoachMessage } = useStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [coachMessages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return
    const msg = input.trim()
    setInput('')
    setLoading(true)
    try {
      await sendCoachMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <h1 className="text-lg font-bold text-gray-900">AI教练对话</h1>
        <p className="text-xs text-gray-400">基于你的上下文提供创业建议</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {coachMessages.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Bot size={32} className="mx-auto text-gray-300" />
            <p className="text-gray-400 text-sm">
              你好，我是你的30天创业执行教练。<br />
              可以问我任何关于创业执行的问题。
            </p>
          </div>
        ) : (
          coachMessages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))
        )}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot size={16} className="text-blue-600" />
            </div>
            <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-gray-500">
              思考中...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-6 py-4 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入你的问题..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <Button type="submit" disabled={!input.trim() || loading}>
            <Send size={16} />
          </Button>
        </div>
      </form>
    </div>
  )
}
