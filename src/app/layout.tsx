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
  title: "DADA | Sonic Minimalism",
  description: "High-end audio post-production & scoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="flex flex-col min-h-screen bg-deepblack text-white relative font-sans">
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
      </body>
    </html>
  );
}
