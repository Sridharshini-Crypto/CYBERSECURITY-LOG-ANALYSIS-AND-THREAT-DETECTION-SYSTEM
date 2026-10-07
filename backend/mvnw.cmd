@echo off
setlocal
where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    mvn %*
    exit /b %ERRORLEVEL%
)
if exist "D:\maven\apache-maven-3.9.9\bin\mvn.cmd" (
    "D:\maven\apache-maven-3.9.9\bin\mvn.cmd" %*
    exit /b %ERRORLEVEL%
)
echo [ERROR] Maven not found in PATH or at D:\maven\apache-maven-3.9.9\bin\mvn.cmd.
exit /b 1

