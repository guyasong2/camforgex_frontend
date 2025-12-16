const DEFAULT_BASE_URL = 'http://127.0.0.1:8000';
const BASE = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE_URL).replace(/\/$/, '');

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
  auth?: boolean;        // attach Authorization: Bearer <token>
  credentials?: RequestCredentials; // only set if you use cookie auth
  timeoutMs?: number;
};

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}
export function setTokens(access?: string | null, refresh?: string | null) {
  if (typeof window === 'undefined') return;
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
}
export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export async function api<T = any>(path: string, opts: ApiOptions = {}) {
  const {
    method = 'GET',
    data,
    headers = {},
    auth = true,
    credentials,  // undefined by default (omit)
    timeoutMs = 20000,
  } = opts;

  const token = getAccessToken();
  const url = `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${method} ${url}`, data ?? '');
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials, // only set if you’re using cookie-based auth
      signal: controller.signal,
    });

    const ct = res.headers.get('content-type') || '';
    const payload = ct.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) {
      const msg =
        typeof payload === 'string' ? payload : payload?.detail || res.statusText || 'Request failed';
      throw new Error(msg);
    }
    return payload as T;
  } finally {
    clearTimeout(t);
  }
}