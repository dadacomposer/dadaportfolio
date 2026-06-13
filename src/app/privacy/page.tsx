'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
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
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4">Privacy Policy</h1>
        <p className="text-xs text-white/40 uppercase tracking-widest">Last Updated: June 2026</p>

        <div className="h-px bg-white/10 w-full my-6" />

        <div className="space-y-6 text-sm text-white/70 leading-relaxed font-light">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">1. Overview</h2>
            <p>
              This Privacy Policy explains how DADA ("we", "us", or "our") handles visitor information. We value your privacy and are committed to maintaining a minimal data footprint. We do not sell, rent, or trade any personal data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">2. Information Collection & Usage</h2>
            <p>
              We do not collect any personal identifier information from passive visitors of this website. However:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Contact Inquiries:</strong> If you fill out the contact form, the details you submit (name, email, project details, budget, phone) are stored securely in our private database (Supabase) so that we can respond to your request.
              </li>
              <li>
                <strong>Google Analytics:</strong> We use Google Analytics (using cookies) to measure anonymous traffic data (e.g., page views, session length, device types) to optimize our portfolio website. Google Analytics is only loaded if you explicitly consent via our cookie banner.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">3. Cookies</h2>
            <p>
              A cookie is a small file placed on your device. We use analytical cookies from Google Analytics to help us understand site usage. You can accept or decline these cookies at any time using the Cookie Consent banner at the bottom of the page or through your browser settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">4. Third-Party Integrations</h2>
            <p>
              Our website links to third-party services like Calendly (for call booking) and Cloudinary (for audio delivery). These services have their own privacy policies which govern any information you share with them.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">5. Data Retention & Security</h2>
            <p>
              Form submissions are kept in our database until they are no longer needed for business contact purposes. We implement industry-standard security protocols through our database host to safeguard this information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">6. Your Rights</h2>
            <p>
              Under data protection laws (such as GDPR), you have the right to access, rectify, or request deletion of any contact information you have sent us. To make a request, please contact us at <a href="mailto:dadacomposer@gmail.com" className="text-accent hover:underline">dadacomposer@gmail.com</a>.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
