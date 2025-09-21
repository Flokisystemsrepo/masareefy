# Pulse Finance Database Schema Migration Guide

## Overview

This guide will help you migrate the Pulse Finance database **schema only** (table structures, indexes, constraints) to a new system. This creates the database structure without any data.

## Files Included

- `schema-dump-2025-09-17T14-38-08-043Z.sql` - Complete database schema dump
- `schema.prisma` - Database schema definition
- `SCHEMA_MIGRATION_GUIDE.md` - This migration guide

## What's Included in the Schema Dump

- **Table Definitions** - All 30 tables with proper column types
- **Primary Keys** - All primary key constraints
- **Foreign Keys** - All relationship constraints with CASCADE deletes
- **Unique Constraints** - All unique indexes and constraints
- **Indexes** - All database indexes for performance
- **Data Types** - Proper PostgreSQL data types (JSONB, TIMESTAMPTZ, etc.)
- **Default Values** - All default values and auto-generated fields

## Prerequisites

- PostgreSQL database server (version 12 or higher)
- Node.js and npm installed
- Access to the target database server

## Schema Migration Steps

### 1. Prepare the Target Environment

#### Create a new PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create new database
CREATE DATABASE pulse_finance_new;

# Create a user (optional, you can use existing user)
CREATE USER pulse_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pulse_finance_new TO pulse_user;

# Exit psql
\q
```

### 2. Update Environment Configuration

Update your `.env` file with the new database connection:

```env
DATABASE_URL="postgresql://pulse_user:your_secure_password@localhost:5432/pulse_finance_new"
```

### 3. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### 4. Import the Schema

```bash
# Import the schema dump
psql -h localhost -U pulse_user -d pulse_finance_new < schema-dump-2025-09-17T14-38-08-043Z.sql
```

### 5. Verify the Schema

```bash
# Check if Prisma can connect to the database
npx prisma db pull

# Open Prisma Studio to verify schema
npx prisma studio
```

### 6. Test the Application

```bash
# Start the development server
npm run dev
```

## Database Schema Overview

The schema includes the following table categories:

### Core Tables:

- **users** - User accounts and authentication
- **user_sessions** - User session management
- **brands** - Business/brand information
- **brand_users** - Brand-user relationships

### Subscription & Billing:

- **plans** - Subscription plans and pricing
- **subscriptions** - User subscription details
- **invoices** - Billing and payment records

### Financial Management:

- **wallets** - Digital wallet configurations
- **wallet_transactions** - All financial transactions
- **revenues** - Income tracking
- **costs** - Expense tracking
- **receivables** - Money owed to you
- **payables** - Money you owe

### Business Operations:

- **inventory** - Product and stock management
- **transfers** - Inventory transfers between locations
- **project_targets** - Business goals and targets
- **tasks** - Task management data
- **team_members** - Team collaboration data
- **categories** - Categorization system

### System & Admin:

- **admins** - Administrative accounts
- **admin_sessions** - Admin session management
- **tickets** - Support ticket system
- **ticket_responses** - Support responses
- **audit_logs** - System activity logs
- **usage_tracking** - Feature usage statistics
- **system_metrics** - System performance metrics

### Integrations:

- **bosta_imports** - Bosta shipping integration
- **bosta_shipments** - Individual shipment records
- **financial_reports** - Generated financial reports

### Prisma System:

- **\_prisma_migrations** - Prisma migration history

## Key Schema Features

### Data Types Used:

- **TEXT** - Variable-length strings
- **VARCHAR(n)** - Fixed-length strings
- **INTEGER/BIGINT** - Numeric values
- **DOUBLE PRECISION** - Decimal numbers
- **BOOLEAN** - True/false values
- **TIMESTAMP/TIMESTAMPTZ** - Date and time
- **JSONB** - JSON data with indexing
- **TEXT[]** - Array of strings

### Constraints:

- **Primary Keys** - Unique identifiers for each record
- **Foreign Keys** - Relationships between tables with CASCADE deletes
- **Unique Constraints** - Ensures data uniqueness
- **NOT NULL** - Required fields
- **Default Values** - Auto-generated values (CUID, timestamps)

### Indexes:

- **Primary Key Indexes** - Automatic indexes on primary keys
- **Unique Indexes** - Performance indexes on unique fields
- **Foreign Key Indexes** - Performance indexes on relationships

## Troubleshooting

### Common Issues:

1. **Permission Denied Error**

   ```bash
   # Make sure the database user has proper permissions
   GRANT ALL PRIVILEGES ON DATABASE pulse_finance_new TO pulse_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pulse_user;
   ```

2. **Connection Issues**

   - Verify the DATABASE_URL in your .env file
   - Check if PostgreSQL is running
   - Ensure the database exists

3. **Schema Conflicts**

   ```bash
   # If you encounter schema conflicts, reset and try again
   DROP DATABASE pulse_finance_new;
   CREATE DATABASE pulse_finance_new;
   ```

4. **Foreign Key Constraint Errors**
   - The schema handles foreign key constraints automatically
   - Tables are created in the correct dependency order

### Verification Commands:

```bash
# Check database connection
npx prisma db pull

# View all tables
psql -h localhost -U pulse_user -d pulse_finance_new -c "\dt"

# Check table structures
psql -h localhost -U pulse_user -d pulse_finance_new -c "\d users"
psql -h localhost -U pulse_user -d pulse_finance_new -c "\d brands"

# Check constraints
psql -h localhost -U pulse_user -d pulse_finance_new -c "\d+ users"
```

## Post-Schema Migration Checklist

- [ ] Database schema successfully imported
- [ ] All tables created without errors
- [ ] Foreign key constraints are working
- [ ] Unique constraints are enforced
- [ ] Indexes are created
- [ ] Prisma can connect to the database
- [ ] Application starts without schema errors
- [ ] Prisma Studio shows all tables

## Next Steps After Schema Migration

1. **Seed Initial Data** (if needed):

   ```bash
   npm run db:seed
   ```

2. **Create Admin User**:

   ```bash
   npm run seed:admin
   ```

3. **Set Up Plans**:

   ```bash
   npm run seed:plans
   ```

4. **Test All Features**:
   - User registration and authentication
   - Brand creation and management
   - Financial operations
   - Admin panel access

---

**Schema dump completed on:** 2025-09-17T14:38:08.332Z  
**Schema file size:** 22.76 KB  
**Total tables:** 30 tables with complete structure  
**Total constraints:** All primary keys, foreign keys, and unique constraints included


