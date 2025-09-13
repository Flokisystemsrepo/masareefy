# Database Migration Guide

## Overview

This guide will help you migrate the Pulse Finance database to your local environment.

## Files Included

- `pulse_finance_backup.sql` - Complete database backup (79KB)
- `pulse_finance_backup.sql.gz` - Compressed version (17KB) - **Use this one for sharing**

## Prerequisites

1. PostgreSQL 15+ installed on your system
2. Access to create databases and users

## Migration Steps

### 1. Create Database

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create the database
CREATE DATABASE pulse_finance;

# Exit psql
\q
```

### 2. Restore Database

```bash
# If you have the compressed file, decompress it first
gunzip pulse_finance_backup.sql.gz

# Restore the database
psql -U postgres -d pulse_finance -f pulse_finance_backup.sql
```

### 3. Verify Migration

```bash
# Connect to the database
psql -U postgres -d pulse_finance

# Check tables
\dt

# Check some data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM brands;
SELECT COUNT(*) FROM tickets;

# Exit
\q
```

## Database Structure

The database includes the following main tables:

### Core Tables

- `users` - User accounts
- `brands` - Brand/company information
- `brand_users` - User-brand relationships
- `admins` - Admin users
- `plans` - Subscription plans
- `subscriptions` - User subscriptions

### Financial Tables

- `revenues` - Revenue tracking
- `costs` - Cost tracking
- `receivables` - Accounts receivable
- `payables` - Accounts payable
- `transfers` - Money transfers
- `wallets` - User wallets
- `wallet_transactions` - Wallet transactions

### Business Tables

- `inventory` - Product inventory
- `tasks` - Task management
- `team_members` - Team management
- `project_targets` - Project targets
- `categories` - Category management

### Integration Tables

- `bosta_imports` - Bosta integration data
- `bosta_shipments` - Bosta shipment data

### Support Tables

- `tickets` - Support tickets
- `ticket_responses` - Ticket responses

### System Tables

- `audit_logs` - System audit logs
- `system_metrics` - System performance metrics
- `user_sessions` - User session management
- `admin_sessions` - Admin session management

## Environment Configuration

After migration, update your `.env` file:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/pulse_finance"
```

## Default Admin Account

The database includes a default admin account:

- **Email**: `admin@admin.com`
- **Password**: `admin`
- **Role**: `super_admin`

## Important Notes

1. **Backup includes all data** - Users, brands, financial data, tickets, etc.
2. **Clean restore** - The backup will drop existing tables before creating new ones
3. **No owner/privilege issues** - Backup excludes ownership and privilege information
4. **UTF-8 encoding** - Database uses UTF-8 encoding
5. **PostgreSQL 15** - Backup was created with PostgreSQL 15

## Troubleshooting

### Permission Issues

If you get permission errors:

```bash
# Grant necessary permissions
psql -U postgres -d pulse_finance -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;"
psql -U postgres -d pulse_finance -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;"
```

### Connection Issues

Make sure PostgreSQL is running:

```bash
# On macOS with Homebrew
brew services start postgresql@15

# On Linux
sudo systemctl start postgresql
```

### Database Already Exists

If the database already exists and you want to replace it:

```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE IF EXISTS pulse_finance;"
psql -U postgres -c "CREATE DATABASE pulse_finance;"
```

## Support

If you encounter any issues during migration, please check:

1. PostgreSQL version compatibility
2. Database permissions
3. Connection settings
4. File integrity

The backup was created on: **September 7, 2025**
Database version: **PostgreSQL 15.14**
