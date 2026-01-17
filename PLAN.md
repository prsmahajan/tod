# Backend Implementation Plan

## Overview
Build a complete backend system using **Appwrite Pro** for database/storage, **Clerk** for authentication, and **Razorpay** for payments (one-time + recurring subscriptions).

---

## Phase 1: Appwrite Setup & Configuration

### 1.1 Create Appwrite Collections

**Collection: `transactions`**
- `userId` (string) - Clerk user ID
- `amount` (number) - Amount in INR
- `type` (string) - "one-time" | "subscription"
- `status` (string) - "success" | "failed" | "pending"
- `razorpayPaymentId` (string)
- `razorpayOrderId` (string)
- `razorpaySubscriptionId` (string, optional)
- `planType` (string) - "seedling" | "sprout" | "tree"
- `createdAt` (datetime)

**Collection: `subscriptions`**
- `userId` (string) - Clerk user ID
- `razorpaySubscriptionId` (string)
- `planId` (string)
- `planType` (string) - "seedling" | "sprout" | "tree"
- `status` (string) - "active" | "paused" | "cancelled"
- `currentPeriodEnd` (datetime)
- `createdAt` (datetime)

**Collection: `user_photos`**
- `userId` (string) - Clerk user ID
- `imageIds` (string[]) - Appwrite storage file IDs
- `description` (string)
- `location` (string, optional)
- `status` (string) - "pending" | "approved" | "rejected"
- `feedDate` (datetime) - When animals were fed
- `approvedAt` (datetime, optional)
- `rejectionReason` (string, optional)
- `createdAt` (datetime)

**Collection: `articles`**
- `title` (string)
- `slug` (string)
- `content` (string) - Rich text/markdown
- `excerpt` (string)
- `coverImageId` (string) - Appwrite storage file ID
- `authorId` (string)
- `status` (string) - "draft" | "published" | "scheduled"
- `publishedAt` (datetime)
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Collection: `animals_fed`**
- `photoId` (string) - Reference to user_photos
- `userId` (string)
- `feedDate` (datetime)
- `animalCount` (number, optional)
- `location` (string)
- `featured` (boolean) - Show in marquee

### 1.2 Create Appwrite Storage Buckets
- `user-uploads` - For user-submitted feeding photos
- `article-images` - For blog article cover images
- `marquee-images` - For approved/featured images

---

## Phase 2: Razorpay Subscriptions Setup

### 2.1 Create Subscription Plans (via API)
Plans to create in Razorpay:
- **Seedling Weekly**: ₹29/week
- **Sprout Weekly**: ₹99/week
- **Tree Weekly**: ₹199/week
- **Seedling Monthly**: ₹79/month
- **Sprout Monthly**: ₹499/month
- **Tree Monthly**: ₹999/month

### 2.2 API Routes to Create
- `POST /api/razorpay/create-subscription` - Create recurring subscription
- `POST /api/razorpay/cancel-subscription` - Cancel active subscription
- `GET /api/razorpay/subscription-status` - Get subscription details
- `POST /api/razorpay/webhook` - Handle Razorpay events

### 2.3 Webhook Events to Handle
- `subscription.activated` - Subscription started
- `subscription.charged` - Payment successful
- `subscription.pending` - Payment pending
- `subscription.halted` - Payment failed multiple times
- `subscription.cancelled` - User cancelled
- `payment.captured` - One-time payment success
- `payment.failed` - Payment failed

---

## Phase 3: User Dashboard (`/app`)

### 3.1 Dashboard Pages
- `/app` - Main dashboard (redirect destination)
- `/app/contributions` - Transaction history & total contributed
- `/app/upload` - Upload feeding photos
- `/app/my-photos` - View submitted photos & status
- `/app/subscription` - Manage active subscription

### 3.2 Dashboard Features
- Total amount contributed (lifetime)
- Recent transactions list
- Active subscription status (if any)
- Photo upload form (single/multiple)
- Photo submission status tracker
- Subscription management (upgrade/cancel)

---

## Phase 4: Admin Panel Updates

### 4.1 Admin Pages to Create/Update
- `/admin/photos` - Review pending user photos
- `/admin/photos/[id]` - Approve/reject with reason
- `/admin/transactions` - View all transactions
- `/admin/subscriptions` - View all active subscriptions

### 4.2 Admin Features
- Photo moderation queue
- Bulk approve/reject
- Add approved photos to marquee
- Transaction analytics
- Export data

---

## Phase 5: Integration & Polish

### 5.1 Support Page Updates
- Add toggle: "One-time" vs "Subscribe"
- One-time: Current flow (single payment)
- Subscribe: Create subscription with autopay
- GPay/UPI autopay via Razorpay standard checkout

### 5.2 Marquee Integration
- Fetch approved photos from `user_photos` collection
- Mix with existing Unsplash images
- Show contributor name (optional)

### 5.3 Animals Fed Timeline
- Date-wise display of feeding activities
- Filter by location, date range
- Show on Impact page or new dedicated page

---

## Technical Stack Summary

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 15 (App Router) |
| Authentication | Clerk |
| Database | Appwrite (Collections) |
| File Storage | Appwrite (Buckets) |
| Payments | Razorpay (Orders + Subscriptions) |
| Hosting | Vercel |
| Analytics | Vercel Analytics / GA4 |

---

## Environment Variables Required

```env
# Existing
RAZORPAY_TEST_ID=xxx
RAZORPAY_TEST_KEY=xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=xxx
CLERK_SECRET_KEY=xxx

# New - Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=xxx
APPWRITE_API_KEY=xxx (server-side only)

# Razorpay Webhook
RAZORPAY_WEBHOOK_SECRET=xxx
```

---

## Implementation Order

1. ✅ Set up Appwrite project & collections
2. ✅ Create Appwrite SDK configuration
3. ✅ Create Razorpay subscription plans
4. ✅ Build subscription API routes + webhooks
5. ✅ Update Support page with subscription option
6. ✅ Build user dashboard (`/app/*`)
7. ✅ Build photo upload & moderation system
8. ✅ Update admin panel with new features
9. ✅ Integrate approved photos with marquee
10. ✅ Testing & polish
