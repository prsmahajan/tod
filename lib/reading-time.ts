/**
 * Calculate estimated reading time for HTML content
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(html: string): number {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, '');

  // Count words (split by whitespace)
  const words = text.trim().split(/\s+/).length;

  // Calculate minutes (200 words per minute average)
  const minutes = Math.ceil(words / 200);

  return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}
