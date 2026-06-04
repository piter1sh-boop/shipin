# HTML视频生成器 - 后端开发计划

## Context
前端已完成，现在需要开发后端实现与大模型对话生成HTML视频。使用MiniMax API（模型MiniMax-M2.7），通过Express.js框架搭建。

## 技术栈
- **后端框架**: Express.js (Node.js)
- **大模型**: MiniMax API (模型: MiniMax-M2.7)
- **API调用方式**: 官方API直接调用

## MiniMax API配置
- API Key: `sk-cp--YOUR_API_KEY_HERE`
- API Base: `https://api.minimax.chat/v1`

## 项目结构
```
shipin/
├── server/
│   ├── index.js           # Express服务器入口
│   ├── routes/
│   │   └── chat.js       # 聊天API路由
│   ├── services/
│   │   └── minimax.js    # MiniMax API调用服务
│   └── middleware/
│       └── cors.js       # CORS配置
├── src/
│   └── ... (前端代码)
└── package.json
```

## 核心功能

### 1. 聊天API接口
- **POST /api/chat**: 发送消息给大模型
  - 输入: `{ messages: [{role, content}], model?: string }`
  - 输出: `{ response: string, usage?: object }`

### 2. MiniMax服务
- 调用MiniMax Chat Completion API
- 支持流式响应（可选）
- 处理错误和重试

### 3. 前端集成
- 将ChatPanel的handleSend改为调用后端API
- 处理流式响应更新UI

## API设计

### POST /api/chat
```json
// Request
{
  "messages": [
    {"role": "user", "content": "帮我生成一个简单的HTML视频"},
    {"role": "assistant", "content": "好的，我来帮你生成..."}
  ],
  "stream": false
}

// Response
{
  "response": "生成的HTML代码...",
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 200
  }
}
```

## 实施步骤

### 1. 安装后端依赖
```bash
npm install express cors axios dotenv
```

### 2. 创建服务器入口
- 配置Express服务器
- 配置CORS
- 配置JSON解析中间件

### 3. 创建MiniMax服务
- 实现API调用函数
- 处理响应格式

### 4. 创建聊天路由
- 实现 /api/chat 端点
- 错误处理

### 5. 前端集成
- 修改ChatPanel调用后端API
- 更新消息显示

## 环境变量
```
MINIMAX_API_KEY=sk-cp--YOUR_API_KEY_HERE
MINIMAX_API_BASE=https://api.minimax.chat/v1
```

## 验证方式
1. 启动后端服务器 `node server/index.js`
2. 测试API: `curl -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Hello"}]}'`
3. 前端发送消息测试完整流程