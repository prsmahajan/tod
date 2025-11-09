# The Open Draft - Features & Implementation Guide

## 🎯 **MISSION**

**Purpose:** Every subscription feeds stray animals across India.

**Model:**
- Tech newsletter teaching complex technology in simple terms
- ₹10/month subscriptions
- Goal: 20,000 subscribers × ₹10 = ₹2,00,000/month
- After operational costs → ₹1,50,000+ for feeding stray dogs, cats, cows, bulls, pigeons

**Impact:** Transparent monthly reports, photos, real-time tracking.

---

## ✅ **COMPLETED FEATURES**

### 1. **Full CMS Admin Panel** (`/admin`)
**Location:** `app/admin/`

**Features:**
- Dashboard with stats (posts, subscribers, recent activity)
- Posts Management (create, edit, delete, rich text editor)
- Categories Management
- Subscribers List
- Users Management (role-based: ADMIN, EDITOR, AUTHOR, SUBSCRIBER)
- Settings Page (site config, social media, feature toggles)

**Files:**
- `app/admin/page.tsx` - Dashboard
- `app/admin/posts/` - Post management
- `app/admin/categories/page.tsx` - Categories
- `app/admin/users/page.tsx` - User management
- `app/admin/settings/page.tsx` - Site settings
- `app/admin/subscribers/page.tsx` - Subscribers list

**Access:** Protected by middleware, role-based authorization

---

### 2. **Authentication System**
**Location:** `app/api/auth/`, `app/login/`, `app/signup/`

**Features:**
- User signup with email verification
- Login with NextAuth.js (JWT sessions)
- Password reset flow (15-minute token expiry)
- Email verification (24-hour token expiry)
- Bcrypt password hashing
- Role-based access control

**Files:**
- `app/api/auth/[...nextauth]/route.ts` - NextAuth config
- `app/api/auth/signup/route.ts` - Registration
- `app/api/auth/verify/route.ts` - Email verification
- `app/api/auth/reset/request/route.ts` - Password reset request
- `app/api/auth/reset/confirm/route.ts` - Password reset confirm
- `lib/tokens.ts` - Token generation
- `lib/mail.ts` - Email sending (Resend)

**Email Provider:** Resend API

---

### 3. **Newsletter System**
**Location:** `app/newsletter/`, `components/newsletter-form.tsx`

**Features:**
- Newsletter subscription form
- Database + Google Sheets dual storage
- Email validation (Zod)
- Duplicate prevention
- Reactivation of unsubscribed users
- **Email sending ENABLED** when posts published
- Unsubscribe functionality (token-based)

**Files:**
- `app/api/subscribe/route.ts` - Subscribe endpoint
- `app/api/unsubscribe/route.ts` - Unsubscribe endpoint
- `app/unsubscribe/page.tsx` - Unsubscribe page
- `lib/newsletter.ts` - Email sending function
- `lib/google-sheets.ts` - Google Sheets integration

**Email Template Includes:**
- Post title, excerpt, author
- "Read Full Article" CTA
- Unsubscribe link (secure)
- Branded footer

**Setup Required:**
- `RESEND_API_KEY` in .env
- `EMAIL_FROM` in .env
- Optional: Google Sheets credentials

---

### 4. **Rich Text Editor**
**Location:** `components/editor/EnhancedEditor.tsx`

**Features:**
- TipTap WYSIWYG editor
- Full formatting toolbar (headings, bold, italic, lists, links, images)
- Image upload to `/public/uploads/`
- Real-time HTML preview
- Undo/Redo

**Files:**
- `components/editor/EnhancedEditor.tsx`
- `app/api/upload/route.ts` - Image upload

---

### 5. **Scheduled Posts**
**Location:** Multiple files

**Features:**
- Date/time picker in post editor
- Auto-publish via Vercel cron (every 15 minutes)
- Manual publish trigger in admin panel
- Newsletter emails sent on publish

