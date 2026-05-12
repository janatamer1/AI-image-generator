/* AI image generation using Pollinations.ai — prompt-accurate, no API key required */

function getImageForPrompt(prompt) {
  const encoded = encodeURIComponent(prompt.trim());
  return `https://image.pollinations.ai/prompt/${encoded}?width=832&height=832&nologo=true&enhance=true`;
}

window.getImageForPrompt = getImageForPrompt;
