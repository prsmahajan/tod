import { google } from "googleapis";

// Initialize Google Sheets API
export async function getGoogleSheetsClient() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    return sheets;
  } catch (error) {
    console.error("Failed to initialize Google Sheets client:", error);
    throw error;
  }
}

interface SubscriberData {
  email: string;
  name?: string | null;
  subscribedAt: Date;
}

// Append subscriber to Google Sheet
export async function appendSubscriberToSheet(subscriber: SubscriberData) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error("GOOGLE_SHEET_ID not configured");
    }

    const values = [
      [
        subscriber.email,
        subscriber.name || "",
        new Date(subscriber.subscribedAt).toISOString(),
        new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Subscribers!A:D", // Appends to "Subscribers" sheet, columns A-D
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });

    console.log(`✅ Added ${subscriber.email} to Google Sheet`);
    return { success: true };
  } catch (error) {
    console.error("Failed to append to Google Sheet:", error);
    // Don't throw - we still want the subscription to work even if Sheets fails
    return { success: false, error };
  }
}

// Optional: Create the sheet with headers if it doesn't exist
export async function initializeSheet() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error("GOOGLE_SHEET_ID not configured");
    }

    // Check if Subscribers sheet exists
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const subscribersSheet = spreadsheet.data.sheets?.find(
      (sheet) => sheet.properties?.title === "Subscribers"
    );

    if (!subscribersSheet) {
      // Create the sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Subscribers",
                },
              },
            },
          ],
        },
      });

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Subscribers!A1:D1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["Email", "Name", "Subscribed At (ISO)", "Subscribed At (Local)"]],
        },
      });

      console.log("✅ Created Subscribers sheet with headers");
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to initialize sheet:", error);
    return { success: false, error };
  }
}
