import { NextResponse } from "next/server";

const CANCELLATION_CONTACT = "account@theopendraft.com";

/**
 * Public cancellation is intentionally disabled for this release.
 * A Razorpay subscription ID is a reference, not proof of ownership.
 * The existing admin-owned cancellation route remains available to staff.
 */
export async function POST(_request: Request) {
  return NextResponse.json(
    {
      error: `For account security, recurring support cannot be cancelled from this public link. Email ${CANCELLATION_CONTACT} from the address used at checkout and include the subscription reference.`,
    },
    { status: 403 },
  );
}
