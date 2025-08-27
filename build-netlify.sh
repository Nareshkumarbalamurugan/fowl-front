# Netlify Build Script
echo "🚀 Starting Netlify Build Process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building React/Vite project..."
npm run build

# Verify build output
echo "✅ Build completed. Checking dist folder..."
ls -la dist/

echo "🎉 Netlify build process completed successfully!"
