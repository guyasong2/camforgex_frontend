import { cookies, headers } from 'next/headers';
export const dynamic = 'force-dynamic'; // keep it dynamic in dev
const API = process.env.API_BASE_URL || 'https://camforgex.onrender.com';

async function authHeaders() {
  const h = new Headers();
  // If you use JWT stored on 3000 domain:
  const c = await cookies();
  const access = c.get('access')?.value;
  if (access) h.set('authorization', `Bearer ${access}`);

  // If you insist on session cookies (less ideal with proxy on different origin):
  // const cookieHeader = headers().get('cookie');
  // if (cookieHeader) h.set('cookie', cookieHeader);
  // const csrf = c.get('csrftoken')?.value;
  // if (csrf) h.set('X-CSRFToken', csrf);

  return h;
}
export async function GET() {
  const res = await fetch(`${API}/api/users/me/`, { headers: await authHeaders(), cache: 'no-store' });
  return new Response(await res.text(), { status: res.status, headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' } });
}
export async function PATCH(req: Request) {
  const h = await authHeaders();
  const formData = await req.formData();
  const res = await fetch(`${API}/api/users/me/`, { method: 'PATCH', headers: h, body: formData });
  return new Response(await res.text(), { status: res.status, headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' } });
}