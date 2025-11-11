/**
 * 打印工具函数测试示例
 * 这是一个演示如何测试 printUtils 的示例文件
 * 实际使用时，可以使用 Jest、Vitest 等测试框架
 */

import { printBadge, printBadgeBatch, checkPrintServiceAvailable } from './printUtils'

// 模拟数据
const mockUserInfo = {
  name: '张三',
  mobile: '13800138000',
  email: 'zhangsan@example.com',
  regcode: '1234-5678-9012',
  ticketType: '0' // 对应 VIP
}

const mockFieldList = [
  {
    name: 'ticketType',
    value: JSON.stringify([
      { label: 'VIP', value: '0' },
      { label: '普通', value: '1' },
      { label: '嘉宾', value: '2' }
    ])
  }
]

const mockEventData = {
  name: '姓名 Name',
  mobile: '手机号 Mobile',
  email: '邮箱 Email',
  regcode: '门票编号 Regcode',
  ticketType: '票种 Type'
}

// 测试单个打印
async function testSinglePrint() {
  console.log('测试单个打印...')
  
  try {
    const result = await printBadge(mockUserInfo, mockFieldList, mockEventData)
    console.log('✓ 打印成功:', result.data)
    return true
  } catch (error) {
    console.error('✗ 打印失败:', error.message)
    return false
  }
}

// 测试批量打印
async function testBatchPrint() {
  console.log('\n测试批量打印...')
  
  const userList = [
    { ...mockUserInfo, name: '张三', regcode: '1234-5678-9012' },
    { ...mockUserInfo, name: '李四', regcode: '1234-5678-9013' },
    { ...mockUserInfo, name: '王五', regcode: '1234-5678-9014' }
  ]
  
  try {
    const result = await printBadgeBatch(userList, mockFieldList, mockEventData)
    console.log(`✓ 批量打印完成: ${result.success}/${result.total} 成功`)
    
    if (result.errors.length > 0) {
      console.log('失败列表:', result.errors)
    }
    
    return result.success === result.total
  } catch (error) {
    console.error('✗ 批量打印失败:', error.message)
    return false
  }
}

// 测试打印服务可用性
async function testServiceAvailability() {
  console.log('\n测试打印服务可用性...')
  
  try {
    const isAvailable = await checkPrintServiceAvailable()
    
    if (isAvailable) {
      console.log('✓ 打印服务可用')
    } else {
      console.log('✗ 打印服务不可用')
    }
    
    return isAvailable
  } catch (error) {
    console.error('✗ 检查失败:', error.message)
    return false
  }
}

// 测试字段值转换
function testFieldValueConversion() {
  console.log('\n测试字段值转换...')
  
  // 模拟字段值转换逻辑
  const fieldList = mockFieldList
  const field = fieldList.find(f => f.name === 'ticketType')
  
  if (field && field.value) {
    const options = JSON.parse(field.value)
    const index = parseInt('0')
    const label = options[index].label
    
    console.log(`原始值: 0 -> 转换后: ${label}`)
    
    if (label === 'VIP') {
      console.log('✓ 字段值转换正确')
      return true
    } else {
      console.log('✗ 字段值转换错误')
      return false
    }
  }
  
  return false
}

// 测试字段映射
function testFieldMapping() {
  console.log('\n测试字段映射...')
  
  const printData = { ...mockUserInfo }
  const eventData = mockEventData
  
  // 模拟字段映射逻辑
  Object.keys(printData).forEach(key => {
    if (eventData[key]) {
      printData[eventData[key]] = printData[key]
    }
  })
  
  // 检查映射是否正确
  if (printData['姓名 Name'] === '张三' && printData['票种 Type'] === '0') {
    console.log('✓ 字段映射正确')
    console.log('映射结果:', {
      '姓名 Name': printData['姓名 Name'],
      '手机号 Mobile': printData['手机号 Mobile'],
      '票种 Type': printData['票种 Type']
    })
    return true
  } else {
    console.log('✗ 字段映射错误')
    return false
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('========================================')
  console.log('打印工具函数测试')
  console.log('========================================\n')
  
  const results = []
  
  // 离线测试（不需要打印服务）
  results.push({
    name: '字段值转换',
    passed: testFieldValueConversion()
  })
  
  results.push({
    name: '字段映射',
    passed: testFieldMapping()
  })
  
  // 在线测试（需要打印服务运行）
  const serviceAvailable = await testServiceAvailability()
  
  if (serviceAvailable) {
    results.push({
      name: '单个打印',
      passed: await testSinglePrint()
    })
    
    results.push({
      name: '批量打印',
      passed: await testBatchPrint()
    })
  } else {
    console.log('\n⚠️  打印服务未运行，跳过在线测试')
    console.log('请运行: node test-print-server.js')
  }
  
  // 输出测试结果
  console.log('\n========================================')
  console.log('测试结果')
  console.log('========================================\n')
  
  const passed = results.filter(r => r.passed).length
  const total = results.length
  
  results.forEach(result => {
    console.log(`${result.passed ? '✓' : '✗'} ${result.name}`)
  })
  
  console.log(`\n总计: ${passed}/${total} 通过`)
  
  if (passed === total) {
    console.log('✓ 所有测试通过！')
  } else {
    console.log('✗ 部分测试失败')
  }
}

// 导出测试函数
export {
  testSinglePrint,
  testBatchPrint,
  testServiceAvailability,
  testFieldValueConversion,
  testFieldMapping,
  runAllTests
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    console.error('测试运行失败:', error)
    process.exit(1)
  })
}

