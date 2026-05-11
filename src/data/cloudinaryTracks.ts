// Catalogo audio — servito da Cloudinary CDN con Preview Points ottimizzati
// I previewStart sono impostati per far partire il brano nel momento di picco (circa 30-45s)

export interface Track {
  _id: string;
  title: string;
  url: string;
  artwork?: string;
  previewStart: number;
}

export const cloudinaryTracks: Track[] = [
  { _id: "falling-stars", title: "Falling Stars", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/falling-stars.mp3", previewStart: 32 },
  { _id: "gravity-of-us", title: "Gravity of Us", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/gravity-of-us.mp3", previewStart: 45 },
  { _id: "secretly-silly", title: "Secretly Silly", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/secretly-silly.mp3", previewStart: 15 },
  { _id: "just-for-good-days", title: "Just For Good Days", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/just-for-good-days.mp3", previewStart: 28 },
  { _id: "a-greater-unknown", title: "A Greater Unknown", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/a-greater-unknown.mp3", previewStart: 40 },
  { _id: "mr-nobody", title: "Mr. nobody", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/mr-nobody.mp3", previewStart: 35 },
  { _id: "cried-out", title: "Cried Out", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/cried-out.mp3", previewStart: 50 },
  { _id: "cloud-recesses", title: "Cloud Recesses", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/cloud-recesses.mp3", previewStart: 22 },
  { _id: "stormy-sea", title: "Stormy Sea", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/stormy-sea.mp3", previewStart: 45 },
  { _id: "the-mountain-spirit", title: "The Mountain Spirit", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/the-mountain-spirit.mp3", previewStart: 38 },
  { _id: "when-the-thunder-sleeps", title: "When the thunder sleeps", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/when-the-thunder-sleeps.mp3", previewStart: 42 },
  { _id: "yatagarasu", title: "Yatagarasu", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/yatagarasu.mp3", previewStart: 30 },
  { _id: "dark-matter", title: "dark matter", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/dark-matter.mp3", previewStart: 48 },
  { _id: "kodawari", title: "kodawari", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/kodawari.mp3", previewStart: 33 },
  { _id: "one-more-star", title: "One More Star", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/one-more-star.mp3", previewStart: 25 },
  { _id: "beneath-the-surface", title: "Beneath the surface", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/beneath-the-surface.mp3", previewStart: 44 },
  { _id: "inner-exploration", title: "Inner Exploration", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/inner-exploration.mp3", previewStart: 37 },
  { _id: "empty-city", title: "Empty city", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/empty-city.mp3", previewStart: 30 },
  { _id: "alter", title: "Alter", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/alter.mp3", previewStart: 40 },
  { _id: "mooving-particles", title: "Mooving particles", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/mooving-particles.mp3", previewStart: 35 },
  { _id: "new-dawns", title: "New Dawns", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/new-dawns.mp3", previewStart: 42 },
  { _id: "cycles", title: "Cycles", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/cycles.mp3", previewStart: 30 },
  { _id: "the-logic-of-sound", title: "The Logic of Sound", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/the-logic-of-sound.mp3", previewStart: 28 },
  { _id: "piano-dots", title: "piano dots", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/piano-dots.mp3", previewStart: 18 },
  { _id: "soft-error", title: "Soft Error", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/soft-error.mp3", previewStart: 35 },
  { _id: "the-clarity-effect", title: "The Clarity Effect", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/the-clarity-effect.mp3", previewStart: 40 },
  { _id: "cerebral-cabaret", title: "Cerebral Cabaret", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/cerebral-cabaret.mp3", previewStart: 45 },
  { _id: "quiet-logic", title: "Quiet Logic", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/quiet-logic.mp3", previewStart: 30 },
  { _id: "still-static", title: "Still Static", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/still-static.mp3", previewStart: 35 },
  { _id: "solitude", title: "Solitude", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/solitude.mp3", previewStart: 40 },
  { _id: "embers", title: "Embers", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/embers.mp3", previewStart: 22 },
  { _id: "ballet-abyss", title: "Ballet Abyss", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/ballet-abyss.mp3", previewStart: 38 },
  { _id: "the-compass-within", title: "The Compass Within", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/the-compass-within.mp3", previewStart: 42 },
  { _id: "the-leap", title: "The Leap", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/the-leap.mp3", previewStart: 30 },
  { _id: "breathe-again", title: "Breathe Again", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/breathe-again.mp3", previewStart: 35 },
  { _id: "tippy-toes", title: "Tippy Toes", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/tippy-toes.mp3", previewStart: 20 },
  { _id: "sweet-dreams", title: "Sweet dreams", url: "https://res.cloudinary.com/dna1jd017/video/upload/dada-composer/audio/sweet-dreams.mp3", previewStart: 30 },
];
