/**
 * Resolves the full API URL for backend endpoints.
 *
 * - Routes /api/idea-explorer/* directly to the local server (server.ts), since the external
 *   Cloudflare worker does not host Idea Explorer endpoints.
 * - Reads VITE_GEMINI_API_URL environment variable if configured for remote worker endpoints.
 * - Falls back to relative paths ("/api/...") for local server / proxy.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Always route Idea Explorer endpoints to the local full-stack server (server.ts)
  if (cleanPath.startsWith('/api/idea-explorer')) {
    return cleanPath;
  }

  let baseUrl = (import.meta.env.VITE_GEMINI_API_URL || '').trim();

  // If baseUrl is empty, or is not a valid absolute URL,
  // fall back to relative paths to route to our local full-stack server (server.ts).
  if (!baseUrl || (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://'))) {
    return cleanPath;
  }

  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `${cleanBase}${cleanPath}`;
}

/**
 * Resilient API fetch helper.
 * Calls the resolved endpoint; if a remote endpoint returns 404 or fails to connect,
 * automatically falls back to the local full-stack server (server.ts).
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const targetUrl = getApiUrl(cleanPath);

  try {
    const res = await fetch(targetUrl, options);
    // If the remote endpoint returned 404 (e.g. endpoint not found on remote worker),
    // and targetUrl was remote, fall back to our local server!
    if (res.status === 404 && targetUrl !== cleanPath) {
      console.warn(`[apiConfig] Remote endpoint ${targetUrl} returned 404, falling back to local server at ${cleanPath}`);
      return await fetch(cleanPath, options);
    }
    return res;
  } catch (err) {
    if (targetUrl !== cleanPath) {
      console.warn(`[apiConfig] Request to remote ${targetUrl} failed, falling back to local server at ${cleanPath}:`, err);
      return await fetch(cleanPath, options);
    }
    throw err;
  }
}
