'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence, Variants } from 'framer-motion';
import { Music, AudioWaveform, MicVocal, AudioLines, Ear, Infinity, Play, Square, ArrowRight, Shuffle } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useRouter } from 'next/navigation';
import AudioOscillator from '@/components/AudioOscillator';
import ProjectCarousel from '@/components/ProjectCarousel';
import FAQ from '@/components/FAQ';
import AudioBloom from '@/components/AudioBloom';

export default function Home() {
  const containerRef = useRef(null);
  const router = useRouter();
  const { isPlaying, togglePlay, currentTrackUrl, playRandomTrack } = useAudio();
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const services = [
    { title: "Custom Music", icon: <Music size={24} strokeWidth={1.5} />, desc: "Tailor-made neo-classical and electronic compositions for your visual narrative." },
    { title: "Sound Design", icon: <AudioWaveform size={24} strokeWidth={1.5} />, desc: "Sculpting immersive and organic sonic environments that breathe life into the picture." },
    { title: "VOX Editing", icon: <MicVocal size={24} strokeWidth={1.5} />, desc: "Surgical dialogue editing, cleanup, and ADR matching for pristine clarity." },
    { title: "Mix & Master", icon: <AudioLines size={24} strokeWidth={1.5} />, desc: "Final mixing for stereo and surround formats, meeting strict broadcast standards." },
    { title: "Foley", icon: <Ear size={24} strokeWidth={1.5} />, desc: "Custom recorded foley to ground the visuals in a tactile reality." },
    { title: "Complete Audio", icon: <Infinity size={24} strokeWidth={1.5} />, desc: "End-to-end audio post-production handling every sonic element of your project." },
  ];

  const blurReveal: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(15px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: [0.33, 1, 0.68, 1] } }
  };

  const [isHeroHovered, setIsHeroHovered] = useState(false);

  const handleListenClick = () => {
    if (!isPlaying) {
      playRandomTrack();
    } else {
      router.push('/listen');
    }
  };

  const handleShuffleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playRandomTrack();
  };

  return (
    <div className="flex flex-col items-center w-full overflow-hidden relative" ref={containerRef}>
      
      {/* Hero Wrapper */}
      <div id="hero" className="w-full relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden text-center">
        <AudioOscillator />
        
        <motion.section 
          className="w-full max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center"
          style={{ y, opacity }}
        >
          {/* Logo */}
          <motion.div 
            className="flex items-baseline gap-0 mb-2 text-white/90"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="flex items-baseline justify-center">
              <span className="text-2xl font-bold tracking-tighter text-white">DADA</span>
              <span className="text-2xl font-bold text-accent">.</span>
              <span className="text-2xl text-white/40 ml-0.5 tracking-tighter font-medium">COMPOSER</span>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1] mb-10 text-white/80 max-w-4xl flex flex-col items-center"
          >
             High-end audio post-production & scoring
          </motion.h1>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.5 }}
          >
            <div 
              className="relative flex items-center gap-3"
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
            >
              <AudioBloom active={isPlaying} isHovered={isHeroHovered} />
              
              <motion.button 
                onClick={handleListenClick}
                initial={false}
                animate={{
                  backgroundColor: isPlaying ? "rgba(var(--accent-rgb), 1)" : "rgba(255, 255, 255, 1)",
                  color: isPlaying ? "#ffffff" : "#000000",
                  borderColor: isPlaying ? "rgba(var(--accent-rgb), 0.5)" : "rgba(255, 255, 255, 1)",
                }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="font-light tracking-widest uppercase px-8 py-3.5 rounded-xl text-sm flex items-center justify-center min-w-[200px] shadow-lg relative z-10 border"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                layout
              >
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={isPlaying ? "playing" : "stopped"}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    {!isPlaying && <Play className="w-4 h-4" fill="currentColor" />}
                    {isPlaying ? "View Full Library" : "Tap to listen"}
                    {!isPlaying && (
                      <span
                        onClick={handleShuffleClick}
                        className="ml-2 p-1 rounded-lg bg-black/10 hover:bg-black/20 transition-colors cursor-pointer"
                        title="Play random track"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </motion.span>
                </AnimatePresence>
              </motion.button>

              <AnimatePresence>
                {isPlaying && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -10 }}
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    className="w-12 h-12 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all z-10 group"
                    title="Stop Music"
                  >
                    <Square size={14} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/pricing" className="block bg-deepblack/30 border border-white/5 text-white font-light tracking-widest uppercase px-8 py-3.5 rounded-xl hover:bg-white/10 hover:border-accent/50 transition-colors text-sm min-w-[200px] backdrop-blur-md text-center">
                See rates
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>
      </div>

      {/* Client Marquee Strip */}
      <section className="w-full py-2 relative z-20">
        <div className="w-full border-y border-white/5 bg-deepblack py-4 overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-deepblack to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-deepblack to-transparent z-10 pointer-events-none" />

          <style jsx>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              display: flex;
              width: max-content;
              animation: marquee 65s linear infinite;
              will-change: transform;
            }
          `}</style>

          <div className="animate-marquee">
            {[0, 1, 2, 3].map((loop) => (
              <div key={loop} className="flex items-center gap-20 md:gap-40 px-10 md:px-20 shrink-0">
                {[1, 2, 7, 8, 9, 10].map((num) => (
                  <div key={num} className="h-10 md:h-12 w-32 md:w-56 shrink-0 flex items-center justify-center">
                    <img
                      src={`/clients/${num}.png`}
                      alt={`Client ${num}`}
                      className="max-h-full max-w-full object-contain opacity-70 hover:opacity-100 transition-all duration-700"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <motion.section 
        className="w-full max-w-5xl mx-auto px-6 py-24 relative z-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="flex flex-col items-center mb-16">
          <motion.p variants={blurReveal} className="text-xs font-light tracking-[0.4em] uppercase text-accent mb-4">Core Services</motion.p>
          <motion.h2 variants={blurReveal} className="text-3xl md:text-5xl font-light tracking-tight text-white text-center">Sculpting soundscapes with surgical precision.</motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div 
              key={i}
              variants={blurReveal}
              className="group relative p-8 border border-white/5 rounded-2xl bg-anthracite/20 hover:bg-white/5 transition-all duration-700 flex flex-col items-start gap-4 overflow-hidden"
              onMouseEnter={() => setHoveredService(i)}
              onMouseLeave={() => setHoveredService(null)}
            >
              <div className="p-3 bg-white/5 rounded-xl text-white group-hover:text-accent group-hover:bg-accent/10 transition-all duration-700 z-10">
                {service.icon}
              </div>
              <h3 className="text-xl font-light text-white tracking-tight z-10">{service.title}</h3>
              <p className="text-gray-500 font-light text-sm leading-relaxed z-10 group-hover:text-gray-400 transition-colors duration-700">{service.desc}</p>
              
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 z-0" />
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-accent z-1"
                initial={{ width: 0 }}
                animate={{ width: hoveredService === i ? "100%" : "0%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Selected Work Carousel */}
      <ProjectCarousel />

      <FAQ />

      {/* Final CTA Section */}
      <section className="w-full py-32 relative z-20">
        <motion.div 
          className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.p variants={blurReveal} className="text-xs font-light tracking-[0.4em] uppercase text-accent mb-6">Ready to collaborate?</motion.p>
          <motion.h2 variants={blurReveal} className="text-4xl md:text-6xl font-light tracking-tight text-white mb-10 leading-tight">Elevate your visual storytelling with bespoke audio.</motion.h2>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center gap-6"
            variants={blurReveal}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link 
                href="https://calendly.com/dadacomposer/30min" 
                target="_blank"
                className="bg-white text-deepblack font-light tracking-widest uppercase px-10 py-4 rounded-xl hover:bg-accent hover:text-white transition-colors text-sm shadow-lg border border-white"
              >
                Book a Call
              </Link>
            </motion.div>
            <span className="text-gray-600 font-light italic text-sm">or</span>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/pricing" className="block bg-deepblack/30 border border-white/5 text-white font-light tracking-widest uppercase px-10 py-4 rounded-xl hover:bg-white/10 hover:border-accent/50 transition-colors text-sm min-w-[200px] backdrop-blur-md text-center">
                See rates
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
}
