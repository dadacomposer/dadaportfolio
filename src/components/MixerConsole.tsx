'use client';
import React from 'react';
import styles from './MixerConsole.module.css';

interface ServiceChannel {
  id: string;
  title: string;
  color: string;
  level: number; // 0 to 10
  faderTarget: number; // Percentage 0-100
}

const services: ServiceChannel[] = [
  { id: 'CH 01', title: 'SOUND DESIGN', color: '#4da6ff', level: 8, faderTarget: 75 },
  { id: 'CH 02', title: 'CUSTOM MUSIC', color: '#ffb347', level: 9, faderTarget: 85 },
  { id: 'CH 03', title: 'ADR & FOLEY', color: '#cda4de', level: 6, faderTarget: 60 },
  { id: 'CH 04', title: 'VOX EDITING', color: '#77dd77', level: 7, faderTarget: 70 },
  { id: 'CH 05', title: 'AUDIO RESTO', color: '#ff6961', level: 5, faderTarget: 50 },
  { id: 'CH 06', title: 'MIX & MASTER', color: '#d4af37', level: 10, faderTarget: 95 },
];

export default function MixerConsole() {
  return (
    <div className={styles.mixerContainer}>
      {services.map((service) => (
        <div key={service.id} className={styles.channelStrip}>
          
          <div className={styles.channelHeader}>
            <div className={styles.channelId}>{service.id}</div>
            <div className={styles.channelTitle} style={{ color: service.color }}>
              {service.title}
            </div>
          </div>

          <div className={styles.vuMeter}>
            {/* Create 10 segments */}
            {Array.from({ length: 10 }).map((_, i) => {
              // Bottom segments are green-ish, middle yellow-ish, top red-ish (simplified to use the channel color or a gradient)
              // For a minimal look, we'll just use the channel's designated color, or fallback to accent.
              // i is 0 (bottom) to 9 (top) because column-reverse
              const isActive = i < service.level - 2; // statically active
              const isDynamic = i >= service.level - 2 && i < service.level; // flickers on hover
              
              let segmentClass = styles.vuSegment;
              if (isActive) segmentClass += ` ${styles.active}`;
              if (isDynamic) segmentClass += ` ${styles.dynamicActive}`;

              // Make the top 2 segments red/orange to simulate peaking, if we want.
              // But keeping it monochrome to the channel color is more elegant.
              let color = service.color;
              if (i >= 8) color = '#ff4d4d'; // Red for peaks

              return (
                <div 
                  key={i} 
                  className={segmentClass} 
                  style={{ '--segment-color': color } as React.CSSProperties}
                />
              );
            })}
          </div>

          <div className={styles.faderTrack}>
            <div 
              className={styles.faderThumb} 
              style={{ 
                bottom: `${service.faderTarget - 10}%`,
                '--fader-target': `${service.faderTarget}%`
              } as React.CSSProperties}
            >
              <div className={styles.faderLine}></div>
            </div>
          </div>

          <div 
            className={styles.panIndicator} 
            style={{ backgroundColor: service.color }}
          ></div>

        </div>
      ))}
    </div>
  );
}
