'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  // Predefined heights and durations to avoid hydration mismatch
  const visualizerData = [
    { height: 31, delay: 0, duration: 0.6 },
    { height: 15, delay: 0.1, duration: 0.7 },
    { height: 12, delay: 0.2, duration: 0.8 },
    { height: 33, delay: 0.3, duration: 0.9 },
    { height: 35, delay: 0.4, duration: 0.5 },
    { height: 43, delay: 0.5, duration: 0.6 },
    { height: 33, delay: 0.6, duration: 0.7 },
    { height: 39, delay: 0.7, duration: 0.8 },
    { height: 36, delay: 0.8, duration: 0.9 },
    { height: 37, delay: 0.9, duration: 0.5 },
    { height: 49, delay: 1.0, duration: 0.6 },
    { height: 32, delay: 1.1, duration: 0.7 },
    { height: 14, delay: 1.2, duration: 0.8 },
    { height: 34, delay: 1.3, duration: 0.9 }
  ];

  return (
    <footer className="bg-gradient-to-br from-[#1a1a1a] via-[#2d1b69] to-[#0a2e24] text-white py-12 md:py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative triangle images — show on large screens only */}
      <div className="hidden lg:block pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-80 xl:w-96 h-80 xl:h-96">
        {/* Top Image */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-28 xl:w-32 xl:h-32">
          <Image
            src="/images/footer/footer3.jpg"
            alt="Music Creation"
            width={128}
            height={128}
            className="rounded-xl object-cover border-2 border-[#40F680] shadow-2xl"
          />
        </div>
        {/* Bottom Left Image */}
        <div className="absolute bottom-8 left-8 w-28 h-28 xl:w-32 xl:h-32">
          <Image
            src="/images/footer/footer1.jpg"
            alt="AI Technology"
            width={128}
            height={128}
            className="rounded-xl object-cover border-2 border-[#8B5CF6] shadow-2xl"
          />
        </div>
        {/* Bottom Right Image */}
        <div className="absolute bottom-8 right-8 w-28 h-28 xl:w-32 xl:h-32">
          <Image
            src="/images/footer/footer2.jpg"
            alt="Music Distribution"
            width={128}
            height={128}
            className="rounded-xl object-cover border-2 border-[#01C7A0] shadow-2xl"
          />
        </div>

        {/* Connecting lines */}
        <svg className="absolute inset-0 w-full h-full">
          <line x1="50%" y1="20%" x2="25%" y2="65%" stroke="rgba(64, 246, 128, 0.4)" strokeWidth="2" />
          <line x1="50%" y1="20%" x2="75%" y2="65%" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="2" />
          <line x1="25%" y1="65%" x2="75%" y2="65%" stroke="rgba(1, 199, 160, 0.4)" strokeWidth="2" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Content grid: 1 -> 2 -> 3 columns. Add right padding only on lg+ to avoid overlap with the triangle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 mb-10 pr-0 lg:pr-80 xl:pr-96">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/logo/logo.jpg"
                  alt="CamForgeX Logo"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#40F680] to-[#8B5CF6] bg-clip-text text-transparent">
                CamForgeX
              </h2>
            </div>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
              The Future of Music Creation & Distribution is Here with CamForgeX's
            </p>

            <div className="bg-gradient-to-r from-[#40F680] to-[#8B5CF6] p-px rounded-lg">
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg sm:text-xl font-semibold text-center mb-2">
                  A MUSIC GENERATOR AND DISTRIBUTOR
                </h3>
                <p className="text-gray-300 text-sm text-center">
                  Leveraging advanced AI to generate, refine, and distribute your music at the click of a button
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#40F680] to-[#01C7A0] bg-clip-text text-transparent">
              Navigation
            </h3>
            <div className="space-y-4">
              <Link href="/login" className="block text-base sm:text-lg text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2">
                Login
              </Link>
              <Link href="/register" className="block text-base sm:text-lg text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2">
                Register
              </Link>
              <Link href="/features" className="block text-base sm:text-lg text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2">
                Features
              </Link>
              <Link href="/pricing" className="block text-base sm:text-lg text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2">
                Pricing
              </Link>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#01C7A0] bg-clip-text text-transparent">
              Start Creating
            </h3>
            <p className="text-gray-300 text-base sm:text-lg">
              Ready to transform your music creation process?
            </p>
            <Link
              href="/register"
              className="inline-block bg-gradient-to-r from-[#40F680] via-[#8B5CF6] to-[#01C7A0] hover:from-[#01C7A0] hover:via-[#8B5CF6] hover:to-[#40F680] text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-500 transform hover:scale-105 shadow-2xl"
            >
              GET STARTED
            </Link>
          </div>
        </div>

        {/* Mobile image strip (replaces the triangle on small screens) */}
        <div className="mt-4 mb-6 flex items-center justify-center gap-3 lg:hidden">
          <Image
            src="/images/footer/footer1.jpg"
            alt="AI Technology"
            width={80}
            height={80}
            className="rounded-lg object-cover border border-[#8B5CF6]/60 shadow-lg"
          />
          <Image
            src="/images/footer/footer3.jpg"
            alt="Music Creation"
            width={96}
            height={96}
            className="rounded-lg object-cover border border-[#40F680]/60 shadow-lg"
          />
          <Image
            src="/images/footer/footer2.jpg"
            alt="Music Distribution"
            width={80}
            height={80}
            className="rounded-lg object-cover border border-[#01C7A0]/60 shadow-lg"
          />
        </div>

        {/* Music Visualizer */}
        <div className="flex justify-center space-x-1 mb-8 max-w-3xl mx-auto">
          {visualizerData.map((item, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-[#40F680] to-[#8B5CF6] rounded-full animate-pulse"
              style={{
                height: `${item.height}px`,
                animationDelay: `${item.delay}s`,
                animationDuration: `${item.duration}s`
              }}
            />
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-xs sm:text-sm">© 2025 CamForgeX. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}