**Files:**
- `app/admin/posts/new/page.tsx` - Has datetime picker
- `app/admin/posts/[id]/page.tsx` - Has datetime picker
- `app/api/cron/publish-scheduled/route.ts` - Cron endpoint
- `vercel.json` - Cron configuration

**Cron Configuration:**
```json
{
  "crons": [{
    "path": "/api/cron/publish-scheduled",
    "schedule": "*/15 * * * *"
  }]
}
```

---

### 6. **Save/Bookmark Posts**
**Location:** `app/saved/`, `components/SavePostButton.tsx`

**Features:**
- Users can save posts to read later
- Bookmark button on all posts
- Saved posts page (`/saved`)
- Remove saved posts
- Login required

**Files:**
- `app/api/saved-posts/route.ts` - Save/unsave/list
- `app/api/saved-posts/check/route.ts` - Check if saved
- `components/SavePostButton.tsx` - Reusable button
- `app/saved/page.tsx` - Saved posts page

**Database:** `SavedPost` model (userId + postId unique)

---

### 7. **Mission Page** ⭐ **NEW**
**Location:** `app/mission/page.tsx`

**Features:**
- Complete story of animal welfare mission
- Problem → Solution → Math breakdown
- Transparency pledge
- FAQs
- Call-to-action buttons
- SEO optimized

**Content Sections:**
- Hero with heart icon
- The Reality (problem statement)
- Our Solution (tech for good)
- How It Works (3-step process)
- Transparency Pledge
- CTAs (Read Free / Subscribe / Donate)
- FAQ section

**Links Added:**
- Navbar: "Our Mission"
- Homepage: Mission banner with heart icon
- Footer: Mission link + "Built with ❤️ for animals"

---

### 8. **SEO & Social Sharing** ⭐ **NEW**
**Location:** `components/SEOHead.tsx`, `components/SocialShare.tsx`

**Features:**
- Open Graph meta tags (Facebook, LinkedIn)
- Twitter Card meta tags
- Dynamic metadata per post
- Auto-generated sitemap.xml
- robots.txt
- Social sharing buttons (Twitter, Facebook, LinkedIn, Copy Link)
- Native mobile share support

**Files:**
- `components/SEOHead.tsx` - SEO utility function
- `components/SocialShare.tsx` - Share buttons
- `app/sitemap.ts` - Dynamic sitemap
- `app/robots.ts` - Robots.txt
- `app/page.tsx` - Homepage SEO
- `app/newsletter/[slug]/page.tsx` - Post SEO with article tags

**SEO Keywords:**
- "tech education + animal welfare"
- "technology explained simply"
- "feed stray animals India"
- "₹10 subscription charity"

---

### 9. **Database Models** (Prisma)
**Location:** `prisma/schema.prisma`

**Models:**
- `User` (with roles: ADMIN, EDITOR, AUTHOR, SUBSCRIBER)
- `Post` (status: DRAFT, PUBLISHED, SCHEDULED)
- `Category`
- `PostCategory` (many-to-many)
- `Subscriber` (with active/inactive status)
- `EmailVerificationToken`
- `PasswordResetToken`
- `Setting` (key-value pairs)
- `SavedPost` (user saved posts)

**Migrations Applied:**
- Initial CMS models
- Settings model
- SavedPost model

---

### 10. **UI/UX**
**Features:**
- Responsive design (mobile-first)
- Navbar with logo
- User dropdown (Admin Dashboard, Saved Posts, Logout)
- Footer with mission messaging
- Clean, modern design
- Loading states
- Error handling
- Success messages

---

## 🚧 **PENDING FEATURES - IMPLEMENTATION GUIDE**

### ⭐ **1. RAZORPAY PAYMENT SYSTEM** (HIGHEST PRIORITY)

This is your revenue engine. Without this, no ₹2L/month for animals.

#### **Phase 1: Setup Razorpay Account**
1. Go to https://razorpay.com/
2. Sign up for business account
3. Complete KYC (business verification)
4. Get API keys:
   - Test Mode: `rzp_test_xxxxx` (for development)
   - Live Mode: `rzp_live_xxxxx` (for production)

