/**
 * Sanitizes a URL to prevent XSS attacks via javascript: protocols.
 * Only allows http:, https:, and mailto: protocols.
 */
export const sanitizeUrl = (url: string | null | undefined): string => {
  if (!url) return "#";
  
  const trimmedUrl = url.trim();
  
  // Basic check for javascript: or other unsafe protocols at the start
  // This handles encoded versions and whitespace bypasses
  const isUnsafe = /^(?:javascript|data|vbscript|file):/i.test(trimmedUrl.replace(/[\x00-\x20\s]/g, ''));
  
  if (isUnsafe) {
    console.warn("Blocked potentially malicious URL:", trimmedUrl);
    return "#";
  }

  // Check if the URL starts with a safe protocol
  const safeProtocols = /^(https?|mailto):/i;
  
  if (safeProtocols.test(trimmedUrl)) {
    return trimmedUrl;
  }
  
  // If it's a relative path starting with /, it's also safe
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }

  // If it doesn't have a protocol but looks like a domain, prepend https://
  if (/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(trimmedUrl)) {
    return `https://${trimmedUrl}`;
  }

  // Fallback for unsafe or unknown protocols
  return "#";
};