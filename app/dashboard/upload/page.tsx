'use client';

import React, { useState, useRef } from 'react';
import { Upload, Loader, Check, AlertCircle, Music } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://camforgex.onrender.com';
const AUTH_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN || '';

interface UploadResponse {
  id: number;
  title: string;
  original_file: string;
  processed_file: string;
  duration_seconds: number;
  bpm: number;
  status: string;
  owner: number;
}

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<UploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError('File size exceeds 100MB limit');
        return;
      }
      setOriginalFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a track title');
      return;
    }
    
    if (!originalFile) {
      setError('Please select an audio file');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('original_file', originalFile);
      formData.append('processed_file', '');
      formData.append('duration_seconds', '0');
      formData.append('bpm', '0');
      formData.append('status', 'UPLOADED');

      console.log('[v0] Uploading track:', { title, fileName: originalFile.name, apiUrl: API_BASE_URL });

      const headers: Record<string, string> = {};
      if (AUTH_TOKEN) {
        headers['Authorization'] = `Token ${AUTH_TOKEN}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/music/tracks/`, {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('[v0] Upload error:', errorData);
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please check your auth token.');
        }
        
        throw new Error(`Failed to upload: ${response.status} - ${errorData.detail || 'Unknown error'}`);
      }

      const data: UploadResponse = await response.json();
      console.log('[v0] Upload successful:', data);
      
      setSuccess(data);
      setTitle('');
      setOriginalFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      console.error('[v0] Error uploading track:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(null);
    setTitle('');
    setOriginalFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      className="min-h-screen text-white p-4 md:p-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #2d1b69 35%, #0f4c75 70%, #16697a 100%)'
      }}
    >
      {/* Animated Background Bars */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-full">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="w-0.5 bg-gradient-to-t from-green-400 via-cyan-400 to-purple-400"
              style={{
                height: `${Math.random() * 100}%`,
                animation: `pulse ${0.6 + Math.random() * 1.2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10 mt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Upload Your Track
          </h1>
          <p className="text-gray-300 text-lg">Share your music and get it processed by AI</p>
        </div>

        {!success ? (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10">
            {error && (
              <div className="mb-6 bg-red-900/50 border border-red-500/50 rounded-2xl p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-200 font-semibold">Error</p>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  Track Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your track title"
                  disabled={isLoading}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition disabled:opacity-50"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-3">
                  Audio File *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-cyan-500/30 rounded-2xl p-8 text-center cursor-pointer hover:border-cyan-500/60 transition bg-slate-800/30"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-cyan-400" />
                    </div>
                    {originalFile ? (
                      <>
                        <p className="text-white font-semibold">{originalFile.name}</p>
                        <p className="text-sm text-gray-400">
                          {(originalFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-white font-semibold">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-400">MP3, WAV, FLAC, OGG, AAC up to 100MB</p>
                      </>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="hidden"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !title.trim() || !originalFile}
                className="w-full bg-gradient-to-r from-green-500 to-cyan-500 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload Track</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Success state - shows uploaded track details */
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10">
            <div className="text-center space-y-8">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full flex items-center justify-center border-4 border-green-500/30">
                <Check className="w-12 h-12 md:w-16 md:h-16 text-green-400" />
              </div>

              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-green-400 mb-2">Upload Successful!</h2>
                <p className="text-gray-300">Your track has been uploaded and is ready for processing</p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 space-y-4 text-left border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Track Title:</span>
                  <span className="font-semibold text-white">{success.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Track ID:</span>
                  <span className="font-mono text-cyan-400">#{success.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 font-semibold">
                    {success.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="font-semibold text-white">{success.duration_seconds}s</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center space-x-2"
                >
                  <Music className="w-5 h-5" />
                  <span>Upload Another</span>
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 bg-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-600 transition"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scaleY(0.4); opacity: 0.6; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
