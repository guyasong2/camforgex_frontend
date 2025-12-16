'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Upload,
  Play,
  Pause,
  Wand2,
  Music2,
  Sparkles,
  Download,
  Share2,
  Volume2,
  Radio,
  Zap,
  RotateCcw,
  Settings,
  Waves,
  User,
  FileText,
  Youtube,
  AlertCircle,
  Check,
  Loader,
} from 'lucide-react';

type Step = 'input' | 'voiceClone' | 'lyrics' | 'genre' | 'processing' | 'result';
type Genre =
  | 'makossa'
  | 'bikutsi'
  | 'bendskin'
  | 'assiko'
  | 'mbole'
  | 'pop'
  | 'afrobeats'
  | 'ndombolo';

interface GenreOption {
  id: Genre;
  name: string;
  emoji: string;
  gradient: string;
  description: string;
}

interface Track {
  id: string;
  title: string;
  genre: Genre;
  audio_file: string;
  voice_clone_file?: string;
  lyrics: string;
  status: 'draft' | 'processing' | 'completed' | 'UPLOADED';
  created_at: string;
  updated_at: string;
}

interface FinetuneSettings {
  tempo: number;
  energy: number;
  bass: number;
  treble: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getOwnerId = () => {
  if (typeof window === 'undefined') return null;
  const userId = localStorage.getItem('user_id');
  if (!userId) {
    console.warn('[v0] No user_id found in localStorage. User may not be logged in.');
  }
  return userId ? parseInt(userId) : null;
};

// FIXED: always return Record<string, string>, which is compatible with HeadersInit
const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};

  if (typeof window === 'undefined') {
    return headers;
  }

  const token =
    localStorage.getItem('access_token') || localStorage.getItem('token');

  console.log(
    '[v0] Auth token from localStorage:',
    token ? 'Found' : 'Not found'
  );

  if (!token) {
    console.warn('[v0] No auth token found. User may not be logged in.');
    return headers;
  }

  headers.Authorization = `Bearer ${token}`;
  return headers;
};

