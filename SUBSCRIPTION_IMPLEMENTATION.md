# Subscription System Implementation

This document explains the subscription-based system with automatic downgrading and feature locking that has been implemented.

## Overview

The system now includes:

- **Free Plan**: Basic access with limited features
- **Paid Plans**: Full access to all features
- **Automatic Downgrading**: Users are automatically moved to free plan when subscription expires
- **Feature Locking**: Locked features show a blurred overlay with upgrade prompts

## Backend Changes

### 1. Free Plan Added

A new free plan has been added to the seed file (`backend/seed-plans.js`) with:

- **Price**: $0/month and $0/year
- **Features**: Basic dashboard, revenue/cost tracking, email support
- **Limits**: 1 brand, 1 user, 100 transactions
- **Locked Features**: Advanced analytics, team management, inventory, etc.

### 2. Subscription Middleware

New middleware (`backend/src/middleware/subscription.ts`) that:

- Checks user subscription status on every request
- Automatically creates free plan subscription for new users
- Automatically downgrades expired subscriptions to free plan
- Provides feature access control

### 3. Automatic Downgrading Script

Script (`backend/scripts/check-subscriptions.js`) that:

- Runs subscription checks
- Identifies expired subscriptions
- Automatically downgrades to free plan
- Creates audit logs for tracking

## Frontend Changes

### 1. Subscription Context

New React context (`src/contexts/SubscriptionContext.tsx`) that:

- Manages subscription state throughout the app
- Provides feature access checking methods
- Handles subscription refresh and updates

### 2. Feature Lock Component

New component (`src/components/FeatureLock.tsx`) that:

- Shows blurred overlay for locked features
- Displays upgrade prompts
- Shows current plan information
- Provides upgrade button navigation

### 3. Protected Routes

The following pages are now wrapped with `FeatureLock`:

- **Tasks Management**: Full task management features
- **Team Management**: Team member management
- **Other locked features**: Will be added as needed

## How It Works

### 1. User Registration

- New users automatically get a free plan subscription
- Free plan provides basic access to dashboard, revenue, and cost features

### 2. Feature Access Control

- Free plan users can only access basic features
- Advanced features show blurred overlay with upgrade prompts
- Paid plan users have access to all features

### 3. Automatic Downgrading

- When a subscription expires, user is automatically moved to free plan
- This happens both on backend requests and through scheduled checks
- Users maintain access to basic features but lose access to premium ones

### 4. Upgrade Flow

- Users can upgrade from the onboarding page
- Upgrade button in locked features navigates to subscription selection
- After payment, users get immediate access to all features

## Usage

### Backend Commands

```bash
# Seed the plans (including free plan)
npm run seed:plans

# Check and downgrade expired subscriptions
npm run check:subscriptions

# Run the backend
npm run dev
```

### Frontend Integration

```tsx
import { useSubscription } from "@/contexts/SubscriptionContext";
import FeatureLock from "@/components/FeatureLock";

// Check if user has access to a feature
const { hasFeatureAccess, isFeatureLocked } = useSubscription();

if (isFeatureLocked("advanced-analytics")) {
  return <FeatureLock featureName="Advanced Analytics" />;
}

// Wrap locked features
<FeatureLock featureName="Team Management">
  <TeamPage />
</FeatureLock>;
```

## Configuration

### Subscription Check Frequency

The subscription check script can be run:

- **Manually**: `npm run check:subscriptions`
- **Via Cron**: Set up a cron job to run daily
- **Via CI/CD**: Include in deployment pipeline

### Feature Access Rules

Feature access is controlled in the subscription context:

- **Free Plan**: Only "dashboard", "revenue", "cost" features
- **Paid Plans**: All features unlocked
- **Custom Rules**: Can be extended in `hasFeatureAccess` method

## Security

- Subscription checks happen on every authenticated request
- Feature access is verified both on frontend and backend
- Users cannot bypass feature locks through direct API calls
- Audit logs track all subscription changes

## Monitoring

- Check subscription status in database
- Monitor audit logs for downgrade events
- Track feature usage by plan type
- Monitor upgrade conversion rates

## Future Enhancements

- **Usage Tracking**: Monitor feature usage for billing
- **Tiered Plans**: More granular feature access control
- **Trial Extensions**: Allow users to extend trials
- **Promotional Codes**: Discount codes for upgrades
- **Usage Alerts**: Notify users approaching limits

## Troubleshooting

### Common Issues

1. **Free plan not created**: Run `npm run seed:plans`
2. **Features not locked**: Check subscription context is properly wrapped
3. **Downgrades not working**: Run `npm run check:subscriptions`
4. **Context errors**: Ensure `SubscriptionProvider` wraps the app

### Debug Commands

```bash
# Check current subscriptions
npm run db:studio

# Reset database and reseed
npm run db:migrate
npm run seed:plans

# Check subscription middleware
npm run dev
```

## Support

For issues or questions about the subscription system:

1. Check this documentation
2. Review the code comments
3. Check the audit logs
4. Contact the development team
