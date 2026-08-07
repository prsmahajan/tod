import { NextResponse } from "next/server";
import { databases, DATABASE_ID, COLLECTIONS, Query } from "@/lib/appwrite/server";
import {
  resolvePublicSupportStatus,
  type PublicSupportMode,
} from "@/lib/razorpay/public-status";

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store, max-age=0" };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode: PublicSupportMode = searchParams.get("mode") === "subscription"
    ? "subscription"
    : "payment";
  const reference = searchParams.get("reference") || "";

  try {
    const status = await resolvePublicSupportStatus({
      mode,
      reference,
      findPayment: async (paymentId) => {
        const result = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.TRANSACTIONS,
          [Query.equal("razorpayPaymentId", paymentId), Query.limit(1)],
        );
        return (result.documents[0] as Record<string, unknown> | undefined) ?? null;
      },
      findSubscription: async (subscriptionId) => {
        const result = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.SUBSCRIPTIONS,
          [Query.equal("razorpaySubscriptionId", subscriptionId), Query.limit(1)],
        );
        return (result.documents[0] as Record<string, unknown> | undefined) ?? null;
      },
    });

    return NextResponse.json(status, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Public support status lookup failed:", error);
    return NextResponse.json(
      { state: "unknown" },
      { status: 503, headers: NO_STORE_HEADERS },
    );
  }
}
