#!/bin/bash

# stops the execution immediately if any command fails (returns non-zero)
set -e

# The name of the application in PM2
# Must match name in ecosystem.config.cjs
APP_NAME="$1"

# The absolute path to the project directory on the VPS
TARGET_DIR="${2:-$(pwd)}"

# Validation: Check if arguments were provided
if [ -z "$APP_NAME" ]; then
  echo "    🔴 Error: Missing argument for application name"
  echo "Usage: ./deploy.sh <app_name> [target_directory]"
  echo "Example: ./deploy.sh my-app /var/www/my-app"
  exit 1
fi

# ----------------------
# Deployment
# ----------------------
echo "🟡 Deploying application '$APP_NAME' to '$TARGET_DIR'..."

# 1. Navigate to project directory
if [ -d "$TARGET_DIR" ]; then
  cd "$TARGET_DIR"
  echo "    🟢 Navigated to $TARGET_DIR"
else
  echo "    🔴 Error: Target directory $TARGET_DIR does not exist."
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
if pm2 list | grep -q "$APP_NAME"; then
    echo "    🟡 Application is running in PM2. Reloading application..."
    # Reload the app and update environment variables
    pm2 reload "$APP_NAME" --update-env
    # Reset restart counters
    pm2 reset "$APP_NAME"
    echo "    🟢 Application reloaded."
else
    # Start the app if it's not running
    echo "    🟡 Application is not running in PM2. Starting application..."
    pm2 start npm --name "$APP_NAME" -- start
    echo "    🟢 Application started."
fi

# Save PM2 Process List so if the server reboots PM2 will start the app
echo "    🟡 Saving PM2 process list..."
pm2 save
echo "    🟢 PM2 Process list saved."

# ----------------------
# Verify PM2 Process status
# ----------------------

echo "    🟡 Waiting 5 seconds for app to initialize..."
sleep 5

echo "    🟡 Verifying PM2 process status..."
APP_STATUS=$(pm2 jlist | grep -o "\"name\":\"$APP_NAME\"[^}]*\"status\":\"[^\"]*\"" | grep -o "\"status\":\"[^\"]*\"" | cut -d'"' -f4)

if [ "$APP_STATUS" == "online" ]; then
    echo "    🟢 '$APP_NAME' is: '$APP_STATUS', Application deployed. "
    exit 0
else
    echo "    🔴 '$APP_NAME' is: '$APP_STATUS', Application NOT deployed. "
    # We force a non-zero exit code so GitHub Actions marks the job as FAILED
    exit 1
fi
