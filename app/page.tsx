"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-teal-700 relative overflow-hidden">
      {/* Background */}
      <Image
        src="/images/bg-hero.jpg"
        alt="background"
        fill
        className="object-cover opacity-30 pointer-events-none"
        priority
      />

      {/* HERO SECTION */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 text-center max-w-5xl mx-auto pt-24 sm:pt-28">
        {/* Heading Section */}
        <div className="mb-6 sm:mb-8 w-full px-2">
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-5 sm:mb-6">
            The Future of Music Creation & Distribution is Here with CamForgeX&apos;s
          </p>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4">
            <span className="bg-gradient-to-r from-[#40F680] via-[#8B5CF6] to-[#01C7A0] bg-clip-text text-transparent block">
              AI MUSIC GENERATOR
            </span>
            <span className="text-gray-200 block tracking-wide text-2xl sm:text-4xl md:text-5xl lg:text-6xl mt-2">
              AND DISTRIBUTOR
            </span>
          </h1>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm sm:text-base md:text-xl max-w-xl mx-auto mb-8 sm:mb-12 leading-relaxed px-3">
          Leveraging advanced AI to generate, refine, and distribute your music at the
          click of a button.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link
            href="/register"
            className="px-7 sm:px-10 py-3 sm:py-4 rounded-full 
              bg-white/10 border border-white/30 
              text-white font-semibold text-base sm:text-lg
              hover:bg-white/20 transition-all
              flex items-center gap-2 sm:gap-3 backdrop-blur-sm
              hover:scale-105 active:scale-95 duration-300"
          >
            GET STARTED
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4 sm:w-6 sm:h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 12l-6.5 6.5m6.5-6.5l-6.5-6.5m6.5 6.5H3"
              />
            </svg>
          </Link>
        </div>

        {/* Two main functionalities */}
        <div className="w-full max-w-4xl mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left mb-8">
          {/* AI Music Generator */}
          <div className="rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition p-5 sm:p-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-[#40F680]/20 to-[#8B5CF6]/20 border border-white/10 text-[#40F680] flex items-center justify-center">
                {/* Sparkles-ish icon */}
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg sm:text-xl">AI Music Generator</h3>
                <p className="text-gray-300 text-sm sm:text-base mt-1">
                  Create original tracks, melodies, and stems using prompts or reference audio.
                </p>
                <ul className="mt-3 space-y-1 text-gray-300 text-sm">
                  <li className="flex items-center gap-2"><CheckIcon /> Text‑to‑music prompts</li>
                  <li className="flex items-center gap-2"><CheckIcon /> Style, tempo & key control</li>
                  <li className="flex items-center gap-2"><CheckIcon /> Export WAV/MP3 & stems</li>
                </ul>
                <Link href="/generate" className="inline-block mt-4 text-sm font-semibold text-[#40F680] hover:text-white">
                  Try the Generator →
                </Link>
              </div>
            </div>
          </div>

          {/* Music Distribution */}
          <div className="rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition p-5 sm:p-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-[#01C7A0]/20 to-[#8B5CF6]/20 border border-white/10 text-[#01C7A0] flex items-center justify-center">
                {/* Distribution/Share icon */}
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="6" cy="12" r="2" />
                  <circle cx="18" cy="6" r="2" />
                  <circle cx="18" cy="18" r="2" />
                  <path d="M8 12l8-6M8 12l8 6" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg sm:text-xl">Music Distribution</h3>
                <p className="text-gray-300 text-sm sm:text-base mt-1">
                  Publish to major platforms in clicks—track releases and earnings.
                </p>
                <ul className="mt-3 space-y-1 text-gray-300 text-sm">
                  <li className="flex items-center gap-2"><CheckIcon /> One‑click platform delivery</li>
                  <li className="flex items-center gap-2"><CheckIcon /> Release scheduling & artwork</li>
                  <li className="flex items-center gap-2"><CheckIcon /> Basic analytics & royalties</li>
                </ul>
                <Link href="/distribute" className="inline-block mt-4 text-sm font-semibold text-[#01C7A0] hover:text-white">
                  Start Distributing →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* tiny inline check icon to avoid extra deps */
function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 flex-none text-[#40F680]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}