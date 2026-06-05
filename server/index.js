// dotenv must be loaded FIRST before any other module that uses process.env
import 'dotenv/config'

import { initDatabase } from './db/index.js'
import { migrateFromStorage } from './migrate-from-storage.js'
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

// POST /api/migrate — migrate LocalStorage data to SQLite
// Called by frontend with the LocalStorage data as body
app.post('/api/migrate', (req, res) => {
  const { localStorageData } = req.body

  if (!localStorageData || typeof localStorageData !== 'object') {
    return res.status(400).json({ error: 'localStorageData object is required' })
  }

  try {
    const report = migrateFromStorage(localStorageData)
    res.json({
      ok: true,
      report,
    })
  } catch (err) {
    console.error('[/api/migrate]', err.message)
    res.status(500).json({ error: 'Migration failed', details: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`[server] AI proxy running on http://localhost:${PORT}`)
})
