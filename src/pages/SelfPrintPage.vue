<template>
  <q-page class="flex flex-center self-print-page">
    <div class="q-pa-md" style="max-width: 80%; width: 100%;">
      <!-- 门票编号显示框 -->
      <q-card class="glass-card q-mb-lg" flat bordered>
        <q-card-section>
          <q-input
            ref="ticketInputRef"
            v-model="ticketNumber"
            class="ticket-input"
            outlined
            placeholder="____-____-____"
            maxlength="14"
            clearable
          >
            <template v-slot:prepend>
              <div class="ticket-input-icon-wrapper">
                <q-icon name="confirmation_number" color="white" size="48px" />
              </div>
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <!-- 自定义九宫格键盘 -->
      <div class="keyboard-container">
        <q-card class="glass-card keyboard-card" flat bordered>
          <q-card-section>
            <div class="row q-col-gutter-sm">
              <!-- 数字键1-9 -->
              <div
                v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
                :key="num"
                class="col-4"
              >
                <q-btn
                  class="keyboard-button full-width"
                  color="primary"
                  :label="num.toString()"
                  @click="inputNumber(num.toString())"
                  unelevated
                />
              </div>
              
              <!-- 横线按钮 -->
              <div class="col-4">
                <q-btn
                  class="keyboard-button full-width"
                  color="secondary"
                  label="-"
                  @click="inputNumber('-')"
                  unelevated
                />
              </div>
              
              <!-- 数字0 -->
              <div class="col-4">
                <q-btn
                  class="keyboard-button full-width"
                  color="primary"
                  label="0"
                  @click="inputNumber('0')"
                  unelevated
                />
              </div>
              
              <!-- 删除按钮 -->
              <div class="col-4">
                <q-btn
                  class="keyboard-button full-width"
                  color="negative"
                  icon="backspace"
                  @click="deleteChar"
                  unelevated
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 操作按钮 -->
      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-6">
          <q-btn
            class="full-width action-button"
            size="lg"
            color="grey"
            label="清空"
            icon="clear"
            @click="clearInput"
            unelevated
          />
        </div>
        <div class="col-6">
          <q-btn
            class="full-width action-button"
            size="lg"
            color="positive"
            label="确认签到"
            icon="check_circle"
            @click="confirmPrint"
            :disable="!isValidTicketFormat"
            unelevated
          />
        </div>
      </div>

      <!-- 用户信息显示对话框 -->
      <q-dialog v-model="showUserInfo">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">用户信息</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="q-gutter-sm">
              <div><strong>姓名：</strong>{{ userInfo.name }}</div>
              <div><strong>手机号：</strong>{{ userInfo.mobile }}</div>
              <div><strong>邮箱：</strong>{{ userInfo.email }}</div>
              <div><strong>门票编号：</strong>{{ userInfo.regcode }}</div>
              <div><strong>类型：</strong>{{ userInfo.ticketType }}</div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="取消" color="grey" v-close-popup />
            <q-btn flat label="打印胸牌" color="primary" @click="handlePrintBadge" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { api } from 'boot/axios'
import { printBadge } from 'src/utils/printUtils'

