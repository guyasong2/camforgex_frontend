import { NextRequest } from 'next/server';
import { cookies, headers } from 'next/headers';

const API = process.env.API_BASE_URL || 'https://camforgex.onrender.com';

// Build headers for auth, cookies, CSRF
async function buildAuthHeaders() {
  const h = new Headers();

  const hdrs = await headers();
  const auth = hdrs.get('authorization');
  if (auth) h.set('authorization', auth);

  const cookieHeader = hdrs.get('cookie');
  if (cookieHeader) h.set('cookie', cookieHeader);

  const cookieStore = await cookies();
  const csrf = cookieStore.get('csrftoken')?.value;
  if (csrf) h.set('X-CSRFToken', csrf);

  return h;
}

// Core proxy function
async function proxy(req: NextRequest, path: string[]) {
  const url = new URL(req.url);
  const method = req.method.toUpperCase();
  const outHeaders = await buildAuthHeaders();

  const backendUrl = `${API}/${path.map(encodeURIComponent).join('/')}${url.search}`;

  let body: BodyInit | undefined;
  const contentType = req.headers.get('content-type') || '';

  if (method === 'GET' || method === 'HEAD') {
    // no body
  } else if (contentType.includes('multipart/form-data')) {
    const fd = await req.formData();
    body = fd; // fetch will handle boundaries automatically
  } else if (contentType.includes('application/json')) {
    const json = await req.json();
    outHeaders.set('content-type', 'application/json');
    body = JSON.stringify(json);
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text();
    outHeaders.set('content-type', 'application/x-www-form-urlencoded');
    body = text;
  } else {
    body = await req.arrayBuffer();
  }

  const res = await fetch(backendUrl, {
    method,
    headers: outHeaders,
    body,
    redirect: 'manual',
    cache: 'no-store',
  });

  const responseText = await res.text();
  return new Response(responseText, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}

// --- Unified handler for all HTTP methods ---
async function handler(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxy(req, path);
}

// Export all HTTP methods
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
