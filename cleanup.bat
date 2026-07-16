@echo off
echo ====================================================
echo ShopFlow Storage Cleanup Utility (Run as Admin)
echo ====================================================
echo.

:: Check for administrative privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Please right-click this file and select "Run as Administrator".
    echo.
    pause
    exit /b
)

echo [1/5] Stopping Windows Update service...
net stop wuauserv /y >nul 2>&1

echo [2/5] Clearing Windows Update download cache...
del /f /s /q "C:\Windows\SoftwareDistribution\Download\*.*" >nul 2>&1
rmdir /s /q "C:\Windows\SoftwareDistribution\Download" >nul 2>&1
mkdir "C:\Windows\SoftwareDistribution\Download" >nul 2>&1

echo [3/5] Restarting Windows Update service...
net start wuauserv >nul 2>&1

echo [4/5] Clearing McAfee trace logs...
del /f /q "C:\ProgramData\McAfee\wps\log\*.etl" >nul 2>&1

echo [5/5] Clearing temporary files...
del /f /s /q "%temp%\*.*" >nul 2>&1
del /f /s /q "C:\Windows\Temp\*.*" >nul 2>&1

echo.
echo ====================================================
echo Cleanup completed successfully!
echo ====================================================
echo.
pause