export default defineComponent({
  name: 'SelfPrintPage',

  setup() {
    const $q = useQuasar()
    const route = useRoute()
    const scene = computed(() => route.query.scene || '')
    const ticketNumber = ref('')
    const showUserInfo = ref(false)
    const ticketInputRef = ref(null) // 输入框引用
    const userInfo = ref({
      name: '',
      phone: '',
      email: '',
      ticketNumber: '',
      type: ''
    })
    const eventFields = ref(null) // 存储字段配置信息
    const eventData = ref(null) // 存储事件数据
    const fieldList = ref([]) // 存储字段列表

    // 检查门票格式是否正确
    const isValidTicketFormat = computed(() => {
      const pattern = /^(\d{4}-\d{4}-\d{4})|(\d{11})$/
      return pattern.test(ticketNumber.value)
    })

    // 输入数字或横线
    const inputNumber = (char) => {
      if (ticketNumber.value.length >= 14) {
        return
      }

      ticketNumber.value += char
    }

    // 删除字符
    const deleteChar = () => {
      ticketNumber.value = ticketNumber.value.slice(0, -1)
    }

    // 清空输入
    const clearInput = () => {
      ticketNumber.value = ''
    }

    // 获取活动字段配置
    const getEventFields = async () => {
      try {
        // 调用接口获取字段配置
        const response = await api.get('/GetEventFields')
        
        console.log('字段配置响应:', response.data)
        
        if (response.data) {
          eventFields.value = response.data
          
          // 保存data和fieldList到变量中
          if (response.data.data) {
            eventData.value = response.data.data
            console.log('事件数据:', eventData.value)
          }
          
          if (response.data.fieldList) {
            fieldList.value = response.data.fieldList
            console.log('字段列表:', fieldList.value)
          }
          
          console.log('字段配置加载完成')
        }
      } catch (error) {
        console.error('获取字段配置失败:', error)
        $q.notify({
          type: 'warning',
          message: '获取字段配置失败，将使用默认配置',
          classes: 'large-notify'
        })
      }
    }

    // 确认打印
    const confirmPrint = async () => {
      if (!isValidTicketFormat.value) {
        $q.notify({
          type: 'negative',
          message: '请输入正确的门票编号格式（dddd-dddd-dddd）',
          classes: 'large-notify'
        })
        return
      }

      $q.loading.show({
        message: '正在签到验证...'
      })

      try {
        // 调用自动签到接口
        const params = { regcode: ticketNumber.value }
        if (scene.value) params.scene = scene.value
        const response = await api.get('/AutoSignin', { params })
        
        console.log('签到响应:', response.data)
        
        // 检查返回数据
        if (response.data.success) {
          userInfo.value = response.data.data
          handlePrintBadge()

          $q.notify({
            type: 'positive',
            message: '签到成功！',
            classes: 'large-notify'
          })
        } else if (response.data && response.data.success === false) {
          $q.notify({
            type: 'negative',
            message: response.data.data || '签到失败',
            classes: 'large-notify'
          })
        } else {
          $q.notify({
            type: 'negative',
            message: '签到失败，返回数据格式错误',
            classes: 'large-notify'
          })
        }
      } catch (error) {
        console.error('签到失败:', error)
        const errorMsg = error.response?.data?.message || error.message || '签到失败，请检查网络连接或联系管理员'
        $q.notify({
          type: 'negative',
          message: errorMsg,
          classes: 'large-notify'
        })
      } finally {
        clearInput()
        $q.loading.hide()
      }
    }

    // 打印胸牌
    const handlePrintBadge = async () => {
      $q.loading.show({
        message: '正在打印胸牌...'
      })

      try {
        // 使用公共打印工具函数
        await printBadge(userInfo.value, fieldList.value, eventData.value)

        // 打印成功
        $q.notify({
          type: 'positive',
          message: '胸牌打印成功！',
          classes: 'large-notify'
        })
        showUserInfo.value = false
        clearInput()
      } catch (error) {
        console.error('打印失败:', error)
        const errorMsg = error.response?.data?.message || error.message || '打印失败，请联系管理员'
        $q.notify({
          type: 'negative',
          message: errorMsg
        })
      } finally {
        $q.loading.hide()
      }
    }

    // 全局键盘监听 - 支持扫码枪输入
    const handleGlobalKeydown = (event) => {
      // 如果当前焦点在输入框上，不做处理
      const activeElement = document.activeElement
      const inputElement = ticketInputRef.value?.$el?.querySelector('input')
      
      if (activeElement === inputElement) {
        return
      }

      // 只处理数字、横线、退格键和回车键
      const key = event.key
      const allowedKeys = /^[0-9-]$/
      
      if (allowedKeys.test(key)) {
        // 阻止默认行为（如快捷键）
        event.preventDefault()
        
        // 自动聚焦输入框
        if (inputElement) {
          inputElement.focus()
        }
        
        // 将字符添加到输入框
        if (ticketNumber.value.length < 14) {
          ticketNumber.value += key
        }
      } else if (key === 'Backspace') {
        // 支持退格键
        event.preventDefault()
        if (inputElement) {
          inputElement.focus()
        }
        deleteChar()
      } else if (key === 'Enter') {
        // 回车键手动触发签到
        event.preventDefault()
        if (isValidTicketFormat.value) {
          confirmPrint()
        }
      }
    }

    // 门票编号变化时，若格式合法则自动触发签到
    // 覆盖虚拟键盘、扫码枪、物理键盘聚焦输入框、粘贴等所有输入路径
    watch(ticketNumber, () => {
      if (isValidTicketFormat.value) {
        confirmPrint()
      }
    })

    // 页面加载时获取字段配置并添加全局键盘监听
    onMounted(() => {
      getEventFields()
      // 添加全局键盘监听
      window.addEventListener('keydown', handleGlobalKeydown)
    })

    // 页面卸载时移除全局键盘监听
    onUnmounted(() => {
      window.removeEventListener('keydown', handleGlobalKeydown)
    })

    return {
      ticketNumber,
      showUserInfo,
      userInfo,
      ticketInputRef,
      eventFields,
      eventData,
      fieldList,
      isValidTicketFormat,
      inputNumber,
      deleteChar,
      clearInput,
      confirmPrint,
      handlePrintBadge,
      getEventFields
    }
  }
})
</script>

<style scoped>
.self-print-page {
  min-height: 100vh;
  background: #000 url('/bg.jpg') center center / cover no-repeat;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 30vh 24px 6vh;
  box-sizing: border-box;
}

.self-print-panel {
  width: min(420px, 90vw);
  border-radius: 24px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
  color: #fff;
}

.self-print-panel .text-h4 {
  color: #fff;
}

.glass-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

.keyboard-container {
  margin-top: 12px;
}

.keyboard-button {
  height: 120px;
}

.ticket-input :deep(.q-field__control) {
  background: transparent;
  border-radius: 16px;
  border-color: rgba(255, 255, 255, 0.5);
  height: 120px;
}

.ticket-input :deep(.q-field__native),
.ticket-input :deep(.q-field__prefix),
.ticket-input :deep(.q-field__suffix) {
  color: #fff;
}

.ticket-input :deep(.q-field__append) {
  height: 100%;
  display: flex;
  align-items: center;
}

.ticket-input :deep(.q-field__append .q-icon) {
  color: #fff;
  font-size: 48px;
}

.ticket-input :deep(.q-field__native) {
  font-size: 48px;
}

.ticket-input :deep(.q-field__native::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

.ticket-input :deep(.q-field__prepend) {
  height: 100%;
}

.ticket-input-icon-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
}

.action-button {
  height: 120px;
}

.action-button :deep(.q-btn__content) {
  font-size: 48px;
}
</style>

<style>
/* Large notify styles for self-print page */
.large-notify {
  padding: 24px 32px;
  border-radius: 16px;
  min-width: 400px;
}
.large-notify .q-notification__icon {
  font-size: 56px;
}
.large-notify .q-notification__message {
  font-size: 32px;
  line-height: 1.4;
}
</style>
