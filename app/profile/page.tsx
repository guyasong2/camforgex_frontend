'use client';
import { useEffect, useState } from 'react';
import { getMe } from '@/lib/auth';

async function updateMe(fd: FormData) {
  const res = await fetch('/api/users/me/', { method: 'PATCH', body: fd, credentials: 'include' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update profile (${res.status}): ${text}`);
  }
  return res.json();
}

export default function ProfilePage() {
  const [form, setForm] = useState({
    username: '', first_name: '', last_name: '', email: '', display_name:'', city:'', country:''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const me = await getMe();
      setForm({
        username: me.username || '',
        email: me.email || '',
        first_name: me.first_name || '',
        last_name: me.last_name || '',
        display_name: me.display_name || '',
        city: me.city || '',
        country: me.country || '',
      });
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v ?? '')));
    if (avatarFile) fd.append('avatar', avatarFile);
    const updated = await updateMe(fd);
    setMsg('Profile updated');
    setForm({
      username: updated.username || '',
      email: updated.email || '',
      first_name: updated.first_name || '',
      last_name: updated.last_name || '',
      display_name: updated.display_name || '',
      city: updated.city || '',
      country: updated.country || '',
    });
  };

  return (
    <main className="max-w-4xl mx-auto p-6 mt-40 mb-5 border-2">
      <h1 className="text-xl font-semibold mb-4 text-center">Edit Profile</h1>
      {msg && <p className="text-green-600 text-sm">{msg}</p>}
      <form onSubmit={onSubmit} className="space-y-3 max-w-md">
        <input
          className="w-full border rounded p-2"
          onChange={e => setAvatarFile(e.target.files?.[0] || null)}
          type="file"
        />
        {/* your other inputs… */}
        <button className="bg-indigo-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </main>
  );
}