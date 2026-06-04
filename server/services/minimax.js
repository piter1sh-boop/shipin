import axios from 'axios'

const apiKey = process.env.MINIMAX_API_KEY
const baseURL = process.env.MINIMAX_BASE_URL || 'https://api.minimax.chat/v1'
const model = process.env.MINIMAX_MODEL || 'MiniMax-M2.7'

if (!apiKey) {
  console.error('[minimax] MINIMAX_API_KEY is not set in server/.env')
}

export async function chat(messages, { temperature = 0.7, maxTokens = 0 } = {}) {
  if (!apiKey) throw new Error('MINIMAX_API_KEY not configured')

  const body = { model, messages, temperature }
  if (maxTokens > 0) body.max_tokens = maxTokens

  const res = await axios.post(
    `${baseURL}/chat/completions`,
    body,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 60000,
    },
  )
  return res.data.choices[0].message.content
}

export async function chatJson(messages) {
  const text = await chat(messages)
  // Remove thinking/reflection tags first
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim()

  // Try markdown code block first
  const fromBlock = cleaned.match(/```(?:json)?\n?([\s\S]*?)\n?```/)?.[1]?.trim()
  if (fromBlock && isJson(fromBlock)) return JSON.parse(fromBlock)

  // Try to find any JSON object or array in the text
  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]) } catch { /* try next */ }
  }

  const err = new Error(`Cannot parse JSON: ${cleaned.slice(0, 200)}`); console.error("[chatJson]", err.message); throw err
}

function isJson(text) {
  try { JSON.parse(text); return true } catch { return false }
}
