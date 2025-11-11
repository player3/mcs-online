/**
 * 测试打印服务
 * 用于测试前端打印功能
 * 
 * 运行方式: node test-print-server.js
 */

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
const PORT = 6789

// 中间件
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

/**
 * 打印接口
 * POST /postname
 */
app.post('/postname', (req, res) => {
  console.log('\n' + '='.repeat(60))
  console.log('📄 收到打印请求')
  console.log('='.repeat(60))
  
  const userData = req.body
  
  // 打印接收到的数据
  console.log('\n用户信息:')
  console.log(JSON.stringify(userData, null, 2))
  
  // 显示关键字段
  console.log('\n关键字段:')
  console.log(`  姓名: ${userData.name || userData['姓名 Name'] || '-'}`)
  console.log(`  门票编号: ${userData.regcode || '-'}`)
  console.log(`  手机号: ${userData.mobile || '-'}`)
  console.log(`  邮箱: ${userData.email || '-'}`)
  console.log(`  类型: ${userData.ticketType || '-'}`)
  
  console.log('\n所有字段:')
  Object.keys(userData).forEach(key => {
    console.log(`  ${key}: ${userData[key]}`)
  })
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ 打印完成')
  console.log('='.repeat(60) + '\n')
  
  // 模拟打印延迟
  setTimeout(() => {
    res.json({
      success: true,
      message: '打印成功',
      timestamp: new Date().toISOString(),
      received: userData
    })
  }, 500)
})

/**
 * 健康检查
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '打印服务运行正常',
    timestamp: new Date().toISOString()
  })
})

/**
 * 测试接口
 * GET /test
 */
app.get('/test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>打印服务测试</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
        .test-form { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        textarea { width: 100%; height: 200px; margin: 10px 0; padding: 10px; }
        button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #45a049; }
        .result { margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 4px; }
        .error { background: #ffebee; }
      </style>
    </head>
    <body>
      <h1>🖨️ 打印服务测试页面</h1>
      <p>服务地址: <strong>http://localhost:6789</strong></p>
      
      <div class="test-form">
        <h2>测试打印</h2>
        <p>修改下面的JSON数据，然后点击发送按钮：</p>
        <textarea id="jsonData">{
  "name": "xu",
  "regcode": "1234-5678-9012",
  "mobile": "13800138000",
  "email": "test@example.com",
  "ticketType": "VIP",
  "姓名 Name": "徐明辉"
}</textarea>
        <button onclick="sendPrintRequest()">📤 发送打印请求</button>
        <div id="result"></div>
      </div>

      <script>
        async function sendPrintRequest() {
          const resultDiv = document.getElementById('result');
          const jsonData = document.getElementById('jsonData').value;
          
          try {
            const data = JSON.parse(jsonData);
            
            resultDiv.innerHTML = '<p>⏳ 正在发送...</p>';
            
            const response = await fetch('http://localhost:6789/postname', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            resultDiv.className = 'result';
            resultDiv.innerHTML = '<h3>✅ 响应结果:</h3><pre>' + 
              JSON.stringify(result, null, 2) + '</pre>';
          } catch (error) {
            resultDiv.className = 'result error';
            resultDiv.innerHTML = '<h3>❌ 错误:</h3><p>' + error.message + '</p>';
          }
        }
      </script>
    </body>
    </html>
  `)
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
  console.log('='.repeat(60))
  console.log('  🖨️  测试打印服务已启动')
  console.log('='.repeat(60))
  console.log(`  地址: http://localhost:${PORT}`)
  console.log(`  打印接口: http://localhost:${PORT}/postname`)
  console.log(`  健康检查: http://localhost:${PORT}/health`)
  console.log(`  测试页面: http://localhost:${PORT}/test`)
  console.log('='.repeat(60))
  console.log('\n等待打印请求...\n')
})

