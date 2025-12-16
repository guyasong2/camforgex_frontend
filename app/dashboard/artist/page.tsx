'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Music,
  Upload as UploadIcon,
  Trophy,
  Bell,
  Plus,
  BarChart3,
  Zap,
  User,
  Edit3,
  Save,
  X,
  Loader2,
  Mail,
  Globe,
  MapPin,
  Link as LinkIcon,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// =========================
// Config
// =========================
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://camforgex.onrender.com/';
const ME_PATH = '/api/users/me/'; // Change if your backend differs
const LOGIN_ROUTE = '/login';

// Helper to call API with Bearer token from localStorage
async function apiFetch(pathOrUrl: string, options: RequestInit = {}) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${API_BASE}${pathOrUrl}`;
  const headers = new Headers(options.headers || {});
  const access = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  }
  if (access) headers.set('Authorization', `Bearer ${access}`);

  const res = await fetch(url, { ...options, headers });
  return res;
}

// =========================
// Types
// =========================
interface Notification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
}

interface UploadItem {
  id: number;
  title: string;
  genre: string;
  plays: number;
  date: string;
}

interface ArtistProfile {
  id?: number;
  username?: string;
  email?: string;
  role?: string;
  display_name?: string;
  bio?: string;
  location?: string;
  website?: string;
  instagram?: string;
  soundcloud?: string;
  spotify?: string;
  avatar_url?: string;
}

// =========================
export default function DashboardPage() {
  const router = useRouter();

  // Gate
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Header name
  const [userName, setUserName] = useState<string>('Artist');

  // Sidebar profile data
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [form, setForm] = useState<ArtistProfile>({});
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Notifications and tips
  const [notifications] = useState<Notification[]>([
    { id: 1, text: "Your song 'Chacun Sa Chance' reached 1K plays!", time: "2h ago", unread: true },
  ]);

  const recentUploads: UploadItem[] = [
    { id: 1, title: "Summer Vibes", genre: "Afrobeat", plays: 1247, date: "2 days ago" },
  ];

  const tips: string[] = [
    "Tip: Upload consistently to build your audience. Aim for at least one track per week.",
    "Pro Tip: Engage with other artists' work to increase your visibility.",
    "Trending: Lo-fi beats and chill hop are getting major traction this month!",
    "Challenge Alert: R&B tracks are in high demand. Join the current challenge!"
  ];
  const [currentTip, setCurrentTip] = useState<number>(0);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auth check + load profile
  useEffect(() => {
    let cancelled = false;

    const goLogin = () => {
      if (typeof window === 'undefined') return;
      const next = encodeURIComponent(window.location.pathname);
      router.replace(`${LOGIN_ROUTE}?next=${next}`);
    };

    (async () => {
      try {
        // 1) Require access token
        const access = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        if (!access) {
          goLogin();
          return;
        }

        // 2) Verify token by loading profile
        setLoadingProfile(true);
        setError(null);

        const res = await apiFetch(ME_PATH);
        const ct = res.headers.get('content-type') || '';
        const data = ct.includes('application/json') ? await res.json() : await res.text();

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            goLogin();
            return;
          }
          const msg =
            typeof data === 'object' && data
              ? Object.values(data)[0]
              : typeof data === 'string'
              ? data
              : 'Failed to load profile';
          throw new Error(String(msg));
        }

        if (cancelled) return;

        setProfile(data);
        setForm({
          display_name: data.display_name || '',
          email: data.email || '',
          username: data.username || '',
          role: (data.role || '').toString(),
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          instagram: data.instagram || '',
          soundcloud: data.soundcloud || '',
          spotify: data.spotify || '',
          avatar_url: data.avatar_url || '',
        });

        // Update header name and persist
        const nameForHeader = data.display_name || data.username || 'Artist';
        setUserName(nameForHeader);
        localStorage.setItem('userName', nameForHeader);
      } catch (e: any) {
        if (!cancelled) {
          console.error(e);
          setError(e?.message || 'Could not load profile');
        }
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
          setAuthChecking(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Track if form changed
  const isDirty = useMemo(() => {
    if (!profile) return false;
    const keys = [
      'display_name',
      'email',
      'username',
      'role',
      'bio',
      'location',
      'website',
      'instagram',
      'soundcloud',
      'spotify',
      'avatar_url',
    ] as const;

    return keys.some((k) => (form as any)[k] !== (profile as any)[k] && (form as any)[k] !== undefined);
  }, [form, profile]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save changes
  const onSave = async () => {
    if (!profile || !isDirty) {
      setEditMode(false);
      return;
    }

    setSaving(true);
    setError(null);

    // Build minimal payload of changed fields
    const payload: Partial<ArtistProfile> = {};
    Object.keys(form).forEach((k) => {
      const key = k as keyof ArtistProfile;
      if (form[key] !== profile[key]) {
        payload[key] = form[key] as any;
      }
    });

    try {
      const res = await apiFetch(ME_PATH, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : await res.text();

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // Token expired while editing
          const next = encodeURIComponent(window.location.pathname);
          router.replace(`${LOGIN_ROUTE}?next=${next}`);
          return;
        }
        const msg =
          typeof data === 'object' && data
            ? Object.values(data)[0]
            : typeof data === 'string'
            ? data
            : 'Failed to save profile';
        throw new Error(String(msg));
      }

      // Merge and update UI
      const updated = { ...profile, ...payload, ...(typeof data === 'object' ? data : {}) };
      setProfile(updated);
      setForm({
        display_name: updated.display_name || '',
        email: updated.email || '',
        username: updated.username || '',
        role: (updated.role || '').toString(),
        bio: updated.bio || '',
        location: updated.location || '',
        website: updated.website || '',
        instagram: updated.instagram || '',
        soundcloud: updated.soundcloud || '',
        spotify: updated.spotify || '',
        avatar_url: updated.avatar_url || '',
      });

      const nameForHeader = updated.display_name || updated.username || 'Artist';
      setUserName(nameForHeader);
      localStorage.setItem('userName', nameForHeader);

      setEditMode(false);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    if (!profile) return;
    setForm({
      display_name: profile.display_name || '',
      email: profile.email || '',
      username: profile.username || '',
      role: (profile.role || '').toString(),
      bio: profile.bio || '',
      location: profile.location || '',
      website: profile.website || '',
      instagram: profile.instagram || '',
      soundcloud: profile.soundcloud || '',
      spotify: profile.spotify || '',
      avatar_url: profile.avatar_url || '',
    });
    setEditMode(false);
    setError(null);
  };

  // Quick Actions
  const quickActions = [
    {
      icon: Plus,
      label: "Create Music",
      color: "bg-gradient-to-br from-purple-500 via-purple-600 to-blue-500",
      href: "/dashboard/create"
    },
    {
      icon: UploadIcon,
      label: "Upload Music",
      color: "bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500",
      href: "/dashboard/upload"
    },
    {
      icon: BarChart3,
      label: "View Analytics",
      color: "bg-gradient-to-br from-teal-500 via-green-500 to-emerald-500",
      href: "/analytics"
    },
    {
      icon: Trophy,
      label: "Challenges",
      color: "bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700",
      href: "/dashboard/challenges"
    }
  ];

  // Gate: while checking auth, show nothing else
  if (authChecking) {
    return (
      <div
        className="min-h-screen mt-40 grid place-items-center text-white"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #2d1b69 35%, #0f4c75 70%, #16697a 100%)'
        }}
      >
        <div className="flex items-center gap-3 text-white/80">
          <Loader2 className="h-5 w-5 animate-spin" />
          Checking session…
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #2d1b69 35%, #0f4c75 70%, #16697a 100%)'
      }}
    >
      {/* Animated visualizer bars background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-96">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-green-400 via-cyan-400 via-purple-400 to-pink-400"
              style={{
                height: `${Math.random() * 100}%`,
                animation: `pulse ${0.8 + Math.random() * 1.5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome Back, {userName}
            </h1>
            <p className="text-gray-300 mt-1">Ready to make some art today?</p>
          </div>

          <div className="relative">
            <Bell className="w-6 h-6 cursor-pointer hover:text-cyan-400 transition" />
            {notifications.filter(n => n.unread).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.filter(n => n.unread).length}
              </span>
            )}
          </div>
        </div>

        {/* Layout: Sidebar + Main */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from	fuchsia-500 to-cyan-500 flex items-center justify-center text-2xl font-bold">
                  {(form.display_name || form.username || 'A').slice(0, 1).toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {form.display_name || form.username || 'Artist'}
                </div>
                <div className="text-xs text-white/70 flex items-center gap-1">
                  <Shield size={14} /> {(form.role || 'ARTIST').toString()}
                </div>
              </div>
            </div>

            {loadingProfile ? (
              <div className="flex items-center gap-2 text-white/80">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading profile…
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 mb-4">
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15 transition"
                    >
                      <Edit3 size={16} /> Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={onSave}
                        disabled={saving || !isDirty}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-sky-500 px-3 py-2 text-sm text-white hover:from-fuchsia-500 hover:to-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                        Save
                      </button>
                      <button
                        onClick={onCancel}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15 transition"
                      >
                        <X size={16} /> Cancel
                      </button>
                    </>
                  )}
                </div>

                {/* Editable fields */}
                <div className="space-y-3">
                  <Field
                    icon={<User size={16} />}
                    label="Display name"
                    name="display_name"
                    value={form.display_name || ''}
                    onChange={onChange}
                    placeholder="Your stage name"
                    disabled={!editMode}
                  />
                  <Field
                    icon={<User size={16} />}
                    label="Username"
                    name="username"
                    value={form.username || ''}
                    onChange={onChange}
                    placeholder="username"
                    disabled={!editMode}
                  />
                  <Field
                    icon={<Mail size={16} />}
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email || ''}
                    onChange={onChange}
                    placeholder="you@example.com"
                    disabled={!editMode}
                  />
                  <Field
                    icon={<MapPin size={16} />}
                    label="Location"
                    name="location"
                    value={form.location || ''}
                    onChange={onChange}
                    placeholder="City, Country"
                    disabled={!editMode}
                  />
                  <Field
                    icon={<Globe size={16} />}
                    label="Website"
                    name="website"
                    value={form.website || ''}
                    onChange={onChange}
                    placeholder="https://your-site.com"
                    disabled={!editMode}
                  />
                  <Field
                    icon={<LinkIcon size={16} />}
                    label="Instagram"
                    name="instagram"
                    value={form.instagram || ''}
                    onChange={onChange}
                    placeholder="@yourhandle or link"
                    disabled={!editMode}
                  />
                  <Field
                    icon={<LinkIcon size={16} />}
                    label="SoundCloud"
                    name="soundcloud"
                    value={form.soundcloud || ''}
                    onChange={onChange}
                    placeholder="https://soundcloud.com/you"
                    disabled={!editMode}
                  />
                  <Field
                    icon={<LinkIcon size={16} />}
                    label="Spotify"
                    name="spotify"
                    value={form.spotify || ''}
                    onChange={onChange}
                    placeholder="Artist link"
                    disabled={!editMode}
                  />

                  <div className="grid gap-1">
                    <label className="text-xs text-white/70">Bio</label>
                    <textarea
                      name="bio"
                      value={form.bio || ''}
                      onChange={onChange}
                      placeholder="Tell your audience about yourself..."
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/50 outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30 min-h-[90px]"
                      disabled={!editMode}
                    />
                  </div>
                </div>
              </>
            )}
          </aside>

          {/* Main Content */}
          <main>
            {/* Tip Panel */}
            <div className="bg-gradient-to-r from-purple-600/80 via-blue-600/80 to-teal-600/80 rounded-2xl p-4 mb-6 flex items-center space-x-3 shadow-lg backdrop-blur-md border border-white/10">
              <Zap className="w-6 h-6 text-yellow-300 mr-3" />
              <div>
                <p className="font-semibold">{tips[currentTip]}</p>
                <p className="text-sm text-gray-300">Tip of the moment</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {quickActions.map((action, idx) => {
                const IconComponent = action.icon;
                return (
                  <Link
                    key={idx}
                    href={action.href}
                    className={`${action.color} p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition duration-300 flex flex-col items-center justify-center space-y-3 backdrop-blur-sm no-underline`}
                  >
                    <IconComponent className="w-10 h-10" />
                    <span className="font-semibold text-lg">{action.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Recent Uploads (example content) */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
              <h2 className="text-xl font-semibold mb-3">Recent Uploads</h2>
              <div className="grid gap-3">
                {recentUploads.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Music className="h-6 w-6 text-cyan-300" />
                      <div>
                        <div className="font-medium">{u.title}</div>
                        <div className="text-xs text-white/70">{u.genre} • {u.date}</div>
                      </div>
                    </div>
                    <div className="text-sm text-white/80">{u.plays.toLocaleString()} plays</div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Local keyframes for the background bars */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

// Small field component for the sidebar
function Field(props: {
  icon?: React.ReactNode;
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  type?: string;
}) {
  const { icon, label, name, value, placeholder, onChange, disabled, type = 'text' } = props;
  return (
    <div className="grid gap-1">
      <label className="text-xs text-white/70">{label}</label>
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 focus-within:border-purple-400/60 focus-within:ring-2 focus-within:ring-purple-500/30">
        {icon && <span className="text-white/60">{icon}</span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder-white/50 outline-none text-sm"
          disabled={disabled}
        />
      </div>
    </div>
  );
}