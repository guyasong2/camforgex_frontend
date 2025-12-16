'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Zap, TrendingUp, Users, DollarSign } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
const CHALLENGES_URL = `${API_BASE}/api/challenges/`;

type TabType = 'browse' | 'create' | 'my-challenges';

interface Challenge {
  id: number;
  title: string;
  description: string;
  funding_amount: number;
  promotion_reward: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  creator: string;
  participants_count: number;
  promotions_count: number;
  created_at: string;
}

export default function ChallengePage() {
  const [tab, setTab] = useState<TabType>('browse');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create form state
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    funding_amount: '',
    promotion_reward: '',
  });

  useEffect(() => {
    fetchChallenges();
  }, [tab]);

  const fetchChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(CHALLENGES_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch challenges');
      const data = await res.json();
      setChallenges(Array.isArray(data) ? data : data.results || []);
    } catch (err: any) {
      setError(err.message);
      console.log('[v0] Error fetching challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(CHALLENGES_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: createForm.title,
          description: createForm.description,
          funding_amount: parseFloat(createForm.funding_amount),
          promotion_reward: parseFloat(createForm.promotion_reward),
        }),
      });
      if (!res.ok) throw new Error('Failed to create challenge');
      
      setCreateForm({
        title: '',
        description: '',
        funding_amount: '',
        promotion_reward: '',
      });
      await fetchChallenges();
      setTab('my-challenges');
    } catch (err: any) {
      setError(err.message);
      console.log('[v0] Error creating challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/60 to-teal-900/40">
      {/* Decorative gradient glow */}
      <div className="pointer-events-none fixed -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-fuchsia-600/20 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 right-0 h-[26rem] w-[26rem] rounded-full bg-sky-500/20 blur-3xl" />

      {/* Header */}
      <div className="relative border-b border-white/10 bg-white/5 backdrop-blur-md mt-20">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition">
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Challenges</h1>
                <p className="text-sm text-white/60">Create & fund music challenges</p>
              </div>
            </div>
            <button
              onClick={() => setTab('create')}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-sky-500 px-4 py-2 font-medium text-white hover:from-fuchsia-500 hover:to-sky-400 transition"
            >
              <Plus className="h-5 w-5" />
              New Challenge
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex gap-8">
            {(['browse', 'create', 'my-challenges'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`border-b-2 px-1 py-4 font-medium transition ${
                  tab === t
                    ? 'border-fuchsia-500 text-white'
                    : 'border-transparent text-white/60 hover:text-white/80'
                }`}
              >
                {t === 'browse' && 'Browse'}
                {t === 'create' && 'Create'}
                {t === 'my-challenges' && 'My Challenges'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
            {error}
          </div>
        )}

        {/* Browse Challenges */}
        {tab === 'browse' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center text-white/60">Loading challenges...</div>
            ) : challenges.length === 0 ? (
              <div className="col-span-full rounded-lg border border-white/10 bg-white/5 p-8 text-center">
                <p className="text-white/60">No challenges available yet</p>
              </div>
            ) : (
              challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="group rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition backdrop-blur-sm"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{challenge.title}</h3>
                      <p className="text-xs text-white/60 mt-1">by {challenge.creator}</p>
                    </div>
                    <span className="rounded-full bg-fuchsia-600/20 px-2.5 py-1 text-xs font-medium text-fuchsia-200">
                      {challenge.status}
                    </span>
                  </div>

                  <p className="mb-4 text-sm text-white/70 line-clamp-2">{challenge.description}</p>

                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white/5 p-3">
                      <div className="flex items-center gap-1 text-white/60 text-xs mb-1">
                        <DollarSign className="h-3 w-3" />
                        Funding
                      </div>
                      <p className="font-semibold text-white">${challenge.funding_amount}</p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-3">
                      <div className="flex items-center gap-1 text-white/60 text-xs mb-1">
                        <TrendingUp className="h-3 w-3" />
                        Reward/Promo
                      </div>
                      <p className="font-semibold text-white">${challenge.promotion_reward}</p>
                    </div>
                  </div>

                  <div className="mb-4 flex gap-4 text-xs text-white/60">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {challenge.participants_count} participants
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" />
                      {challenge.promotions_count} promotions
                    </div>
                  </div>

                  <button className="w-full rounded-lg bg-gradient-to-r from-fuchsia-600 to-sky-500 py-2 font-medium text-white hover:from-fuchsia-500 hover:to-sky-400 transition text-sm">
                    Join Challenge
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Challenge */}
        {tab === 'create' && (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
              <h2 className="mb-6 text-2xl font-semibold text-white">Create a New Challenge</h2>

              <form onSubmit={handleCreateChallenge} className="space-y-6">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-white/80">Challenge Title</label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="Summer Vibes Beat Challenge"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/50 outline-none focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-500/30"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-white/80">Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Describe your challenge, requirements, and what you're looking for..."
                    rows={4}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/50 outline-none focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-500/30"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-white/80">
                      Total Funding Amount
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">$</span>
                      <input
                        type="number"
                        value={createForm.funding_amount}
                        onChange={(e) => setCreateForm({ ...createForm, funding_amount: e.target.value })}
                        placeholder="1000"
                        step="50"
                        min="100"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/50 outline-none focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-500/30"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-white/80">
                      Reward Per Promotion
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">$</span>
                      <input
                        type="number"
                        value={createForm.promotion_reward}
                        onChange={(e) => setCreateForm({ ...createForm, promotion_reward: e.target.value })}
                        placeholder="50"
                        step="10"
                        min="10"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/50 outline-none focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-500/30"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 p-4">
                  <p className="text-sm text-white/80">
                    <span className="font-medium">Funding Pool:</span> Your $
                    {parseFloat(createForm.funding_amount || '0').toLocaleString()} will be distributed among promoters who help amplify your challenge.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-to-r from-fuchsia-600 to-sky-500 px-6 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/20 hover:from-fuchsia-500 hover:to-sky-400 transition disabled:opacity-60"
                >
                  {loading ? 'Creating Challenge...' : 'Create Challenge'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* My Challenges */}
        {tab === 'my-challenges' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center text-white/60">Loading your challenges...</div>
            ) : challenges.length === 0 ? (
              <div className="col-span-full rounded-lg border border-white/10 bg-white/5 p-8 text-center">
                <p className="text-white/60">You haven't created any challenges yet</p>
                <button
                  onClick={() => setTab('create')}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-2 font-medium text-white hover:bg-fuchsia-500 transition"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Challenge
                </button>
              </div>
            ) : (
              challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{challenge.title}</h3>
                      <span className="rounded-full bg-green-600/20 px-2.5 py-1 text-xs font-medium text-green-200">
                        {challenge.status}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 line-clamp-2">{challenge.description}</p>
                  </div>

                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Total Funding:</span>
                      <span className="font-semibold text-white">${challenge.funding_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Per Promotion:</span>
                      <span className="font-semibold text-white">${challenge.promotion_reward}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Promotions:</span>
                      <span className="font-semibold text-white">{challenge.promotions_count}</span>
                    </div>
                  </div>

                  <button className="w-full rounded-lg border border-white/20 py-2 font-medium text-white hover:bg-white/10 transition text-sm">
                    Manage Challenge
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
