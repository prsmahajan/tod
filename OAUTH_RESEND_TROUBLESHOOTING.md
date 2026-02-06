# OAuth & Email Troubleshooting Guide

## Google OAuth Error: redirect_uri_mismatch

### Problem
Error 400: redirect_uri_mismatch - "This app's request is invalid"

### Solution

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth Settings**
   - Go to: **APIs & Services** → **Credentials**
   - Click on your OAuth 2.0 Client ID

3. **Add Authorized Redirect URIs**
   Add these exact URLs:
   ```
   http://localhost:3000/auth/callback
   https://theopendraft.com/auth/callback
   https://www.theopendraft.com/auth/callback
   ```

4. **Save Changes**
   - Click "Save" button
   - Wait 1-2 minutes for changes to propagate

5. **Test OAuth**
   - Clear browser cache/cookies
   - Try signing in with Google again

### Common Issues

- **Using wrong domain**: Make sure the domain matches exactly (with/without www)
- **HTTP vs HTTPS**: Production should use HTTPS, development uses HTTP
- **Trailing slash**: Don't add trailing slashes to redirect URIs

---

## Resend Email Issues

### Problem 1: Only 2 emails sending, then stopping

**Possible Causes:**
1. **Rate Limiting** - Resend free tier: 100 emails/day, 3 emails/second
2. **Invalid API Key** - Check if `RESEND_API_KEY` is correct
3. **Email Domain Not Verified** - Must verify your sending domain
4. **Missing FROM address** - Check `EMAIL_FROM` environment variable

### Solution

#### Check Your Resend Configuration

1. **Verify API Key**
   ```bash
   # In .env.local
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```

2. **Verify FROM Email**
   ```bash
   # Use your verified domain
   EMAIL_FROM=noreply@theopendraft.com
   # OR
   EMAIL_FROM="The Open Draft <noreply@theopendraft.com>"
   ```

3. **Check Resend Dashboard**
   - Go to: https://resend.com/emails
   - Check for failed emails
   - Look for error messages

#### Rate Limiting

The bulk send now includes:
- **500ms delay** between emails (complies with 3/sec limit)
- **2 second delay** if rate limit detected
- **Better error logging** to see exactly what fails

#### Resend Free Tier Limits

- **100 emails per day**
- **3 emails per second**
- **Single domain verification**

If you have more than 100 users to verify, consider:
1. Upgrading to Resend Pro ($20/mo = 50k emails)
2. Sending in batches over multiple days
3. Using the script instead: `npx tsx scripts/send-verification-emails.ts`

---

## Environment Variables Checklist

Make sure these are set in your `.env.local`:

```bash
# Resend
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@theopendraft.com

# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-server-api-key

# App URL
NEXT_PUBLIC_APP_URL=https://theopendraft.com
```

---

## Testing Bulk Email Send

### Option 1: Admin Dashboard
1. Go to `/admin/users`
2. Click "Send Verification (X)" button
3. Check browser console for logs
4. Check Resend dashboard for delivery status

### Option 2: Command Line Script
```bash
npm run send-verifications
```

Or manually:
```bash
npx tsx -r dotenv/config scripts/send-verification-emails.ts dotenv_config_path=.env.local
```

This will show detailed logs:
```
🔍 Finding unverified users...
Found 7 unverified users

📧 Sending verification emails...
✅ user1@example.com (User 1)
✅ user2@example.com (User 2)
❌ user3@example.com - Rate limit exceeded

📊 Summary:
   Sent: 2
   Failed: 1
   Total: 3
```

---

## Debugging Tips

### For OAuth Issues:
1. Check browser console for errors
2. Verify redirect URI matches exactly (case-sensitive)
3. Try in incognito mode
4. Check Appwrite console for OAuth provider settings

### For Email Issues:
1. Check server logs: `npm run dev` output
2. Check Resend dashboard: https://resend.com/emails
3. Verify domain in Resend: https://resend.com/domains
4. Test with a single email first before bulk send
5. Check if you hit daily limit (100 emails on free tier)

---

## Quick Fixes

### "Failed to send verification email"
- Check `RESEND_API_KEY` is correct
- Verify `EMAIL_FROM` uses a verified domain
- Check Resend dashboard for errors

### "Rate limit exceeded"
- Wait a few minutes
- Use the script with delays instead of bulk send
- Upgrade to Resend Pro for higher limits

### "Domain not verified"
1. Go to https://resend.com/domains
2. Add your domain
3. Add DNS records (DKIM, SPF, etc.)
4. Wait for verification

---

## Contact Support

If issues persist:
- **Resend Support**: https://resend.com/support
- **Google OAuth**: https://support.google.com/cloud/answer/6158849
- **Appwrite**: https://appwrite.io/support
