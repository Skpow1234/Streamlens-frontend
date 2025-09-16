const API_BASE: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002'

interface ApiFetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>
  token?: string | null
  sessionId?: string | null
  useCache?: boolean
  cacheTTL?: number
}

export function buildUrl(path: string): string {
  const trimmed = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${trimmed}`
}

// Rate limiting and caching
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

const apiCache = new ApiCache();

export async function apiFetch(path: string, { headers = {}, token, sessionId, useCache = true, cacheTTL = 300000, ...rest }: ApiFetchOptions = {}): Promise<any> {
  const mergedHeaders: Record<string, string> = { 'Content-Type': 'application/json', ...headers }
  if (sessionId) mergedHeaders['x-session-id'] = sessionId
  if (token) mergedHeaders['Authorization'] = `Bearer ${token}`
  if (typeof window !== 'undefined') mergedHeaders['Referer'] = window.location.href

  // Check cache for GET requests
  const cacheKey = `${path}-${JSON.stringify(rest)}`;
  if (useCache && (rest.method === 'GET' || !rest.method)) {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', path);
      return cached;
    }
  }

  const res = await fetch(buildUrl(path), { headers: mergedHeaders, ...rest });

  // Handle rate limiting with enhanced feedback
  if (res.status === 429) {
    const errorData = await res.json().catch(() => ({ message: 'Rate limit exceeded' }));

    // Extract retry information from headers
    const retryAfter = res.headers.get('Retry-After');
    const retrySeconds = retryAfter ? parseInt(retryAfter) : errorData.retry_after || 60;

    throw new Error(`Rate limit exceeded. Please wait ${retrySeconds} seconds before trying again.`);
  }

  if (!res.ok) {
    // Enhanced error handling with API feedback
    let message: string = `${res.status} ${res.statusText}`;

    try {
      const errorData = await res.json();

      // Check for specific API error types
      if (errorData.type === 'rate_limit_exceeded') {
        const retryAfter = res.headers.get('Retry-After') || errorData.retry_after || 60;
        throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`);
      }

      message = errorData.message || errorData.detail || message;
    } catch {
      // Fallback to text response
      try { message = await res.text() } catch {}
    }

    throw new Error(message);
  }

  const contentType: string = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  // Cache successful GET responses
  if (useCache && (rest.method === 'GET' || !rest.method)) {
    apiCache.set(cacheKey, data, cacheTTL);
    console.log('Cached response:', path);
  }

  // Log API performance metrics
  if (typeof window !== 'undefined') {
    const processingTime = res.headers.get('X-Process-Time');
    const rateLimitRemaining = res.headers.get('X-Rate-Limit-Remaining');

    console.log(`API ${rest.method || 'GET'} ${path}:`, {
      status: res.status,
      processingTime: processingTime ? `${processingTime}s` : 'N/A',
      rateLimitRemaining: rateLimitRemaining || 'N/A'
    });
  }

  return data;
}

// Bulk operations helper
export async function bulkApiFetch(requests: Array<{ path: string; options: ApiFetchOptions }>): Promise<any[]> {
  const results = await Promise.allSettled(
    requests.map(({ path, options }) =>
      apiFetch(path, { ...options, useCache: false }) // Disable cache for bulk operations
    )
  );

  const responses = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return { success: true, data: result.value, index };
    } else {
      return {
        success: false,
        error: result.reason.message || 'Request failed',
        index
      };
    }
  });

  return responses;
}

// Cache management
export const apiCacheStats = {
  size: () => apiCache.size(),
  clear: () => apiCache.clear(),
  getStats: () => ({
    cacheSize: apiCache.size(),
    cacheEnabled: true
  })
};


