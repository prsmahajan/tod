import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { getGoogleSheetsClient } from '@/lib/google-sheets';

async function main() {
  console.log('📊 Checking Google Sheets for subscriber data...\n');

  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      console.log('⚠️  GOOGLE_SHEET_ID not configured in environment variables');
      console.log('   Google Sheets integration is not active\n');
      return;
    }

    // Get all data from the Subscribers sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Subscribers!A:D',
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log('✅ No data found in Google Sheets (clean state)\n');
      return;
    }

    console.log(`Found ${rows.length} row(s) in Google Sheets:\n`);

    // First row is usually headers
    const headers = rows[0];
    console.log('Headers:', headers.join(' | '));
    console.log('─'.repeat(80));

    // Display data rows
    const dataRows = rows.slice(1);
    if (dataRows.length === 0) {
      console.log('✅ Only headers present - no subscriber data\n');
      return;
    }

    dataRows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.join(' | ')}`);
    });

    console.log('─'.repeat(80));
    console.log(`\n📈 Summary:`);
    console.log(`   Total rows (including header): ${rows.length}`);
    console.log(`   Data rows: ${dataRows.length}`);
    console.log(`\n💡 To clear this data, manually delete rows 2-${rows.length} in your Google Sheet`);
    console.log(`   or I can create a script to do it automatically.\n`);

  } catch (error: any) {
    console.error('❌ Error accessing Google Sheets:', error.message);
    console.log('\nPossible issues:');
    console.log('  - Google Sheets API not enabled');
    console.log('  - Service account does not have access to the sheet');
    console.log('  - Invalid GOOGLE_SHEET_ID\n');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });
