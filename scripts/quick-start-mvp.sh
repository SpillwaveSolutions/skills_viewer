#!/bin/bash
# Quick Start - Get MVP Running Fast
set -e

echo "==================================================================="
echo "  Skill Debugger - Quick Start MVP"  
echo "==================================================================="
echo ""
echo "This script will:"
echo "1. Create a minimal Tauri + React app in a temp directory"
echo "2. Copy the working template back to this project"
echo "3. Add our custom skill discovery features"
echo ""
read -p "Press Enter to continue..."

# Create temp workspace
TEMP_DIR=$(mktemp -d)
echo "Creating Tauri template in: $TEMP_DIR"

cd "$TEMP_DIR"
npm create tauri-app@latest skill-debugger-temp -- \
  --template react-ts \
  --manager npm \
  --yes

echo ""
echo "Template created! Copying files back to project..."

# Copy the generated files back
cp -r skill-debugger-temp/* "$OLDPWD/"
cp -r skill-debugger-temp/.* "$OLDPWD/" 2>/dev/null || true

cd "$OLDPWD"
rm -rf "$TEMP_DIR"

echo ""
echo "✓ Base Tauri + React project created!"
echo ""
echo "Next steps:"
echo "  1. npm install"
echo "  2. npm run tauri dev"
echo ""

