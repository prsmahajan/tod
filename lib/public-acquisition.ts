import { NextResponse } from "next/server";

export function archivedAcquisitionResponse(): NextResponse {
  return NextResponse.json(
    { error: "This signup program is no longer accepting entries." },
    {
      status: 410,
      headers: { "Cache-Control": "public, max-age=300" },
    },
  );
}
