@echo off
echo ========================================
echo    PUSHING ELDERLY ASSISTANT TO GITHUB
echo ========================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/win
    echo Then restart this script.
    pause
    exit /b 1
)

echo Git is installed. Proceeding with GitHub setup...
echo.

REM Navigate to project directory
cd /d "%~dp0"

REM Initialize Git repository (if not already initialized)
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo.
)

REM Add all files to staging
echo Adding all files to staging area...
git add .
echo.

REM Create initial commit
echo Creating initial commit...
git commit -m "Initial commit: Elderly Assistant Application with AI Guardian, SOS System, and Voice Assistant"
echo.

REM Check if remote origin exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo Adding remote origin to CareConnect repository...
    git remote add origin https://github.com/purvavikaspatil/CareConnect.git
    echo.
)

REM Push to GitHub
echo Pushing to GitHub...
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    SUCCESS! CODE PUSHED TO GITHUB
    echo ========================================
    echo.
    echo Your elderly assistant application has been successfully pushed to GitHub!
    echo You can now view it at your repository URL.
) else (
    echo.
    echo ========================================
    echo    ERROR OCCURRED
    echo ========================================
    echo.
    echo There was an error pushing to GitHub. Please check:
    echo 1. Your GitHub credentials are configured
    echo 2. The repository URL is correct
    echo 3. You have push permissions to the repository
    echo.
    echo You may need to authenticate with GitHub:
    echo - Use GitHub CLI: gh auth login
    echo - Or configure Git credentials
)

echo.
pause

