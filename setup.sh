#!/bin/bash

echo "🚀 Starting smart setup for your game..."

# ---- CONFIG ----
BUILD_DIR="docs"
PACKAGE_FILE="package.json"
VITE_CONFIG="vite.config.js"
MODULES_TARBALL="node_modules.tgz"
MIRROR_REGISTRY="https://registry.npmmirror.com"
MODULES_TARBALL_URL="https://bengothard.github.io/fruit-collector/node_modules.tgz"

install_deps() {
  if npm install "$@"; then
    return 0
  fi
  echo "⚠️ npm install failed. Trying mirror registry..."
  if npm install --registry "$MIRROR_REGISTRY" "$@"; then
    return 0
  fi
  echo "⚠️ Mirror install failed. Attempting offline cache..."
  if [ ! -f "$MODULES_TARBALL" ]; then
    echo "📥 Downloading offline cache from $MODULES_TARBALL_URL"
    curl -L -o "$MODULES_TARBALL" "$MODULES_TARBALL_URL" || return 1
  fi
  tar -xzf "$MODULES_TARBALL"
}

# ---- STEP 0: Environment Check ----
if ! command -v npm &> /dev/null; then
  echo "❌ npm not found. Please install Node.js + npm first: https://nodejs.org"
  exit 1
fi

# ---- STEP 1: Install Dependencies ----
if [ -f "$PACKAGE_FILE" ]; then
  if [ -d "node_modules" ]; then
    echo "📦 node_modules directory already exists. Skipping npm install."
  else
    echo "📦 Installing dependencies from $PACKAGE_FILE..."
    install_deps || { echo "❌ Dependency installation failed."; exit 1; }
  fi
else
  echo "⚠️ $PACKAGE_FILE not found. Creating minimal Vite-compatible file..."

  cat <<EOL > $PACKAGE_FILE
{
  "name": "epic-game",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "devDependencies": {
    "vite": "^4.0.0"
  }
}
EOL
  install_deps || { echo "❌ Dependency installation failed."; exit 1; }
fi

# ---- STEP 2: Ensure Vite Config Exists ----
if [ ! -f "$VITE_CONFIG" ]; then
  echo "⚙️ Creating default $VITE_CONFIG for GitHub Pages deployment to /docs..."
  echo 'export default { build: { outDir: "docs" } }' > $VITE_CONFIG
fi

# ---- STEP 3: Add Build Script if Missing ----
if ! grep -q '"build"' "$PACKAGE_FILE"; then
  echo "🛠️ Adding build script to $PACKAGE_FILE..."
  npx npm-add-script -k "build" -v "vite build"
fi

# ---- STEP 4: Build Project ----
echo "🏗️ Building project with Vite..."
npm run build || { echo "❌ Build failed."; exit 1; }

# ---- STEP 5: Post-Build Checks ----
if [ -d "$BUILD_DIR" ]; then
  echo "✅ Build complete! Output is in ./$BUILD_DIR"
else
  echo "❌ Build directory $BUILD_DIR not found. Something went wrong."
  exit 1
fi

# ---- STEP 6: GitHub Pages Reminder ----
echo ""
echo "🌍 To publish to GitHub Pages:"
echo "1. Commit and push the /docs folder:"
echo "   git add ."
echo "   git commit -m '🚀 Build game'"
echo "   git push"
echo ""
echo "2. Then visit: https://bengothard.github.io/your-game-name/"
echo ""

echo "🧠 Pro Tip: Rename 'your-game-name' in the URL to match your repo name."

echo "🎉 Setup complete. Time to build something epic!"
