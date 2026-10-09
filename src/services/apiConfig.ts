/**
 * Resolves the full API URL for Image Studio backend endpoints.
 *
 * - Reads VITE_GEMINI_API_URL environment variable if configured.
 * - Falls back to relative paths ("/api/image-studio/...") for local server / proxy.
 */
export function getApiUrl(path: string): string {
  let baseUrl = (import.meta.env.VITE_GEMINI_API_URL || '').trim();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If baseUrl is empty, or is not a valid absolute URL,
  // fall back to relative paths to route to our local full-stack server (server.ts).
  if (!baseUrl || (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://'))) {
    return cleanPath;
  }

  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `${cleanBase}${cleanPath}`;
}
