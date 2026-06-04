// dotenv must be loaded FIRST before any other module that uses process.env
import 'dotenv/config'

import { initDatabase } from './db/index.js'
import express from 'express'
import cors from 'cors'
import { aiRouter } from './routes/ai.js'
import { behaviorRouter } from './routes/behavior.js'

// Initialize database
initDatabase()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5177' }))
app.use(express.json())

// AI proxy routes
app.use('/api', aiRouter)

// Behavior tracking routes
app.use('/api', behaviorRouter)  // 🆕 Add this

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`[server] AI proxy running on http://localhost:${PORT}`)
})
