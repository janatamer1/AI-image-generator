/* AI image generation — races 3 parallel requests, uses whichever loads first */

const TIMEOUT_MS = 25000;

function buildUrl(prompt, model, seed) {
  const encoded = encodeURIComponent(prompt.trim());
  return `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&model=${model}&seed=${seed}`;
}

function loadImageUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error('failed'));
    img.src = url;
  });
}

function generateImageFromPrompt(prompt) {
  const base = Math.floor(Math.random() * 999999);
  const candidates = [
    buildUrl(prompt, 'turbo', base),
    buildUrl(prompt, 'turbo', base + 1),
    buildUrl(prompt, 'flux-schnell', base + 2),
  ];

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
  );

  return Promise.race([
    Promise.any(candidates.map(url => loadImageUrl(url))),
    timeout
  ]);
}

window.generateImageFromPrompt = generateImageFromPrompt;
