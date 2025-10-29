@echo off
echo.
echo ========================================
echo   Google Cloud TTS Setup Helper
echo ========================================
echo.
echo This script will help you set up natural voice for the assistant.
echo.

REM Check if .env exists
if exist .env (
    echo .env file already exists!
    echo.
    type .env
    echo.
    set /p overwrite="Do you want to update it? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo Setup cancelled.
        pause
        exit /b
    )
)

echo.
echo To get your FREE Google Cloud TTS API key:
echo 1. Go to: https://console.cloud.google.com/apis/credentials
echo 2. Create a new API key
echo 3. Copy it and paste below
echo.
echo Or press ENTER to skip (will use browser voice)
echo.

set /p apikey="Enter your Google Cloud TTS API key: "

if "%apikey%"=="" (
    set apikey=your_api_key_here
    echo.
    echo No API key provided. Browser voice will be used.
    echo You can add the API key later by editing .env file.
)

echo.
echo Creating .env file...
echo VITE_GOOGLE_TTS_API_KEY=%apikey% > .env

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.

if "%apikey%"=="your_api_key_here" (
    echo Status: Browser Voice will be used
    echo.
    echo To enable Premium Voice later:
    echo 1. Get API key from: https://console.cloud.google.com/apis/credentials
    echo 2. Edit .env file and replace 'your_api_key_here' with your key
    echo 3. Restart dev server: npm run dev
) else (
    echo Status: Premium Voice enabled!
    echo.
    echo Next step: Restart your dev server
    echo   npm run dev
)

echo.
echo For detailed instructions, see: GOOGLE_TTS_SETUP.md
echo.
pause

