@echo off
chcp 65001 >nul
echo ==========================================
echo   MCS Online - 开发环境启动脚本
echo ==========================================
echo.

echo [1/3] 检查依赖...
if not exist "node_modules\" (
    echo 正在安装依赖，请稍候...
    call npm install
    if errorlevel 1 (
        echo 依赖安装失败！请手动运行: npm install
        pause
        exit /b 1
    )
)

echo.
echo [2/3] 启动Mock API服务器...
start "Mock API Server" cmd /k "node mock-server.js"
timeout /t 3 /nobreak >nul

echo.
echo [3/3] 启动前端开发服务器...
echo.
echo ==========================================
echo   前端: http://localhost:9000
echo   后端: http://localhost:3000
echo ==========================================
echo.
call npm run dev

pause

