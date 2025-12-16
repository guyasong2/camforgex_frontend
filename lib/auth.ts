import { api, setTokens } from './api';

export async function register(data: {
  email: string;
  password: string;
  username?: string;
  role?: 'artist' | 'promoter' | 'user';
}) {
  const res = await api<{ access?: string; refresh?: string; user?: any }>(
    '/api/users/register/',
    { method: 'POST', data, auth: false }
  );
  if (res?.access || res?.refresh) setTokens(res.access || null, res.refresh || null);
  return res;
}

export async function getMe() {
  return api<any>('/api/users/me/', { method: 'GET' });
}