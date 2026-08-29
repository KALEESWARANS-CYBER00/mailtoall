@echo off
title MailFlow Native Launcher (Windows)
echo ==================================================
echo    MailFlow Local Native Launcher (Windows)       
echo ==================================================

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed. Please install Python 3.
    pause
    exit /b 1
)

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js.
    pause
    exit /b 1
)

:: 1. Create Python virtual environment if not present
if not exist venv (
    echo Creating virtual environment (venv)...
    python -m venv venv
)

echo Installing backend dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt gunicorn

:: 2. Build React SPA if dist folder is missing
if not exist frontend\dist (
    echo Compiling React SPA...
    cd frontend
    call npm install
    call npm run build
    cd ..
)

echo 🚀 Starting MailFlow locally on http://127.0.0.1:5005
echo    (SMTP ports 465/587 will connect error-free on your local network!)
start http://127.0.0.1:5005

python app.py
pause
