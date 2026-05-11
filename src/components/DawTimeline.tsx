'use client';
import React, { useState } from 'react';
import { X, Play } from 'lucide-react';
import styles from './DawTimeline.module.css';

interface RegionData {
  id: string;
  title: string;
  start: number; // percentage 0-100
  width: number; // percentage 0-100
}

interface TrackData {
  label: string;
  color: string;
  regions: RegionData[];
}

const timelineData: TrackData[] = [
  {
    label: 'FILM - 2024',
    color: '#997326', // Muted amber/gold
    regions: [
      { id: 'f1', title: 'Il Confine · Feature Film', start: 0, width: 45 },
      { id: 'f2', title: 'Notte Bianca · Short', start: 50, width: 35 },
    ]
  },
  {
    label: 'SERIES - 2024',
    color: '#2d5940', // Muted green
    regions: [
      { id: 's1', title: 'RAI 1 Series · S02', start: 5, width: 60 },
      { id: 's2', title: 'Netflix IT · Doc', start: 68, width: 25 },
    ]
  },
  {
    label: 'MUSIC - 2023',
    color: '#593359', // Muted purple
    regions: [
      { id: 'm1', title: 'Album Mix', start: 0, width: 20 },
      { id: 'm2', title: 'Live Concert Film', start: 23, width: 35 },
      { id: 'm3', title: 'Score Edit', start: 62, width: 28 },
    ]
  },
  {
    label: 'COMMERCIAL',
    color: '#264d73', // Muted blue
    regions: [
      { id: 'c1', title: 'Fiat', start: 0, width: 15 },
      { id: 'c2', title: 'Lavazza', start: 18, width: 15 },
      { id: 'c3', title: 'Ferrari', start: 36, width: 20 },
      { id: 'c4', title: 'Campari', start: 60, width: 18 },
      { id: 'c5', title: 'ENI', start: 82, width: 12 },
    ]
  }
];

export default function DawTimeline() {
  const [selectedVideo, setSelectedVideo] = useState<RegionData | null>(null);

  return (
    <>
      <div className={styles.timelineContainer}>
        <div className={styles.timelineHeader}>
          <div className={styles.timelineTitle}>PORTFOLIO TIMELINE</div>
          <div className={styles.timelineLine}></div>
        </div>

        <div className={styles.gridArea}>
          {/* Time Ruler */}
          <div className={styles.timeRuler}>
            <div className={styles.timeMark}>|1</div>
            <div className={styles.timeMark}>|5</div>
            <div className={styles.timeMark}>|9</div>
            <div className={styles.timeMark}>|13</div>
            <div className={styles.timeMark}>|17</div>
            <div className={styles.timeMark}>|21</div>
            <div className={styles.timeMark}>|25</div>
          </div>

          {/* Tracks */}
          {timelineData.map((track, trackIdx) => (
            <div key={trackIdx} className={styles.trackRow}>
              <div className={styles.trackLabel}>{track.label}</div>
              <div className={styles.trackContent}>
                {track.regions.map((region) => (
                  <div 
                    key={region.id}
                    className={styles.region}
                    style={{ 
                      left: `${region.start}%`, 
                      width: `${region.width}%`,
                      '--region-color': track.color 
                    } as React.CSSProperties}
                    onClick={() => setSelectedVideo(region)}
                  >
                    {region.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className={styles.modalOverlay} onClick={() => setSelectedVideo(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{selectedVideo.title}</h3>
              <button className={styles.closeBtn} onClick={() => setSelectedVideo(null)}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.videoPlayer}>
              {/* Placeholder for actual video player */}
              <Play size={48} opacity={0.5} />
              <span style={{ marginLeft: '1rem' }}>Video Player Placeholder</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
