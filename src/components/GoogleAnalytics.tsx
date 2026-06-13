'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function GoogleAnalytics() {
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    // Read initial consent from localStorage
    const savedConsent = localStorage.getItem('cookie-consent');
    setConsent(savedConsent);

    // Listen for consent status updates
    const handleConsentChange = () => {
      setConsent(localStorage.getItem('cookie-consent'));
    };

    window.addEventListener('cookie-consent-changed', handleConsentChange);
    return () => {
      window.removeEventListener('cookie-consent-changed', handleConsentChange);
    };
  }, []);

  if (consent !== 'accepted') {
    return null;
  }

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-EDB2904MLN"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-EDB2904MLN', {
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
