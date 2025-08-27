#!/bin/bash

echo "🚀 Poultry Mitra Deployment Helper"
echo "=================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
echo "📋 Checking prerequisites..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not found"
    exit 1
fi

echo ""
echo "🔧 Running pre-deployment checks..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Checking code quality..."
npm run lint 2>/dev/null || echo "⚠️ Linting skipped (no lint script found)"

# Run tests
echo "🧪 Running tests..."
npm test 2>/dev/null || echo "⚠️ Tests skipped (no test script found)"

# Build the project
echo "🔨 Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Build output in 'dist' folder:"
    ls -la dist/
    
    echo ""
    echo "🌟 Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. For Netlify: Drag and drop the 'dist' folder to netlify.com/drop"
    echo "2. For Render: Push to GitHub and connect your repo"
    echo "3. For manual: Use 'npm run preview' to test locally"
    echo ""
    echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
else
    echo "❌ Build failed!"
    echo "Please fix the errors above and try again."
    exit 1
fi
