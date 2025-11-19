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
            <q-btn-dropdown color="secondary" icon="download" label="导出配置">
              <q-list>
                <q-item clickable v-close-popup @click="exportConfig('xml')">
                  <q-item-section>
                    <q-item-label>导出 XML</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="exportConfig('json')">
                  <q-item-section>
                    <q-item-label>导出 JSON</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
      </div>

      <div class="col-12 row q-col-gutter-md" v-if="config">
        <!-- 编辑区域 -->
        <div class="col-12 col-md-8">
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="edit" class="q-mr-sm" />
                可视化编辑
                <span class="text-caption text-grey q-ml-sm">
                  (拖动调整位置，点击选中配置)
                </span>
              </div>
              
              <div class="editor-container-wrapper">
                <div 
                  class="editor-container"
                  :style="{
                    width: config.card.width + 'px',
                    height: config.card.height + 'px',
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left'
                  }"
                  @mousemove="handleMouseMove"
                  @mouseup="handleMouseUp"
                  @mouseleave="handleMouseUp"
                >
                  <!-- 背景图片占位 -->
                  <div v-if="config.card.printImage" class="background-placeholder">
                    背景图片
                  </div>

                  <!-- 文本元素 -->
                  <div
                    v-for="(item, index) in config.printTexts"
                    :key="'text-' + index"
                    class="draggable-item text-item"
                    :class="{ 'selected': selectedItem === item }"
                    :style="{
                      left: (item.x - item.width / 2) + 'px',
                      top: (item.y - item.height / 2) + 'px',
                      width: item.width + 'px',
                      height: item.height + 'px',
                      fontFamily: item.fontType,
                      fontSize: item.fontSize + 'pt',
                      fontWeight: item.bold ? 'bold' : 'normal',
                      textAlign: item.stringAlign.toLowerCase(),
                      display: 'flex',
                      alignItems: item.lineAlignment === 'Center' ? 'center' : (item.lineAlignment === 'Bottom' ? 'flex-end' : 'flex-start'),
                      justifyContent: item.stringAlign === 'Center' ? 'center' : (item.stringAlign === 'Right' ? 'flex-end' : 'flex-start')
                    }"
                    @mousedown.stop="handleMouseDown($event, item)"
                  >
                    {{ item.text || '示例文本' }}
                    <q-tooltip>
                      {{ item.text }} ({{ item.x }}, {{ item.y }})
                    </q-tooltip>
                  </div>

                  <!-- 二维码元素 -->
                  <div
                    v-if="config.qrCode"
                    class="draggable-item qr-item"
                    :class="{ 'selected': selectedItem === config.qrCode }"
                    :style="{
                      left: (config.qrCode.x - config.qrCode.width / 2) + 'px',
                      top: (config.qrCode.y - config.qrCode.height / 2) + 'px',
                      width: config.qrCode.width + 'px',
                      height: config.qrCode.height + 'px'
                    }"
                    @mousedown.stop="handleMouseDown($event, config.qrCode)"
                  >
                    <q-icon name="qr_code" size="100%" />
                    <div class="qr-label">二维码</div>
                  </div>
                </div>
              </div>
              
              <div class="text-caption text-grey-6 q-mt-sm">
                缩放比例: {{ previewScale.toFixed(2) }}x
                <q-slider
                  v-model="previewScale"
                  :min="0.1"
                  :max="2"
                  :step="0.1"
                  label
                  style="max-width: 200px; display: inline-block; vertical-align: middle; margin-left: 10px;"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- 属性面板 -->
        <div class="col-12 col-md-4">
          <q-card class="sticky-panel">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="tune" class="q-mr-sm" />
                属性配置
              </div>

              <div v-if="selectedItem">
                <div class="text-subtitle2 q-mb-sm text-primary">
                  {{ isQrCode(selectedItem) ? '二维码配置' : '文本配置' }}
                </div>

                <div class="row q-col-gutter-sm">
                  <!-- 通用位置属性 -->
                  <div class="col-6">
                    <q-input
                      v-model.number="selectedItem.x"
                      type="number"
                      label="X 坐标 (中心)"
                      dense
                      outlined
                    />
                  </div>
                  <div class="col-6">
                    <q-input
                      v-model.number="selectedItem.y"
                      type="number"
                      label="Y 坐标 (中心)"
                      dense
                      outlined
                    />
                  </div>
                  <div class="col-6">
                    <q-input
                      v-model.number="selectedItem.width"
                      type="number"
                      label="宽度"
                      dense
                      outlined
                    />
                  </div>
                  <div class="col-6">
                    <q-input
                      v-model.number="selectedItem.height"
                      type="number"
                      label="高度"
                      dense
                      outlined
                    />
                  </div>

                  <!-- 文本特有属性 -->
                  <template v-if="!isQrCode(selectedItem)">
                    <div class="col-12">
                      <q-input
                        v-model="selectedItem.text"
                        label="文本内容"
                        dense
                        outlined
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model="selectedItem.fontType"
                        label="字体"
                        dense
                        outlined
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model.number="selectedItem.fontSize"
                        type="number"
                        label="字号 (pt)"
                        dense
                        outlined
                      />
                    </div>
                    <div class="col-6">
                      <q-select
                        v-model="selectedItem.stringAlign"
                        :options="['Left', 'Center', 'Right']"
                        label="水平对齐"
                        dense
                        outlined
                      />
                    </div>
                    <div class="col-6">
                      <q-select
                        v-model="selectedItem.lineAlignment"
                        :options="['Top', 'Center', 'Bottom']"
                        label="垂直对齐"
                        dense
                        outlined
                      />
                    </div>
                    <div class="col-12">
                      <q-toggle
                        v-model="selectedItem.bold"
                        label="粗体"
                      />
                      <q-toggle
                        v-model="selectedItem.compatible"
                        label="兼容模式"
                      />
                    </div>
                  </template>

                  <!-- 二维码特有属性 -->
                  <template v-else>
                    <div class="col-12">
                      <q-input
                        v-model.number="selectedItem.dpi"
                        type="number"
                        label="DPI"
                        dense
                        outlined
                      />
                    </div>
                  </template>
                </div>
              </div>
              <div v-else class="text-grey text-center q-pa-lg">
                请点击左侧元素进行配置
              </div>
            </q-card-section>
          </q-card>
        </div>
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
import { defineComponent, ref, onMounted } from 'vue'
import { useQuasar, exportFile } from 'quasar'
import axios from 'axios'

