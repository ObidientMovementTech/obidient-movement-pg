#!/bin/bash

# Fix Phone Number Unique Constraint Migration
# This script adds a UNIQUE constraint on phone_number to fix the ON CONFLICT error

echo "🔧 Fixing phone_number unique constraint..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set it first: export DATABASE_URL='your_database_url'"
    exit 1
fi

# Run the migration
psql "$DATABASE_URL" -f "$(dirname "$0")/migrations/fix_phone_unique_constraint.sql"

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo "You can now upload CSV files without the ON CONFLICT error."
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi
