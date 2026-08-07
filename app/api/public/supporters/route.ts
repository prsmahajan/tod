import { NextResponse } from "next/server";

/**
 * Archived for the first animal-first release. Historical subscription data is
 * retained, but the public portal does not publish names or partial counts as
 * verified supporter metrics.
 */
export async function GET() {
  return NextResponse.json(
    { error: "Supporter counts are not published." },
    {
      status: 410,
      headers: { "Cache-Control": "public, max-age=300" },
    },
  );
}
