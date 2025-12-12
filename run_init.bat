@echo off

echo 正在执行数据库初始化脚本...

REM 使用MySQL的完整路径执行脚本
"G:\mysql\bin\mysql.exe" -u root -p < "F:\code\web_Final-project\数据库初始化脚本.sql"

echo 脚本执行完成！
pause