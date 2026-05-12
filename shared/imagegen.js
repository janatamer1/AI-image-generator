/* AI image generation using Pollinations.ai — prompt-accurate, no API key required */

function getImageForPrompt(prompt) {
  const encoded = encodeURIComponent(prompt.trim());
  return `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&nologo=true&model=flux-schnell`;
}

window.getImageForPrompt = getImageForPrompt;
