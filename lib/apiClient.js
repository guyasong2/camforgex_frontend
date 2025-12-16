export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const ROUTES = {
  stats: (userType) => `${API_BASE}/api/dashboard/stats?userType=${userType}`,
  trendingSongs: (userType, limit = 20, page = 1) =>
    `${API_BASE}/api/songs/trending?userType=${userType}&limit=${limit}&page=${page}`,
  featuredArtists: (limit = 12) => `${API_BASE}/api/artists/featured?limit=${limit}`,
  activeEvents: (userType) => `${API_BASE}/api/events/active?userType=${userType}`,
  activeChallenges: () => `${API_BASE}/api/challenges/active`,
  library: (userType) => `${API_BASE}/api/library?userType=${userType}`,
  joinChallenge: (id) => `${API_BASE}/api/challenges/${id}/join`,
  downloadSong: (id) => `${API_BASE}/api/songs/${id}/download`,
};

export async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

export const swrFetcher = (url) => fetchJSON(url);