#### **Phase 2: Install Dependencies**
```bash
npm install razorpay
```

#### **Phase 3: Add Environment Variables**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx
```

#### **Phase 4: Create Razorpay Utility**
**File:** `lib/razorpay.ts`
```typescript
import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

#### **Phase 5: Add Subscription Model to Database**
**Update:** `prisma/schema.prisma`
```prisma
enum SubscriptionStatus {
  ACTIVE
  CANCELED
  EXPIRED
  PAUSED
}

model Subscription {
  id                  String             @id @default(cuid())
  userId              String
  razorpaySubId       String             @unique
  razorpayPlanId      String
  razorpayCustomerId  String?
  status              SubscriptionStatus @default(ACTIVE)
  currentPeriodStart  DateTime
  currentPeriodEnd    DateTime
  canceledAt          DateTime?
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([razorpaySubId])
}
```

Add to User model:
```prisma
model User {
  // ... existing fields
  subscriptions Subscription[]
}
```

Run migration:
```bash
npx prisma migrate dev --name add_subscriptions
```

#### **Phase 6: Create Razorpay Plan**
Create a plan in Razorpay Dashboard or via API:
- **Amount:** ₹10 (1000 paise)
- **Currency:** INR
- **Interval:** 1 month
- **Name:** "Monthly Tech Newsletter + Animal Welfare"

Or create via code in a one-time script:
```typescript
const plan = await razorpay.plans.create({
  period: 'monthly',
  interval: 1,
  item: {
    name: 'Monthly Newsletter Subscription',
    amount: 1000, // ₹10 in paise
    currency: 'INR',
    description: 'Tech newsletter + feed stray animals'
  }
});
console.log('Plan ID:', plan.id); // Save this ID
```

#### **Phase 7: Create Subscribe API Endpoint**
**File:** `app/api/subscribe-payment/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { razorpay } from '@/lib/razorpay';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has active subscription
    const existingSub = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    if (existingSub) {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 400 });
    }

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID!, // Add this to .env
      customer_notify: 1,
      quantity: 1,
      total_count: 12, // 12 months initially, renews
      notes: {
        userId: user.id,
        email: user.email,
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
```

#### **Phase 8: Create Webhook Handler**
**File:** `app/api/webhooks/razorpay/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle different events
    switch (event.event) {
      case 'subscription.activated':
        await handleSubscriptionActivated(event.payload.subscription.entity);
        break;
      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.payment.entity);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity);
        break;
      case 'subscription.completed':
        await handleSubscriptionCompleted(event.payload.subscription.entity);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

async function handleSubscriptionActivated(subscription: any) {
  const userId = subscription.notes.userId;

  await prisma.subscription.create({
    data: {
      userId,
      razorpaySubId: subscription.id,
      razorpayPlanId: subscription.plan_id,
      razorpayCustomerId: subscription.customer_id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(subscription.current_start * 1000),
      currentPeriodEnd: new Date(subscription.current_end * 1000),
    },
  });

  console.log(`Subscription activated for user ${userId}`);
}

async function handleSubscriptionCharged(payment: any) {
  console.log(`Payment successful: ${payment.id}`);
  // You can track revenue here
}

async function handleSubscriptionCancelled(subscription: any) {
  await prisma.subscription.updateMany({
    where: { razorpaySubId: subscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
    },
  });
}

async function handleSubscriptionCompleted(subscription: any) {
  await prisma.subscription.updateMany({
    where: { razorpaySubId: subscription.id },
    data: { status: 'EXPIRED' },
  });
}
```

