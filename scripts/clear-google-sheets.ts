import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { getGoogleSheetsClient } from '@/lib/google-sheets';

async function main() {
  console.log('🗑️  Clearing subscriber data from Google Sheets...\n');

  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      console.log('⚠️  GOOGLE_SHEET_ID not configured');
      return;
    }

    // First, check what's there
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Subscribers!A:D',
    });

    const rows = response.data.values;

    if (!rows || rows.length <= 1) {
      console.log('✅ No data to clear (only headers or empty)\n');
      return;
    }

    const dataRowCount = rows.length - 1; // Exclude header row
    console.log(`Found ${dataRowCount} data row(s) to clear\n`);

    // Clear all data rows but keep the header
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `Subscribers!A2:D${rows.length}`,
    });

    console.log(`✨ Successfully cleared ${dataRowCount} row(s) from Google Sheets\n`);
    console.log('✅ Headers preserved - sheet is ready for real subscribers!\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });
