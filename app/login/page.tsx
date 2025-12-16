'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'ARTIST' | 'PROMOTER';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://camforgex.onrender.com';
const LOGIN_URL = `${API_BASE}/api/users/login/`;
const GOOGLE_LOGIN_URL = `${API_BASE}/api/users/auth/google/`;

const dashboardForRole = (role?: string) =>
  (role || '').toUpperCase() === 'ARTIST'
    ? '/dashboard/artist'
    : '/dashboard/users';

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({ username: '', password: '' });
  const [role, setRole] = useState<Role>('ARTIST');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleBtnRef = useRef<HTMLDivElement>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const parseResponse = async (res: Response) => {
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json')
      ? await res.json()
      : await res.text();
    return { ok: res.ok, data };
  };

  const storeTokensAndGo = (data: any, fallbackRole: Role) => {
    if (typeof window !== 'undefined' && typeof data === 'object') {
      if (data?.access) localStorage.setItem('access_token', data.access);
      if (data?.refresh) localStorage.setItem('refresh_token', data.refresh);

      if (data?.token?.access)
        localStorage.setItem('access_token', data.token.access);
      if (data?.token?.refresh)
        localStorage.setItem('refresh_token', data.token.refresh);
    }

    const nextRole = (data?.role || data?.user?.role || fallbackRole) as Role;
    router.push(dashboardForRole(nextRole));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      });

      const { ok, data } = await parseResponse(res);

      if (!ok) {
        const msg =
          data?.detail ||
          Object.values(data)?.[0] ||
          'Invalid username or password';
        throw new Error(msg);
      }

      storeTokensAndGo(data, role);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN
  const handleGoogleCredential = async (response: { credential: string }) => {
    if (!response?.credential) return;

    setGoogleLoading(true);
    setError(null);

    try {
      const res = await fetch(GOOGLE_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_token: response.credential,
          role,
        }),
      });

      const { ok, data } = await parseResponse(res);

      if (!ok) {
        const msg =
          typeof data === 'object'
            ? Object.values(data)?.[0]
            : 'Google login failed';
        throw new Error(msg as string);
      }

      storeTokensAndGo(data, role);
    } catch (err: any) {
      setError(err?.message || 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const initialize = () => {
      if (!window.google?.accounts?.id) return;

      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        console.warn('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        ux_mode: 'popup',
      });

      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 360,
          logo_alignment: 'left',
        });
      }
    };

    // Load script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initialize;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-950 via-purple-950/60 to-teal-900/40">
      {/* Gradient glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-fuchsia-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[26rem] w-[26rem] rounded-full bg-sky-500/20 blur-3xl" />

      <form
        onSubmit={onSubmit}
        className="relative mx-auto mt-28 w-[92%] max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:p-10"
      >
        <h1 className="text-center text-2xl font-semibold text-white sm:text-3xl">
          Welcome back
        </h1>

        {error && (
          <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-4">
          {/* Username */}
          <div className="grid gap-2">
            <label htmlFor="username" className="text-sm text-white/80">
              Username
            </label>
            <input
              id="username"
              name="username"
              placeholder="yourname"
              value={form.username}
              onChange={onChange}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/50 outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30"
              required
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm text-white/80">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/50 outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30"
              required
              autoComplete="current-password"
            />
          </div>

          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="cursor-pointer group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-sky-500 px-4 py-2.5 font-medium text-white shadow-lg shadow-fuchsia-500/20 transition hover:from-fuchsia-500 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>

          {/* Divider */}
          <div className="my-2 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-wider text-white/50">
              or
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Google Login */}
          <div className="flex w-full flex-col items-center">
            <div ref={googleBtnRef} className="w-full flex justify-center" />
            {googleLoading && (
              <div className="mt-2 text-xs text-white/70">
                Connecting to Google…
              </div>
            )}
          </div>

        <p className="mt-6 text-center text-sm text-white/80">
          Don’t have an account?{' '}
          <a
            className="text-white underline decoration-fuchsia-400/60 underline-offset-4 hover:text-fuchsia-200"
            href="/register"
          >
            Register
          </a>
        </p>
      </form>
    </main>
  );
}
