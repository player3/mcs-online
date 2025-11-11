# MCS Online - 门票自助打印系统

基于 Vue 3 和 Quasar Framework 开发的门票自助打印系统，提供用户自助打印和管理员查询两大核心功能。

## 功能特性

### 1. 用户自助打印界面
- 自定义九宫格数字键盘，方便用户输入门票编号
- 门票格式：dddd-dddd-dddd（四位数字-四位数字-四位数字）
- 自动验证门票有效性
- 显示用户信息并支持打印胸牌

### 2. 管理员查询界面
- 支持多条件查询：姓名、手机号、邮箱、门票编号
- 显示详细的用户信息
- 支持管理员手动打印胸牌
- 查看打印状态和打印时间

## 技术栈

- **Vue 3**: 渐进式JavaScript框架
- **Quasar Framework**: 高性能的Vue UI框架
- **Vue Router**: 官方路由管理器
- **Axios**: HTTP客户端
- **Pinia**: 状态管理（可选）

## 📚 文档

完整的项目文档已按功能分类整理在 `docs/` 目录中：

- **[文档索引](./docs/README.md)** - 完整的文档目录和规范说明
- **[快速开始](./docs/guide/START.md)** - 项目快速启动指南
- **[使用说明](./docs/guide/使用说明.txt)** - 详细的使用说明
- **[功能文档](./docs/features/)** - 各功能模块的详细说明
- **[快速参考](./docs/quick-reference/)** - 功能快速参考卡片
- **[Bug修复记录](./docs/bugfix/)** - 历史问题和解决方案
- **[测试文档](./docs/testing/)** - 测试用例和测试指南

> 💡 **提示**: 查看 [文档重组说明](./docs/文档重组说明.md) 了解文档组织结构和使用方法。

## 项目结构

```
mcs-online/
├── src/
│   ├── assets/              # 静态资源
│   ├── boot/                # Quasar启动文件
│   │   └── axios.js         # Axios配置
│   ├── components/          # 可复用组件
│   ├── css/                 # 全局样式
│   │   └── app.scss         # 主样式文件
│   ├── layouts/             # 布局组件
│   │   └── MainLayout.vue   # 主布局
│   ├── pages/               # 页面组件
│   │   ├── SelfPrintPage.vue    # 自助打印页面
│   │   ├── AdminQueryPage.vue   # 管理查询页面
│   │   └── ErrorNotFound.vue    # 404页面
│   ├── router/              # 路由配置
│   │   ├── index.js         # 路由入口
│   │   └── routes.js        # 路由定义
│   ├── services/            # API服务
│   │   └── api.js           # API接口定义
│   ├── utils/               # 工具函数
│   │   └── printUtils.js    # 打印工具函数
│   ├── App.vue              # 根组件
│   ├── index.template.html  # HTML模板
│   └── main.js              # 应用入口
├── docs/                    # 项目文档
│   ├── guide/               # 指南文档
│   ├── features/            # 功能文档
│   ├── quick-reference/     # 快速参考
│   ├── bugfix/              # Bug修复记录
│   ├── testing/             # 测试文档
│   └── README.md            # 文档索引
├── package.json             # 项目依赖
├── quasar.config.js         # Quasar配置
├── .cursorrules             # Cursor AI 配置
└── README.md                # 项目说明
```

## 安装和运行

### 前置要求

- Node.js >= 14.19
- npm >= 6.13.4 或 yarn >= 1.21.1

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发模式运行

```bash
npm run dev
# 或
yarn dev
```

应用将在 `http://localhost:9000` 启动

### 生产构建

```bash
npm run build
# 或
yarn build
```

构建文件将输出到 `dist/` 目录

## 后台API接口说明

本项目需要配合后台API使用，以下是所需的API接口：

### 1. 根据门票编号查询用户

```
GET /api/tickets/:ticketNumber
```

**响应格式：**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "ticketNumber": "1234-5678-9012",
    "type": "VIP",
    "company": "某某公司",
    "position": "经理",
    "printed": false,
    "printTime": null
  }
}
```

### 2. 查询用户列表

```
GET /api/users/search
```

**查询参数：**
- name: 姓名（可选）
- phone: 手机号（可选）
- email: 邮箱（可选）
- ticketNumber: 门票编号（可选）

**响应格式：**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "张三",
      "phone": "13800138000",
      "email": "zhangsan@example.com",
      "ticketNumber": "1234-5678-9012",
      "type": "VIP",
      "company": "某某公司",
      "position": "经理",
      "printed": false,
      "printTime": null
    }
  ]
}
```

### 3. 打印胸牌

```
POST /api/print
```

**请求体：**
```json
{
  "ticketNumber": "1234-5678-9012",
  "userInfo": {
    "name": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "type": "VIP"
  }
}
```

**响应格式：**
```json
{
  "success": true,
  "message": "打印成功"
}
```

## 配置说明

### 修改API地址

编辑 `src/boot/axios.js` 文件，修改 `baseURL`：

```javascript
const api = axios.create({ 
  baseURL: 'http://your-api-server.com/api' 
})
```

### 修改开发服务器端口

编辑 `quasar.config.js` 文件中的 `devServer` 配置：

```javascript
devServer: {
  open: true,
  port: 9000  // 修改为你想要的端口
}
```

## 使用指南

### 用户自助打印

1. 在自助打印页面，使用九宫格键盘输入门票编号
2. 系统会自动在第4位和第9位后添加横线
3. 输入完成后点击"确认打印"按钮
4. 系统验证门票信息并显示用户详情
5. 确认无误后点击"打印胸牌"完成打印

### 管理员查询

1. 在管理查询页面，输入至少一个查询条件
2. 点击"查询"按钮搜索用户
3. 从查询结果列表中选择目标用户
4. 查看用户详细信息
5. 点击"打印胸牌"进行打印

## 开发和扩展

### 添加新页面

1. 在 `src/pages/` 目录创建新的 Vue 组件
2. 在 `src/router/routes.js` 中添加路由配置

### 自定义样式

编辑 `src/css/app.scss` 文件添加全局样式

### 添加新的API服务

在 `src/services/api.js` 中添加新的服务方法

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 13.1
- Edge >= 88

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系开发团队。

