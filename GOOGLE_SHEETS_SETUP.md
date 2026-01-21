Ah! You're asking about the final migration step I recommended. Looking at the work we completed, the last thing I told you to do was:  
                                                                                                                                          
  Run the One-Time Database Sync                                                                                                          
                                                                                                                                          
  After all the optimizations, you need to sync all existing Appwrite subscriptions into PostgreSQL:                                      
                                                                                                                                          
  # Run this command once to migrate all data                                                                                             
  curl -X POST http://localhost:3000/api/admin/sync-subscriptions                                                                         
                                                                                                                                          
  # Or if deployed:                                                                                                                       
  curl -X POST https://theopendraft.com/api/admin/sync-subscriptions                                                                      
                                                                                                                                          
  This command will:                                                                                                                      
  1. Fetch all subscription data from Appwrite                                                                                            
  2. Sync it into your PostgreSQL database                                                                                                
  3. Ensure both databases are in sync going forward                                                                                      
                                                                                                                                          
  ---                                                                                                                                     
  Why This Was Important                                                                                                                  
                                                                                                                                          
  Before the optimization, you had:                                                                                                       
  - Subscription data in Appwrite (from Razorpay webhooks)                                                                                
  - User data in PostgreSQL (from admin dashboard)                                                                                        
  - They were NOT synced properly                                                                                                         
                                                                                                                                          
  After the optimization, I created:                                                                                                      
  - /lib/subscription-sync.ts - Sync functions                                                                                            
  - /app/api/admin/sync-subscriptions/route.ts - Sync endpoint                                                                            
  - Automatic bi-directional sync on every webhook                                                                                        
                                                                                                                                          
  So the final step was to run that sync command once to migrate all existing data.                                                       
                                                                                                                                          
  ---                                                                                                                                     
  Verification Steps                                                                                                                      
                                                                                                                                          
  After running the sync, check:                                                                                                          
                                                                                                                                          
  # 1. Run the sync                                                                                                                       
  curl -X POST http://localhost:3000/api/admin/sync-subscriptions                                                                         
                                                                                                                                          
  # 2. Check the response - should show how many records synced                                                                           
  # Example response:                                                                                                                     
  # {                                                                                                                                     
  #   "success": true,                                                                                                                    
  #   "synced": 45,                                                                                                                       
  #   "message": "Successfully synced 45 subscriptions"                                                                                   
  # }                                                                                                                                     
                                                                                                                                          
  # 3. Verify in admin dashboard                                                                                                          
  # Go to: http://localhost:3000/cms/admin/subscriptions                                                                                  
  # All subscriptions should now be visible                                                                                               
                                                                                                                                          
  # 4. Test that new subscriptions auto-sync                                                                                              
  # Make a test payment → Should appear in PostgreSQL automatically                                                                       
                                                                                                                                          
  Is this what you were looking for? The one-time database migration sync?    

# Google Sheets Integration Setup

This guide will help you connect your newsletter subscription form to Google Sheets.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Name it something like "Newsletter Subscribers"

## Step 2: Enable Google Sheets API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google Sheets API"
3. Click on it and press **ENABLE**

## Step 3: Create a Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **Service Account**
3. Fill in:
   - Service account name: `newsletter-subscriber`
   - Service account ID: (auto-generated)
   - Click **CREATE AND CONTINUE**
4. Skip the optional steps (click **DONE**)

## Step 4: Create Service Account Key

1. Click on the service account you just created
2. Go to the **KEYS** tab
3. Click **ADD KEY** > **Create new key**
4. Choose **JSON** format
5. Click **CREATE**
6. A JSON file will be downloaded - **keep this safe!**

## Step 5: Set Up Your Google Sheet

1. Create a new Google Sheet or open your existing subscriber sheet
2. Copy the **Sheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
   - The SHEET_ID is the long string between `/d/` and `/edit`

3. **Share the sheet** with your service account:
   - Click **Share** button in Google Sheets
   - Paste the service account email (from the JSON file, it looks like: `newsletter-subscriber@your-project.iam.gserviceaccount.com`)
   - Give it **Editor** permissions
   - Click **Send**

## Step 6: Add Credentials to Your .env.local

Open the JSON file you downloaded and add these to your `.env.local`:

```env
# Google Sheets Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID="your-sheet-id-from-url"
```

**Important Notes:**
- The `GOOGLE_SERVICE_ACCOUNT_EMAIL` is the `client_email` field from JSON
- The `GOOGLE_PRIVATE_KEY` is the `private_key` field from JSON
  - Keep the quotes
  - Keep the `\n` characters (they represent line breaks)
- The `GOOGLE_SHEET_ID` is from your Google Sheets URL

## Step 7: (Optional) Initialize Your Sheet

Run this command to create a "Subscribers" sheet with headers:

```bash
npx tsx scripts/init-google-sheet.ts
```

Or manually create a sheet named **"Subscribers"** with these column headers:
- Column A: `Email`
- Column B: `Name`
- Column C: `Subscribed At (ISO)`
- Column D: `Subscribed At (Local)`

## Step 8: Test It!

1. Restart your development server
2. Go to your homepage at `http://localhost:3000`
3. Try subscribing with your email
4. Check your Google Sheet - you should see the new subscriber!

## Troubleshooting

### Error: "Permission denied"
- Make sure you shared the Google Sheet with the service account email
- The service account needs **Editor** access

### Error: "GOOGLE_SHEET_ID not configured"
- Check your `.env.local` file has the `GOOGLE_SHEET_ID` variable
- Make sure it's the correct ID from the URL

### Error: "Invalid grant"
- Your private key might be malformed
- Make sure the `\n` characters are preserved in the `.env.local` file
- Try copying the entire private_key field again from the JSON

### Subscribers not appearing in sheet
- Check the browser console for errors
- Check your server logs (terminal) for errors
- Verify the sheet name is exactly "Subscribers" (case-sensitive)
- Make sure the service account has edit permissions

## How It Works

When someone subscribes:
1. ✅ Email is saved to your PostgreSQL database
2. ✅ Email is appended to your Google Sheet
3. ✅ They'll receive newsletter emails when you publish posts

The Google Sheet serves as a backup and makes it easy to export/manage subscribers in a familiar interface!
