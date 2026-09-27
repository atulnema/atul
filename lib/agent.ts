// Live chat agent settings shared by the widget and the API route.
// The system prompt lives in lib/agentPrompt.ts so it stays on the server.

export const agent = {
  name: "Astra",
  model: "claude-opus-5",
  // Chat replies should be short; this also caps cost per message.
  maxTokens: 2048,
  // Limits on what a visitor can send, enforced by the API route.
  maxMessages: 24,
  maxMessageChars: 2000,
  greeting:
    "Hey, I'm Astra, the Alphastrix assistant. Ask me about SEO, ads, websites or branding, or tell me what you're trying to grow.",
  suggestions: [
    "What services do you offer?",
    "How does your process work?",
    "Can you help my local business rank?",
    "I want to talk to a human",
  ],
};
