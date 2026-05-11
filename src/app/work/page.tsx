'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { videoProjects } from '@/data/projects';
import ProjectIslandModal from '@/components/ProjectIslandModal';

export default function WorkPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setModalOpen(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 pb-40 pt-12 relative min-h-screen">
      
      <motion.div 
        className="mb-20"
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.0 }}
      >
        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6 text-white">Work.</h1>
        <div className="max-w-2xl text-sm text-gray-400 space-y-4 leading-relaxed">
          <p>
            An archive of selected visual projects, case studies, and commercial campaigns.
          </p>
          <p>
            Each piece represents a unique sonic challenge, ranging from subtle foley and immersive Atmos mixing, 
            to aggressive, fast-paced electronic scoring. My approach is always to treat audio not as a 
            background element, but as a physical material that dictates the emotional weight of the picture.
          </p>
        </div>
      </motion.div>

      {/* Vertical Interactive List / Overlapping Cards */}
      <div className="flex flex-col -space-y-16">
        {videoProjects.map((video, index) => (
          <motion.div 
            key={video._id}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
            whileHover={{ y: -20, transition: { duration: 0.4, ease: "easeOut" } }}
            className="w-full relative group cursor-pointer"
            style={{ zIndex: index }}
            onClick={() => openModal(index)}
          >
            {/* The Card Container */}
            <div className="w-full aspect-[21/9] md:aspect-[3/1] rounded-2xl overflow-hidden relative border border-white/5 flex items-end p-6 md:p-10 bg-deepblack">
              
              {/* Background Mock */}
              <div className="absolute inset-0 bg-anthracite/50 z-0 transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-deepblack via-deepblack/80 to-transparent z-10" />
              
              {/* Subtle Border Glow on Hover instead of Play Button */}
              <div className="absolute inset-0 border border-transparent group-hover:border-accent/30 transition-colors duration-500 z-20 pointer-events-none" />

              {/* Text Content */}
              <div className="relative z-30 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <motion.h3 
                    className="text-3xl md:text-4xl font-light tracking-tight text-white mb-2"
                    initial={{ x: 0 }}
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {video.title}
                  </motion.h3>
                  <p className="text-gray-400 text-xs font-light tracking-widest uppercase">{video.role}</p>
                </div>
                
                <div className="hidden md:flex flex-col items-end text-right">
                  <p className="text-gray-400 text-sm font-light">{video.client}</p>
                  <p className="text-gray-600 text-xs font-mono mt-1">{video.date}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <ProjectIslandModal 
        isOpen={modalOpen}
        projects={videoProjects}
        selectedIndex={selectedIndex}
        onClose={() => setModalOpen(false)}
        onChangeIndex={setSelectedIndex}
      />
    </div>
  );
}