#### **Phase 9: Create Subscribe Page**
**File:** `app/subscribe/page.tsx`
```typescript
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, Check } from "lucide-react";
import Script from "next/script";

export default function SubscribePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    if (status !== "authenticated") {
      router.push("/login?redirect=/subscribe");
      return;
    }

    setLoading(true);

    try {
      // Create subscription
      const res = await fetch("/api/subscribe-payment", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      // Initialize Razorpay checkout
      const options = {
        key: data.razorpayKeyId,
        subscription_id: data.subscriptionId,
        name: "The Open Draft",
        description: "Monthly Newsletter + Feed Animals",
        image: "/images/logo-dark.png",
        handler: function (response: any) {
          // Payment successful
          alert("Subscription successful! Thank you for helping feed animals!");
          router.push("/dashboard");
        },
        prefill: {
          name: session?.user?.name,
          email: session?.user?.email,
        },
        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      alert(error.message || "Failed to initialize subscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Subscribe & <span className="text-red-600">Feed Lives</span>
            </h1>
            <p className="text-xl text-gray-700">
              Just ₹10/month for premium tech content + feeding stray animals
            </p>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border-2 border-blue-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <Heart size={32} className="text-red-600 fill-current" />
              </div>
              <div className="text-5xl font-bold mb-2">₹10<span className="text-2xl text-gray-600">/month</span></div>
              <p className="text-gray-600">Cancel anytime. No hidden fees.</p>
            </div>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-600 mt-1 flex-shrink-0" />
                <span>Weekly in-depth tech articles (complex topics made simple)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-600 mt-1 flex-shrink-0" />
                <span>Early access to new content</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-green-600 mt-1 flex-shrink-0" />
                <span>Save & bookmark articles</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-red-600 mt-1 flex-shrink-0" />
                <span className="font-semibold">100% of proceeds (after costs) feed hungry stray animals in India</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? "Processing..." : "Subscribe Now - ₹10/month"}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Secure payment powered by Razorpay. Cancel anytime from your account.
            </p>
          </div>

          {/* Trust Section */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600">
              Read our <a href="/mission" className="text-blue-600 underline">mission</a> to learn how your subscription feeds animals
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
```

#### **Phase 10: Add Subscription Status to User**
Check subscription status in components:
```typescript
// In any component
const subscription = await prisma.subscription.findFirst({
  where: {
    userId: user.id,
    status: 'ACTIVE',
  },
});

const isSubscribed = !!subscription;
```

#### **Phase 11: Razorpay Dashboard Setup**
1. Go to Razorpay Dashboard
2. Settings → Webhooks
3. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
4. Select events: subscription.activated, subscription.charged, subscription.cancelled, subscription.completed
5. Get webhook secret, add to .env as `RAZORPAY_WEBHOOK_SECRET`

#### **Phase 12: Test Mode Flow**
1. Use test API keys (`rzp_test_xxxxx`)
2. Test subscription flow
3. Use Razorpay test cards:
   - Success: 4111 1111 1111 1111
   - CVV: any 3 digits
   - Expiry: any future date
4. Verify webhook events in Dashboard
5. Check database for subscription record

#### **Phase 13: Go Live**
1. Complete KYC in Razorpay
2. Switch to live API keys (`rzp_live_xxxxx`)
3. Update .env with live keys
4. Update webhook URL to production domain
5. Deploy to production
6. Test with real card (small amount)
7. Monitor dashboard for incoming subscriptions

---

### ⭐ **2. IMPACT DASHBOARD** (Builds Trust)

Show real-time impact of subscriptions on animals.

#### **Implementation:**

