import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import DynamicIsland from "@/components/DynamicIsland";
import Footer from "@/components/Footer";
import { AudioProvider } from "@/context/AudioContext";
import GlobalGrid from "@/components/GlobalGrid";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dadacomposer.com"),
  title: {
    default: "DADA | Audio Post-Production & Composer for Hire",
    template: "%s | DADA.COMPOSER"
  },
  description: "High-end audio post-production, bespoke music scoring, sound design, and foley. Hire a professional composer to elevate your film, commercial, or media project.",
  keywords: ["composer for hire", "audio post-production", "sound design", "foley", "music scoring", "custom music", "media composer", "audio strategy", "film scoring"],
  authors: [{ name: "DADA" }],
  creator: "DADA",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dadacomposer.com",
    title: "DADA | High-End Audio Post-Production & Scoring",
    description: "Bespoke music scoring and surgical sound design. Elevate your media with professional audio.",
    siteName: "DADA.COMPOSER",
  },
  twitter: {
    card: "summary_large_image",
    title: "DADA | Audio Post-Production & Scoring",
    description: "Bespoke music scoring and surgical sound design.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} scroll-smooth`}>
      <body className="flex flex-col min-h-screen bg-deepblack text-white relative font-sans transition-colors duration-500">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EDB2904MLN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EDB2904MLN');
          `}
        </Script>
        <GlobalGrid />
        <AudioProvider>
          <Navbar />
          <main className="flex-grow pt-24">{children}</main>
          <Footer />
          <DynamicIsland />
        </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
