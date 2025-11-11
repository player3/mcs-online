/**
 * Mock API Server
 * 用于测试前端功能的模拟后端服务器
 * 
 * 运行方式: node mock-server.js
 */

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
const PORT = 3000

// 中间件
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// 模拟用户数据
const users = [
  {
    id: '1',
    name: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    ticketNumber: '1234-5678-9012',
    type: 'VIP',
    company: '科技有限公司',
    position: '总经理',
    printed: false,
    printTime: null
  },
  {
    id: '2',
    name: '李四',
    phone: '13800138001',
    email: 'lisi@example.com',
    ticketNumber: '2345-6789-0123',
    type: '嘉宾',
    company: '互联网公司',
    position: '技术总监',
    printed: true,
    printTime: '2024-01-15T10:30:00Z'
  },
  {
    id: '3',
    name: '王五',
    phone: '13800138002',
    email: 'wangwu@example.com',
    ticketNumber: '3456-7890-1234',
    type: '参会者',
    company: '软件开发公司',
    position: '开发工程师',
    printed: false,
    printTime: null
  },
  {
    id: '4',
    name: '赵六',
    phone: '13800138003',
    email: 'zhaoliu@example.com',
    ticketNumber: '4567-8901-2345',
    type: '工作人员',
    company: '会议服务公司',
    position: '志愿者',
    printed: false,
    printTime: null
  },
  {
    id: '5',
    name: '钱七',
    phone: '13800138004',
    email: 'qianqi@example.com',
    ticketNumber: '5678-9012-3456',
    type: '媒体',
    company: '新闻媒体',
    position: '记者',
    printed: true,
    printTime: '2024-01-15T09:15:00Z'
  }
]

// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

/**
 * 根据门票编号查询用户
 * GET /api/tickets/:ticketNumber
 */
app.get('/api/tickets/:ticketNumber', (req, res) => {
  const { ticketNumber } = req.params
  
  console.log(`查询门票: ${ticketNumber}`)
  
  const user = users.find(u => u.ticketNumber === ticketNumber)
  
  if (user) {
    res.json({
      success: true,
      data: user,
      message: '查询成功'
    })
  } else {
    res.status(404).json({
      success: false,
      data: null,
      message: '门票编号不存在'
    })
  }
})

/**
 * 查询用户列表
 * GET /api/users/search
 */
app.get('/api/users/search', (req, res) => {
  const { name, phone, email, ticketNumber } = req.query
  
  console.log('查询条件:', { name, phone, email, ticketNumber })
  
  let results = users
  
  // 按条件过滤
  if (name) {
    results = results.filter(u => u.name.includes(name))
  }
  if (phone) {
    results = results.filter(u => u.phone.includes(phone))
  }
  if (email) {
    results = results.filter(u => u.email.includes(email))
  }
  if (ticketNumber) {
    results = results.filter(u => u.ticketNumber.includes(ticketNumber))
  }
  
  res.json({
    success: true,
    data: results,
    message: `找到 ${results.length} 条记录`
  })
})

/**
 * 打印胸牌
 * POST /api/print
 */
app.post('/api/print', (req, res) => {
  const { ticketNumber, userInfo } = req.body
  
  console.log('打印请求:', { ticketNumber, userName: userInfo?.name })
  
  // 查找并更新用户的打印状态
  const userIndex = users.findIndex(u => u.ticketNumber === ticketNumber)
  
  if (userIndex !== -1) {
    users[userIndex].printed = true
    users[userIndex].printTime = new Date().toISOString()
    
    // 模拟打印延迟
    setTimeout(() => {
      res.json({
        success: true,
        data: users[userIndex],
        message: '打印成功'
      })
    }, 1000)
  } else {
    res.status(404).json({
      success: false,
      data: null,
      message: '用户不存在'
    })
  }
})

/**
 * 获取所有用户（用于调试）
 * GET /api/users
 */
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: users,
    message: '查询成功'
  })
})

/**
 * 健康检查
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API服务运行正常',
    timestamp: new Date().toISOString()
  })
})

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log('='.repeat(50))
  console.log('  Mock API Server 已启动')
  console.log('='.repeat(50))
  console.log(`  地址: http://localhost:${PORT}`)
  console.log(`  健康检查: http://localhost:${PORT}/api/health`)
  console.log('='.repeat(50))
  console.log('\n可用的API接口:')
  console.log(`  GET  /api/tickets/:ticketNumber  - 根据门票编号查询用户`)
  console.log(`  GET  /api/users/search           - 查询用户列表`)
  console.log(`  POST /api/print                  - 打印胸牌`)
  console.log(`  GET  /api/users                  - 获取所有用户（调试）`)
  console.log(`  GET  /api/health                 - 健康检查`)
  console.log('='.repeat(50))
  console.log('\n测试门票编号:')
  users.forEach(user => {
    console.log(`  ${user.ticketNumber} - ${user.name} (${user.type})`)
  })
  console.log('='.repeat(50))
  console.log('\n按 Ctrl+C 停止服务器\n')
})

