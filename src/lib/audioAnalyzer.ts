export function calculateZcrFromSamples(samples: Float32Array): number {
  let crossings = 0;
  for (let i = 1; i < samples.length; i++) {
    if ((samples[i] >= 0 && samples[i - 1] < 0) || (samples[i] < 0 && samples[i - 1] >= 0)) {
      crossings++;
    }
  }
  return crossings / samples.length;
}

export function calculateBpmFromSamples(samples: Float32Array, sampleRate: number): number {
  const frameSize = 1024;
  const energies = [];
  
  for (let i = 0; i < samples.length; i += frameSize) {
    let sum = 0;
    const count = Math.min(frameSize, samples.length - i);
    for (let j = 0; j < count; j++) {
      sum += Math.abs(samples[i + j]);
    }
    energies.push(sum / count);
  }

  const peaks: number[] = [];
  const movingAverageWindow = 43; // ~1s window
  
  for (let i = 0; i < energies.length; i++) {
    const start = Math.max(0, i - Math.floor(movingAverageWindow / 2));
    const end = Math.min(energies.length, i + Math.floor(movingAverageWindow / 2));
    let localSum = 0;
    for (let k = start; k < end; k++) {
      localSum += energies[k];
    }
    const localAvg = localSum / (end - start);

    const current = energies[i];
    const prev = i > 0 ? energies[i - 1] : 0;
    const next = i < energies.length - 1 ? energies[i + 1] : 0;
    
    if (current > prev && current > next && current > localAvg * 1.3) {
      peaks.push(i);
    }
  }

  if (peaks.length < 2) return 80;

  const intervals: number[] = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }

  const bpms = intervals.map(interval => {
    const durationInSeconds = (interval * frameSize) / sampleRate;
    return 60 / durationInSeconds;
  });

  const filteredBpms = bpms.filter(bpm => bpm >= 60 && bpm <= 180);
  if (filteredBpms.length === 0) return 80;

  const bins: { [key: number]: number } = {};
  filteredBpms.forEach(bpm => {
    const rounded = Math.round(bpm / 5) * 5;
    bins[rounded] = (bins[rounded] || 0) + 1;
  });

  let maxCount = 0;
  let dominantBpm = 80;
  for (const bpm in bins) {
    const bpmNum = parseInt(bpm);
    if (bins[bpmNum] > maxCount) {
      maxCount = bins[bpmNum];
      dominantBpm = bpmNum;
    }
  }

  if (dominantBpm < 70) dominantBpm *= 2;
  if (dominantBpm > 140) dominantBpm = Math.round(dominantBpm / 2);
  
  if (dominantBpm < 70) dominantBpm = 72;
  if (dominantBpm > 140) dominantBpm = 138;

  return dominantBpm;
}

export function generateKeywordsFromMetadata(title: string, zcr: number, bpm: number): string {
  const keywordsSet = new Set<string>();
  
  if (zcr < 0.045) {
    ["Dark", "Deep", "Warm", "Brooding", "Moody", "Sub-heavy", "Somber", "Intimate", "Melancholic", "Low-end"].forEach(k => keywordsSet.add(k));
  } else if (zcr >= 0.045 && zcr < 0.08) {
    ["Cinematic", "Atmospheric", "Reflective", "Emotional", "Beautiful", "Calm", "Organic", "Warm", "Gentle"].forEach(k => keywordsSet.add(k));
  } else {
    ["Bright", "Shimmering", "Crisp", "Uplifting", "Airy", "Tension", "High-energy", "Vivid", "Dynamic", "Sparkling"].forEach(k => keywordsSet.add(k));
  }

  if (bpm >= 115) {
    ["Driving", "Fast-paced", "Dynamic", "Action", "Rhythmic", "Urgent", "Pulse", "Suspenseful"].forEach(k => keywordsSet.add(k));
  } else if (bpm < 85) {
    ["Ambient", "Slow-tempo", "Relaxing", "Calm", "Ethereal", "Floating", "Spacey", "Minimalist"].forEach(k => keywordsSet.add(k));
  } else {
    ["Mid-tempo", "Flowing", "Steady", "Progressive", "Determined", "Moving"].forEach(k => keywordsSet.add(k));
  }

  const titleLower = title.toLowerCase();
  if (titleLower.includes('hope') || titleLower.includes('rise') || titleLower.includes('bright') || titleLower.includes('sun') || titleLower.includes('love') || titleLower.includes('beautiful') || titleLower.includes('happy') || titleLower.includes('together') || titleLower.includes('turning')) {
    ["Uplifting", "Hopeful", "Inspiring", "Triumphant", "Optimistic", "Heartwarming"].forEach(k => keywordsSet.add(k));
  }
  if (titleLower.includes('dark') || titleLower.includes('shadow') || titleLower.includes('night') || titleLower.includes('lost') || titleLower.includes('ghost') || titleLower.includes('gone') || titleLower.includes('cry') || titleLower.includes('sad') || titleLower.includes('happen') || titleLower.includes('exit')) {
    ["Mysterious", "Dramatic", "Suspense", "Melancholy", "Intriguing", "Haunting"].forEach(k => keywordsSet.add(k));
  }
  if (titleLower.includes('chase') || titleLower.includes('run') || titleLower.includes('action') || titleLower.includes('power') || titleLower.includes('drive') || titleLower.includes('thunder') || titleLower.includes('fire')) {
    ["Energetic", "Powerful", "Bold", "Aggressive", "Climactic"].forEach(k => keywordsSet.add(k));
  }

  ["Cinematic", "DADA", "Daniel Angelucci", "Composer", "Music Vine", "Background Music", "Soundtrack", "Instrumental", "Production Music"].forEach(k => keywordsSet.add(k));

  return Array.from(keywordsSet).join(', ');
}
