import { initDatabase } from './db/index.js'  // 🆕 Add this line

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { aiRouter } from './routes/ai.js'

// Initialize database
initDatabase()  // 🆕 Add this line

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5177' }))
app.use(express.json())

// AI proxy routes
app.use('/api', aiRouter)

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`[server] AI proxy running on http://localhost:${PORT}`)
})
