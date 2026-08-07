import { NextResponse } from 'next/server';

const ARCHIVED_MESSAGE = 'Subscription verification is no longer available from this public endpoint.';

function archivedResponse() {
  return NextResponse.json(
    { error: ARCHIVED_MESSAGE },
    {
      status: 410,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}

export async function GET() {
  return archivedResponse();
}

export async function POST() {
  return archivedResponse();
}

export async function PUT() {
  return archivedResponse();
}