export default function MusicCreationPage() {
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingFinal, setIsPlayingFinal] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSample, setVoiceSample] = useState<File | null>(null);
  const [lyrics, setLyrics] = useState('');
  const [isVoiceCloned, setIsVoiceCloned] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [finalMusicUrl, setFinalMusicUrl] = useState<string | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finetuneSettings, setFinetuneSettings] = useState<FinetuneSettings>({
    tempo: 120,
    energy: 70,
    bass: 60,
    treble: 50,
  });
  const [trackTitle, setTrackTitle] = useState('My AI Track');

  // FIXED: useRef<T | null>(null) so null is assignable
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const voiceInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finalAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const genres: GenreOption[] = [
    {
      id: 'makossa',
      name: 'Makossa',
      emoji: '💃',
      gradient: 'from-yellow-500 to-red-500',
      description: 'Rhythmic & danceable',
    },
    {
      id: 'bikutsi',
      name: 'Bikutsi',
      emoji: '🥁',
      gradient: 'from-green-500 to-blue-500',
      description: 'Energetic & traditional',
    },
    {
      id: 'bendskin',
      name: 'Bend-skin',
      emoji: '🎶',
      gradient: 'from-purple-500 to-pink-500',
      description: 'Urban & modern',
    },
    {
      id: 'assiko',
      name: 'Assiko',
      emoji: '🎺',
      gradient: 'from-orange-500 to-red-600',
      description: 'Festive & celebratory',
    },
    {
      id: 'mbole',
      name: 'Mbole',
      emoji: '🎵',
      gradient: 'from-teal-500 to-cyan-500',
      description: 'Traditional & cultural',
    },
    {
      id: 'pop',
      name: 'Afro Pop',
      emoji: '🎤',
      gradient: 'from-pink-500 to-purple-500',
      description: 'Modern & catchy',
    },
    {
      id: 'afrobeats',
      name: 'Afrobeats',
      emoji: '⚡',
      gradient: 'from-amber-500 to-orange-600',
      description: 'Trendy & rhythmic',
    },
    {
      id: 'ndombolo',
      name: 'Ndombolo',
      emoji: '🔥',
      gradient: 'from-red-500 to-yellow-500',
      description: 'Energetic & danceable',
    },
  ];

  const createTrack = async (audioFile: File): Promise<Track | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const duration = await new Promise<number>((resolve) => {
        const audio = new Audio(URL.createObjectURL(audioFile));
        audio.onloadedmetadata = () => {
          resolve(Math.round(audio.duration));
        };
        audio.onerror = () => resolve(0);
      });

      const formData = new FormData();
      formData.append('original_file', audioFile);
      formData.append('title', trackTitle);
      formData.append('status', 'UPLOADED');
      formData.append('duration_seconds', duration.toString());
      formData.append('bpm', '120');

      const ownerId = getOwnerId();
      if (ownerId) {
        formData.append('owner', ownerId.toString());
      } else {
        setError('User ID not found. Please log in again.');
        return null;
      }

      const headers = getAuthHeaders();
      console.log('[v0] Creating track with headers:', headers);
      console.log('[v0] API URL:', API_BASE_URL);

      const response = await fetch(`${API_BASE_URL}/api/music/tracks/`, {
        method: 'POST',
        body: formData,
        headers,
      });

      console.log('[v0] Create track response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('[v0] Error response body:', errorText);

        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('token');
          localStorage.removeItem('user_id');
          return null;
        }
        throw new Error(
          `Failed to create track: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const track: Track = await response.json();
      setCurrentTrack(track);
      console.log('[v0] Track created successfully:', track);
      return track;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create track';
      setError(errorMessage);
      console.error('[v0] Error creating track:', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTrackWithVoiceClone = async (
    trackId: string,
    voiceFile: File
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('voice_clone_file', voiceFile);

      console.log('[v0] Updating track with voice clone:', trackId);
      const response = await fetch(
        `${API_BASE_URL}/api/music/tracks/${trackId}/`,
        {
          method: 'PATCH',
          body: formData,
          headers: getAuthHeaders(),
        }
      );

      console.log('[v0] Voice clone response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('[v0] Error response:', errorText);
        throw new Error(
          `Failed to update track: ${response.status} ${response.statusText}`
        );
      }

      const updatedTrack: Track = await response.json();
      setCurrentTrack(updatedTrack);
      console.log('[v0] Track updated with voice clone:', updatedTrack);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update track';
      setError(errorMessage);
      console.error('[v0] Error updating track:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const applyFinetune = async (trackId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[v0] Applying finetune settings:', finetuneSettings);
      const response = await fetch(
        `${API_BASE_URL}/api/music/tracks/${trackId}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            finetune_settings: finetuneSettings,
          }),
        }
      );

      console.log('[v0] Finetune response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('[v0] Error response:', errorText);
        throw new Error(
          `Failed to apply finetune: ${response.status} ${response.statusText}`
        );
      }

      const updatedTrack: Track = await response.json();
      setCurrentTrack(updatedTrack);
      console.log('[v0] Finetune settings applied:', updatedTrack);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to apply finetune';
      setError(errorMessage);
      console.error('[v0] Error applying finetune:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrack = async (trackId: string): Promise<Track | null> => {
    try {
      console.log('[v0] Fetching track:', trackId);
      const response = await fetch(
        `${API_BASE_URL}/api/music/tracks/${trackId}/`,
        {
          headers: {
            Accept: 'application/json',
            ...getAuthHeaders(),
          },
        }
      );

      console.log('[v0] Fetch track response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('[v0] Error response:', errorText);
        throw new Error(
          `Failed to fetch track: ${response.status} ${response.statusText}`
        );
      }

      const track: Track = await response.json();
      console.log('[v0] Track fetched:', track);
      return track;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch track';
      console.error('[v0] Error fetching track:', errorMessage);
      return null;
    }
  };

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
    }
  }, [audioUrl]);

  useEffect(() => {
    if (finalAudioRef.current && finalMusicUrl) {
      finalAudioRef.current.src = finalMusicUrl;
    }
  }, [finalMusicUrl]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (finalAudioRef.current) {
      if (isPlayingFinal) {
        finalAudioRef.current.play().catch(console.error);
      } else {
        finalAudioRef.current.pause();
      }
    }
  }, [isPlayingFinal]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);

        const file = new File([audioBlob], 'recording.wav', {
          type: 'audio/wav',
        });
        setUploadedFile(file);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setUploadedFile(null);
      setAudioUrl(null);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const handleVoiceSampleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVoiceSample(file);
    }
  };

  const handleGenreSelect = async (genre: Genre) => {
    setSelectedGenre(genre);
    setCurrentStep('processing');
    setAiProgress(0);

    const interval = setInterval(() => {
      setAiProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    if (currentTrack) {
      const success = await applyFinetune(currentTrack.id);
      if (success) {
        let attempts = 0;
        const pollInterval = setInterval(async () => {
          attempts++;
          const track = await fetchTrack(currentTrack.id);

          if (track && track.status === 'completed') {
            clearInterval(pollInterval);
            clearInterval(interval);
            setAiProgress(100);

            if (track.audio_file) {
              const audioPath = track.audio_file.startsWith('http')
                ? track.audio_file
                : `${API_BASE_URL}${track.audio_file}`;
              setFinalMusicUrl(audioPath);
            }
            setCurrentStep('result');
          } else if (attempts > 30) {
            clearInterval(pollInterval);
            clearInterval(interval);
            setAiProgress(100);
            setCurrentStep('result');
          }
        }, 1000);
      }
    }
  };

  const handleNextFromInput = async () => {
    if (!uploadedFile) {
      setError('Please record or upload audio first');
      return;
    }

    const track = await createTrack(uploadedFile);
    if (track) {
      if (selectedGenre) {
        await fetch(`${API_BASE_URL}/api/music/tracks/${track.id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ genre: selectedGenre, lyrics }),
        });
      }
      setCurrentStep('voiceClone');
    }
  };

  const handleVoiceCloneSubmit = async () => {
    if (!voiceSample || !currentTrack) {
      setError('Please upload a voice sample');
      return;
    }

    const success = await updateTrackWithVoiceClone(currentTrack.id, voiceSample);
    if (success) {
      setIsVoiceCloned(true);
      setCurrentStep('lyrics');
    }
  };

  const handleReset = () => {
    setCurrentStep('input');
    setSelectedGenre(null);
    setIsRecording(false);
    setRecordingTime(0);
    setUploadedFile(null);
    setAiProgress(0);
    setIsPlaying(false);
    setIsPlayingFinal(false);
    setVoiceSample(null);
    setLyrics('');
    setIsVoiceCloned(false);
    setAudioUrl(null);
    setFinalMusicUrl(null);
    setShowShareOptions(false);
    setCurrentTrack(null);
    setError(null);
    setTrackTitle('My AI Track');

    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (finalMusicUrl) URL.revokeObjectURL(finalMusicUrl);
  };

  const selectedGenreInfo = selectedGenre
    ? genres.find((g) => g.id === selectedGenre)
    : null;

  const shareToPlatform = (
    platform: 'youtube' | 'spotify' | 'tiktok' | 'instagram'
  ) => {
    const songTitle = `${trackTitle} - ${selectedGenreInfo?.name ?? ''} Track`;
    const hashtags = `AIMusic,${selectedGenreInfo?.name ?? ''},CameroonMusic,${
      selectedGenreInfo?.name ?? ''
    }Music`;

    let url = '';
    switch (platform) {
      case 'youtube':
        url = `https://www.youtube.com/upload?title=${encodeURIComponent(
          songTitle
        )}&description=${encodeURIComponent(hashtags)}`;
        window.open(url, '_blank');
        break;
      case 'spotify':
        alert(
          'Spotify integration would be implemented here with proper API setup'
        );
        break;
      case 'tiktok':
        url = `https://www.tiktok.com/upload?description=${encodeURIComponent(
          songTitle + ' ' + hashtags
        )}`;
        window.open(url, '_blank');
        break;
      case 'instagram':
        alert('Share this track on Instagram Stories or Reels');
        break;
    }
  };

  const downloadMusic = () => {
    if (finalMusicUrl) {
      const a = document.createElement('a');
      a.href = finalMusicUrl;
      a.download = `${trackTitle}-${selectedGenreInfo?.name ?? 'Track'}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div
      className="min-h-screen text-white p-4 md:p-8 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #1a1a2e 0%, #2d1b69 35%, #0f4c75 70%, #16697a 100%)',
      }}
    >
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      <audio
        ref={finalAudioRef}
        onEnded={() => setIsPlayingFinal(false)}
      />

      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-full">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="w-0.5 bg-gradient-to-t from-green-400 via-cyan-400 to-purple-400"
              style={{
                height: `${Math.random() * 100}%`,
                animation: `pulse ${
                  0.6 + Math.random() * 1.2
                }s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">
            AI Music Studio Cameroon
          </h1>
          <p className="text-gray-300 text-lg">
            Transform your voice into professional Cameroonian music
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500/50 rounded-2xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-200 font-semibold">Error</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-300 hover:text-red-200"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center justify-center mb-12 space-x-4 overflow-x-auto">
          {[
            { id: 'input', label: 'Record/Upload', icon: Mic },
            { id: 'voiceClone', label: 'Clone Voice', icon: User },
            { id: 'lyrics', label: 'Add Lyrics', icon: FileText },
            { id: 'genre', label: 'Choose Genre', icon: Radio },
            { id: 'processing', label: 'AI Magic', icon: Wand2 },
            { id: 'result', label: 'Your Song', icon: Music2 },
          ].map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted =
              ['input', 'voiceClone', 'lyrics', 'genre', 'processing', 'result'].indexOf(
                currentStep
              ) > index;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex flex-col items-center ${
                    index > 0 ? 'ml-4' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 scale-110 shadow-lg'
                        : isCompleted
                        ? 'bg-gradient-to-r from-green-500 to-teal-500'
                        : 'bg-slate-700/50'
                    }`}
                  >
                    <StepIcon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <span
                    className={`text-xs mt-2 text-center ${
                      isActive
                        ? 'text-cyan-400 font-semibold'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < 5 && (
                  <div
                    className={`w-4 md:w-8 h-0.5 mx-1 md:mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-700/50'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-12 shadow-2xl border border-white/10">
          {currentStep === 'input' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Let's Get Your Audio</h2>
                <p className="text-gray-400">
                  Record directly or upload an existing file
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-white/5">
                {!isRecording && !uploadedFile && !recordingTime && (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center border-4 border-cyan-500/30">
                      <Mic className="w-10 h-10 md:w-16 md:h-16 text-cyan-400" />
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                      <button
                        onClick={startRecording}
                        className="flex items-center space-x-3 bg-gradient-to-r from-red-500 to-pink-600 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                        disabled={isLoading}
                      >
                        <Mic className="w-5 h-5 md:w-6 md:h-6" />
                        <span>Start Recording</span>
                      </button>
                      <span className="text-gray-500">or</span>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-cyan-600 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                        disabled={isLoading}
                      >
                        <Upload className="w-5 h-5 md:w-6 md:h-6" />
                        <span>Upload File</span>
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {isRecording && (
                  <div className="text-center space-y-6">
                    <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-gradient-to-br from-red-500/30 to-pink-500/30 rounded-full flex items-center justify-center border-4 border-red-500/50 animate-pulse">
                      <div className="text-center">
                        <Waves className="w-8 h-8 md:w-12 md:h-12 text-red-400 mx-auto mb-2" />
                        <div className="text-2xl md:text-3xl font-bold text-red-400">
                          {formatTime(recordingTime)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-1 h-20 md:h-24">
                      {[...Array(30)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gradient-to-t from-red-500 to-pink-400 rounded-full"
                          style={{
                            height: `${30 + Math.random() * 70}%`,
                            animation: `pulse ${
                              0.4 + Math.random() * 0.6
                            }s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 0.4}s`,
                          }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={stopRecording}
                      className="bg-gradient-to-r from-red-600 to-red-700 px-8 md:px-10 py-3 md:py-4 rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
                    >
                      Stop Recording
                    </button>
                  </div>
                )}

                {(recordingTime > 0 || uploadedFile) &&
                  !isRecording && (
                    <div className="text-center space-y-6">
                      <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full flex items-center justify-center border-4 border-green-500/30">
                        <Music2 className="w-10 h-10 md:w-16 md:h-16 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-green-400 mb-2">
                          Audio Ready!
                        </h3>
                        {uploadedFile ? (
                          <p className="text-gray-400">{uploadedFile.name}</p>
                        ) : (
                          <p className="text-gray-400">
                            Duration: {formatTime(recordingTime)}
                          </p>
                        )}
                      </div>

                      {audioUrl && (
                        <div className="bg-slate-700/30 rounded-xl p-4 max-w-md mx-auto">
                          <div className="flex items-center justify-center space-x-1 h-20 md:h-24 mb-4">
                            {[...Array(20)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-1 bg-gradient-to-t from-cyan-400 to-purple-400 rounded-full transition-all ${
                                  isPlaying ? 'animate-pulse' : ''
                                }`}
                                style={{
                                  height: `${20 + Math.random() * 60}%`,
                                  animationDelay: `${i * 0.05}s`,
                                }}
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-center gap-4">
                            <button
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all"
                            >
                              {isPlaying ? (
                                <Pause className="w-6 h-6" />
                              ) : (
                                <Play className="w-6 h-6 ml-0.5" />
                              )}
                            </button>
                            <div className="flex items-center space-x-2 text-gray-400">
                              <Volume2 className="w-4 h-4" />
                              <div className="w-24 h-2 bg-slate-600 rounded-full overflow-hidden">
                                <div className="w-3/4 h-full bg-gradient-to-r from-cyan-500 to-purple-500" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <label className="block text-sm text-gray-300">
                          Track Title
                        </label>
                        <input
                          type="text"
                          value={trackTitle}
                          onChange={(e) => setTrackTitle(e.target.value)}
                          placeholder="Enter track title"
                          className="w-full max-w-md mx-auto bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
                        <button
                          onClick={handleNextFromInput}
                          disabled={isLoading}
                          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-cyan-500 px-6 md:px-8 py-2 md:py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <span>Next: Voice Clone</span>
                              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setRecordingTime(0);
                            setUploadedFile(null);
                            setAudioUrl(null);
                            setIsPlaying(false);
                            if (audioUrl) URL.revokeObjectURL(audioUrl);
                          }}
                          className="flex items-center space-x-2 bg-slate-700 px-4 md:px-6 py-2 md:py-3 rounded-xl hover:bg-slate-600 transition"
                        >
                          <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {currentStep === 'voiceClone' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Clone Your Voice</h2>
                <p className="text-gray-400">
                  Upload a voice sample to create your AI voice model
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-white/5">
                {!isVoiceCloned && !voiceSample && (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border-4 border-purple-500/30">
                      <User className="w-10 h-10 md:w-16 md:h-16 text-purple-400" />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">
                        Upload Voice Sample
                      </h3>
                      <p className="text-gray-400 text-sm max-w-md mx-auto">
                        Upload 1-2 minutes of clear speech for best results.
                        Speak naturally in your normal voice.
                      </p>

                      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6">
                        <button
                          onClick={() => voiceInputRef.current?.click()}
                          className="flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <Upload className="w-5 h-5 md:w-6 md:h-6" />
                          <span>Upload Voice Sample</span>
                        </button>

                        <button
                          onClick={() => setCurrentStep('lyrics')}
                          className="text-gray-400 hover:text-white transition underline"
                        >
                          Skip for now
                        </button>
                      </div>

                      <input
                        ref={voiceInputRef}
                        type="file"
                        accept="audio/*,video/*"
                        onChange={handleVoiceSampleUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-left max-w-2xl mx-auto">
                      <div className="bg-slate-700/30 p-4 rounded-xl">
                        <h4 className="font-semibold text-green-400 mb-2">
                          ✓ Best Practices
                        </h4>
                        <ul className="text-gray-300 space-y-1">
                          <li>• Quiet environment</li>
                          <li>• Consistent volume</li>
                          <li>• Natural speaking pace</li>
                          <li>• 1-2 minutes duration</li>
                        </ul>
                      </div>
                      <div className="bg-slate-700/30 p-4 rounded-xl">
                        <h4 className="font-semibold text-red-400 mb-2">
                          ✗ Avoid
                        </h4>
                        <ul className="text-gray-300 space-y-1">
                          <li>• Background noise</li>
                          <li>• Sudden volume changes</li>
                          <li>• Whispering or shouting</li>
                          <li>• Multiple speakers</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {voiceSample && !isVoiceCloned && (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center border-4 border-yellow-500/30">
                      <Loader className="w-10 h-10 md:w-16 md:h-16 text-yellow-400 animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-yellow-400 mb-2">
                        Processing Voice...
                      </h3>
                      <p className="text-gray-400">{voiceSample.name}</p>
                    </div>
                    <button
                      onClick={handleVoiceCloneSubmit}
                      disabled={isLoading}
                      className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 mx-auto"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Create Voice Clone</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {isVoiceCloned && (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full flex items-center justify-center border-4 border-green-500/30">
                      <Check className="w-10 h-10 md:w-16 md:h-16 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-green-400 mb-2">
                        Voice Cloned Successfully! 🎉
                      </h3>
                      <p className="text-gray-400">
                        Your AI voice model is ready for music generation
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                      <button
                        onClick={() => setCurrentStep('lyrics')}
                        className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-cyan-500 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
                      >
                        <span>Next: Add Lyrics</span>
                        <FileText className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setIsVoiceCloned(false);
                          setVoiceSample(null);
                        }}
                        className="flex items-center space-x-2 bg-slate-700 px-6 py-3 rounded-xl hover:bg-slate-600 transition"
                      >
                        <RotateCcw className="w-5 h-5" />
                        <span>Re-upload</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('input')}
                  className="text-gray-400 hover:text-white transition"
                >
                  ← Back to recording
                </button>
              </div>
            </div>
          )}

          {currentStep === 'lyrics' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Add Your Lyrics</h2>
                <p className="text-gray-400">
                  Write or paste your lyrics for the AI to sing
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-white/5">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Your Lyrics{' '}
                      {isVoiceCloned && (
                        <span className="text-green-400">
                          (Will be sung in your cloned voice)
                        </span>
                      )}
                    </label>
                    <textarea
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      placeholder="Enter your lyrics here... You can write in English, French, Pidgin, or any Cameroonian language"
                      className="w-full h-48 md:h-64 bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-400">
                      {lyrics.length > 0 && (
                        <p>
                          {
                            lyrics
                              .split(/\s+/)
                              .filter((word) => word.length > 0).length
                          }{' '}
                          words
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                      <button
                        onClick={() => setCurrentStep('voiceClone')}
                        className="px-6 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => setCurrentStep('genre')}
                        disabled={!lyrics.trim()}
                        className={`flex items-center space-x-2 px-6 md:px-8 py-3 rounded-xl font-semibold transition-all ${
                          lyrics.trim()
                            ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:shadow-lg hover:scale-105'
                            : 'bg-slate-700 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <span>Next: Choose Genre</span>
                        <Radio className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'genre' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Choose Cameroonian Genre
                </h2>
                <p className="text-gray-400">
                  Select the musical style for your AI-generated track
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreSelect(genre.id)}
                    disabled={isLoading}
                    className="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/5 hover:border-white/20 transition-all hover:scale-105 hover:shadow-xl overflow-hidden disabled:opacity-50"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${genre.gradient} opacity-0 group-hover:opacity-20 transition-opacity`}
                    />
                    <div className="relative z-10 text-center space-y-2 md:space-y-3">
                      <div className="text-3xl md:text-5xl">{genre.emoji}</div>
                      <h3 className="text-lg md:text-xl font-bold">
                        {genre.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400">
                        {genre.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center space-y-4">
                <button
                  onClick={() => setCurrentStep('lyrics')}
                  className="text-gray-400 hover:text-white transition"
                >
                  ← Back to lyrics
                </button>
              </div>
            </div>
          )}

          {currentStep === 'processing' && selectedGenreInfo && (
            <div className="space-y-8 text-center">
              <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-gradient-to-br from-purple-500/30 to-cyan-500/30 rounded-full flex items-center justify-center border-4 border-purple-500/50 relative">
                <Wand2
                  className="w-12 h-12 md:w-20 md:h-20 text-purple-400 animate-spin"
                  style={{ animationDuration: '3s' }}
                />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" />
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  AI is Creating Magic ✨
                </h2>
                <p className="text-lg md:text-xl text-gray-400 mb-2">
                  Generating your {selectedGenreInfo.name} track...
                </p>
                {isVoiceCloned && (
                  <p className="text-cyan-400">
                    Using your cloned voice with your lyrics
                  </p>
                )}
              </div>

              <div className="max-w-md mx-auto space-y-3">
                <div className="bg-slate-800/50 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-teal-500 transition-all duration-300"
                    style={{ width: `${aiProgress}%` }}
                  />
                </div>
                <p className="text-xl md:text-2xl font-bold text-cyan-400">
                  {Math.min(Math.round(aiProgress), 100)}%
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm text-gray-400">
                {[
                  { label: 'Analyzing input', done: aiProgress > 10 },
                  {
                    label: isVoiceCloned
                      ? 'Loading voice model'
                      : 'Generating vocals',
                    done: aiProgress > 25,
                  },
                  { label: 'Creating melody', done: aiProgress > 40 },
                  { label: 'Adding instruments', done: aiProgress > 60 },
                  { label: 'Mixing audio', done: aiProgress > 80 },
                  { label: 'Finalizing track', done: aiProgress >= 100 },
                ].map((stage, i) => (
                  <div
                    key={i}
                    className={`flex items-center space-x-1 ${
                      stage.done ? 'text-green-400' : ''
                    }`}
                  >
                    {stage.done && (
                      <Zap className="w-3 h-3 md:w-4 md:h-4" />
                    )}
                    <span>{stage.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'result' && selectedGenreInfo && (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 md:w-40 md:h-40 mx-auto bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full flex items-center justify-center border-4 border-green-500/30">
                  <Sparkles className="w-12 h-12 md:w-20 md:h-20 text-yellow-400" />
                </div>
                <h2 className="text-2xl md:text-4xl font-bold">
                  Your Song is Ready! 🎉
                </h2>
                <div
                  className={`inline-block px-4 md:px-6 py-1 md:py-2 rounded-full bg-gradient-to-r ${selectedGenreInfo.gradient} font-semibold`}
                >
                  {selectedGenreInfo.emoji} {selectedGenreInfo.name}
                </div>
                {isVoiceCloned && (
                  <p className="text-cyan-400">Featuring your cloned voice! 🎤</p>
                )}
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-white/5">
                <div className="flex items-center justify-center space-x-1 h-24 md:h-32 mb-6">
                  {[...Array(60)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-gradient-to-t from-green-500 via-cyan-400 to-purple-400 rounded-full transition-all ${
                        isPlayingFinal ? 'animate-pulse' : ''
                      }`}
                      style={{
                        height: `${30 + Math.random() * 70}%`,
                        animationDelay: `${i * 0.02}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setIsPlayingFinal(!isPlayingFinal)}
                    className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all"
                  >
                    {isPlayingFinal ? (
                      <Pause className="w-6 h-6 md:w-8 md:h-8" />
                    ) : (
                      <Play className="w-6 h-6 md:w-8 md:h-8 ml-0.5 md:ml-1" />
                    )}
                  </button>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
                    <div className="w-24 md:w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-gradient-to-r from-cyan-500 to-purple-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-4 md:p-6 border border-white/5">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <span className="flex items-center space-x-2 font-semibold">
                    <Settings className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                    <span>Fine-Tune Settings</span>
                  </span>
                  <span className="text-gray-400">
                    {showSettings ? '−' : '+'}
                  </span>
                </button>

                {showSettings && (
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {[
                        { label: 'Tempo', key: 'tempo', min: 60, max: 180 },
                        { label: 'Energy', key: 'energy', min: 0, max: 100 },
                        { label: 'Bass', key: 'bass', min: 0, max: 100 },
                        { label: 'Treble', key: 'treble', min: 0, max: 100 },
                      ].map((control) => (
                        <div key={control.label}>
                          <label className="text-sm text-gray-400 mb-2 block">
                            {control.label}
                          </label>
                          <input
                            type="range"
                            min={control.min}
                            max={control.max}
                            value={
                              finetuneSettings[
                                control.key as keyof FinetuneSettings
                              ]
                            }
                            onChange={(e) =>
                              setFinetuneSettings({
                                ...finetuneSettings,
                                [control.key]: parseInt(e.target.value, 10),
                              })
                            }
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {
                              finetuneSettings[
                                control.key as keyof FinetuneSettings
                              ]
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => currentTrack && applyFinetune(currentTrack.id)}
                      disabled={isLoading || !currentTrack}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isLoading ? 'Applying...' : 'Apply Changes'}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
                <button
                  onClick={downloadMusic}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                  disabled={isLoading || !finalMusicUrl}
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Download</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                    disabled={isLoading || !finalMusicUrl}
                  >
                    <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Share</span>
                  </button>

                  {showShareOptions && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-800 border border-white/10 rounded-2xl p-4 shadow-2xl min-w-48">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => shareToPlatform('youtube')}
                          className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-slate-700 transition"
                        >
                          <Youtube className="w-6 h-6 text-red-500" />
                          <span className="text-xs">YouTube</span>
                        </button>
                        <button
                          onClick={() => shareToPlatform('spotify')}
                          className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-slate-700 transition"
                        >
                          <Music2 className="w-6 h-6 text-green-500" />
                          <span className="text-xs">Spotify</span>
                        </button>
                        <button
                          onClick={() => shareToPlatform('tiktok')}
                          className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-slate-700 transition"
                        >
                          <div className="w-6 h-6 bg-black text-white rounded flex items-center justify-center text-xs font-bold">
                            TK
                          </div>
                          <span className="text-xs">TikTok</span>
                        </button>
                        <button
                          onClick={() => shareToPlatform('instagram')}
                          className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-slate-700 transition"
                        >
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">
                            IG
                          </div>
                          <span className="text-xs">Instagram</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 bg-slate-700 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-semibold hover:bg-slate-600 transition disabled:opacity-50"
                  disabled={isLoading}
                >
                  <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Create Another</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scaleY(0.4);
            opacity: 0.6;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 5px;
          background: linear-gradient(to right, #06b6d4, #8b5cf6);
          outline: none;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(to right, #10b981, #06b6d4);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
        input[type='range']::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(to right, #10b981, #06b6d4);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </div>
  );
}