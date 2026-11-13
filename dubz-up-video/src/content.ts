// Every word and number in the film lives here.
//
// Dubz Up is presented as an AI dubbing product. The market sizes and traction
// figures below are PLACEHOLDERS written for the storyboard, not real data.
// Replace them with your own numbers, then set `showIllustrativeNote` to false.

export const content = {
  showIllustrativeNote: true,
  illustrativeNote: "Illustrative figures",

  hook: {
    lead: "The world speaks",
    count: 7000,
    unit: "languages.",
    turn: "Your video speaks",
    punch: "one.",
    lonely: "Hello",
    hellos: [
      "Hola",
      "Bonjour",
      "नमस्ते",
      "こんにちは",
      "안녕하세요",
      "مرحبا",
      "Olá",
      "Ciao",
      "你好",
      "Hallo",
    ],
  },

  problem: {
    title: ["Dubbing", "is", "broken."],
    cards: [
      { title: "Slow", sub: "Weeks for every language" },
      { title: "Pricey", sub: "Studios, actors, retakes" },
      { title: "Off-brand", sub: "It never sounds like you" },
    ],
  },

  reveal: {
    meet: "Meet",
    chips: ["One upload.", "Every language.", "Your voice."],
  },

  how: {
    steps: [
      { title: ["Drop your", "video"], sub: "Any format, any length." },
      { title: ["Clone your", "voice"], sub: "Tone, pace, personality." },
      { title: ["Pick your", "languages"], sub: "Tap the markets you want." },
      { title: ["Publish", "everywhere"], sub: "Lip-synced, ready to post." },
    ],
    fileName: "launch.mp4",
    cloned: "Voice cloned",
    selected: "languages selected",
    button: "Dub it!",
    badge: ["Done in", "minutes"],
    languages: [
      { label: "English", on: false },
      { label: "Español", on: true },
      { label: "हिन्दी", on: true },
      { label: "日本語", on: true },
      { label: "Français", on: true },
      { label: "Deutsch", on: false },
      { label: "한국어", on: true },
      { label: "العربية", on: true },
      { label: "Português", on: true },
      { label: "Italiano", on: false },
      { label: "中文", on: true },
      { label: "Türkçe", on: false },
    ],
    outputs: [
      { tag: "ES", hello: "¡Hola!" },
      { tag: "HI", hello: "नमस्ते" },
      { tag: "JA", hello: "こんにちは" },
      { tag: "FR", hello: "Salut !" },
      { tag: "AR", hello: "مرحبا" },
    ],
  },

  market: {
    title: ["A market that", "speaks volumes."],
    sub: "Every video wants a global audience.",
    rings: [
      { key: "TAM", label: "Video localisation", value: 30, prefix: "$", suffix: "B" },
      { key: "SAM", label: "Creator and brand video", value: 8, prefix: "$", suffix: "B" },
      { key: "SOM", label: "Year 5 target", value: 400, prefix: "$", suffix: "M" },
    ],
  },

  traction: {
    title: "Growing loud and fast.",
    chartTitle: "Waitlist signups",
    chartTag: "Monthly",
    months: ["M1", "M2", "M3", "M4", "M5", "M6"],
    bars: [0.12, 0.2, 0.31, 0.47, 0.69, 1],
    growth: "+38% MoM",
    stats: [
      { value: 12400, suffix: "", label: "creators on the waitlist" },
      { value: 42, suffix: "", label: "languages supported" },
      { value: 0, text: "SaaS + usage", label: "subscription + pay per minute" },
    ],
  },

  ask: {
    lines: ["Every voice.", "Everywhere."],
    round: "Raising our seed round",
    cta: "Let's talk",
  },
} as const;
