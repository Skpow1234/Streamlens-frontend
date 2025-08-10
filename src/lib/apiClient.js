const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002'

export function buildUrl(path) {
  const trimmed = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${trimmed}`
}

export async function apiFetch(path, { headers = {}, token, sessionId, ...rest } = {}) {
  const mergedHeaders = { 'Content-Type': 'application/json', ...headers }
  if (sessionId) mergedHeaders['X-Session-ID'] = sessionId
  if (token) mergedHeaders['Authorization'] = `Bearer ${token}`

  const res = await fetch(buildUrl(path), { headers: mergedHeaders, ...rest })
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`
    try { message = await res.text() } catch {}
    throw new Error(message)
  }
  const contentType = res.headers.get('content-type') || ''
  return contentType.includes('application/json') ? res.json() : res.text()
}


