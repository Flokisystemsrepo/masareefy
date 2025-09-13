#!/bin/bash

# Database Migration Script for Pulse Finance
# This script helps migrate the database backup to a new environment

set -e  # Exit on any error

echo "🚀 Pulse Finance Database Migration Script"
echo "=========================================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 15+ first."
    exit 1
fi

# Check if backup file exists
if [ ! -f "pulse_finance_backup.sql" ]; then
    echo "❌ Backup file 'pulse_finance_backup.sql' not found."
    echo "   Please make sure the backup file is in the current directory."
    exit 1
fi

echo "✅ PostgreSQL found"
echo "✅ Backup file found"

# Get database connection details
read -p "Enter PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -p "Enter PostgreSQL host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter PostgreSQL port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Enter database name (default: pulse_finance): " DB_NAME
DB_NAME=${DB_NAME:-pulse_finance}

echo ""
echo "📋 Migration Details:"
echo "   Username: $DB_USER"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo ""

read -p "Do you want to proceed? (y/N): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled."
    exit 0
fi

echo ""
echo "🔄 Starting migration..."

# Create database
echo "1. Creating database '$DB_NAME'..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Restore database
echo "2. Restoring database from backup..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f pulse_finance_backup.sql

# Verify migration
echo "3. Verifying migration..."
USER_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM users;" | xargs)
BRAND_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM brands;" | xargs)
TICKET_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM tickets;" | xargs)

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "📊 Database Statistics:"
echo "   Users: $USER_COUNT"
echo "   Brands: $BRAND_COUNT"
echo "   Tickets: $TICKET_COUNT"
echo ""
echo "🔑 Default Admin Account:"
echo "   Email: admin@admin.com"
echo "   Password: admin"
echo ""
echo "📝 Next Steps:"
echo "   1. Update your .env file with the database connection:"
echo "      DATABASE_URL=\"postgresql://$DB_USER:your_password@$DB_HOST:$DB_PORT/$DB_NAME\""
echo "   2. Run 'npm install' to install dependencies"
echo "   3. Run 'npm run dev' to start the application"
echo ""
echo "🎉 Happy coding!"
