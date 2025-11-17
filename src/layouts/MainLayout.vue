<template>
  <q-layout view="hHh lpR fFf">
    <!-- 打印机状态显示 -->
    <div class="printer-status-chip">
      <q-chip
        :color="printerOnline ? 'positive' : 'negative'"
        text-color="white"
        :icon="printerOnline ? 'print' : 'print_disabled'"
        size="md"
      >
        <span class="text-weight-medium">
          {{ printerOnline ? '打印机在线' : '打印机离线' }}
        </span>
      </q-chip>
      <q-tooltip v-if="!printerOnline" class="bg-negative">
        打印服务连接失败，请检查打印服务是否启动
      </q-tooltip>
    </div>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const printerOnline = ref(false)
    let pollingTimer = null

    // 检查打印机状态
    const checkPrinterStatus = async () => {
      try {
        const response = await axios.get('http://localhost:6789', {
          timeout: 3000 // 3秒超时
        })
        // 如果返回数据包含 'ok'，则认为在线
        printerOnline.value = response.data && 
          (response.data === 'ok' || response.data.status === 'ok' || 
           (typeof response.data === 'string' && response.data.toLowerCase().includes('ok')))
      } catch (error) {
        // 请求失败或超时，打印机离线
        printerOnline.value = false
      }
    }

    // 启动轮询
    const startPolling = () => {
      checkPrinterStatus() // 立即检查一次
      pollingTimer = setInterval(() => {
        checkPrinterStatus()
      }, 3000) // 每3秒检查一次
    }

    // 停止轮询
    const stopPolling = () => {
      if (pollingTimer) {
        clearInterval(pollingTimer)
        pollingTimer = null
      }
    }

    onMounted(() => {
      startPolling()
    })

    onUnmounted(() => {
      stopPolling()
    })

    return {
      printerOnline
    }
  }
})
</script>

<style scoped>
.printer-status-chip {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 2000;
}
</style>
