'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getMe } from '@/lib/auth';
import { clearTokens } from '@/lib/api';
import { useRouter } from 'next/navigation';

const dashboardForRole = (role) =>
  (role || '').toLowerCase() === 'artist' ? '/dashboard/artist' : '/dashboard/users';

export default function Navbar() {
  const [me, setMe] = useState(null);
  const [open, setOpen] = useState(false); // <- was missing
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await getMe();
        if (mounted) setMe(user);
      } catch {
        if (mounted) setMe(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const logout = () => {
    clearTokens();
    setMe(null);
    router.push('/login');
  };

  const dashboardPath = dashboardForRole(me?.role);

  return (
    <nav className="w-full fixed top-0 left-0 z-50 px-6 py-3 sm:py-4 backdrop-blur-sm mb-40">
      <div className="flex justify-between items-center sm:max-w-[80%] max-w-7xl mx-auto p-2.5 rounded-full border bg-black/50 border-white/10">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo/logo.jpg"
            alt="CamForgeX Logo"
            width={50}
            height={50}
            className="w-10 h-10 object-contain"
            priority
          />
          <h1 className="text-xl sm:text-2xl font-bold text-white">CamForgeX</h1>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-4">
          {me ? (
            <>
              <Link
                href={dashboardPath}
                className="px-6 py-2 bg-white/80 text-black rounded-full font-semibold hover:bg-white transition"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="px-6 py-2 border border-white/30 rounded-full text-white hover:bg-white/10 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-6 py-2 border border-white/30 rounded-full text-white hover:bg-white/10 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-white/80 text-black rounded-full font-semibold hover:bg-white transition"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu icon */}
        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="md:hidden flex flex-col gap-1.5"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`h-0.5 w-6 bg-white transition ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`h-0.5 w-6 bg-white transition ${open ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-white transition ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden mt-4 px-4 py-4 flex flex-col gap-3 bg-transparent border-none shadow-none"
        >
          {me ? (
            <>
              <Link
                href={dashboardPath}
                onClick={() => setOpen(false)}
                className="w-full text-center py-2 bg-white/80 text-black rounded-full font-semibold hover:bg-white"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full text-center py-2 border border-white/30 rounded-full text-white hover:bg-white/10"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full text-center py-2 border border-white/30 rounded-full text-white hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="w-full text-center py-2 bg-white/80 text-black rounded-full font-semibold hover:bg-white"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}