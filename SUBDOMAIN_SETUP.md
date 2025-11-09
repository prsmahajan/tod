# 🔒 Admin Subdomain Setup Guide

Your admin panel is now configured to only work on: **quirky.theopendraft.com**

This adds an extra security layer by separating admin access from the public site.

---

## ✅ What's Already Done (In Code)

- ✅ Middleware redirects `/admin` on main domain → quirky subdomain
- ✅ Admin routes only work on `quirky.theopendraft.com`
- ✅ Authentication and role checks on subdomain
- ✅ Navbar admin links point to quirky subdomain

---

## 🚀 Setup Steps (Vercel Dashboard)

### **Step 1: Add Subdomain to Vercel Project**

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project: **The Open Draft**
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `quirky.theopendraft.com`
6. Click **Add**

Vercel will automatically configure the DNS since you own the domain on Vercel!

---

### **Step 2: Verify Domain is Working**

Wait 1-2 minutes for DNS propagation, then test:

```bash
# Test if subdomain resolves
ping quirky.theopendraft.com
```

Or visit in browser:
```
https://quirky.theopendraft.com
```

You should see your site homepage (same as main domain).

---

### **Step 3: Test Admin Access**

**On Main Domain (should redirect):**
```
https://theopendraft.com/admin
→ Redirects to https://quirky.theopendraft.com/admin
```

**On Quirky Subdomain (should work):**
```
https://quirky.theopendraft.com/admin
→ Shows admin panel (if logged in)
```

---

## 🧪 Testing Locally (Development)

For local development with subdomain routing:

### **Option A: Edit `/etc/hosts` (Mac/Linux)**

```bash
sudo nano /etc/hosts
```

Add these lines:
```
127.0.0.1 theopendraft.local
127.0.0.1 quirky.theopendraft.local
```

Then access:
- Main site: `http://theopendraft.local:3000`
- Admin: `http://quirky.theopendraft.local:3000/admin`

### **Option B: Just use localhost (simpler)**

The middleware handles `localhost` detection, so you can still access:
- `http://localhost:3000` - Main site
- `http://localhost:3000/admin` - Redirects to quirky (may need manual URL editing in dev)

---

## 🔐 Security Benefits

**Why use a subdomain for admin?**

1. **Obscurity** - Attackers trying `/admin` on main domain get redirected
2. **Cookie isolation** - Subdomain can have separate session cookies
3. **Firewall rules** - Can apply different security policies to subdomain
4. **Analytics separation** - Admin traffic doesn't mix with user traffic
5. **CDN bypass** - Admin panel bypasses CDN caching

---

## 📝 How It Works

### **Middleware Logic:**

```typescript
if (pathname === "/admin") {
  if (hostname !== "quirky.theopendraft.com") {
    // Redirect to quirky subdomain
    redirect("https://quirky.theopendraft.com/admin")
  }

  // Check authentication + admin role
  // Allow access
}
```

### **User Flow:**

1. Admin clicks "Admin" in navbar
2. Link goes to: `quirky.theopendraft.com/admin`
3. Middleware checks:
   - ✅ On quirky subdomain? → Continue
   - ✅ User logged in? → Continue
   - ✅ User is ADMIN/EDITOR/AUTHOR? → Show admin panel
   - ❌ Any check fails? → Redirect to login or home

---

## 🛠 Troubleshooting

### **Problem: "Can't access admin panel"**

**Solution:**
```bash
# Clear cookies for both domains
# Logout and login again
```

### **Problem: "Subdomain not found (404)"**

**Solution:**
- Check Vercel dashboard → Domains
- Make sure `quirky.theopendraft.com` is added and shows ✅
- Wait 2-5 minutes for DNS propagation
- Try incognito/private browsing

### **Problem: "Redirect loop"**

**Solution:**
- Clear browser cache and cookies
- Check environment variable: `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` is set to main domain (not subdomain)

---

## 🔄 Reverting to `/admin` on Main Domain

If you want to go back to having admin on the main domain:

1. Revert `middleware.ts` to:
```typescript
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
```

2. Revert navbar links to use `<Link href="/admin">`

---

## 📞 Support

If subdomain setup doesn't work:
- Check Vercel deployment logs for errors
- Verify domain ownership in Vercel
- Contact Vercel support if DNS issues persist

---

**Built with ❤️ for secure admin access**
