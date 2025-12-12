@echo off

REM 设置正确的字符编码
chcp 65001 >nul

echo 正在执行数据库初始化脚本...
echo.

REM 直接使用mysql命令执行脚本
mysql -u root -p < "数据库初始化脚本.sql"

REM 检查执行结果
if %ERRORLEVEL% equ 0 (
    echo.
    echo 脚本执行成功！
) else (
    echo.
    echo 脚本执行失败，请检查：
    echo 1. MySQL是否已安装并添加到环境变量
    echo 2. MySQL服务是否正在运行
    echo 3. 输入的root密码是否正确
)

echo.
pause