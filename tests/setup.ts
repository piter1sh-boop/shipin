/**
 * Vitest 测试环境配置
 * tests/setup.ts
 */
import { vi } from 'vitest'

// 设置测试环境变量
process.env.NODE_ENV = 'test'
process.env.PORT = '3001'
process.env.DATABASE_PATH = './data/shipin.test.db'

// 模拟 fetch（Node.js 18+ 内置）
// 如果需要可以在此添加更多全局设置

// 全局测试超时设置
vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
})