export default defineComponent({
  name: 'SettingsPage',

  setup() {
    const $q = useQuasar()
    const loading = ref(false)
    const config = ref(null)
    const previewScale = ref(0.5)
    const selectedItem = ref(null)
    
    // 拖拽状态
    const dragState = ref({
      isDragging: false,
      startX: 0,
      startY: 0,
      initialItemX: 0,
      initialItemY: 0,
      item: null
    })

    // 判断是否为二维码对象
    const isQrCode = (item) => {
      return item && item === config.value?.qrCode
    }

    // 鼠标按下开始拖拽
    const handleMouseDown = (e, item) => {
      e.preventDefault()
      selectedItem.value = item
      dragState.value = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        initialItemX: item.x,
        initialItemY: item.y,
        item: item
      }
    }

    // 鼠标移动
    const handleMouseMove = (e) => {
      if (!dragState.value.isDragging || !dragState.value.item) return

      const dx = (e.clientX - dragState.value.startX) / previewScale.value
      const dy = (e.clientY - dragState.value.startY) / previewScale.value

      dragState.value.item.x = Math.round(dragState.value.initialItemX + dx)
      dragState.value.item.y = Math.round(dragState.value.initialItemY + dy)
    }

    // 鼠标松开
    const handleMouseUp = () => {
      dragState.value.isDragging = false
      dragState.value.item = null
    }

    // 解析 XML 配置
    const parseXmlConfig = (xmlString) => {
      try {
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml')

        // 检查是否有解析错误
        const parserError = xmlDoc.querySelector('parsererror')
        if (parserError) {
          console.error('XML 解析错误:', parserError.textContent)
          throw new Error('XML 解析失败')
        }

        const customSetting = xmlDoc.querySelector('CustomSetting')
        if (!customSetting) {
          throw new Error('无效的配置格式')
        }

        // 解析卡片配置
        const cardElement = customSetting.querySelector('Card')
        if (!cardElement) {
          throw new Error('无效的配置格式：缺少 Card 节点')
        }

        const widthText = cardElement.querySelector(':scope > Width')?.textContent
        const heightText = cardElement.querySelector(':scope > Height')?.textContent
        const printImageText = cardElement.querySelector(':scope > PrintImage')?.textContent

        const cardConfig = {
          width: parseInt(widthText || '0'),
          height: parseInt(heightText || '0'),
          printImage: printImageText === 'true'
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
          bold: element.querySelector('Blod')?.textContent === 'true',
          stringAlign: element.querySelector('StringAlgin')?.textContent || '',
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
      selectedItem.value = null

      try {
        const printServiceUrl = 'http://localhost:6789/printConfig'
        const response = await axios.get(printServiceUrl, {
          timeout: 5000
        })

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

        config.value = parseXmlConfig(xmlString)

        $q.notify({
          type: 'positive',
          message: '配置加载成功'
        })
      } catch (error) {
        console.error('加载打印配置失败:', error)
        const errorMsg = error.response?.data?.message || error.message || '加载配置失败，请检查打印服务是否启动'
        $q.notify({
          type: 'negative',
          message: errorMsg
        })
        
        // 开发测试用 Mock 数据
        if (process.env.DEV) {
           config.value = {
             card: { width: 1000, height: 1600, printImage: true },
             qrCode: { dpi: 300, width: 200, height: 200, x: 500, y: 1400 },
             printTexts: [
               { index: 0, text: '张三', width: 400, height: 100, x: 500, y: 400, fontType: 'SimHei', fontSize: 40, bold: true, stringAlign: 'Center', lineAlignment: 'Center' },
               { index: 1, text: 'VIP 嘉宾', width: 400, height: 80, x: 500, y: 600, fontType: 'SimHei', fontSize: 30, bold: false, stringAlign: 'Center', lineAlignment: 'Center' }
             ]
           }
           $q.notify({ type: 'info', message: '已加载测试数据' })
        }
      } finally {
        loading.value = false
      }
    }

    // 导出配置
    const exportConfig = (type) => {
      if (!config.value) return

      let content = ''
      let filename = 'print_config'
      let mimeType = ''

      if (type === 'json') {
        content = JSON.stringify(config.value, null, 2)
        filename += '.json'
        mimeType = 'application/json'
      } else {
        // 生成 XML
        content = generateXml(config.value)
        filename += '.xml'
        mimeType = 'text/xml'
      }

      const status = exportFile(filename, content, mimeType)

      if (status === true) {
        $q.notify({
          message: '导出成功',
          color: 'positive',
          icon: 'file_download'
        })
      } else {
        $q.notify({
          message: '导出失败',
          color: 'negative',
          icon: 'warning'
        })
      }
    }

    // 生成 XML 字符串
    const generateXml = (cfg) => {
      let xml = '<?xml version="1.0" encoding="utf-8"?>\n'
      xml += '<CustomSetting>\n'
      
      // Card
      xml += '  <Card>\n'
      xml += `    <Width>${cfg.card.width}</Width>\n`
      xml += `    <Height>${cfg.card.height}</Height>\n`
      xml += `    <PrintImage>${cfg.card.printImage}</PrintImage>\n`
      
      // QRCode
      if (cfg.qrCode) {
        xml += '    <QRCode>\n'
        xml += `      <Dpi>${cfg.qrCode.dpi}</Dpi>\n`
        xml += `      <Width>${cfg.qrCode.width}</Width>\n`
        xml += `      <Height>${cfg.qrCode.height}</Height>\n`
        xml += `      <X>${cfg.qrCode.x}</X>\n`
        xml += `      <Y>${cfg.qrCode.y}</Y>\n`
        xml += '    </QRCode>\n'
      }

      // PrintTexts
      xml += '    <PrintTexts>\n'
      cfg.printTexts.forEach(text => {
        xml += '      <PrintTextSetting>\n'
        xml += `        <Text>${text.text}</Text>\n`
        xml += `        <Width>${text.width}</Width>\n`
        xml += `        <Height>${text.height}</Height>\n`
        xml += `        <X>${text.x}</X>\n`
        xml += `        <Y>${text.y}</Y>\n`
        xml += `        <FontType>${text.fontType}</FontType>\n`
        xml += `        <FontSize>${text.fontSize}</FontSize>\n`
        xml += `        <Blod>${text.bold}</Blod>\n` // 保持原有的拼写错误兼容
        xml += `        <StringAlgin>${text.stringAlign}</StringAlgin>\n` // 保持原有的拼写错误兼容
        xml += `        <LineAlignment>${text.lineAlignment}</LineAlignment>\n`
        xml += `        <Arrange>${text.arrange || ''}</Arrange>\n`
        xml += `        <bCompatible>${text.compatible}</bCompatible>\n`
        xml += `        <TextPrintRow>${text.textPrintRow || 1}</TextPrintRow>\n`
        xml += `        <LimitLen>${text.limitLen || 0}</LimitLen>\n`
        xml += '      </PrintTextSetting>\n'
      })
      xml += '    </PrintTexts>\n'
      
      xml += '  </Card>\n'
      xml += '</CustomSetting>'
      
      return xml
    }

    onMounted(() => {
      loadPrintConfig()
    })

    return {
      loading,
      config,
      previewScale,
      selectedItem,
      loadPrintConfig,
      exportConfig,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      isQrCode
    }
  }
})
</script>

<style scoped>
.text-h4 {
  display: flex;
  align-items: center;
}

.editor-container-wrapper {
  width: 100%;
  height: 600px;
  overflow: auto;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  position: relative;
  display: flex;
  justify-content: center;
  padding: 20px;
}

.editor-container {
  background: white;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  position: relative;
  user-select: none;
}

.background-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
  font-size: 24px;
  pointer-events: none;
  border: 1px dashed #ccc;
}

.draggable-item {
  position: absolute;
  cursor: move;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.draggable-item:hover {
  border-color: #2196f3;
  background: rgba(33, 150, 243, 0.05);
}

.draggable-item.selected {
  border-color: #2196f3;
  background: rgba(33, 150, 243, 0.1);
  z-index: 10;
  box-shadow: 0 0 0 1px #2196f3;
}

.text-item {
  overflow: hidden;
  white-space: nowrap;
}

.qr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.05);
}

.qr-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.sticky-panel {
  position: sticky;
  top: 20px;
}
</style>

