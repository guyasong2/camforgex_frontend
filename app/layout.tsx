import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from './components/Footer';
import Navbar from './components/Navbar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CamForgeX",
  description: "The all-in-one platform where artists can upload, edit, and launch promo campaigns for their music. Skilled promoters then get paid to promote the tracks they love, driving streams and building buzz in a transparent, performance-driven marketplace. Join the new music economy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-transparent`}
      >
        <Navbar />
        <main className="flex-1 flex flex-col pt-0"> {/* Added padding-top to account for fixed navbar */}
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}