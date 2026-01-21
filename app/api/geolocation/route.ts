import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Try to get country from Vercel Edge headers (production)
    const vercelCountry = request.headers.get('x-vercel-ip-country') || (request as any).geo?.country;

    if (vercelCountry) {
      console.log('[Geolocation] Detected from Vercel headers:', vercelCountry);
      return NextResponse.json({
        country: vercelCountry,
        isIndia: vercelCountry === 'IN',
      });
    }

    // Fallback: Use ipapi.co auto-detection
    // This should detect based on the requesting IP automatically
    try {
      const response = await fetch('https://ipapi.co/json/', {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Geolocation] Detected from ipapi.co:', data.country_code, data);

        return NextResponse.json({
          country: data.country_code || 'IN',
          isIndia: data.country_code === 'IN',
        });
      } else {
        console.error('[Geolocation] ipapi.co response not ok:', response.status);
      }
    } catch (error) {
      console.error('[Geolocation] ipapi.co error:', error);
    }

    // Default to India if all detection methods fail
    console.log('[Geolocation] Defaulting to India');
    return NextResponse.json({
      country: 'IN',
      isIndia: true,
    });
  } catch (error) {
    console.error('[Geolocation] API error:', error);
    return NextResponse.json(
      {
        country: 'IN',
        isIndia: true,
      },
      { status: 200 }
    );
  }
}
