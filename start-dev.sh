#!/bin/bash

echo "=========================================="
echo "  MCS Online - 开发环境启动脚本"
echo "=========================================="
echo ""

echo "[1/3] 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖，请稍候..."
    npm install
    if [ $? -ne 0 ]; then
        echo "依赖安装失败！请手动运行: npm install"
        exit 1
    fi
fi

echo ""
echo "[2/3] 启动Mock API服务器..."
node mock-server.js &
MOCK_PID=$!
echo "Mock服务器已启动 (PID: $MOCK_PID)"
sleep 3

echo ""
echo "[3/3] 启动前端开发服务器..."
echo ""
echo "=========================================="
echo "  前端: http://localhost:9000"
echo "  后端: http://localhost:3000"
echo "=========================================="
echo ""

# 捕获Ctrl+C信号，清理后台进程
trap "echo ''; echo '正在关闭服务器...'; kill $MOCK_PID 2>/dev/null; exit" INT TERM

npm run dev

# 清理
kill $MOCK_PID 2>/dev/null

