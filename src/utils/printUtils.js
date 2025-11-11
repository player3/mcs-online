/**
 * 胸牌打印工具函数
 * 提供统一的打印数据处理和打印服务调用
 */

import axios from 'axios'

/**
 * 打印胸牌
 * @param {Object} userInfo - 用户信息对象
 * @param {Array} fieldList - 字段列表配置
 * @param {Object} eventData - 事件数据（字段映射）
 * @returns {Promise} 打印结果
 */
export async function printBadge(userInfo, fieldList = [], eventData = {}) {
  if (!userInfo) {
    throw new Error('用户信息不能为空')
  }

  // 准备打印数据，包含用户的所有信息
  const printData = {
    ...userInfo, // 展开所有用户信息
    name: userInfo.name,
    regcode: userInfo.regcode || userInfo.ticketNumber
  }

  // 转换字段值（根据fieldList配置）
  Object.keys(printData).forEach(key => {
    if (printData[key]) {
      // 查找字段配置
      const field = fieldList.find(f => f.name === key)
      if (field && field.value) {
        try {
          // 解析字段选项
          const options = JSON.parse(field.value)
          const index = parseInt(printData[key])
          
          // 如果是有效的索引，使用对应的label
          if (!isNaN(index) && options[index]) {
            printData[key] = options[index].label
          }
        } catch (e) {
          // 如果解析失败，保持原值
          console.warn(`解析字段 ${key} 的选项失败:`, e)
        }
      }
    }

    // 添加中英文字段映射
    if (eventData && eventData[key]) {
      printData[eventData[key]] = printData[key]
    }
  })

  console.log('发送打印数据:', printData)

  // 调用本地打印服务
  const response = await axios.post('http://localhost:6789/postname', printData, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  console.log('打印响应:', response.data)

  return response
}

/**
 * 批量打印胸牌
 * @param {Array} userList - 用户列表
 * @param {Array} fieldList - 字段列表配置
 * @param {Object} eventData - 事件数据（字段映射）
 * @returns {Promise} 打印结果数组
 */
export async function printBadgeBatch(userList, fieldList = [], eventData = {}) {
  if (!Array.isArray(userList) || userList.length === 0) {
    throw new Error('用户列表不能为空')
  }

  const results = []
  const errors = []

  for (const user of userList) {
    try {
      const result = await printBadge(user, fieldList, eventData)
      results.push({
        user: user.name,
        success: true,
        data: result.data
      })
    } catch (error) {
      errors.push({
        user: user.name,
        success: false,
        error: error.message
      })
    }
  }

  return {
    total: userList.length,
    success: results.length,
    failed: errors.length,
    results,
    errors
  }
}

/**
 * 验证打印服务是否可用
 * @returns {Promise<boolean>} 服务是否可用
 */
export async function checkPrintServiceAvailable() {
  try {
    const response = await axios.get('http://localhost:6789/health', {
      timeout: 2000
    })
    return response.status === 200
  } catch (error) {
    console.warn('打印服务不可用:', error.message)
    return false
  }
}