**File:** `app/impact/page.tsx`
```typescript
import { prisma } from "@/lib/db";
import { Heart, DollarSign, Users, TrendingUp } from "lucide-react";

export default async function ImpactPage() {
  // Get stats
  const [subscriberCount, activeSubscriptions, totalPosts] = await Promise.all([
    prisma.subscriber.count({ where: { isActive: true } }),
    prisma.subscription?.count({ where: { status: 'ACTIVE' } }) || 0,
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
  ]);

  const monthlyRevenue = activeSubscriptions * 10; // ₹10 per subscription
  const estimatedAfterCosts = monthlyRevenue * 0.75; // Assuming 25% operational costs
  const mealsPerMonth = Math.floor(estimatedAfterCosts / 5); // Assuming ₹5 per meal

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="text-red-600">Impact</span>
          </h1>
          <p className="text-xl text-gray-700">
            Real-time transparency on how subscriptions feed animals
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-blue-600" size={32} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{activeSubscriptions}</div>
            <div className="text-sm text-gray-600">Active Subscribers</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-green-600" size={32} />
            </div>
            <div className="text-3xl font-bold text-gray-900">₹{monthlyRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <Heart className="text-red-600 fill-current" size={32} />
            </div>
            <div className="text-3xl font-bold text-gray-900">₹{estimatedAfterCosts.toLocaleString()}</div>
            <div className="text-sm text-gray-600">For Animals (est.)</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-purple-600" size={32} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{mealsPerMonth.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Meals/Month (est.)</div>
          </div>
        </div>

        {/* Transparency Section */}
        <div className="bg-white rounded-xl p-8 shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-6">Monthly Report</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700">
              <strong>Current Month:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>Active Subscribers: {activeSubscriptions}</li>
              <li>Total Revenue: ₹{monthlyRevenue}</li>
              <li>Operational Costs (est.): ₹{(monthlyRevenue * 0.25).toFixed(2)}</li>
              <li>Amount for Animals: ₹{estimatedAfterCosts}</li>
              <li>Estimated Meals Provided: {mealsPerMonth}</li>
            </ul>
            <p className="mt-4 text-sm text-gray-600">
              Note: Operational costs include hosting, email service, payment gateway fees, and platform maintenance.
              We commit to keeping these as low as possible.
            </p>
          </div>
        </div>

        {/* Photos Section */}
        <div className="bg-white rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-bold mb-6">Feeding Sessions</h2>
          <p className="text-gray-600 mb-6">
            Photos and videos of animals being fed will be added here monthly.
            Check back soon for updates!
          </p>
          {/* Add image grid here once you have photos */}
        </div>
      </div>
    </main>
  );
}
```

**Add link in Navbar:**
```typescript
<Link href="/impact" className="text-gray-600 hover:text-gray-900 transition">
  Impact
</Link>
```

---

### ⭐ **3. ONE-TIME DONATION PAGE**

For users who want to help but can't commit to monthly subscriptions.

