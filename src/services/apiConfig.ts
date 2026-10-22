/**
 * Resolves the relative same-origin path for backend endpoints.
 * All logic relating to VITE_GEMINI_API_URL or absolute URLs has been removed.
 */
export function getApiUrl(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Resilient API fetch helper using relative same-origin endpoints.
 * If res.ok is false, parses the returned JSON and throws a standard JavaScript Error
 * with the message so it surfaces in the UI. Does not silently swallow HTTP 500 errors.
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = getApiUrl(path);
  const res = await fetch(url, options);

  if (!res.ok) {
    let errorMessage = `API request failed with HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data && (data.error || data.message)) {
        errorMessage = data.error || data.message;
      }
    } catch {
      try {
        const text = await res.text();
        if (text && text.trim()) {
          errorMessage = text.trim();
        }
      } catch {
        // Fall back to default error message
      }
    }
    throw new Error(errorMessage);
  }

  return res;
}

/**
 * Safely parses a JSON response from the API.
 * Detects HTTP error statuses and non-JSON content types,
 * throwing descriptive errors rather than silent failures.
 */
export async function safeParseJsonResponse<T = any>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = `API request failed with HTTP ${res.status}`;
    try {
      const errorJson = await res.json();
      if (errorJson && (errorJson.error || errorJson.message)) {
        errorMessage = errorJson.error || errorJson.message;
      }
    } catch {
      const text = await res.text().catch(() => '');
      if (text && text.trim()) {
        errorMessage = text.trim();
      }
    }
    throw new Error(errorMessage);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '');
    throw new Error(`Expected JSON response, but received '${contentType || 'text'}': ${text.slice(0, 150)}`);
  }

  return await res.json();
}
