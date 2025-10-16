#!/bin/bash

# Create call center database schema
# This script sets up the necessary tables for the call center functionality

echo "Setting up Call Center database schema..."

# Check if we have database connection parameters
if [ -z "$DB_URI" ]; then
  echo "Error: DB_URI environment variable not set"
  echo "Please set your database connection string"
  exit 1
fi

# Run the schema SQL file
echo "Creating tables..."
cd "$(dirname "$0")"
psql $DB_URI -f call_center_schema.sql

if [ $? -eq 0 ]; then
  echo "✅ Call Center database schema created successfully!"
  echo ""
  echo "Next steps:"
  echo "1. Start the server: npm run dev"
  echo "2. Import voter data via the admin interface"
  echo "3. Assign volunteers to polling units"
  echo "4. Begin call center operations"
else
  echo "❌ Failed to create database schema"
  exit 1
fi