**File:** `app/donate/page.tsx`
```typescript
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import Script from "next/script";

export default function DonatePage() {
  const { data: session, status } = useSession();
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const presetAmounts = [50, 100, 200, 500, 1000];

  async function handleDonate() {
    setLoading(true);

    try {
      const donationAmount = customAmount ? parseInt(customAmount) : amount;

      if (donationAmount < 10) {
        alert("Minimum donation is ₹10");
        setLoading(false);
        return;
      }

      // Create Razorpay order
      const res = await fetch("/api/create-donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: donationAmount }),
      });

      const data = await res.json();

      const options = {
        key: data.razorpayKeyId,
        amount: donationAmount * 100,
        currency: "INR",
        name: "The Open Draft",
        description: "One-time donation to feed stray animals",
        image: "/images/logo-dark.png",
        order_id: data.orderId,
        handler: function (response: any) {
          alert("Thank you for your donation! You just helped feed hungry animals!");
          window.location.href = "/";
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#ef4444",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      alert(error.message || "Failed to process donation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <main className="min-h-screen bg-gradient-to-b from-red-50 to-white py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <Heart size={40} className="text-red-600 fill-current" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Make a <span className="text-red-600">Difference</span>
            </h1>
            <p className="text-xl text-gray-700">
              One-time donation to feed stray animals across India
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* Preset Amounts */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Select Amount</label>
              <div className="grid grid-cols-3 gap-3">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setAmount(preset);
                      setCustomAmount("");
                    }}
                    className={`py-3 rounded-lg font-semibold transition ${
                      amount === preset && !customAmount
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Or Enter Custom Amount</label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="₹"
                className="w-full border rounded-lg p-3 text-lg"
                min="10"
              />
            </div>

            {/* Impact Preview */}
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Your ₹{customAmount || amount} can provide approximately{" "}
                {Math.floor((parseInt(customAmount) || amount) / 5)} meals</strong> for hungry animals
                (assuming ₹5 per meal).
              </p>
            </div>

            {/* Donate Button */}
            <button
              onClick={handleDonate}
              disabled={loading}
              className="w-full bg-red-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400"
            >
              {loading ? "Processing..." : `Donate ₹${customAmount || amount}`}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Secure payment powered by Razorpay. 100% of donation goes to feeding animals.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
```

**API Endpoint:** `app/api/create-donation/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    if (amount < 10) {
      return NextResponse.json({ error: 'Minimum ₹10' }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `donation_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
```

---

### 4. **MOBILE OPTIMIZATION CHECKLIST**

Most Indian users browse on mobile. Ensure perfect mobile experience:

#### **Testing Checklist:**
- [ ] Navbar hamburger menu works on mobile
- [ ] All forms fit on mobile screens
- [ ] Payment flow works on mobile (Razorpay checkout)
- [ ] Images load properly on mobile
- [ ] Text is readable without zooming
- [ ] Buttons are tap-friendly (min 44px height)
- [ ] No horizontal scrolling
- [ ] Fast loading on 3G/4G
- [ ] Social share buttons work on mobile

#### **Performance:**
- [ ] Images optimized (use Next.js Image component)
- [ ] Lazy load images
- [ ] Minify CSS/JS (Next.js does this)
- [ ] Enable caching
- [ ] Use CDN for images
- [ ] Lighthouse score > 90

#### **Tools:**
- Chrome DevTools Mobile Simulator
- Real device testing
- Google PageSpeed Insights
- Lighthouse

---

## 🚀 **PRODUCTION DEPLOYMENT CHECKLIST**

### **Pre-Launch:**
- [ ] All environment variables set in production
- [ ] Database migrations run
- [ ] Razorpay KYC completed
- [ ] Razorpay live keys configured
- [ ] Webhook URL set in Razorpay dashboard
- [ ] Email (Resend) configured
- [ ] Domain connected
- [ ] SSL certificate active
- [ ] Google Sheets connected (optional)
- [ ] First admin user created
- [ ] At least 3-5 published posts
- [ ] Mission page reviewed
- [ ] Impact dashboard live

### **Testing:**
- [ ] Full subscription flow (test with real card small amount)
- [ ] Email delivery working
- [ ] Unsubscribe working
- [ ] Password reset working
- [ ] Email verification working
- [ ] Save posts working
- [ ] Social sharing working
- [ ] Mobile experience perfect
- [ ] Admin panel all features working
- [ ] Scheduled posts auto-publish

### **Launch Day:**
- [ ] Announce on social media
- [ ] Share mission story
- [ ] Ask friends/family to subscribe
- [ ] Post in relevant communities
- [ ] SEO optimized (already done ✅)
- [ ] Monitor Razorpay dashboard
- [ ] Monitor error logs
- [ ] Respond to first subscribers

### **Post-Launch:**
- [ ] Weekly content publication
- [ ] Monthly impact reports
- [ ] Photos of feeding sessions
- [ ] Subscriber growth tracking
- [ ] Revenue tracking
- [ ] Thank you emails to subscribers
- [ ] Community building

---

## 📊 **REVENUE MODEL**

**Target:** 20,000 subscribers

### **Growth Milestones:**
| Subscribers | Monthly Revenue | For Animals (75%) | Estimated Meals/Month |
|-------------|-----------------|-------------------|-----------------------|
| 1,000       | ₹10,000        | ₹7,500           | 1,500                |
| 5,000       | ₹50,000        | ₹37,500          | 7,500                |
| 10,000      | ₹1,00,000      | ₹75,000          | 15,000               |
| 20,000      | ₹2,00,000      | ₹1,50,000        | 30,000               |
| 50,000      | ₹5,00,000      | ₹3,75,000        | 75,000               |

**Operational Costs (estimate 25%):**
- Hosting: ₹2,000-5,000/month (Vercel Pro)
- Email service (Resend): ₹3,000-10,000/month (depends on volume)
- Payment gateway fees: 2% of revenue
- Domain, SSL: ₹1,000/year
- Buffer for unexpected costs

**Growth Strategy:**
1. SEO (organic traffic) ✅ Already implemented
2. Social sharing (viral growth) ✅ Already implemented
3. Word of mouth (mission-driven)
4. Quality content (retention)
5. Transparency (trust building)

---

## 🔑 **ENVIRONMENT VARIABLES COMPLETE LIST**

Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://yourdomain.com"

# App
APP_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="newsletter@yourdomain.com"

# Google Sheets (Optional)
GOOGLE_SERVICE_ACCOUNT_EMAIL="xxx@xxx.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID="your-sheet-id"

# Google Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Cron Security
CRON_SECRET="your-cron-secret-key"

# Razorpay (Payment) - CRITICAL
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxxx"
RAZORPAY_PLAN_ID="plan_xxxxxxxxxxxxxxx"
RAZORPAY_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxx"
```

---

## 📝 **SCRIPTS FOR ADMIN**

### **Create First Admin:**
```bash
npx tsx scripts/make-admin.ts your@email.com
```

### **List All Users:**
```bash
npx tsx scripts/list-users.ts
```

### **Initialize Google Sheets:**
```bash
npx tsx scripts/init-google-sheet.ts
```

---

## 🎨 **BRAND GUIDELINES**

**Colors:**
- Primary: Blue (#2563eb) - Technology, trust
- Secondary: Red (#ef4444) - Heart, compassion, animals
- Success: Green (#10b981) - Growth, positive impact

**Tone:**
- Professional but warm
- Educational but accessible
- Mission-driven
- Transparent
- Compassionate

**Key Messages:**
- "Learn Tech. Feed Lives."
- "Technology explained simply. Animals fed compassionately."
- "Every subscription = meals for hungry animals"
- "100% transparency, 100% for animals"

---

## 🐛 **TROUBLESHOOTING**

### **Newsletter emails not sending:**
1. Check `RESEND_API_KEY` in .env
2. Check `EMAIL_FROM` is verified domain
3. Check Resend dashboard for errors
4. Check post has `status=PUBLISHED`
5. Check `emailSent` flag not already true

### **Payments not working:**
1. Check Razorpay keys (test vs live)
2. Check webhook is configured
3. Check webhook secret matches
4. Check KYC is complete for live mode
5. Test with Razorpay test cards first

### **Scheduled posts not publishing:**
1. Check Vercel cron is configured
2. Check cron endpoint is working (manual trigger)
3. Check `scheduledFor` is in past
4. Check `status=SCHEDULED`
5. Check logs in Vercel dashboard

### **Build errors:**
1. Run `npm install`
2. Run `npx prisma generate`
3. Run `npx prisma migrate deploy`
4. Check environment variables
5. Check Node version (18+)

---

## 📞 **SUPPORT & COMMUNITY**

**Contact:**
- Email: tod@theopendraft.com
- Mission: /mission page

**Tech Stack:**
- Next.js 15
- Prisma (PostgreSQL)
- NextAuth.js
- Razorpay
- Resend (emails)
- TipTap (editor)
- Tailwind CSS

---

## ✅ **FINAL NOTES**

This is not just a newsletter. This is a **mission to feed lives**.

Every line of code serves two purposes:
1. Educate people about technology
2. Feed hungry animals

Stay focused on both. Quality content = retention = revenue = more animals fed.

**Remember:**
- 20,000 subscribers = ₹1,50,000/month for animals
- That's potentially **30,000 meals per month**
- That's **360,000 meals per year**

Your code is literally saving lives. Build with that purpose.

---

**Last Updated:** December 2024
**Version:** 1.0
**Status:** Ready for payment system integration
