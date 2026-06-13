'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 py-12 mt-20 relative z-10 bg-deepblack">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="flex flex-col gap-2">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-white flex items-baseline">
            DADA<span className="text-accent">.</span>
            <span className="text-2xl text-white/40 ml-0.5 tracking-tighter font-medium">COMPOSER</span>
          </Link>
          <p className="text-sm text-gray-500">
            Audio post-production & scoring.<br />
            Remote worldwide.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-light text-gray-500 uppercase tracking-widest mb-2">Navigation</span>
          <Link href="/#work" className="text-sm font-light text-gray-400 hover:text-accent transition-colors">Work</Link>
          <Link href="/listen" className="text-sm font-light text-gray-400 hover:text-accent transition-colors">Listen</Link>
          <Link href="/pricing" className="text-sm font-light text-gray-400 hover:text-accent transition-colors">Pricing</Link>
          <Link href="/contact" className="text-sm font-light text-gray-400 hover:text-accent transition-colors">Contact</Link>
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          <span className="text-xs font-light text-gray-500 uppercase tracking-widest mb-2">Connect</span>
          <a href="mailto:dadacomposer@gmail.com" className="text-sm font-light text-gray-400 hover:text-accent transition-colors">dadacomposer@gmail.com</a>
          <motion.a 
            href="https://calendly.com/dadacomposer/30min" 
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              fetch('/api/notify-slack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  trackTitle: 'Calendly Link',
                  commentText: '📅 *Book a Call Clicked!* A visitor clicked the Calendly booking link in the website footer.',
                  author: 'Website Visitor',
                  playlistTitle: 'Footer Link'
                })
              }).catch(err => console.error(err));
            }}
            className="text-xs tracking-widest uppercase text-deepblack bg-white px-6 py-3 mt-4 rounded-xl font-light hover:bg-accent transition-colors inline-block text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book a Call
          </motion.a>
        </div>

      </div>
      <div className="max-w-4xl mx-auto px-6 mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 gap-4">
        <span>© {new Date().getFullYear()} Daniel Angelucci. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-accent transition-colors">Terms & Conditions</Link>
        </div>
        <span>Made for Sonic Minimalism.</span>
      </div>
    </footer>
  );
}
