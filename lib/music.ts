export type Genre = 'makossa' | 'bikutsi' | 'bendskin' | 'assiko' | 'mbole' | 'pop' | 'afrobeats' | 'ndombolo';

const ROUTES = {
  // Change these to match your backend if different
  uploadVocal: '/api/music/uploads/',              // POST multipart: {file}
  uploadVoiceSample: '/api/music/voice-samples/',  // POST multipart: {file}
  tracks: '/api/music/tracks/',                    // POST create JSON or multipart, GET list
  track: (id: string | number) => `/api/music/tracks/${id}/`,                // GET/PATCH
  generate: (id: string | number) => `/api/music/tracks/${id}/generate/`,   // POST
  status: (id: string | number) => `/api/music/tracks/${id}/status/`,       // GET
};

async function throwIfNotOk(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} - ${text}`);
  }
}

export async function uploadVocal(file: File) {
  const fd = new FormData();
  fd.append('file', file, file.name);
  const res = await fetch(ROUTES.uploadVocal, { method: 'POST', body: fd, credentials: 'include' });
  await throwIfNotOk(res);
  return res.json() as Promise<{ id: string; url?: string }>;
}

export async function uploadVoiceSample(file: File) {
  const fd = new FormData();
  fd.append('file', file, file.name);
  const res = await fetch(ROUTES.uploadVoiceSample, { method: 'POST', body: fd, credentials: 'include' });
  await throwIfNotOk(res);
  return res.json() as Promise<{ id: string }>;
}

export interface CreateTrackPayload {
  title?: string;
  genre: Genre;
  lyrics: string;
  vocal_upload_id: string;       // returned by uploadVocal
  voice_sample_id?: string;      // optional
}
export interface Track {
  id: string;
  title?: string;
  genre: Genre;
  status: 'created' | 'queued' | 'processing' | 'ready' | 'failed';
  progress?: number;
  audio_url?: string;
  lyrics?: string;
  settings?: { tempo?: number; energy?: number; bass?: number; treble?: number; };
}

export async function createTrack(payload: CreateTrackPayload) {
  const res = await fetch(ROUTES.tracks, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  await throwIfNotOk(res);
  return res.json() as Promise<Track>;
}

export async function startGeneration(trackId: string) {
  const res = await fetch(ROUTES.generate(trackId), { method: 'POST', credentials: 'include' });
  await throwIfNotOk(res);
  return res.json() as Promise<{ job_id: string }>;
}

export async function getTrack(trackId: string) {
  const res = await fetch(ROUTES.track(trackId), { method: 'GET', credentials: 'include', cache: 'no-store' });
  await throwIfNotOk(res);
  return res.json() as Promise<Track>;
}

export async function getStatus(trackId: string) {
  const res = await fetch(ROUTES.status(trackId), { method: 'GET', credentials: 'include', cache: 'no-store' });
  await throwIfNotOk(res);
  return res.json() as Promise<{ status: Track['status']; progress: number }>;
}

export async function updateTrack(trackId: string, patch: Partial<Track> & { lyrics?: string; title?: string }) {
  const res = await fetch(ROUTES.track(trackId), {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(patch),
    credentials: 'include',
  });
  await throwIfNotOk(res);
  return res.json() as Promise<Track>;
}

export async function pollUntilReady(trackId: string, onProgress?: (p: number) => void, signal?: AbortSignal) {
  // Poll /status first if available, else fallback to GET /track
  const poll = async () => {
    try {
      const s = await getStatus(trackId);
      onProgress?.(s.progress ?? 0);
      return s.status;
    } catch {
      const t = await getTrack(trackId);
      onProgress?.(t.progress ?? 0);
      return t.status;
    }
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (signal?.aborted) throw new Error('Aborted');
    const status = await poll();
    if (status === 'ready' || status === 'failed') return status;
    await new Promise(r => setTimeout(r, 1500));
  }
}