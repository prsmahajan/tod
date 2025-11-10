# Production Environment Variables Setup

## Required Environment Variables for Production

Add these to your production hosting platform (Vercel, Netlify, etc.):

### Database
```bash
DATABASE_URL="postgresql://neondb_owner:npg_QbrWkS70cFUM@ep-small-frost-adb4l6or-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### Authentication (NextAuth)
```bash
NEXTAUTH_SECRET="086cf36d47bb00188b8fb94c3cb7967d45b304c28c2b4182156c64464a84f777"
NEXTAUTH_URL="https://theopendraft.com"  # Replace with your actual production domain
```

### Application URLs
```bash
APP_URL="https://theopendraft.com"  # Replace with your actual production domain
NEXT_PUBLIC_APP_URL="https://theopendraft.com"  # Replace with your actual production domain
```

### Email (Resend)
```bash
RESEND_API_KEY="re_XPASdNr5_3SutyJEzbWvdKxRamewyoGdZ"
EMAIL_FROM="account@theopendraft.com"
```

**IMPORTANT**: Verify your domain in Resend:
1. Go to https://resend.com/domains
2. Add and verify `theopendraft.com`
3. Add the required DNS records (SPF, DKIM) to your domain registrar
4. Wait for verification (can take a few minutes to a few hours)

### Google Analytics (Optional)
```bash
NEXT_PUBLIC_GA_ID="G-ZW1Z8YMY61"
```

### Google Sheets Integration (Optional)
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL="newsletter@the-open-draft-477710.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCc39tcOybwskMz\nMZhO3D9GPHegSgkqeuGd5vodFmtCjhHTkKGf9hORsGHSSczY8Pxwo+rrrC7W98Ax\nOrkTTK2KcH8QM4eLooMHNra2PVedxIQkP8WuSDFCXbcd8PJ5YJ4R1BkLPOxU8tKR\nIgKpyZ4WFmAK+RbGf3d4OBmg0T2ZNTi+eAKaGqZkw8G9vFMchtLAPE09oHn+qoKS\nWCWhYCXp6vt2hAu7k7mA+GA4RfMBUSc5mukOaqC0Uf4bsf4B9KqCYnEdYqDRtwbe\nsodvApqAlci+MkOdprSUSNldtmXfQWUOnBatHr4Xp0cF83EmRDdtkaFTvCqcl67C\nGKs6HqZfAgMBAAECggEAJL7OzBjS8zheQ0SPr5EphRMu1i3hXcDwziLHXT7eGvXa\nORs8sJJcXRjaoP5GbF5uUxgiM9feFN5td1qQ9XNVhwL40FuxmUSUuoDXZXKS7lKU\nvUTu0fb5CtmWxf2lXkcCX5y1zQsVNIS4S+SSiSC/1d6h2pAkBJTg8Bj7785zRkpy\nBPsahLHWhLRRS4BIVmfUiRpnjuJhuHDs6HmE2uzh7RA1GWpsPozXabwiA/56DXZR\nY8p+LIIdfGDhJVBUxh3YP/apIiV3ewjt13oXJBP95af99LkTE3zqZfwjHTPn4v1R\nIL5Qyzp0Z46b1KJJQ171Q9XbB5H0fiavmqwytux0mQKBgQDXHpXOkb4LH5b0DuM0\n1T0jN3PaBimIJgB2iq6tla1muS6Fx4seV/3cvbrtZoRhLDKMIh/I4VEA6hyv8kXF\nHCKOswdyCCYEQWTecCZgDbmfhLtwdYV9aiOBOdQshdG0JsrXnBscwrT4mFoRhyYt\n3m2OLgFF1+0tK5AlQGzzLcb14wKBgQC6r7DZbtUfo4QwIIWSb2AMvXK9I3QzHvHV\nTtAvpVe2b6d2G0970qpszdqT/Jb16Kh9NKqruX6ESD4eUFqxoK/EB0XmK+xjMD27\nOk0j0zujwVZOqpTuJgm/fLNCm9dVvC21ODZXGDPYky4AOgr76UNDoCKYZUMj7dD1\nkFluUdSWVQKBgQDHibE/mOSFANpOq/iIqzs4jVlC5PBlP4qyalU44lujqyXCJaOf\nk9MAjGT1jGBCmnKQlZ6SAJ3YkU/mzH13Jm/PmbTQS0qoK9halACknFaP5tjOqdQW\nzvr8BR4P5ljsGAeTE1P6y4h+ByOUmp4JcgaBGZ9In896VKwyQZ5NuyqQLQKBgGzo\nAWtW1M3YPk01K7b5cjb8besYu7j23G1rxNeGxVyQVkj4Na4uf21pyZF7UTWzvFcO\nWmJDnCLfYh2dEst8ygy5kXVtOkHC6sBGiqnTmH83Unoh2S/00Mr8nDbHYx+I38FQ\nQaMdY2F8uuE2+yFqOutAh+4PZNOY8MXQp9tLsZDhAoGBANYs5zDmSolOJoFm6FNX\nUYz1A+xBYCbJn2Y5wpeqtKq/CnwzNa3o6HrefJ0Y8PKOBIoFyoZNnUThxlzKy/4R\n4J+tdn2a+79JxulvFle+DX+znfACWx4u+aPuqiQ1qv3HUaayR19DTiFMV6C4aXXz\nqehWLucn+jjfSb4ll1dPaxrK\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID="1qfjrANRN66RVeoEhgJQfy2wcIeMSOtbo9Rodu4u3Wzg"
```

## Steps to Deploy

### If using Vercel:
1. Go to your project settings in Vercel dashboard
2. Navigate to "Environment Variables"
3. Add each variable above
4. Make sure to update domain names from `theopendraft.com` to your actual domain
5. Redeploy your application

### If using Netlify:
1. Go to Site settings > Environment variables
2. Add each variable above
3. Make sure to update domain names to your actual domain
4. Trigger a new deploy

## Common Issues

### Email not working in production:
- Verify your domain in Resend dashboard
- Check that DNS records are properly configured
- Ensure `EMAIL_FROM` uses your verified domain
- Check that `APP_URL` is set correctly (used for email links)

### Users becoming admin:
- Fixed! Only the first user created will be admin
- All subsequent signups will be SUBSCRIBER role
- Existing users have been corrected

### Database connection issues:
- Ensure `DATABASE_URL` includes `sslmode=require&channel_binding=require`
- Neon database should be accessible from your hosting platform
