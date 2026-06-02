export const subscriptionCallbackUrl = "/account?panel=subscription";

export function createLoginUrl(callbackUrl = subscriptionCallbackUrl) {
  return `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export function getSafeInternalCallbackUrl(
  value: string | string[] | undefined,
  fallback = "/start"
) {
  const callbackUrl = Array.isArray(value) ? value[0] : value;
  if (!callbackUrl) return fallback;

  try {
    const decoded = decodeURIComponent(callbackUrl);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      return decoded;
    }
  } catch {
    // Fall back below.
  }

  if (callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }

  return fallback;
}
