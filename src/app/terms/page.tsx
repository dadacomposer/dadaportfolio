'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 pb-32 pt-12 font-sans text-white">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4">Terms & Conditions</h1>
        <p className="text-xs text-white/40 uppercase tracking-widest">Last Updated: June 2026</p>

        <div className="h-px bg-white/10 w-full my-6" />

        <div className="space-y-6 text-sm text-white/70 leading-relaxed font-light">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">1. Agreement to Terms</h2>
            <p>
              By accessing this website, you agree to be bound by these Terms and Conditions and acknowledge compliance with all applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">2. Use License</h2>
            <p>
              All materials on this website, including audio previews, designs, text, and videos, are the intellectual property of Daniel Angelucci (DADA) unless otherwise noted.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                You may stream and preview audio files for assessment purposes.
              </li>
              <li>
                You may not copy, modify, republish, distribute, or use any audio assets or visual designs for commercial purposes without an explicit licensing contract signed by us.
              </li>
              <li>
                For shared review links (e.g. Musicvine reviews), files downloaded as ZIP packages are strictly licensed for evaluation and must not be distributed publicly.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">3. Disclaimer</h2>
            <p>
              The materials on this website are provided "as is". We make no warranties, expressed or implied, and hereby disclaim all other warranties including, without limitation, implied warranties or conditions of merchantability or fitness for a particular purpose.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">4. Limitations</h2>
            <p>
              In no event shall DADA be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this website, even if notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">5. Governing Law</h2>
            <p>
              Any claim relating to DADA's website shall be governed by local laws without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
