#!/bin/bash

# ==============================================================================
# Script Name: db_backup.sh
# Description: Creates a .dbbackup archive of a MongoDB database.
#              Saves to ../db_backups/ with format ${DB_NAME}_${CURRENT_DATE_TIME}
# Usage: ./db_backup.sh [database_name]
# ==============================================================================

# Path Resolution
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BACKUP_DIR="$SCRIPT_DIR/../db_backups"

# Database Defaults
DEFAULT_DB_NAME="michinomicon"
DB_HOST="localhost"
DB_PORT="27017"
DB_USER="ops_admin"
AUTH_SOURCE="admin"

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Determine Database Name (Argument 1 or Default)
DB_NAME="${1:-$DEFAULT_DB_NAME}"

# Generate Timestamp
CURRENT_DATE_TIME=$(date +"%Y%m%d%H%M%S")

# Construct Filename: ${DB_NAME}_${CURRENT_DATE_TIME}.dbbackup
FILENAME="${DB_NAME}_${CURRENT_DATE_TIME}.dbbackup"
FULL_PATH="${BACKUP_DIR}/${FILENAME}"


echo "=========================================="
echo "       MongoDB Backup Started             "
echo "=========================================="
echo "Database:     $DB_NAME"
echo "Output File:  $FILENAME"
echo "Location:     $BACKUP_DIR"
echo "------------------------------------------"
echo "Connecting to $DB_HOST:$DB_PORT as $DB_USER..."

# Run mongodump
# Password prompt will happen automatically as configured
mongodump \
  --host "$DB_HOST" \
  --port "$DB_PORT" \
  --username "$DB_USER" \
  --authenticationDatabase "$AUTH_SOURCE" \
  --db "$DB_NAME" \
  --archive="$FULL_PATH" \
  --gzip

EXIT_CODE=$?

# Final Status

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "           Backup Successful!             "
    echo "=========================================="
    echo "Backup saved to:"
    echo "$FULL_PATH"

    FILE_SIZE=$(du -h "$FULL_PATH" | cut -f1)
    echo "Size: $FILE_SIZE"
    echo "=========================================="
else
    echo ""
    echo "=========================================="
    echo "             Backup FAILED                "
    echo "=========================================="
    echo "mongodump exited with error code $EXIT_CODE"
    
    # Cleanup empty/partial file if created
    if [ -f "$FULL_PATH" ]; then
        rm "$FULL_PATH"
        echo "Removed partial backup file."
    fi
    exit $EXIT_CODE
fi