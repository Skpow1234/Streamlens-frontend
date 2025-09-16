const API_BASE: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002'

interface ApiFetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>
  token?: string
  sessionId?: string
}

export function buildUrl(path: string): string {
  const trimmed = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${trimmed}`
}

export async function apiFetch(path: string, { headers = {}, token, sessionId, ...rest }: ApiFetchOptions = {}): Promise<any> {
  const mergedHeaders: Record<string, string> = { 'Content-Type': 'application/json', ...headers }
  if (sessionId) mergedHeaders['X-Session-ID'] = sessionId
  if (token) mergedHeaders['Authorization'] = `Bearer ${token}`
  if (typeof window !== 'undefined') mergedHeaders['Referer'] = window.location.href

  const res = await fetch(buildUrl(path), { headers: mergedHeaders, ...rest })
  if (!res.ok) {
    let message: string = `${res.status} ${res.statusText}`
    try { message = await res.text() } catch {}
    throw new Error(message)
  }
  const contentType: string = res.headers.get('content-type') || ''
  return contentType.includes('application/json') ? res.json() : res.text()
}


