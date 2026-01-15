#!/bin/bash

# 🟡🟢🔴

# ----------------------
# Load Environment Variables
# ----------------------
if [ -f .env ]; then
  # export all variables defined in .env
  set -a
  source .env
  set +a
  echo "🟢 Loaded environment variables from current .env"
else
  echo "🟡 Warning: .env file not found in current directory."
fi

# ----------------------
# Configuration
# ----------------------

# The absolute path to the project directory on the VPS
TARGET_DIR="${TARGET_DIR:-$(pwd)}"

# The name of the application in PM2
# (Ensure this matches the name used in your ecosystem.config.js or previous start command)
PM2_NAME="${APP_NAME}"

# ----------------------
# Deployment
# ----------------------
echo "🟡 Deploying application '$PM2_NAME'..."

# 1. Navigate to project directory
if [ -d "$PROJECT_DIR" ]; then
  cd "$PROJECT_DIR"
  echo "    🟢 Navigated to $PROJECT_DIR"
else
  echo "    🔴 Error: Project directory $PROJECT_DIR does not exist."
  exit 1
fi

# Install Dependencies
# Use --frozen-lockfile to ensure the installed packages match pnpm-lock.yaml exactly
echo "    🟡 Installing the dependencies..."
pnpm install --frozen-lockfile
echo "    🟢 Dependencies installed."

# Build the Application
echo "    🟡 Building the application..."
pnpm build
echo "    🟢 Application built."

# Run PayloadCMS Database Migrations
# echo "    🟡 Running PayloadCMS database migrations..."
# pnpm payload migrate
# echo "    🟢 Databases Migrated."

echo "    🟡 Running application..."
# Check if the app is already running in PM2
if pm2 list | grep -q "$PM2_NAME"; then
    echo "    🟡 Application is running in PM2. Reloading application..."
    # Reload the app and update environment variables
    pm2 reload "$PM2_NAME" --update-env
    # Reset restart counters
    pm2 reset "$PM2_NAME"
    echo "    🟢 Application reloaded."
else
    # Start the app if it's not running
    echo "    🟡 Application is running in PM2. Starting application..."
    pm2 start npm --name "$PM2_NAME" -- start
    echo "    🟢 Application started."
fi

# Save PM2 Process List so if the server reboots PM2 will start the app
echo "    🟡 Saving PM2 process list..."
pm2 save
echo "    🟢 PM2 Process list saved."

echo "🟢 Application '$PM2_NAME' deployed."
pm2 list