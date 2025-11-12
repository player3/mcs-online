<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- 页面标题 -->
      <div class="col-12">
        <div class="text-h4 q-mb-md">
          <q-icon name="settings" class="q-mr-sm" />
          打印配置管理
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="col-12">
        <div class="row q-col-gutter-sm">
          <div class="col-auto">
            <q-btn
              color="primary"
              icon="refresh"
              label="刷新配置"
              @click="loadPrintConfig"
              :loading="loading"
            />
          </div>
          <div class="col-auto" v-if="config">
            <q-btn
              color="secondary"
              icon="preview"
              label="预览效果"
              @click="showPreview = !showPreview"
            />
          </div>
        </div>
      </div>

      <!-- 打印预览 -->
      <div class="col-12" v-if="config && showPreview">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="preview" class="q-mr-sm" />
              打印效果预览
            </div>
            <div class="preview-container">
              <canvas
                ref="previewCanvas"
                class="preview-canvas"
                :width="previewWidth"
                :height="previewHeight"
              ></canvas>
            </div>
            <div class="text-caption text-grey-6 q-mt-sm text-center">
              预览比例: {{ previewScale.toFixed(2) }}x (实际尺寸: {{ config.card.width }}×{{ config.card.height }}px)
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 配置信息展示 -->
      <div class="col-12" v-if="config">
        <!-- 卡片基本信息 -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="credit_card" class="q-mr-sm" />
              卡片配置
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-chip color="primary" text-color="white" icon="straighten">
                  宽度: {{ config.card.width }}px
                </q-chip>
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-chip color="primary" text-color="white" icon="straighten">
                  高度: {{ config.card.height }}px
                </q-chip>
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-chip 
                  :color="config.card.printImage ? 'positive' : 'negative'" 
                  text-color="white" 
                  icon="image"
                >
                  打印图片: {{ config.card.printImage ? '是' : '否' }}
                </q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 二维码配置 -->
        <q-card class="q-mb-md" v-if="config.qrCode">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="qr_code" class="q-mr-sm" />
              二维码配置
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-chip color="secondary" text-color="white" icon="settings_overscan">
                  DPI: {{ config.qrCode.dpi }}
                </q-chip>
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-chip color="secondary" text-color="white" icon="photo_size_select_small">
                  尺寸: {{ config.qrCode.width }}×{{ config.qrCode.height }}
                </q-chip>
              </div>
              <div class="col-md-3 col-sm-6 col-xs-12">
                <q-chip color="secondary" text-color="white" icon="gps_fixed">
                  位置: ({{ config.qrCode.x }}, {{ config.qrCode.y }})
                </q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 文本打印配置列表 -->
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="text_fields" class="q-mr-sm" />
              文本打印配置 ({{ config.printTexts.length }} 项)
            </div>

            <!-- 使用表格展示 -->
            <q-table
              :rows="config.printTexts"
              :columns="textColumns"
              row-key="index"
              flat
              bordered
              :rows-per-page-options="[10, 20, 50]"
              :pagination="{ rowsPerPage: 10 }"
            >
              <!-- 文本列 - 支持多行显示 -->
              <template v-slot:body-cell-text="props">
                <q-td :props="props">
                  <div class="text-weight-medium">{{ props.row.text }}</div>
                </q-td>
              </template>

              <!-- 尺寸列 -->
              <template v-slot:body-cell-size="props">
                <q-td :props="props">
                  <q-badge color="blue-grey" :label="`${props.row.width}×${props.row.height}`" />
                </q-td>
              </template>

              <!-- 位置列 -->
              <template v-slot:body-cell-position="props">
                <q-td :props="props">
                  <q-badge color="teal" :label="`(${props.row.x}, ${props.row.y})`" />
                </q-td>
              </template>

              <!-- 字体列 -->
              <template v-slot:body-cell-font="props">
                <q-td :props="props">
                  <div>{{ props.row.fontType }}</div>
                  <div class="text-caption text-grey">{{ props.row.fontSize }}pt</div>
                </q-td>
              </template>

              <!-- 对齐列 -->
              <template v-slot:body-cell-align="props">
                <q-td :props="props">
                  <div>横: {{ props.row.stringAlign }}</div>
                  <div>纵: {{ props.row.lineAlignment }}</div>
                </q-td>
              </template>

              <!-- 其他属性 -->
              <template v-slot:body-cell-properties="props">
                <q-td :props="props">
                  <q-chip 
                    v-if="props.row.bold" 
                    size="sm" 
                    color="orange" 
                    text-color="white"
                  >
                    粗体
                  </q-chip>
                  <q-chip 
                    v-if="props.row.compatible" 
                    size="sm" 
                    color="green" 
                    text-color="white"
                  >
                    兼容
                  </q-chip>
                  <div class="text-caption text-grey q-mt-xs">
                    行数: {{ props.row.textPrintRow }}
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- 无配置提示 -->
      <div class="col-12" v-else-if="!loading">
        <q-card flat bordered>
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="settings_suggest" size="64px" color="grey-5" />
            <div class="text-h6 text-grey-6 q-mt-md">
              暂无配置信息
            </div>
            <div class="text-body2 text-grey-5 q-mt-sm">
              点击"刷新配置"按钮加载打印配置
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

