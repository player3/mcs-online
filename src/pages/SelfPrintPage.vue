<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md" style="max-width: 500px; width: 100%;">
      <div class="text-h4 text-center q-mb-lg">
        请输入门票编号
      </div>

      <!-- 门票编号显示框 -->
      <q-card class="q-mb-lg" flat bordered>
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
              <q-icon name="confirmation_number" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <!-- 自定义九宫格键盘 -->
      <div class="keyboard-container">
        <q-card flat bordered>
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
            class="full-width"
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
            class="full-width"
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
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { printBadge } from 'src/utils/printUtils'

export default defineComponent({
  name: 'SelfPrintPage',

  setup() {
    const $q = useQuasar()
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
          message: '获取字段配置失败，将使用默认配置'
        })
      }
    }

    // 确认打印
    const confirmPrint = async () => {
      if (!isValidTicketFormat.value) {
        $q.notify({
          type: 'negative',
          message: '请输入正确的门票编号格式（dddd-dddd-dddd）'
        })
        return
      }

      $q.loading.show({
        message: '正在签到验证...'
      })

      try {
        // 调用自动签到接口
        const response = await api.get(`/AutoSignin?regcode=${ticketNumber.value}`)
        
        console.log('签到响应:', response.data)
        
        // 检查返回数据
        if (response.data.success) {
          userInfo.value = response.data.data
          handlePrintBadge()
          
          $q.notify({
            type: 'positive',
            message: '签到成功！'
          })
        } else if (response.data && response.data.success === false) {
          $q.notify({
            type: 'negative',
            message: response.data.data || '签到失败'
          })
        } else {
          $q.notify({
            type: 'negative',
            message: '签到失败，返回数据格式错误'
          })
        }
      } catch (error) {
        console.error('签到失败:', error)
        const errorMsg = error.response?.data?.message || error.message || '签到失败，请检查网络连接或联系管理员'
        $q.notify({
          type: 'negative',
          message: errorMsg
        })
      } finally {
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
          message: '胸牌打印成功！'
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

      // 只处理数字、横线和退格键
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
      }
    }

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

