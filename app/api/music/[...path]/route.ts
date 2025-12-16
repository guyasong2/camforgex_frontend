import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';

const API = process.env.API_BASE_URL || 'https://camforgex.onrender.com';

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
    body = fd; // fetch sets boundary automatically
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

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}

// ---- Route handlers ----
export async function GET(req: NextRequest, context: { params: { path: string[] } }) {
  return proxy(req, context.params.path || []);
}
export async function POST(req: NextRequest, context: { params: { path: string[] } }) {
  return proxy(req, context.params.path || []);
}
export async function PATCH(req: NextRequest, context: { params: { path: string[] } }) {
  return proxy(req, context.params.path || []);
}
export async function PUT(req: NextRequest, context: { params: { path: string[] } }) {
  return proxy(req, context.params.path || []);
}
export async function DELETE(req: NextRequest, context: { params: { path: string[] } }) {
  return proxy(req, context.params.path || []);
}
