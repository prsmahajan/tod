# Deployment Checklist for Vercel

## Required Environment Variables

The following environment variables MUST be set in Vercel for the admin login to work:

### 1. NEXTAUTH_SECRET
```
A random string used to encrypt JWT tokens.
Generate one: openssl rand -base64 32
```

### 2. NEXTAUTH_URL
```
The full URL of your deployed site
Production: https://theopendraft.com
```

### 3. DATABASE_URL
```
Your PostgreSQL database connection string
Format: postgresql://user:password@host:port/database?sslmode=require
```

### 4. RESEND_API_KEY
```
Your Resend API key for sending emails
Get from: https://resend.com/api-keys
```

### 5. NEXT_PUBLIC_GOOGLE_ANALYTICS_ID (Optional)
```
Your Google Analytics tracking ID
Format: G-XXXXXXXXXX
```

## How to Set Environment Variables in Vercel

1. Go to: https://vercel.com/[your-org]/[your-project]/settings/environment-variables
2. Add each variable with:
   - **Key**: Variable name (e.g., NEXTAUTH_SECRET)
   - **Value**: The actual value
   - **Environment**: Production, Preview, Development (select all)
3. Click "Save"
4. **IMPORTANT**: After adding variables, you MUST redeploy for them to take effect

## Verify Environment Variables

After deployment, visit: `https://theopendraft.com/api/debug/env`

This will show which environment variables are configured (without revealing their values).

## Admin Access Flow

### First Time Setup:
1. **Sign up at**: https://theopendraft.com/signup
   - Enter your name, email, and password
   - The FIRST user becomes ADMIN automatically
   - Email is auto-verified for first user
   - You'll be auto-logged in and redirected to /admin

### Subsequent Logins:
1. **Login at**: https://theopendraft.com/login
2. Enter your credentials
3. You'll be redirected to /admin

### User Limit:
- Maximum 3 users can sign up
- First user = ADMIN (auto-verified)
- Users 2-3 = USER role (need email verification)

## Debugging Auth Issues

### Check Auth Status:
Visit: `https://theopendraft.com/api/debug/auth`

This shows:
- Whether you're authenticated
- Your current role
- Session information
- Cookie presence

### Common Issues:

1. **"Redirects to login when accessing /admin"**
   - Check if NEXTAUTH_SECRET is set in Vercel
   - Check if NEXTAUTH_URL matches your domain exactly
   - Check Vercel logs for middleware errors

2. **"Cannot sign up"**
   - Check DATABASE_URL is correct
   - Check database is accessible from Vercel
   - Check if 3-user limit reached

3. **"Signed up but still can't access /admin"**
   - Check if you're the first user (only first user = ADMIN)
   - Visit /api/debug/auth to check your role
   - Clear cookies and login again

4. **"Session not persisting"**
   - Check cookie settings in browser (allow cookies for theopendraft.com)
   - Check NEXTAUTH_SECRET hasn't changed
   - Check NEXTAUTH_URL is set correctly

## Vercel Logs

Check logs at: https://vercel.com/[your-org]/[your-project]/logs

Look for:
- `[MIDDLEWARE]` logs showing auth attempts
- `[NEXTAUTH]` logs showing session creation
- Database connection errors
- JWT encryption errors

## Support

If issues persist:
1. Check Vercel logs
2. Visit /api/debug/auth and /api/debug/env
3. Verify all environment variables are set
4. Try clearing browser cookies and signing up again
