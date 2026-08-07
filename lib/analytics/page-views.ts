const PAYMENT_REFERENCE_PATTERN = /(?:payment|order|subscription|razorpay)[_-]?id|(?:pay|order|sub)_[a-z0-9]/i;

function sanitizePathname(value: unknown): string | null {
  if (
    typeof value !== "string"
    || !value.startsWith("/")
    || value.startsWith("//")
    || value.includes("?")
    || value.includes("#")
    || value.includes("\\")
    || /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return null;
  }

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }

  if (decoded.includes("?") || decoded.includes("#") || PAYMENT_REFERENCE_PATTERN.test(decoded)) {
    return null;
  }
  return value;
}

function sendPageView(pathname: unknown): boolean {
  const safePathname = sanitizePathname(pathname);
  if (!safePathname || typeof window === "undefined" || typeof window.gtag !== "function") {
    return false;
  }

  try {
    window.gtag("event", "page_view", { page_path: safePathname });
    return true;
  } catch {
    return false;
  }
}

export function createPageViewTracker(): (pathname: unknown) => boolean {
  let lastTrackedPathname: string | null = null;

  return (pathname: unknown) => {
    if (pathname === lastTrackedPathname) return false;
    if (!sendPageView(pathname)) return false;

    lastTrackedPathname = pathname as string;
    return true;
  };
}
