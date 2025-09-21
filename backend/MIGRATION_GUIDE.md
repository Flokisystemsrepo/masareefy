# Pulse Finance Database Migration Guide

## Overview

This guide will help you migrate the Pulse Finance database to a new system. The migration dump contains all your current data including users, brands, financial records, and system configurations.

## Files Included

- `migration-dump-2025-09-17T14-34-46-576Z.sql` - Complete database dump
- `schema.prisma` - Database schema definition
- `MIGRATION_GUIDE.md` - This migration guide

## Prerequisites

- PostgreSQL database server (version 12 or higher)
- Node.js and npm installed
- Access to the target database server

## Migration Steps

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

### 4. Import the Database Dump

```bash
# Import the migration dump
psql -h localhost -U pulse_user -d pulse_finance_new < migration-dump-2025-09-17T14-34-46-576Z.sql
```

### 5. Verify the Migration

```bash
# Check if Prisma can connect to the database
npx prisma db pull

# Open Prisma Studio to verify data
npx prisma studio
```

### 6. Test the Application

```bash
# Start the development server
npm run dev
```

## Data Included in Migration

The migration dump includes all the following data:

### Core Tables:

- **Users** - All user accounts and authentication data
- **Brands** - Business/brand information
- **Plans** - Subscription plans and pricing
- **Subscriptions** - User subscription details
- **Invoices** - Billing and payment records

### Financial Data:

- **Wallets** - Digital wallet configurations
- **Wallet Transactions** - All financial transactions
- **Revenues** - Income tracking
- **Costs** - Expense tracking
- **Receivables** - Money owed to you
- **Payables** - Money you owe

### Business Operations:

- **Inventory** - Product and stock management
- **Transfers** - Inventory transfers between locations
- **Project Targets** - Business goals and targets
- **Tasks** - Task management data
- **Team Members** - Team collaboration data

### System Data:

- **Admin Users** - Administrative accounts
- **Tickets** - Support ticket system
- **Audit Logs** - System activity logs
- **Usage Tracking** - Feature usage statistics
- **Bosta Integration** - Shipping and delivery data

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

3. **Schema Mismatch**

   ```bash
   # If you encounter schema issues, push the schema first
   npx prisma db push
   ```

4. **Foreign Key Constraint Errors**
   - The dump file handles foreign key constraints automatically
   - If issues persist, check the order of table imports

### Verification Commands:

```bash
# Check database connection
npx prisma db pull

# View all tables
psql -h localhost -U pulse_user -d pulse_finance_new -c "\dt"

# Check record counts
psql -h localhost -U pulse_user -d pulse_finance_new -c "SELECT COUNT(*) FROM users;"
psql -h localhost -U pulse_user -d pulse_finance_new -c "SELECT COUNT(*) FROM brands;"
```

## Security Notes

- Change all default passwords after migration
- Update JWT secrets in your .env file
- Review user permissions and access levels
- Consider running security audits on the migrated data

## Support

If you encounter any issues during migration:

1. Check the PostgreSQL logs for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure all dependencies are properly installed
4. Test database connectivity before importing data

## Post-Migration Checklist

- [ ] Database successfully imported
- [ ] Application starts without errors
- [ ] User authentication works
- [ ] Financial data is accessible
- [ ] All integrations are functional
- [ ] Admin panel is accessible
- [ ] Email notifications work (if configured)
- [ ] File uploads work (if using S3)

---

**Migration completed on:** 2025-09-17T14:34:46.862Z  
**Dump file size:** 0.11 MB  
**Total tables migrated:** 29 tables with data


