# 🐾 The Open Draft

**Technology Explained Simply. Animals Fed Compassionately.**

A Next.js-powered newsletter platform with a noble mission: Every subscription helps feed stray animals across India.

---

## 🎯 Mission

In India, millions of stray animals (dogs, cats, cows, bulls, pigeons) struggle with hunger every day. The Open Draft bridges technology education with animal welfare.

**The Model:**
- High-quality tech content (complex topics made simple)
- ₹10/month subscriptions
- **100% of revenue (after minimal operational costs) → feeding stray animals**

**Goal:** 20,000 subscribers = ₹1,50,000/month = ~30,000 animal meals/month

---

## 🚀 Features

### ✅ Completed
- **Full CMS** - Create, edit, publish articles with rich text editor
- **Authentication** - Email verification, password reset, role-based access
- **Newsletter System** - Email delivery via Resend, unsubscribe functionality
- **Scheduled Posts** - Auto-publish via Vercel cron (every 15 minutes)
- **Save/Bookmark** - Users can save posts to read later
- **Mission Page** - Complete story of animal welfare purpose
- **SEO Optimized** - Meta tags, Open Graph, Twitter cards, sitemap.xml
- **Social Sharing** - Twitter, Facebook, LinkedIn, copy link
- **Admin Panel** - Dashboard, users, posts, categories, settings, subscribers
- **Google Sheets Integration** - Dual storage for subscribers

### 🚧 Pending (Priority Order)
1. **Razorpay Payment System** (CRITICAL - revenue engine)
2. **Impact Dashboard** (builds trust with transparency)
3. **One-time Donations** (additional revenue)
4. **Mobile Optimization** (verify perfect experience)

See [FEATURES.md](./FEATURES.md) for complete implementation guides.

---

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js (JWT sessions)
- **Email:** Resend API
- **Editor:** TipTap (WYSIWYG)
- **Payments:** Razorpay (pending integration)
- **UI:** Tailwind CSS + Radix UI
- **Analytics:** Google Analytics + Vercel Analytics

---

## 📦 Installation

```bash
# Clone repository
git clone <repository-url>
cd open-draft

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Set up database
npx prisma generate
npx prisma migrate deploy

# Run development server
npm run dev
```

Visit `http://localhost:3000`

---

## 🔑 Environment Variables

Required variables (see `.env.example`):

```env
DATABASE_URL=                    # PostgreSQL connection
NEXTAUTH_SECRET=                 # Generate with: openssl rand -base64 32
NEXTAUTH_URL=                    # http://localhost:3000
APP_URL=                         # http://localhost:3000
RESEND_API_KEY=                  # For email sending
EMAIL_FROM=                      # newsletter@yourdomain.com
```

Optional but recommended:
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=    # For Google Sheets
GOOGLE_PRIVATE_KEY=              # For Google Sheets
GOOGLE_SHEET_ID=                 # For subscriber backup
NEXT_PUBLIC_GA_MEASUREMENT_ID=   # For analytics
CRON_SECRET=                     # For webhook security
```

Payment (when ready):
```env
RAZORPAY_LIVE_ID=                # Server-side live key ID
RAZORPAY_LIVE_KEY=               # Server-side live secret key
NEXT_PUBLIC_RAZORPAY_KEY_ID=     # Public checkout key ID
RAZORPAY_PLAN_ID=                # Monthly plan ID
RAZORPAY_WEBHOOK_SECRET=         # Separate webhook signing secret
```

---

## 👤 Create Admin User

After setup, create your first admin:

```bash
npx tsx scripts/make-admin.ts your@email.com
```

---

## 📝 Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration
npx prisma generate      # Generate Prisma Client

# Admin
npx tsx scripts/make-admin.ts <email>    # Make user admin
npx tsx scripts/list-users.ts            # List all users
npx tsx scripts/init-google-sheet.ts     # Init Google Sheets
```

---

## 🏗 Project Structure

```
├── app/
│   ├── admin/              # Admin panel pages
│   ├── api/                # API routes
│   ├── mission/            # Mission page
│   ├── newsletter/         # Public newsletter pages
│   ├── saved/              # Saved posts page
│   ├── subscribe/          # Subscription page (to build)
│   └── donate/             # Donation page (to build)
├── components/
│   ├── admin/              # Admin components
│   ├── editor/             # Rich text editor
│   ├── Navbar.tsx          # Main navigation
│   ├── SavePostButton.tsx  # Save/bookmark button
│   ├── SEOHead.tsx         # SEO utility
│   └── SocialShare.tsx     # Social sharing buttons
├── lib/
│   ├── db.ts               # Prisma client
│   ├── mail.ts             # Email sending
│   ├── newsletter.ts       # Newsletter emails
│   ├── tokens.ts           # Token generation
│   └── google-sheets.ts    # Google Sheets API
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
└── scripts/                # Utility scripts
```

---

## 📚 Documentation

- **[FEATURES.md](./FEATURES.md)** - Complete feature list + implementation guides
- **[GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)** - Google Sheets integration guide

---

## 🎨 Brand Guidelines

**Colors:**
- Primary (Blue): `#2563eb` - Technology, trust
- Secondary (Red): `#ef4444` - Compassion, animals
- Success (Green): `#10b981` - Impact, growth

**Key Messages:**
- "Learn Tech. Feed Lives."
- "Technology explained simply. Animals fed compassionately."
- "Every subscription = meals for hungry animals"

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy
5. Set up cron jobs (Vercel auto-detects `vercel.json`)

Subscription webhooks require Appwrite document transaction support compatible
with `node-appwrite` 21.1.0 or newer. The webhook fails safely instead of writing
subscription state when transactions are unavailable.

### Database

Use Neon, Supabase, or any PostgreSQL provider.

### Post-Deployment

1. Run migrations: `npx prisma migrate deploy`
2. Create admin user
3. Publish first posts
4. Set up Razorpay webhooks
5. Configure Resend domain

---

## 📊 Revenue Model

| Subscribers | Monthly Revenue | For Animals (75%) | Meals/Month |
|-------------|-----------------|-------------------|-------------|
| 1,000       | ₹10,000        | ₹7,500           | 1,500      |
| 5,000       | ₹50,000        | ₹37,500          | 7,500      |
| 10,000      | ₹1,00,000      | ₹75,000          | 15,000     |
| 20,000      | ₹2,00,000      | ₹1,50,000        | 30,000     |

**Operational Costs:** ~25% (hosting, email, payment fees, maintenance)

---

## 🤝 Contributing

This project has a mission. Contributions should:
1. Improve user experience
2. Increase conversion (more subscriptions = more animals fed)
3. Build trust through transparency
4. Maintain code quality

---

## 🐛 Issues & Support

**Email:** tod@theopendraft.com

**Common Issues:** See troubleshooting section in [FEATURES.md](./FEATURES.md)

---

## 📜 License

MIT License - Use this code to help animals anywhere in the world.

---

## ❤️ Impact

This is not just code. Every subscriber you convert = meals for hungry animals.

**Your contributions literally save lives.**

Build with purpose. Build with compassion.

---

**Built with ❤️ for stray animals across India**
