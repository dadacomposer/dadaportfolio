'use client';

import { useState, useEffect } from 'react';
import ShareCommentSystem from '@/components/admin/ShareCommentSystem';
import ShareActivityLog from '@/components/admin/ShareActivityLog';

interface SharePageClientProps {
  playlist: any;
  tracks: any[];
}

export default function SharePageClient({ playlist, tracks }: SharePageClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Open sidebar by default on desktop viewports
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  const playlistTitle = playlist.title.replace(' (Single Share)', '');

  return (
    <div className="min-h-screen bg-deepblack text-white px-6 pb-6 md:px-12 md:pb-12 font-sans selection:bg-accent selection:text-white relative overflow-x-hidden">
      
      {/* Fixed Header Container (Logo + Title + Info) */}
      <div className={`fixed top-0 left-0 right-0 z-[95] bg-deepblack px-6 pt-8 pb-6 md:px-12 md:pt-12 md:pb-8 border-b border-white/10 text-left transition-all duration-300 ${
        playlist.permission_level === 'musicvine' && isSidebarOpen ? 'lg:pr-[370px]' : ''
      }`}>
        <div className="max-w-4xl">
          {/* Logo */}
          <div className="mb-6 md:mb-8">
            <a href="https://www.dadacomposer.com/" className="text-xl font-bold tracking-tighter text-white flex items-baseline">
              DADA<span className="text-accent">.</span>
              <span className="text-xl text-white/40 ml-0.5 tracking-tighter font-medium">COMPOSER</span>
            </a>
          </div>
          {/* Playlist Title & Metadata */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-none mb-4">{playlistTitle}</h1>
          <p className="text-white/50 tracking-widest uppercase text-xs md:text-sm">
            Curated by DADA • {tracks.length} Tracks
            {playlist.permission_level === 'musicvine' && ' • Feedback Mode'}
            {playlist.permission_level === 'download' && ' • Download Available'}
          </p>
        </div>
      </div>
      
      {/* Activity Log (Musicvine mode only) */}
      {playlist.permission_level === 'musicvine' && (
        <ShareActivityLog 
          playlistId={playlist.id} 
          tracks={tracks} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
        />
      )}

      {/* Main Content Area (Shifts dynamically) */}
      <div className={`max-w-4xl mx-auto transition-all duration-300 pt-[180px] md:pt-[240px] ${
        playlist.permission_level === 'musicvine' && isSidebarOpen ? 'lg:pr-[370px] lg:max-w-[100%]' : ''
      }`}>

        {/* Tracks List */}
        <div className="space-y-4">
          {tracks.map((track, index) => (
            <ShareCommentSystem 
              key={track.id} 
              track={track} 
              index={index}
              playlistId={playlist.id}
              playlistTitle={playlist.title}
              permissionLevel={playlist.permission_level} 
            />
          ))}
        </div>

        {/* Footer (for Musicvine mode only) */}
        {playlist.permission_level === 'musicvine' && (
          <div className="max-w-3xl mx-auto mt-20 pt-10 border-t border-white/10 space-y-10">
            
            {/* Music Vine Submission Declarations */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-4 backdrop-blur-sm">
              <h3 className="text-xs uppercase tracking-widest text-accent font-bold mb-4">Music Vine Submission Declarations</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-0.5 font-bold">✓</span>
                  <span>I am the only artist / composer to receive license commissions from this track.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-0.5 font-bold">✓</span>
                  <span>I own all rights to this track (master recording & composition) or have permission from all rights holders to submit this track.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-0.5 font-bold">✓</span>
                  <span>Track aligns with Music Vine's AI policy.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-0.5 font-bold">✓</span>
                  <span>I authorize Music Vine as my publisher.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-0.5 font-bold">✓</span>
                  <span>This track doesn't contain Lyrics.</span>
                </li>
              </ul>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
