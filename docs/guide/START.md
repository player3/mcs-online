# 快速启动指南

## 第一步：安装依赖

### 安装前端依赖

```bash
npm install
```

### 安装Mock服务器依赖（可选，用于测试）

```bash
npm install --prefix . express cors body-parser
```

或者创建单独的mock服务器目录：

```bash
# 创建mock目录
mkdir mock-server-dir
cd mock-server-dir

# 复制文件
cp ../mock-server.js .
cp ../package-mock.json ./package.json

# 安装依赖
npm install

cd ..
```

## 第二步：启动Mock服务器（可选）

在一个终端窗口中运行：

```bash
node mock-server.js
```

Mock服务器将在 `http://localhost:3000` 启动

**测试门票编号：**
- `1234-5678-9012` - 张三 (VIP)
- `2345-6789-0123` - 李四 (嘉宾)
- `3456-7890-1234` - 王五 (参会者)
- `4567-8901-2345` - 赵六 (工作人员)
- `5678-9012-3456` - 钱七 (媒体)

## 第三步：启动前端应用

在另一个终端窗口中运行：

```bash
npm run dev
```

前端应用将在 `http://localhost:9000` 启动

## 功能测试

### 测试用户自助打印

1. 访问 `http://localhost:9000`
2. 默认进入"自助打印"页面
3. 使用数字键盘输入门票编号，例如：`1234-5678-9012`
4. 点击"确认打印"
5. 查看用户信息并点击"打印胸牌"

### 测试管理员查询

1. 点击顶部的"管理查询"标签
2. 输入查询条件，例如：
   - 姓名：张三
   - 手机号：13800138000
   - 门票编号：1234-5678-9012
3. 点击"查询"按钮
4. 从结果列表中选择用户
5. 查看详细信息并点击"打印胸牌"

## 配置后台API

如果你有真实的后台服务，修改 `src/boot/axios.js` 文件：

```javascript
const api = axios.create({ 
  baseURL: 'http://your-backend-url/api' 
})
```

## 生产部署

### 构建生产版本

```bash
npm run build
```

构建完成后，`dist/spa` 目录包含所有静态文件，可以部署到任何Web服务器。

### 部署到Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist/spa;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 常见问题

### 1. 端口冲突

如果端口被占用，可以修改：

**前端端口** - 编辑 `quasar.config.js`:
```javascript
devServer: {
  port: 9000  // 改为其他端口
}
```

**后端端口** - 编辑 `mock-server.js`:
```javascript
const PORT = 3000  // 改为其他端口
```

### 2. API连接失败

确保：
1. Mock服务器正在运行
2. API地址配置正确（`src/boot/axios.js`）
3. CORS配置正确

### 3. 依赖安装失败

尝试：
```bash
# 清除缓存
npm cache clean --force

# 删除node_modules
rm -rf node_modules

# 重新安装
npm install
```

## 技术支持

如有问题，请检查：
1. Node.js版本 >= 14.19
2. npm版本 >= 6.13.4
3. 浏览器控制台错误信息
4. 服务器终端日志

祝使用愉快！ 🎉

