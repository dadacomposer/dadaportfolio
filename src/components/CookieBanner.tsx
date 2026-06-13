'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after 1.5 seconds delay
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChoice = (choice: 'accepted' | 'declined') => {
    localStorage.setItem('cookie-consent', choice);
    setIsVisible(false);
    
    // Dispatch custom event to notify GoogleAnalytics component in real-time
    const event = new Event('cookie-consent-changed');
    window.dispatchEvent(event);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-[9999] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="pointer-events-auto bg-anthracite/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex gap-3 items-start">
              <div className="shrink-0 p-1.5 bg-accent/10 rounded-lg text-accent mt-0.5">
                <Info size={16} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold tracking-tight text-white uppercase">Cookie Preferences</h4>
                <p className="text-xs text-white/60 leading-relaxed font-light">
                  We use cookies to analyze anonymous traffic and improve your browsing experience. 
                  Learn more in our{' '}
                  <Link href="/privacy" className="text-accent hover:underline font-normal">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-2 text-xs uppercase tracking-widest font-bold">
              <button
                onClick={() => handleChoice('declined')}
                className="flex-grow py-3 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-center"
              >
                Decline
              </button>
              <button
                onClick={() => handleChoice('accepted')}
                className="flex-grow py-3 bg-white text-deepblack rounded-xl hover:bg-white/90 transition-all text-center"
              >
                Accept
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
