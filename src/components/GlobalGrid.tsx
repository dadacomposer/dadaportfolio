'use client';

export default function GlobalGrid() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none opacity-60">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="oscilloscope-grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path 
              d="M 100 0 L 0 0 0 100" 
              fill="none" 
              stroke="rgba(255, 255, 255, 0.1)" 
              strokeWidth="1" 
              strokeDasharray="4,4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#oscilloscope-grid)" />
      </svg>
      {/* Dynamic atmospheric gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#18110b] via-[#050505] to-[#020202] mix-blend-screen opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#050505_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deepblack/40 to-deepblack" />
    </div>
  );
}
