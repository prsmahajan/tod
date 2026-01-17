// Geolocation utility to detect user's country
// Uses Vercel Edge headers or fallback to IP geolocation API

export interface GeolocationData {
  country: string;
  isIndia: boolean;
}

/**
 * Detects if the user is from India based on IP address
 * @param request - The Next.js request object
 * @returns GeolocationData containing country code and India status
 */
export async function detectUserLocation(
  request?: Request
): Promise<GeolocationData> {
  try {
    // Try to get country from Vercel Edge headers (if deployed on Vercel)
    if (request) {
      const country = request.headers.get('x-vercel-ip-country');
      if (country) {
        return {
          country,
          isIndia: country === 'IN',
        };
      }
    }

    // Fallback to ipapi.co for development or non-Vercel deployments
    const response = await fetch('https://ipapi.co/json/', {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Geolocation API failed');
    }

    const data = await response.json();
    return {
      country: data.country_code || 'IN',
      isIndia: data.country_code === 'IN',
    };
  } catch (error) {
    console.error('Geolocation detection failed:', error);
    // Default to India if detection fails
    return {
      country: 'IN',
      isIndia: true,
    };
  }
}

/**
 * Client-side geolocation detection
 * Calls ipapi.co directly from the browser to detect user's actual IP location
 */
export async function detectUserLocationClient(): Promise<GeolocationData> {
  try {
    // Call ipapi.co directly from the browser
    // This ensures we get the user's actual IP (including VPN)
    const response = await fetch('https://ipapi.co/json/');

    if (!response.ok) {
      throw new Error('Geolocation API failed');
    }

    const data = await response.json();
    console.log('[Geolocation Client] Detected country:', data.country_code, data);

    return {
      country: data.country_code || 'IN',
      isIndia: data.country_code === 'IN',
    };
  } catch (error) {
    console.error('Client-side geolocation detection failed:', error);
    // Default to India if detection fails
    return {
      country: 'IN',
      isIndia: true,
    };
  }
}

// Pricing conversion rates
export const PRICING_MAP = {
  INR: {
    29: 29,
    79: 79,
    99: 99,
    199: 199,
    499: 499,
    999: 999,
  },
  USD: {
    29: 1,
    79: 3,
    99: 5,
    199: 6,
    499: 10,
    999: 20,
  },
};

export function getPriceForLocation(
  inrAmount: number,
  isIndia: boolean
): { amount: number; currency: string; symbol: string } {
  if (isIndia) {
    return {
      amount: inrAmount,
      currency: 'INR',
      symbol: '₹',
    };
  }

  // Convert to USD based on pricing map
  const usdAmount = PRICING_MAP.USD[inrAmount as keyof typeof PRICING_MAP.USD] || Math.ceil(inrAmount / 83);

  return {
    amount: usdAmount,
    currency: 'USD',
    symbol: '$',
  };
}
