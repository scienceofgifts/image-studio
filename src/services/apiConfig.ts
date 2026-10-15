/**
 * Resolves the full API URL for backend endpoints.
 *
 * - Reads VITE_GEMINI_API_URL environment variable if configured for remote worker endpoints.
 * - Falls back to relative paths ("/api/...") for local server / proxy.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

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
 * Calls the resolved endpoint. If a remote worker returns 404 or fails,
 * it only accepts a local fallback if the local response is valid JSON (preventing
 * static SPA HTML fallbacks on Cloudflare Pages from masking errors).
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const targetUrl = getApiUrl(cleanPath);

  try {
    const res = await fetch(targetUrl, options);
    // If the remote endpoint returned 404, only fall back to cleanPath if cleanPath
    // returns actual JSON (meaning a real local Express server is running)
    if (res.status === 404 && targetUrl !== cleanPath) {
      console.warn(`[apiConfig] Remote endpoint ${targetUrl} returned 404, checking local server...`);
      try {
        const localRes = await fetch(cleanPath, options);
        const contentType = localRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return localRes;
        }
      } catch {
        // Fallback failed, keep original remote response
      }
    }
    return res;
  } catch (err) {
    if (targetUrl !== cleanPath) {
      console.warn(`[apiConfig] Request to remote ${targetUrl} failed, checking local server:`, err);
      try {
        const localRes = await fetch(cleanPath, options);
        const contentType = localRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return localRes;
        }
      } catch {
        // Ignore fallback failure
      }
    }
    throw err;
  }
}

/**
 * Safely parses a JSON response from the API.
 * Detects HTML responses (such as SPA static fallbacks or Cloudflare error pages),
 * non-JSON content types, and HTTP error statuses, throwing descriptive errors
 * rather than raw JSON parsing exceptions.
 */
export async function safeParseJsonResponse<T = any>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    if (isJson) {
      try {
        const errorJson = await res.json();
        throw new Error(errorJson.error || errorJson.message || `API request failed with HTTP ${res.status}`);
      } catch (e: any) {
        if (e.message && !e.message.startsWith('Unexpected token') && !e.message.includes('JSON')) {
          throw e;
        }
      }
    }
    const text = await res.text().catch(() => '');
    if (text.trim().startsWith('<') || text.includes('<!DOCTYPE')) {
      throw new Error(`API endpoint returned an HTML error page (HTTP ${res.status}). Please verify that the Cloudflare Worker is deployed.`);
    }
    throw new Error(text.trim() || `API request failed with HTTP ${res.status}: ${res.statusText}`);
  }

  if (!isJson) {
    const text = await res.text().catch(() => '');
    if (text.trim().startsWith('<') || text.includes('<!DOCTYPE')) {
      throw new Error('Received an HTML page instead of JSON from API. Please check your API URL configuration (VITE_GEMINI_API_URL).');
    }
    throw new Error(`Expected JSON response, but received '${contentType || 'unknown content-type'}'.`);
  }

  const rawText = await res.text();
  try {
    return JSON.parse(rawText);
  } catch (err: any) {
    throw new Error(`Failed to parse API response as JSON: ${err?.message || 'Invalid format'}`);
  }
}
