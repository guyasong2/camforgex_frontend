import { cookies, headers } from 'next/headers';

const API = process.env.API_BASE_URL || 'https://camforgex.onrender.com';

async function buildAuthHeaders() {
  const h = new Headers();
  // Forward Authorization header if you use JWT in headers:
  const hdrs = await headers();
  const auth = hdrs.get('authorization');
  if (auth) h.set('authorization', auth);

  // Forward browser cookies (sessionid/access/refresh/csrftoken)
  const cookieHeader = hdrs.get('cookie');
  if (cookieHeader) h.set('cookie', cookieHeader);

  // CSRF (if needed for Django session auth)
  const cookieStore = await cookies();
  const csrf = cookieStore.get('csrftoken')?.value;
  if (csrf) h.set('X-CSRFToken', csrf);

  return h;
}

async function proxy(req: Request, path: string[]) {
  const url = new URL(req.url);
  const method = req.method.toUpperCase();
  const outHeaders = await buildAuthHeaders();

  // build backend URL from API and path segments, preserve query string
  const backendUrl = `${API}/${path.map(encodeURIComponent).join('/')}${url.search}`;

  let body: BodyInit | undefined;
  const contentType = req.headers.get('content-type') || '';

  if (method === 'GET' || method === 'HEAD') {
    // no body
  } else if (contentType.includes('multipart/form-data')) {
    const fd = await req.formData();
    body = fd; // don't set Content-Type, fetch will set boundary automatically
  } else if (contentType.includes('application/json')) {
    const json = await req.json();
    outHeaders.set('content-type', 'application/json');
    body = JSON.stringify(json);
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text();
    outHeaders.set('content-type', 'application/x-www-form-urlencoded');
    body = text;
  } else {
    // default fallback
    body = await req.arrayBuffer();
  }

  const res = await fetch(backendUrl, {
    method,
    headers: outHeaders,
    body,
    redirect: 'manual',
    cache: 'no-store',
  });

  const text = await res.text(); // pass body through unchanged
  return new Response(text, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path || []);
}
export async function POST(req: Request, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path || []);
}
export async function PATCH(req: Request, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path || []);
}
export async function PUT(req: Request, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path || []);
}
export async function DELETE(req: Request, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path || []);
}