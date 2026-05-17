import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'DADA | High-End Audio Post-Production & Scoring';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#050505',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
          padding: '40px',
        }}
      >
        {/* Subtle grid background to match site */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            opacity: 1,
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '64px', fontWeight: 'bold', letterSpacing: '-0.05em', color: 'white' }}>DADA</span>
            <span style={{ fontSize: '64px', fontWeight: 'bold', color: '#3b82f6' }}>.</span>
            <span style={{ fontSize: '64px', fontWeight: 500, letterSpacing: '-0.05em', color: 'rgba(255,255,255,0.4)', marginLeft: '4px' }}>COMPOSER</span>
          </div>

          {/* Hero text */}
          <div style={{ 
            fontSize: '84px', 
            fontWeight: 300, 
            letterSpacing: '-0.02em', 
            color: 'rgba(255,255,255,0.9)', 
            textAlign: 'center',
            lineHeight: 1.1,
            maxWidth: '1000px'
          }}>
            High-end audio post-production & scoring
          </div>
          
          {/* Subtle accent or subtext */}
          <div style={{
            marginTop: '60px',
            fontSize: '28px',
            fontWeight: 300,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center'
          }}>
            Sonic Minimalism
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
