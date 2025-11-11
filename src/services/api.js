import { api } from 'boot/axios'

/**
 * 用户服务API
 */
export const userService = {
  /**
   * 根据门票编号查询用户信息
   * @param {string} ticketNumber - 门票编号
   */
  async getByTicketNumber(ticketNumber) {
    return await api.get(`/tickets/${ticketNumber}`)
  },

  /**
   * 自动签到
   * @param {string} ticketNumber - 门票编号
   * @returns {Promise} 返回用户信息
   */
  async autoSignin(ticketNumber) {
    return await api.post('/AutoSignin', { ticketNumber })
  },

  /**
   * 查询用户信息
   * @param {Object} params - 查询参数
   * @param {string} params.name - 姓名
   * @param {string} params.phone - 手机号
   * @param {string} params.email - 邮箱
   * @param {string} params.ticketNumber - 门票编号
   */
  async search(params) {
    return await api.get('/users/search', { params })
  },

  /**
   * 自动搜索（分页查询）
   * @param {Object} params - 查询参数
   * @param {string} params.sessionId - 会话ID
   * @param {number} params.page - 页码（从0开始，0表示第一页）
   * @param {number} params.pageSize - 每页条数
   * @param {string} params.name - 姓名（可选）
   * @param {string} params.regcode - 门票编号（可选）
   * @param {string} params.email - 邮箱（可选）
   * @param {string} params.mobile - 手机号（可选）
   * @returns {Promise} 返回分页数据 { success, code, data, total }
   */
  async autoSearch(params) {
    return await api.get('/AutoSearch', { params })
  }
}

/**
 * 打印服务API
 */
export const printService = {
  /**
   * 打印胸牌（调用本地打印服务）
   * @param {Object} userData - 用户信息数据
   * @returns {Promise} 返回打印结果
   */
  async printBadge(userData) {
    // 直接调用本地打印服务，不通过代理
    const axios = require('axios')
    return await axios.post('http://localhost:6789/postname', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

/**
 * 活动配置服务API
 */
export const eventService = {
  /**
   * 获取活动字段配置
   * @returns {Promise} 返回字段配置信息
   */
  async getEventFields() {
    return await api.get('/GetEventFields')
  }
}

export default {
  userService,
  printService,
  eventService
}