export default defineComponent({
  name: 'SettingsPage',

  setup() {
    const $q = useQuasar()
    const loading = ref(false)
    const config = ref(null)
    const showPreview = ref(false)
    const previewCanvas = ref(null)
    const previewWidth = ref(400)
    const previewHeight = ref(533)
    const previewScale = ref(1)

    // 表格列定义
    const textColumns = [
      {
        name: 'text',
        label: '文本内容',
        field: 'text',
        align: 'left',
        sortable: true
      },
      {
        name: 'size',
        label: '尺寸',
        field: 'width',
        align: 'center'
      },
      {
        name: 'position',
        label: '位置',
        field: 'x',
        align: 'center'
      },
      {
        name: 'font',
        label: '字体',
        field: 'fontType',
        align: 'center'
      },
      {
        name: 'align',
        label: '对齐方式',
        field: 'stringAlign',
        align: 'center'
      },
      {
        name: 'properties',
        label: '属性',
        field: 'bold',
        align: 'center'
      }
    ]

    // 解析 XML 配置
    const parseXmlConfig = (xmlString) => {
      try {
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml')

        // 检查是否有解析错误
        const parserError = xmlDoc.querySelector('parsererror')
        if (parserError) {
          throw new Error('XML 解析失败')
        }

        const customSetting = xmlDoc.querySelector('CustomSetting')
        if (!customSetting) {
          throw new Error('无效的配置格式')
        }

        // 解析卡片配置
        const cardElement = customSetting.querySelector('Card')
        const cardConfig = {
          width: parseInt(cardElement.querySelector('Width')?.textContent || '0'),
          height: parseInt(cardElement.querySelector('Height')?.textContent || '0'),
          printImage: cardElement.querySelector('PrintImage')?.textContent === 'true'
        }

        // 解析二维码配置
        const qrCodeElement = cardElement.querySelector('QRCode')
        let qrCodeConfig = null
        if (qrCodeElement) {
          qrCodeConfig = {
            dpi: parseInt(qrCodeElement.querySelector('Dpi')?.textContent || '0'),
            width: parseInt(qrCodeElement.querySelector('Width')?.textContent || '0'),
            height: parseInt(qrCodeElement.querySelector('Height')?.textContent || '0'),
            x: parseInt(qrCodeElement.querySelector('X')?.textContent || '0'),
            y: parseInt(qrCodeElement.querySelector('Y')?.textContent || '0')
          }
        }

        // 解析文本打印配置
        const printTextElements = cardElement.querySelectorAll('PrintTexts > PrintTextSetting')
        const printTexts = Array.from(printTextElements).map((element, index) => ({
          index,
          text: element.querySelector('Text')?.textContent || '',
          width: parseInt(element.querySelector('Width')?.textContent || '0'),
          height: parseInt(element.querySelector('Height')?.textContent || '0'),
          x: parseInt(element.querySelector('X')?.textContent || '0'),
          y: parseInt(element.querySelector('Y')?.textContent || '0'),
          fontType: element.querySelector('FontType')?.textContent || '',
          fontSize: parseInt(element.querySelector('FontSize')?.textContent || '0'),
          bold: element.querySelector('Blod')?.textContent === 'true', // 注意：原XML中拼写为Blod
          stringAlign: element.querySelector('StringAlgin')?.textContent || '', // 注意：原XML中拼写为StringAlgin
          lineAlignment: element.querySelector('LineAlignment')?.textContent || '',
          arrange: element.querySelector('Arrange')?.textContent || '',
          compatible: element.querySelector('bCompatible')?.textContent === 'true',
          textPrintRow: parseInt(element.querySelector('TextPrintRow')?.textContent || '1'),
          limitLen: parseInt(element.querySelector('LimitLen')?.textContent || '0')
        }))

        return {
          card: cardConfig,
          qrCode: qrCodeConfig,
          printTexts
        }
      } catch (error) {
        console.error('解析配置失败:', error)
        throw error
      }
    }

    // 加载打印配置
    const loadPrintConfig = async () => {
      loading.value = true

      try {
        // 直接调用本地打印服务获取配置
        const response = await axios.get('http://localhost:6789/printConfig', {
          timeout: 5000
        })
        
        console.log('打印配置响应:', response.data)

        // 判断返回的数据格式
        let xmlString = ''
        if (typeof response.data === 'string') {
          xmlString = response.data
        } else if (response.data.data && typeof response.data.data === 'string') {
          xmlString = response.data.data
        } else if (response.data.config && typeof response.data.config === 'string') {
          xmlString = response.data.config
        } else {
          throw new Error('返回数据格式不正确')
        }

        // 解析 XML 配置
        config.value = parseXmlConfig(xmlString)

        $q.notify({
          type: 'positive',
          message: '配置加载成功',
          caption: `共 ${config.value.printTexts.length} 个文本配置项`
        })

        // 如果预览已打开，重新绘制
        if (showPreview.value) {
          nextTick(() => {
            drawPreview()
          })
        }
      } catch (error) {
        console.error('加载打印配置失败:', error)
        const errorMsg = error.response?.data?.message || error.message || '加载配置失败，请检查打印服务是否启动'
        $q.notify({
          type: 'negative',
          message: errorMsg
        })
        config.value = null
      } finally {
        loading.value = false
      }
    }

    // 绘制预览
    const drawPreview = () => {
      if (!config.value || !previewCanvas.value) {
        return
      }

      const canvas = previewCanvas.value
      const ctx = canvas.getContext('2d')
      const cardConfig = config.value.card

      // 计算缩放比例（最大宽度600px）
      const maxWidth = 600
      previewScale.value = Math.min(maxWidth / cardConfig.width, maxWidth / cardConfig.height)
      previewWidth.value = cardConfig.width * previewScale.value
      previewHeight.value = cardConfig.height * previewScale.value

      // 清空画布
      ctx.clearRect(0, 0, previewWidth.value, previewHeight.value)

      // 绘制卡片背景（白色）
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, previewWidth.value, previewHeight.value)

      // 绘制卡片边框
      ctx.strokeStyle = '#CCCCCC'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, previewWidth.value, previewHeight.value)

      // 绘制背景图片占位（如果启用）
      if (cardConfig.printImage) {
        ctx.fillStyle = '#F5F5F5'
        ctx.fillRect(0, 0, previewWidth.value, previewHeight.value)
        ctx.fillStyle = '#E0E0E0'
        ctx.font = `${12 * previewScale.value}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('背景图片', previewWidth.value / 2, previewHeight.value / 2)
      }

      // 绘制文本元素
      config.value.printTexts.forEach((textConfig) => {
        const x = textConfig.x * previewScale.value
        const y = textConfig.y * previewScale.value
        const width = textConfig.width * previewScale.value
        const height = textConfig.height * previewScale.value

        // 绘制文本框背景（半透明）
        ctx.fillStyle = 'rgba(33, 150, 243, 0.1)'
        ctx.fillRect(x, y, width, height)

        // 绘制文本框边框
        ctx.strokeStyle = 'rgba(33, 150, 243, 0.3)'
        ctx.lineWidth = 1
        ctx.strokeRect(x, y, width, height)

        // 设置字体
        const fontSize = textConfig.fontSize * previewScale.value
        ctx.font = `${textConfig.bold ? 'bold ' : ''}${fontSize}px ${textConfig.fontType || 'Arial'}`
        ctx.fillStyle = '#333333'

        // 设置对齐方式
        if (textConfig.stringAlign === 'Center') {
          ctx.textAlign = 'center'
        } else if (textConfig.stringAlign === 'Right') {
          ctx.textAlign = 'right'
        } else {
          ctx.textAlign = 'left'
        }

        if (textConfig.lineAlignment === 'Center') {
          ctx.textBaseline = 'middle'
        } else if (textConfig.lineAlignment === 'Bottom') {
          ctx.textBaseline = 'bottom'
        } else {
          ctx.textBaseline = 'top'
        }

        // 计算文本位置
        let textX = x
        if (textConfig.stringAlign === 'Center') {
          textX = x + width / 2
        } else if (textConfig.stringAlign === 'Right') {
          textX = x + width
        }

        let textY = y
        if (textConfig.lineAlignment === 'Center') {
          textY = y + height / 2
        } else if (textConfig.lineAlignment === 'Bottom') {
          textY = y + height
        }

        // 绘制文本（使用示例文本）
        const displayText = textConfig.text || '示例文本'
        ctx.fillText(displayText, textX, textY)

        // 绘制文本标签（小字）
        ctx.save()
        ctx.font = `${8 * previewScale.value}px Arial`
        ctx.fillStyle = '#999999'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(textConfig.text, x, y - 12 * previewScale.value)
        ctx.restore()
      })

      // 绘制二维码占位符
      if (config.value.qrCode) {
        const qrConfig = config.value.qrCode
        const qrX = qrConfig.x * previewScale.value
        const qrY = qrConfig.y * previewScale.value
        const qrWidth = qrConfig.width * previewScale.value
        const qrHeight = qrConfig.height * previewScale.value

        // 绘制二维码背景
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(qrX, qrY, qrWidth, qrHeight)

        // 绘制二维码边框
        ctx.strokeStyle = '#4CAF50'
        ctx.lineWidth = 2
        ctx.strokeRect(qrX, qrY, qrWidth, qrHeight)

        // 绘制二维码网格（模拟）
        ctx.fillStyle = '#333333'
        const gridSize = Math.max(4, qrWidth / 10)
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            if ((i + j) % 2 === 0) {
              ctx.fillRect(
                qrX + (i * qrWidth / 10),
                qrY + (j * qrHeight / 10),
                gridSize,
                gridSize
              )
            }
          }
        }

        // 绘制二维码标签
        ctx.save()
        ctx.font = `${8 * previewScale.value}px Arial`
        ctx.fillStyle = '#4CAF50'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText('二维码', qrX + qrWidth / 2, qrY + qrHeight + 4 * previewScale.value)
        ctx.restore()
      }
    }

    // 监听配置变化，重新绘制预览
    watch([config, showPreview], () => {
      if (config.value && showPreview.value) {
        nextTick(() => {
          drawPreview()
        })
      }
    })

    // 页面加载时自动获取配置
    onMounted(() => {
      loadPrintConfig()
    })

    return {
      loading,
      config,
      showPreview,
      previewCanvas,
      previewWidth,
      previewHeight,
      previewScale,
      textColumns,
      loadPrintConfig,
      drawPreview
    }
  }
})
</script>

<style scoped>
.text-h4 {
  display: flex;
  align-items: center;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: auto;
}

.preview-canvas {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  max-width: 100%;
  height: auto;
}
</style>

