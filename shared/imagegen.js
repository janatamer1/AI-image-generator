/* AI image generation — auto-retries up to 3 times, races 5 parallel requests per attempt */

const ATTEMPT_TIMEOUT = 20000;
const MAX_ATTEMPTS = 3;

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

async function generateImageFromPrompt(prompt, onAttempt) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (onAttempt) onAttempt(attempt, MAX_ATTEMPTS);

    const base = Math.floor(Math.random() * 999999);
    const candidates = [
      buildUrl(prompt, 'turbo', base),
      buildUrl(prompt, 'turbo', base + 1),
      buildUrl(prompt, 'turbo', base + 2),
      buildUrl(prompt, 'flux-schnell', base + 3),
      buildUrl(prompt, 'flux-schnell', base + 4),
    ];

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ATTEMPT_TIMEOUT)
    );

    try {
      return await Promise.race([
        Promise.any(candidates.map(url => loadImageUrl(url))),
        timeout
      ]);
    } catch {
      if (attempt === MAX_ATTEMPTS) throw new Error('All attempts failed');
    }
  }
}

window.generateImageFromPrompt = generateImageFromPrompt;
