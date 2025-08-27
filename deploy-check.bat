@echo off
echo 🚀 Poultry Mitra Deployment Helper
echo ==================================

echo 📋 Checking prerequisites...

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js: %NODE_VERSION%
)

:: Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm: %NPM_VERSION%
)

echo.
echo 🔧 Running pre-deployment checks...

:: Install dependencies
echo 📦 Installing dependencies...
call npm ci
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

:: Build the project
echo 🔨 Building for production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    echo Please fix the errors above and try again.
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.
echo 📁 Build output in 'dist' folder:
dir dist

echo.
echo 🌟 Ready for deployment!
echo.
echo Next steps:
echo 1. For Netlify: Drag and drop the 'dist' folder to netlify.com/drop
echo 2. For Render: Push to GitHub and connect your repo
echo 3. For manual: Use 'npm run preview' to test locally
echo.
echo 📖 See DEPLOYMENT_GUIDE.md for detailed instructions

pause
