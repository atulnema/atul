// Languages and voices used by the Indic Studio page (/studio).
// Shared by the client UI and the API routes, so the routes can reject anything
// the UI would never send.

// The 11 languages covered by both mayura:v1 (translate) and bulbul:v3 (speech).
export const languages = [
  { code: "en-IN", label: "English", native: "English" },
  { code: "hi-IN", label: "Hindi", native: "हिन्दी" },
  { code: "bn-IN", label: "Bengali", native: "বাংলা" },
  { code: "ta-IN", label: "Tamil", native: "தமிழ்" },
  { code: "te-IN", label: "Telugu", native: "తెలుగు" },
  { code: "gu-IN", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn-IN", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml-IN", label: "Malayalam", native: "മലയാളം" },
  { code: "mr-IN", label: "Marathi", native: "मराठी" },
  { code: "pa-IN", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "od-IN", label: "Odia", native: "ଓଡ଼ିଆ" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

// mayura:v1 tones. "code-mixed" keeps English brand words inside the Indic text,
// which is usually what ad copy wants.
export const tones = [
  { id: "formal", label: "Formal" },
  { id: "modern-colloquial", label: "Everyday" },
  { id: "code-mixed", label: "Hinglish-style mix" },
] as const;

export type Tone = (typeof tones)[number]["id"];

// A short, curated subset of bulbul:v3 speakers.
export const voices = [
  { id: "shubh", label: "Shubh", gender: "Male" },
  { id: "priya", label: "Priya", gender: "Female" },
  { id: "aditya", label: "Aditya", gender: "Male" },
  { id: "ritu", label: "Ritu", gender: "Female" },
  { id: "kabir", label: "Kabir", gender: "Male" },
  { id: "kavya", label: "Kavya", gender: "Female" },
] as const;

export type VoiceId = (typeof voices)[number]["id"];

export const MAX_TRANSLATE_CHARS = 1000; // mayura:v1 limit
export const MAX_SPEAK_CHARS = 1500; // bulbul:v3 allows 2500; kept lower to cap cost

export const isLanguage = (v: unknown): v is LanguageCode =>
  languages.some((l) => l.code === v);
export const isTone = (v: unknown): v is Tone => tones.some((t) => t.id === v);
export const isVoice = (v: unknown): v is VoiceId => voices.some((s) => s.id === v);
