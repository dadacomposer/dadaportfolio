'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { client } from '@/sanity/lib/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProjectCard from './ProjectCard';
import ProjectIslandModal from './ProjectIslandModal';

// Sub-component to handle giant scroll logic safely
function ProjectScroll({ projects, openModal, hideArrows }: { projects: any[], openModal: (idx: number) => void, hideArrows: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: containerRef });

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = window.innerWidth * 0.9;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full relative h-[600px] md:h-[800px] flex items-center group/carousel">
      {/* Navigation Arrows - Maximum Visibility */}
      <AnimatePresence>
        {!hideArrows && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-y-0 left-0 md:left-10 flex items-center z-[999] pointer-events-none px-4"
            >
              <button 
                onClick={() => scroll('left')}
                className="w-14 h-14 md:w-20 md:h-20 rounded-full border border-white/20 bg-black/60 backdrop-blur-2xl flex items-center justify-center text-white hover:bg-accent transition-all pointer-events-auto shadow-2xl"
              >
                <ChevronLeft size={40} strokeWidth={1.5} />
              </button>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-y-0 right-0 md:right-10 flex items-center z-[999] pointer-events-none px-4"
            >
              <button 
                onClick={() => scroll('right')}
                className="w-14 h-14 md:w-20 md:h-20 rounded-full border border-white/20 bg-black/60 backdrop-blur-2xl flex items-center justify-center text-white hover:bg-accent transition-all pointer-events-auto shadow-2xl"
              >
                <ChevronRight size={40} strokeWidth={1.5} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Carousel Container */}
      <div 
        ref={containerRef}
        className="flex gap-16 md:gap-32 overflow-x-auto px-[5vw] py-10 snap-x snap-mandatory hide-scrollbar relative z-30 w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {projects.map((project, index) => (
          <ProjectCard 
            key={`${project._id}-${index}`} 
            project={project} 
            onClick={() => openModal(index)} 
            containerRef={containerRef}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProjectCarousel() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    client.fetch(`*[_type == "project"] | order(year desc) {
      _id,
      title,
      role,
      category,
      year,
      "videoUrl": videoFile.asset->url,
      "coverImageUrl": coverImage.asset->url,
      externalUrl
    }`).then(data => {
      // Robust sorting for Prada
      const prada = data.find((p: any) => p.title.toUpperCase().includes('PRADA'));
      const others = data.filter((p: any) => !p.title.toUpperCase().includes('PRADA'));
      const sorted = prada ? [prada, ...others] : data;
      setProjects([...sorted, ...sorted, ...sorted]);
    });
  }, []);

  const openModal = (index: number) => {
    const originalLength = projects.length / 3;
    setSelectedIndex(index % originalLength);
    setModalOpen(true);
  };
  
  return (
    <>
      {/* Anchor point positioned slightly above the section for better framing */}
      <div id="work" className="relative -top-24 h-0" />
      
      <div className="w-full relative py-20 md:py-32 overflow-hidden bg-deepblack min-h-screen flex flex-col justify-center border-t border-white/5">
        {/* Monumental Background Text - Positioned for layered effect */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none flex items-start justify-center overflow-hidden opacity-10 pt-20 md:pt-32">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-[35vw] font-bold tracking-tighter text-white/50 leading-none uppercase"
          >
            Work
          </motion.h2>
        </div>

        {projects.length > 0 ? (
          <ProjectScroll projects={projects} openModal={openModal} hideArrows={modalOpen} />
        ) : (
          <div className="w-full h-80 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <ProjectIslandModal 
        isOpen={modalOpen}
        projects={projects.length > 0 ? projects.slice(0, projects.length / 3) : []}
        selectedIndex={selectedIndex}
        onClose={() => setModalOpen(false)}
        onChangeIndex={setSelectedIndex}
      />
    </>
  );
}
