/**
 * Sanitizes a URL to prevent XSS attacks via javascript: protocols.
 * Only allows http:, https:, and mailto: protocols.
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return "#";
  
  const trimmedUrl = url.trim();
  
  // Check if the URL starts with a safe protocol
  const safeProtocols = /^(https?|mailto):/i;
  
  if (safeProtocols.test(trimmedUrl)) {
    return trimmedUrl;
  }
  
  // If it's a relative path starting with /, it's also safe
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }

  // Fallback for unsafe or unknown protocols
  return "#";
};