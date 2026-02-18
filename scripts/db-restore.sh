#!/bin/bash

# ==============================================================================
# Script Name: db_restore.sh
# Description: Restores a MongoDB backup from a .dbbackup file using mongorestore.
# Usage: ./db_restore.sh <filename_or_path>
# ==============================================================================

# --- Configuration ---
# Determine the absolute path of the directory this script is in
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# Resolve the default backups directory relative to the script location
DEFAULT_BACKUP_DIR="$SCRIPT_DIR/../db_backups"
# Target Database URI (Password left empty to trigger prompt/auth failure handling)
TARGET_DB_URI="mongodb://ops_admin:@localhost:27017/?authSource=admin"

# --- Function: Print Error and Exit ---
fail() {
    echo -e "\n[ERROR] $1"
    exit 1
}

# Input Parsing & Path Resolution ---

# Check if an argument is provided
if [ -z "$1" ]; then
    fail "No backup file specified.\nUsage: ./db_restore.sh <filename_or_path>"
fi

INPUT_ARG="$1"

# Check if input has an extension; if not, append .dbbackup
filename=$(basename "$INPUT_ARG")
extension="${filename##*.}"

if [ "$filename" == "$extension" ]; then
    # No extension detected
    INPUT_ARG="${INPUT_ARG}.dbbackup"
fi

# Determine full path
if [[ "$INPUT_ARG" == */* ]]; then
    # If the argument contains a slash, treat it as a path (relative or absolute)
    BACKUP_FILE="$INPUT_ARG"
else
    # If it's just a filename, look in the default db_backups directory
    BACKUP_FILE="$DEFAULT_BACKUP_DIR/$INPUT_ARG"
fi

# Validation ---

# Validate file existence
if [ ! -f "$BACKUP_FILE" ]; then
    fail "File not found at:\n$BACKUP_FILE"
fi

# Validate file extension (Must be .dbbackup)
if [[ "$BACKUP_FILE" != *.dbbackup ]]; then
    fail "Invalid file extension. File must end in '.dbbackup'."
fi

# Validate content (Basic check: Ensure it's not empty and looks like a binary/archive)
# Using 'file' command to check if it's data or gzip (standard for mongodump archives)
FILE_TYPE=$(file -b "$BACKUP_FILE")
if [[ "$FILE_TYPE" != *"gzip compressed data"* ]] && [[ "$FILE_TYPE" != *"data"* ]]; then
     fail "File content validation failed. The file does not appear to be a valid binary archive.\nDetected type: $FILE_TYPE"
fi

# Extract filename without extension for logging
BASENAME=$(basename "$BACKUP_FILE")
FILENAME_NO_EXT="${BASENAME%.*}"



# ========= TODO =========
#  - Enforce mandatory dry run before a real restore.
#
# Add a prompt to optionally run `mongorestore` with `--dryRun` and `--verbose` first before
# the proper restore and log the results to `restore_dryrun_output_${FILENAME_NO_EXT}.log.
# After the dry run, validate the success of the dry run. 
# If successful, prompt to optionally continue with proper restore as below.
# If not successfull, display "dry run failed" message and display location of log file then EXIT THE SCRIPT. 
#
#=========================



# ========= !! NOTE !! =========
# This script must be made a lot more granular with more checks and prompts before
# It should perform restore operations using `--drop` and the like.
#===============================

# User Confirmation
echo "=========================================="
echo "       MongoDB Restore Confirmation       "
echo "=========================================="
echo "Backup File:  $BACKUP_FILE"
echo "Target DB:    $TARGET_DB_URI"
echo "------------------------------------------"
echo "WARNING: This will overwrite data in the target database."
echo ""
read -p "Are you sure you want to proceed? (y/N): " CONFIRM

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo "Restore cancelled by user."
    exit 0
fi



# Log file path setup
LOG_FILE="${SCRIPT_DIR}/restore_error_${FILENAME_NO_EXT}.log"

# We capture Stderr to a temp file to decide if we keep it (on failure) or discard it (on success)
# Note: Using --archive flag is standard for single-file restores
TEMP_LOG=$(mktemp)

# Run mongorestore
mongorestore --uri="$TARGET_DB_URI" --archive="$BACKUP_FILE" --gzip 2> >(tee "$TEMP_LOG" >&2)

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    # --- Success ---
    rm "$TEMP_LOG" # Clean up log if successful
    
    echo ""
    echo "=========================================="
    echo "           Restore Successful!            "
    echo "=========================================="
    echo "Restored from: $BACKUP_FILE"
    echo "Restored to:   $TARGET_DB_URI"
    echo "=========================================="
else
    # --- Failure ---
    mv "$TEMP_LOG" "$LOG_FILE" # Save the log
    
    echo ""
    echo "=========================================="
    echo "             Restore FAILED               "
    echo "=========================================="
    echo "An error occurred during the restore process."
    echo "Error logs have been saved to:"
    echo "$LOG_FILE"
    exit $EXIT_CODE
fi