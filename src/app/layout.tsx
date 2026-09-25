import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";
import { ToastProvider } from "@/context/ToastContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dadacomposer.com"),
  title: "DADA.COMPOSER | Under Construction",
  description: "DADA.COMPOSER is being refreshed. Please check back soon.",
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
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-deepblack font-sans text-white">
        <ToastProvider>
          <AudioProvider>
            <main>{children}</main>
          </AudioProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
