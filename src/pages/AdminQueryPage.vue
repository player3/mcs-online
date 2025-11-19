<template>
  <q-page class="q-pa-md">
    <div class="q-pa-md" style="max-width: 1200px; margin: 0 auto;">
      <div class="row items-center justify-between q-mb-lg">
        <div class="text-h4">
          用户信息查询
        </div>
      </div>

      <!-- SessionId 显示 -->
      <q-banner v-if="sessionId" class="bg-blue-1 q-mb-md" dense>
        <template v-slot:avatar>
          <q-icon name="info" color="primary" />
        </template>
        当前会话ID: <strong>{{ sessionId }}</strong>
      </q-banner>

      <!-- 查询表单 -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="text-h6 q-mb-md">查询条件</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="queryForm.name"
                label="姓名"
                outlined
                clearable
                @keyup.enter="handleEnterKey"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="queryForm.py"
                label="姓名拼音"
                outlined
                clearable
                @keyup.enter="handleEnterKey"
              >
                <template v-slot:prepend>
                  <q-icon name="spellcheck" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="queryForm.phone"
                label="手机号"
                outlined
                clearable
                @keyup.enter="handleEnterKey"
              >
                <template v-slot:prepend>
                  <q-icon name="phone" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="queryForm.email"
                label="邮箱"
                outlined
                clearable
                @keyup.enter="handleEnterKey"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                ref="ticketNumberInput"
                v-model="queryForm.ticketNumber"
                label="门票编号"
                outlined
                clearable
                placeholder="dddd-dddd-dddd"
                @update:model-value="onTicketNumberInput"
                @keyup.enter="handleEnterKey"
              >
                <template v-slot:prepend>
                  <q-icon name="confirmation_number" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            label="重置"
            color="grey"
            icon="refresh"
            @click="resetForm"
            unelevated
          />
          <q-btn
            label="查询"
            color="primary"
            icon="search"
            @click="searchUser(1)"
            :disable="!hasQueryCondition"
            unelevated
          />
        </q-card-actions>
      </q-card>

      <!-- 查询结果表格 -->
      <q-card v-if="searchResults.length > 0" flat bordered>
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">查询结果</div>
            <div class="text-caption text-grey">
              共 {{ pagination.total }} 条记录
            </div>
          </div>

          <q-table
            :rows="searchResults"
            :columns="tableColumns"
            row-key="id"
            flat
            bordered
            :pagination="tablePagination"
            hide-pagination
          >
            <!-- 姓名列 -->
            <template v-slot:body-cell-name="props">
              <q-td :props="props">
                <div class="row items-center cursor-pointer" @click="showUserDetail(props.row)">
                  <q-avatar size="32px" color="primary" text-color="white" icon="person" class="q-mr-sm" />
                  <span class="text-weight-medium text-primary">{{ props.row.name }}</span>
                  <q-tooltip>点击查看详情</q-tooltip>
                </div>
              </q-td>
            </template>

            <!-- 类型列 -->
            <template v-slot:body-cell-type="props">
              <q-td :props="props">
                <q-badge :color="getTypeBadgeColor(props.row.type || props.row.ticketType)">
                  {{ props.row.type || props.row.ticketType || '-' }}
                </q-badge>
              </q-td>
            </template>

            <!-- 联系方式列 -->
            <template v-slot:body-cell-contact="props">
              <q-td :props="props">
                <div>{{ props.row.mobile || props.row.phone || '-' }}</div>
                <div class="text-caption text-grey">{{ props.row.email || '-' }}</div>
              </q-td>
            </template>

            <!-- 门票列 -->
            <template v-slot:body-cell-ticket="props">
              <q-td :props="props">
                {{ props.row.ticket || '-' }}
              </q-td>
            </template>

            <!-- 公司列 -->
            <template v-slot:body-cell-company="props">
              <q-td :props="props">
                {{ props.row.company || '-' }}
              </q-td>
            </template>

            <!-- 预报名状态列 -->
            <template v-slot:body-cell-complaintState="props">
              <q-td :props="props">
                {{ props.row.complaintState || '-' }}
              </q-td>
            </template>

            <!-- 支付状态列 -->
            <template v-slot:body-cell-payState="props">
              <q-td :props="props">
                <q-badge :color="props.row.payState === 1 ? 'positive' : 'grey'">
                  {{ getPayStateLabel(props.row.payState) }}
                </q-badge>
              </q-td>
            </template>

            <!-- 签到状态列 -->
            <template v-slot:body-cell-signed="props">
              <q-td :props="props">
                <q-badge :color="props.row.signed ? 'positive' : 'grey'">
                  {{ props.row.signed ? '已签到' : '未签到' }}
                </q-badge>
              </q-td>
            </template>

            <!-- 操作列 -->
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  size="sm"
                  color="primary"
                  icon="check_circle"
                  label="签到"
                  @click="handleSignin(props.row)"
                  :disable="props.row.signed"
                  unelevated
                  dense
                  class="q-mr-sm"
                />
                <q-btn
                  size="sm"
                  color="secondary"
                  icon="print"
                  label="打印"
                  @click="handlePrint(props.row)"
                  unelevated
                  dense
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-separator />

        <!-- 分页组件 -->
        <q-card-section class="q-pt-md">
          <div class="row justify-center">
            <q-pagination
              v-model="pagination.page"
              :max="Math.ceil(pagination.total / pagination.pageSize)"
              :max-pages="7"
              direction-links
              boundary-links
              @update:model-value="onPageChange"
              color="primary"
              active-design="unelevated"
              active-color="primary"
              active-text-color="white"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- 用户详细信息 -->
      <q-card v-if="selectedUser" class="user-card q-mt-lg" flat bordered>
        <q-card-section class="bg-primary text-white">
          <div class="text-h5">用户详细信息</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label overline>姓名</q-item-label>
                <q-item-label class="text-h6">{{ selectedUser.name }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label overline>手机号</q-item-label>
                <q-item-label class="text-h6">{{ selectedUser.mobile || selectedUser.phone }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label overline>邮箱</q-item-label>
                <q-item-label class="text-h6">{{ selectedUser.email }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label overline>门票编号</q-item-label>
                <q-item-label class="text-h6">{{ selectedUser.regcode || selectedUser.ticketNumber }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label overline>类型</q-item-label>
                <q-item-label class="text-h6">
                  <q-badge :color="getTypeBadgeColor(selectedUser.type)">
                    {{ selectedUser.type }}
                  </q-badge>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="selectedUser.company">
              <q-item-section>
                <q-item-label overline>公司</q-item-label>
                <q-item-label class="text-h6">{{ selectedUser.company }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="selectedUser.position">
              <q-item-section>
                <q-item-label overline>职位</q-item-label>
                <q-item-label class="text-h6">{{ selectedUser.position }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label overline>打印状态</q-item-label>
                <q-item-label class="text-h6">
                  <q-badge :color="selectedUser.printed ? 'positive' : 'grey'">
                    {{ selectedUser.printed ? '已打印' : '未打印' }}
                  </q-badge>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="selectedUser.printTime">
              <q-item-section>
                <q-item-label overline>打印时间</q-item-label>
                <q-item-label class="text-h6">{{ formatDateTime(selectedUser.printTime) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-md q-py-md">
          <q-btn
            label="编辑信息"
            color="secondary"
            icon="edit"
            @click="openEditDialog(selectedUser)"
            flat
          />
          <q-btn
            label="取消选择"
            color="grey"
            icon="clear"
            @click="clearSelection"
            flat
          />
          <q-btn
            label="打印胸牌"
            color="primary"
            icon="print"
            @click="printUserBadge"
            unelevated
          />
        </q-card-actions>
      </q-card>

      <!-- 无结果提示 -->
      <q-card v-if="searchPerformed && searchResults.length === 0" flat bordered>
        <q-card-section class="text-center q-py-xl">
          <q-icon name="info" size="64px" color="grey" />
          <div class="text-h6 text-grey q-mt-md">未找到匹配的用户信息</div>
          <div class="text-grey-7 q-mt-sm">请尝试其他查询条件</div>
        </q-card-section>
      </q-card>

      <!-- 用户详情对话框 -->
      <q-dialog v-model="showDetailDialog" :maximized="$q.screen.lt.sm">
        <q-card style="min-width: 500px; max-width: 700px;">
          <q-card-section class="row items-center bg-primary text-white">
            <q-avatar size="48px" color="white" text-color="primary" icon="person" class="q-mr-md" />
            <div class="text-h5">{{ detailUser?.name || '用户详情' }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-separator />

          <q-card-section v-if="detailUser" class="scroll" style="max-height: 60vh">
            <q-list>
              <q-item v-for="(value, key) in filteredDetailUser" :key="key">
                <q-item-section>
                  <q-item-label overline>{{ formatFieldName(key) }}</q-item-label>
                  <q-item-label class="text-body1">
                    <template v-if="key === 'type' || key === 'ticketType'">
                      <q-badge :color="getTypeBadgeColor(value)">{{ value }}</q-badge>
                    </template>
                    <template v-else-if="key === 'printed'">
                      <q-badge :color="value ? 'positive' : 'grey'">
                        {{ value ? '已打印' : '未打印' }}
                      </q-badge>
                    </template>
                    <template v-else-if="key === 'signed'">
                      <q-badge :color="value ? 'positive' : 'grey'">
                        {{ value ? '已签到' : '未签到' }}
                      </q-badge>
                    </template>
                    <template v-else-if="key === 'printTime' || key === 'signinTime'">
                      {{ formatDateTime(value) }}
                    </template>
                    <template v-else>
                      {{ value }}
                    </template>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn
              label="编辑"
              color="secondary"
              icon="edit"
              @click="openEditDialog(detailUser)"
              unelevated
            />
            <q-btn
              label="签到"
              color="primary"
              icon="check_circle"
              @click="handleSigninFromDetail"
              :disable="detailUser?.signed"
              unelevated
            />
            <q-btn
              label="打印"
              color="secondary"
              icon="print"
              @click="handlePrintFromDetail"
              unelevated
            />
            <q-btn label="关闭" color="grey" flat v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- 用户信息编辑对话框 -->
      <q-dialog v-model="showEditDialog" persistent>
        <q-card style="min-width: 500px; max-width: 700px;">
          <q-card-section class="row items-center">
            <div class="text-h6">编辑用户信息</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup @click="cancelEdit" />
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div
                v-for="field in editFieldEntries"
                :key="field.key"
                class="col-12 col-md-6"
              >
                <q-toggle
                  v-if="field.type === 'boolean'"
                  v-model="editUserForm[field.key]"
                  :label="field.label"
                  color="primary"
                  keep-color
                />
                <q-input
                  v-else
                  v-model="editUserForm[field.key]"
                  :label="field.label"
                  outlined
                  :disable="readOnlyEditFields.includes(field.key)"
                  :readonly="readOnlyEditFields.includes(field.key)"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn label="取消" color="grey" flat @click="cancelEdit" />
            <q-btn label="保存" color="primary" icon="save" @click="saveUserEdits" unelevated />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { api } from 'boot/axios'
import { printBadge } from 'src/utils/printUtils'

export default defineComponent({
  name: 'AdminQueryPage',

  setup() {
    const $q = useQuasar()
    const route = useRoute()
    
    const queryForm = ref({
      name: '',
      py: '',
      phone: '',
      email: '',
      ticketNumber: ''
    })

    const searchResults = ref([])
    const selectedUser = ref(null)
    const searchPerformed = ref(false)

    // 用户详情对话框
    const showDetailDialog = ref(false)
    const detailUser = ref(null)

    // 用户编辑对话框
    const showEditDialog = ref(false)
    const createEmptyEditForm = () => ({})
    const editUserForm = ref(createEmptyEditForm())

    // 门票编号输入框引用
    const ticketNumberInput = ref(null)

    // 分页相关
    const pagination = ref({
      page: 1,        // UI显示从1开始
      pageSize: 10,
      total: 0
    })

    // 字段配置相关
    const eventFields = ref(null) // 存储字段配置信息
    const eventData = ref(null) // 存储事件数据
    const fieldList = ref([]) // 存储字段列表
    
    // 从query参数获取sessionId
    const sessionId = ref(route.query.sessionId || '')

    // 表格列定义
    const tableColumns = [
      {
        name: 'name',
        label: '姓名',
        field: 'name',
        align: 'left',
        sortable: true
      },
      {
        name: 'type',
        label: '门票类型',
        field: row => row.type || row.ticketType,
        align: 'left',
        sortable: true
      },
      {
        name: 'contact',
        label: '联系方式',
        field: row => row.mobile || row.phone || row.email,
        align: 'left',
        sortable: false
      },
      {
        name: 'company',
        label: '公司',
        field: 'company',
        align: 'left',
        sortable: true
      },
      {
        name: 'complaintState',
        label: '预报名状态',
        field: 'complaintState',
        align: 'center',
        sortable: true
      },
      {
        name: 'payState',
        label: '支付状态',
        field: 'payState',
        align: 'center',
        sortable: true
      },
      {
        name: 'signed',
        label: '签到状态',
        field: 'signed',
        align: 'center',
        sortable: true
      },
      {
        name: 'actions',
        label: '操作',
        field: 'actions',
        align: 'center',
        style: 'width: 200px'
      }
    ]

    // 表格分页配置（用于表格内部，实际分页由外部控制）
    const tablePagination = {
      rowsPerPage: 0 // 0表示显示所有行
    }

    // 检查是否有查询条件
    const hasQueryCondition = computed(() => {
      return !!(
        queryForm.value.name ||
        queryForm.value.py ||
        queryForm.value.phone ||
        queryForm.value.email ||
        queryForm.value.ticketNumber
      )
    })

    // 过滤掉空值的用户详情数据
    const filteredDetailUser = computed(() => {
      if (!detailUser.value) return {}
      
      const filtered = {}
      Object.keys(detailUser.value).forEach(key => {
        const value = detailUser.value[key]
        
        // 保留以下字段即使它们的值为 false 或 0
        const alwaysShowFields = ['printed', 'signed']
        
        // 如果值不为空，或者是必须显示的字段
        if (
          alwaysShowFields.includes(key) ||
          (value !== null && value !== undefined && value !== '')
        ) {
          filtered[key] = value
        }
      })
      
      return filtered
    })

    const isSameUser = (user, target) => {
      if (!user || !target) return false
      if (user.id && target.id && user.id === target.id) return true
      if (user.regcode && target.regcode && user.regcode === target.regcode) return true
      if (user.ticketNumber && target.ticketNumber && user.ticketNumber === target.ticketNumber) return true
      return false
    }

    const editFieldEntries = computed(() => {
      const form = editUserForm.value || {}
      const nonEditableKeys = [
        'id',
        '__ob__',
        'avatar',
        'province',
        'city',
        'customer_type',
        'industry',
        'regcode',
        'ticketNumber',
        'payState',
        'country',
        'signed',
        'complaintState',
        'signinTime',
        'ticket',
        'department',
      ]
      return Object.keys(form)
        .filter(key => !nonEditableKeys.includes(key))
        .map(key => ({
          key,
          label: formatFieldName(key),
          type: typeof form[key] === 'boolean' ? 'boolean' : 'text'
        }))
    })
    const readOnlyEditFields = ['email', 'mobile', 'phone']

    const resetEditForm = () => {
      editUserForm.value = createEmptyEditForm()
    }

    const openEditDialog = (user) => {
      if (!user) return
      const clone = JSON.parse(JSON.stringify(user))
      if (clone.mobile == null && clone.phone) {
        clone.mobile = clone.phone
      }
      if (clone.phone == null && clone.mobile) {
        clone.phone = clone.mobile
      }
      if (clone.regcode == null && clone.ticketNumber) {
        clone.regcode = clone.ticketNumber
      }
      if (clone.ticketNumber == null && clone.regcode) {
        clone.ticketNumber = clone.regcode
      }
      editUserForm.value = clone
      showEditDialog.value = true
    }

    const cancelEdit = () => {
      showEditDialog.value = false
      resetEditForm()
    }

    const saveUserEdits = async () => {
      const payload = { ...editUserForm.value }
      const fieldValues = { ...(payload.fieldValues || {}) }

      Object.keys(payload).forEach(key => {
        if (key.startsWith('cf_')) {
          fieldValues[key] = payload[key]
          delete payload[key]
        }
      })

      payload.fieldValues = fieldValues

      if (payload.mobile && !payload.phone) {
        payload.phone = payload.mobile
      }

      if (payload.phone && !payload.mobile) {
        payload.mobile = payload.phone
      }

      if (!payload.id && !payload.regcode && !payload.ticketNumber) {
        showEditDialog.value = false
        resetEditForm()
        return
      }

      $q.loading.show({
        message: '正在保存用户信息...'
      })

      try {
        const response = await api.post('/editMember', payload)
        if (response.data?.success === false) {
          $q.notify({
            type: 'negative',
            message: response.data?.message || '保存失败，请稍后重试'
          })
          return
        }

        const responseData = response.data?.data || {}
        const updatedUser = { ...payload, ...responseData }

        const mergedFieldValues = {
          ...(payload.fieldValues || {}),
          ...(responseData.fieldValues || {})
        }

        if (Object.keys(mergedFieldValues).length) {
          updatedUser.fieldValues = mergedFieldValues
          Object.keys(mergedFieldValues).forEach(key => {
            updatedUser[key] = mergedFieldValues[key]
          })
        }
        delete updatedUser.fieldValues

        searchResults.value = searchResults.value.map(user => {
          if (isSameUser(user, updatedUser)) {
            return { ...user, ...updatedUser }
          }
          return user
        })

        if (selectedUser.value && isSameUser(selectedUser.value, updatedUser)) {
          selectedUser.value = { ...selectedUser.value, ...updatedUser }
        }

        if (detailUser.value && isSameUser(detailUser.value, updatedUser)) {
          detailUser.value = { ...detailUser.value, ...updatedUser }
        }

        $q.notify({
          type: 'positive',
          message: response.data?.message || '用户信息已更新'
        })

        showEditDialog.value = false
        resetEditForm()
      } catch (error) {
        console.error('保存用户信息失败:', error)
        const errorMsg = error.response?.data?.message || error.message || '保存失败，请稍后重试'
        $q.notify({
          type: 'negative',
          message: errorMsg
        })
      } finally {
        $q.loading.hide()
      }
    }

    // 重置表单
    const resetForm = () => {
      queryForm.value = {
        name: '',
        py: '',
        phone: '',
        email: '',
        ticketNumber: ''
      }
      searchResults.value = []
      selectedUser.value = null
      searchPerformed.value = false
      // 重置分页
      pagination.value.page = 1
      pagination.value.total = 0
    }

    // 门票编号输入事件处理
    const onTicketNumberInput = (value) => {
      // 检查格式是否为 dddd-dddd-dddd
      const pattern = /^\d{4}-\d{4}-\d{4}$/
      
      if (value && pattern.test(value)) {
        console.log('门票编号格式正确，自动触发查询:', value)
        
        // 清空其他查询条件，只使用门票编号查询
        queryForm.value.name = ''
        queryForm.value.py = ''
        queryForm.value.phone = ''
        queryForm.value.email = ''
        
        // 延迟触发查询，避免与输入事件冲突
        setTimeout(() => {
          searchUser(1)
        }, 100)
      }
    }

    // 处理回车键事件
    const handleEnterKey = () => {
      // 检查是否有查询条件
      if (hasQueryCondition.value) {
        console.log('回车键触发查询')
        searchUser(1)
      } else {
        $q.notify({
          type: 'warning',
          message: '请至少填写一个查询条件',
          position: 'top'
        })
      }
    }

    // 查询用户
    const searchUser = async (page = 1) => {
      if (!hasQueryCondition.value) {
        $q.notify({
          type: 'warning',
          message: '请至少填写一个查询条件'
        })
        return
      }

      // 确保page是有效的数字
      if (typeof page !== 'number' || isNaN(page) || page < 1) {
        console.error('无效的页码:', page)
        page = 1
      }

      $q.loading.show({
        message: '正在查询用户信息...'
      })

      try {
        // 更新当前页码（UI显示）
        pagination.value.page = page

        // 调用 AutoSearch 接口（page从0开始）
        const apiPage = page - 1  // UI的第1页对应API的第0页
        
        const response = await api.get('/AutoSearch', {
          params: {
            sessionId: sessionId.value,
            page: apiPage,  // 传递从0开始的页码
            pageSize: pagination.value.pageSize,
            name: queryForm.value.name || '',
            py: queryForm.value.py || '',
            regcode: queryForm.value.ticketNumber || '',
            email: queryForm.value.email || '',
            mobile: queryForm.value.phone || ''
          }
        })

        console.log('查询响应:', response.data)
        console.log('请求参数 - UI页码:', page, '- API页码:', apiPage)

        if (response.data && response.data.success) {
          searchResults.value = response.data.data || []
          pagination.value.total = response.data.total || 0
          searchPerformed.value = true
          selectedUser.value = null

          if (searchResults.value.length === 0) {
            $q.notify({
              type: 'info',
              message: '未找到匹配的用户信息'
            })
          } else {
            $q.notify({
              type: 'positive',
              message: `找到 ${pagination.value.total} 条记录，当前第 ${pagination.value.page} 页`
            })
          }
        } else {
          $q.notify({
            type: 'negative',
            message: response.data.message || '查询失败'
          })
        }
      } catch (error) {
        console.error('查询失败:', error)
        const errorMsg = error.response?.data?.message || error.message || '查询失败，请检查网络连接或联系管理员'
        $q.notify({
          type: 'negative',
          message: errorMsg
        })
      } finally {
        $q.loading.hide()
        
        // 如果是通过门票编号查询，选中输入框内容以便继续输入
        if (queryForm.value.ticketNumber && ticketNumberInput.value) {
          // 延迟执行以确保loading隐藏后才选中
          setTimeout(() => {
            if (ticketNumberInput.value && ticketNumberInput.value.$el) {
              const inputElement = ticketNumberInput.value.$el.querySelector('input')
              if (inputElement) {
                inputElement.focus()
                inputElement.select()
              }
            }
          }, 100)
        }
      }
    }

    // 页码变化（接收number类型的新页码）
    const onPageChange = (newPage) => {
      console.log('页码变化:', newPage, '类型:', typeof newPage)
      
      // 确保newPage是有效的数字
      if (typeof newPage === 'number' && !isNaN(newPage) && newPage >= 1) {
        searchUser(newPage)
      } else {
        console.error('页码变化接收到无效值:', newPage)
        // 使用当前页码或默认为1
        searchUser(pagination.value.page || 1)
      }
    }

    // 选择用户
    const selectUser = (user) => {
      selectedUser.value = user
    }

    // 清除选择
    const clearSelection = () => {
      selectedUser.value = null
    }

    // 获取类型徽章颜色
    const getTypeBadgeColor = (type) => {
      const colors = {
        'VIP': 'red',
        '嘉宾': 'purple',
        '参会者': 'blue',
        '工作人员': 'green',
        '媒体': 'orange'
      }
      return colors[type] || 'grey'
    }

    const getPayStateLabel = (state) => {
      const map = {
        1: '已支付',
        2: '未支付'
      }
      return map[state] || '-'
    }

    // 格式化日期时间
    const formatDateTime = (dateTime) => {
      if (!dateTime) return '-'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN')
    }

    // 显示用户详情
    const showUserDetail = (user) => {
      detailUser.value = { ...user }
      showDetailDialog.value = true
    }

    // 格式化字段名
    const formatFieldName = (key) => {
      // 第一层：优先使用eventData中的映射
      if (eventData.value && eventData.value[key]) {
        return eventData.value[key]
      }
      
      // 第二层：从fieldList中查找字段描述
      if (fieldList.value && fieldList.value.length > 0) {
        const field = fieldList.value.find(f => f.name === key)
        if (field && field.describe) {
          return field.describe
        }
      }
      
      // 第三层：使用默认映射
      const defaultFieldNameMap = {
        regcode: '门票编号',
        ticketNumber: '门票编号',
        type: '类型',
        ticketType: '票种',
        printed: '打印状态',
        signed: '签到状态',
        printTime: '打印时间',
        signinTime: '签到时间',
        position: '职位',
        phone: '手机号'
      }
      
      // 第四层：返回原始key
      return defaultFieldNameMap[key] || key
    }

    // 从详情对话框签到
    const handleSigninFromDetail = async () => {
      if (!detailUser.value) return
      await handleSignin(detailUser.value)
    }

    // 从详情对话框打印
    const handlePrintFromDetail = async () => {
      if (!detailUser.value) return
      await handlePrint(detailUser.value)
    }

    // 处理签到
    const handleSignin = async (user) => {
      $q.loading.show({
        message: '正在签到...'
      })

      try {
        const response = await api.get(`/AutoSignin?regcode=${user.regcode || user.ticketNumber}`)
        
        console.log('签到响应:', response.data)
        
        if (response.data.success) {
          $q.notify({
            type: 'positive',
            message: `${user.name} 签到成功！`
          })
          
          // 更新用户签到状态
          user.signed = true
          user.signinTime = new Date().toISOString()
          handlePrint(user)
        } else {
          $q.notify({
            type: 'negative',
            message: response.data.message || '签到失败'
          })
        }
      } catch (error) {
        console.error('签到失败:', error)
        const errorMsg = error.response?.data?.message || error.message || '签到失败，请联系管理员'
        $q.notify({
          type: 'negative',
          message: errorMsg
        })
      } finally {
        $q.loading.hide()
      }
    }

    // 处理打印
    const handlePrint = async (user) => {
      $q.loading.show({
        message: '正在打印胸牌...'
      })

      try {
        // 使用公共打印工具函数
        await printBadge(user, fieldList.value, eventData.value)

        // 打印成功
        $q.notify({
          type: 'positive',
          message: `${user.name} 胸牌打印成功！`
        })
        
        // 更新打印状态
        user.printed = true
        user.printTime = new Date().toISOString()
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

    // 打印用户胸牌
    const printUserBadge = async () => {
      if (!selectedUser.value) return

      $q.loading.show({
        message: '正在打印胸牌...'
      })

      try {
        // 使用公共打印工具函数
        await printBadge(selectedUser.value, fieldList.value, eventData.value)

        // 打印成功
        $q.notify({
          type: 'positive',
          message: '胸牌打印成功！'
        })
        
        // 更新打印状态
        selectedUser.value.printed = true
        selectedUser.value.printTime = new Date().toISOString()
        
        // 更新列表中的用户信息
        const index = searchResults.value.findIndex(u => u.id === selectedUser.value.id)
        if (index !== -1) {
          searchResults.value[index] = { ...selectedUser.value }
        }
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

    // 页面加载时获取字段配置
    onMounted(() => {
      getEventFields()
    })

    return {
      queryForm,
      searchResults,
      selectedUser,
      searchPerformed,
      pagination,
      sessionId,
      tableColumns,
      tablePagination,
      eventFields,
      eventData,
      fieldList,
      showDetailDialog,
      detailUser,
      showEditDialog,
      editUserForm,
      editFieldEntries,
      filteredDetailUser,
      readOnlyEditFields,
      ticketNumberInput,
      hasQueryCondition,
      resetForm,
      searchUser,
      onTicketNumberInput,
      handleEnterKey,
      onPageChange,
      handleSignin,
      handlePrint,
      selectUser,
      clearSelection,
      getTypeBadgeColor,
      getPayStateLabel,
      formatDateTime,
      formatFieldName,
      showUserDetail,
      openEditDialog,
      saveUserEdits,
      cancelEdit,
      handleSigninFromDetail,
      handlePrintFromDetail,
      getEventFields,
      printUserBadge
    }
  }
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}
</style>
