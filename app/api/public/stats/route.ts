import { NextResponse } from "next/server";

const VERIFICATION_MESSAGE =
  "Public contribution totals and meal estimates are paused until historical payment currencies are verified.";

export async function GET() {
  return NextResponse.json(
    {
      availability: "currency-verification-pending",
      message: VERIFICATION_MESSAGE,
    },
    {
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" },
    },
  );
}
