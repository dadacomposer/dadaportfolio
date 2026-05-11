'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ProjectType = 'cinema' | 'corporate';

interface ScaleOption {
  label: string;
  multiplier: number;
  description: string;
}

const CINEMA_SCALES: ScaleOption[] = [
  { label: 'Student / Non-profit', multiplier: 0.5, description: 'Academic projects or small charitable works.' },
  { label: 'Indie / Short Film', multiplier: 1.0, description: 'Independent productions for festivals or digital release.' },
  { label: 'Feature / Major Studio', multiplier: 5.0, description: 'Full-length theatrical releases or high-budget streaming.' }
];

const CORPORATE_SCALES: ScaleOption[] = [
  { label: 'Local / Internal', multiplier: 4.0, description: 'Social media clips or internal company videos.' },
  { label: 'National Campaign', multiplier: 10.0, description: 'TV / Radio spots for national broadcast.' },
  { label: 'Global / Large Scale', multiplier: 15.0, description: 'Major brand campaigns with worldwide usage rights.' }
];

export default function PricingPage() {
  const [projectType, setProjectType] = useState<ProjectType>('cinema');
  const [scaleIndex, setScaleIndex] = useState(1);
  const [minutes, setMinutes] = useState(5);

  const currentScale = projectType === 'cinema' ? CINEMA_SCALES[scaleIndex] : CORPORATE_SCALES[scaleIndex];
  
  const total = useMemo(() => {
    const baseRate = 100; // Base per minute for Cinema Indie
    // Corporate rates are now explicitly handled by their multipliers relative to 100 base
    return Math.round(minutes * baseRate * currentScale.multiplier);
  }, [minutes, projectType, currentScale]);

  return (
    <div className="w-full max-w-5xl mx-auto px-6 pb-32 pt-12">
      
      <motion.div 
        className="mb-20 max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-[10px] font-light tracking-[0.5em] uppercase text-accent mb-6">Rates & Investment</p>
        <h1 className="text-5xl md:text-8xl font-light tracking-tighter text-white leading-none mb-10">Pricing.</h1>
        <p className="text-gray-400 font-light leading-relaxed text-sm md:text-base">
          Investing in high-end audio is investing in the emotional longevity of your project. 
          My pricing structure is designed to be transparent and scalable, reflecting the 
          complexity of the sonic landscape and the intended reach of the media. 
          Use the calculator below to generate an indicative quote for your production.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start">
        
        {/* Left Side: Parameters */}
        <div className="space-y-12">
          
          {/* Project Type Selection */}
          <section>
            <h3 className="text-xs font-light text-gray-500 uppercase tracking-[0.3em] mb-6">1. Project Type</h3>
            <div className="flex gap-4">
              {(['cinema', 'corporate'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => { setProjectType(type); setScaleIndex(1); }}
                  className={`px-8 py-4 rounded-xl text-sm font-light uppercase tracking-widest border transition-all ${
                    projectType === type 
                      ? 'bg-white text-deepblack border-white' 
                      : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'
                  }`}
                >
                  {type === 'cinema' ? 'Cinema / Film' : 'Corporate / Ads'}
                </button>
              ))}
            </div>
          </section>

          {/* Scale Selection */}
          <section>
            <h3 className="text-xs font-light text-gray-500 uppercase tracking-[0.3em] mb-6">2. Production Scale</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(projectType === 'cinema' ? CINEMA_SCALES : CORPORATE_SCALES).map((option, idx) => (
                <button
                  key={option.label}
                  onClick={() => setScaleIndex(idx)}
                  className={`p-6 rounded-xl border text-left transition-all flex flex-col gap-2 ${
                    scaleIndex === idx 
                      ? 'bg-accent/10 border-accent' 
                      : 'bg-anthracite/20 border-white/5 hover:border-white/20'
                  }`}
                >
                  <span className={`text-xs font-light uppercase tracking-widest ${scaleIndex === idx ? 'text-accent' : 'text-white'}`}>
                    {option.label}
                  </span>
                  <p className="text-[11px] font-light text-gray-500 leading-relaxed">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Duration Slider */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-xs font-light text-gray-500 uppercase tracking-[0.3em]">3. Media Duration</h3>
              <span className="text-3xl font-light text-white">{minutes} <span className="text-sm text-gray-500">min</span></span>
            </div>
            <div className="px-2">
              <input 
                type="range" 
                min="1" 
                max="60" 
                value={minutes} 
                onChange={(e) => setMinutes(parseInt(e.target.value))}
                className="w-full h-[1px] bg-white/10 appearance-none cursor-pointer accent-accent"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(minutes/60)*100}%, rgba(255,255,255,0.1) ${(minutes/60)*100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] text-gray-600 font-light uppercase tracking-widest mt-4">
                <span>1 min</span>
                <span>60 min+</span>
              </div>
            </div>
          </section>

        </div>

        {/* Right Side: Quote Summary */}
        <motion.div 
          className="sticky top-32 p-10 bg-anthracite/30 border border-white/5 rounded-3xl backdrop-blur-xl flex flex-col items-center gap-8"
          layout
        >
          <div className="flex flex-col items-center text-center gap-1">
            <span className="text-[10px] text-gray-500 font-light tracking-[0.3em] uppercase mb-2">Estimated Quote</span>
            <AnimatePresence mode="wait">
              <motion.div 
                key={total}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-6xl font-light text-white tracking-tighter"
              >
                €{total.toLocaleString()}
              </motion.div>
            </AnimatePresence>
            <p className="text-[10px] text-accent/60 font-light uppercase tracking-widest mt-4">
              Project: {projectType === 'cinema' ? 'Cinema' : 'Corporate'} · {minutes}m
            </p>
          </div>

          <div className="w-full h-px bg-white/5" />

          <div className="w-full space-y-4">
            <p className="text-[11px] text-gray-500 font-light leading-relaxed text-center">
              * This is an <span className="text-white italic">indicative quote</span> based on typical project complexity. 
              The final rate may vary depending on specific instrumentation requirements, 
              licensing needs, and delivery deadlines.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full mt-4">
            <a 
              href="https://calendly.com/dadacomposer/30min" 
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-white text-deepblack font-light tracking-widest uppercase py-5 rounded-2xl hover:bg-accent hover:text-white transition-all text-sm shadow-xl"
            >
              Book a Call
            </a>
          </motion.div>
        </motion.div>

      </div>

      {/* Additional Info Section */}
      <motion.section 
        className="mt-32 border-t border-white/5 pt-20 grid grid-cols-1 md:grid-cols-3 gap-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div>
          <h4 className="text-xs font-light text-white uppercase tracking-widest mb-4">Full License</h4>
          <p className="text-sm font-light text-gray-500 leading-relaxed">
            All prices include full commercial licensing rights for your project, unless otherwise specified for major global campaigns.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-light text-white uppercase tracking-widest mb-4">Revision Rounds</h4>
          <p className="text-sm font-light text-gray-500 leading-relaxed">
            Every quote includes two full rounds of revisions to ensure the sonic identity perfectly matches your visual vision.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-light text-white uppercase tracking-widest mb-4">Final Delivery</h4>
          <p className="text-sm font-light text-gray-500 leading-relaxed">
            You will receive high-quality 48kHz/24bit WAV files, plus all necessary stems (music-only, FX-only, etc.) for final mixing.
          </p>
        </div>
      </motion.section>

    </div>
  );
}
