import { NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite/server';

/**
 * Public Supporters API
 * 
 * Returns a list of supporters (subscribers) for public display.
 * Only returns non-sensitive information: first name, plan type, and join date.
 * 
 * Privacy: Email addresses are never exposed. Names are anonymized to first name + last initial.
 */

// Simple in-memory cache
let cachedSupporters: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

interface Supporter {
  id: string;
  displayName: string;
  planType: string;
  joinedAt: string;
  avatar: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const includeAll = searchParams.get('all') === 'true';

    // Check cache
    const now = Date.now();
    const cacheKey = `${limit}-${includeAll}`;
    if (cachedSupporters?.key === cacheKey && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json(cachedSupporters.data);
    }

    // Fetch ALL subscriptions (not just active) to show everyone who ever supported
    const queries = [
      Query.orderDesc('$createdAt'),
      Query.limit(includeAll ? 500 : Math.max(limit * 2, 100)), // Fetch extra to account for deduplication
    ];

    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      queries
    );

    // Get total count of all supporters (including past)
    const totalRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.SUBSCRIPTIONS,
      [Query.limit(1)]
    );

    // Process supporters - deduplicate by email first, then anonymize for privacy
    const seenEmails = new Set<string>();
    const supporters: Supporter[] = [];
    
    for (const doc of res.documents as any[]) {
      const email = (doc.userEmail || '').toLowerCase();
      
      // Skip duplicates (same person with multiple subscriptions)
      if (email && seenEmails.has(email)) continue;
      if (email) seenEmails.add(email);
      
      const displayName = anonymizeName(doc.userName || doc.userEmail || '');
      
      supporters.push({
        id: doc.$id,
        displayName,
        planType: doc.planType || 'seedling',
        joinedAt: doc.$createdAt,
        avatar: generateAvatar(email || doc.$id, doc.planType), // Use email for consistent avatar color
      });
    }

    // No need for additional deduplication - already done above
    const uniqueSupporters = supporters;

    const response = {
      supporters: uniqueSupporters.slice(0, limit),
      total: uniqueSupporters.length, // Unique supporters count
      activeCount: uniqueSupporters.length,
    };

    // Update cache
    cachedSupporters = { key: cacheKey, data: response };
    cacheTimestamp = now;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching supporters:', error);
    return NextResponse.json({
      supporters: [],
      total: 0,
      activeCount: 0,
    });
  }
}

/**
 * Anonymize name for privacy
 * "John Doe" -> "John D."
 * "john@email.com" -> "John"
 */
function anonymizeName(nameOrEmail: string): string {
  if (!nameOrEmail) return 'Anonymous';

  // If it's an email, extract the part before @
  if (nameOrEmail.includes('@')) {
    const localPart = nameOrEmail.split('@')[0];
    // Capitalize first letter
    const name = localPart.charAt(0).toUpperCase() + localPart.slice(1).toLowerCase();
    // Remove numbers and special chars, take first "word"
    const cleanName = name.replace(/[0-9._-]/g, ' ').split(' ')[0];
    return cleanName || 'Supporter';
  }

  // If it's a name, show first name + last initial
  const parts = nameOrEmail.trim().split(' ');
  if (parts.length === 1) {
    return parts[0];
  }
  
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

/**
 * Generate a deterministic avatar color based on name
 */
function generateAvatar(name: string, planType: string): string {
  // Generate a hue based on name hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  
  // Plan-based saturation/lightness
  const planColors: Record<string, { s: number; l: number }> = {
    seedling: { s: 60, l: 65 },
    sapling: { s: 70, l: 55 },
    tree: { s: 80, l: 45 },
  };
  
  const { s, l } = planColors[planType] || planColors.seedling;
  
  return `hsl(${hue}, ${s}%, ${l}%)`;
}

