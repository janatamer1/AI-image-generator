/* Image generation — races Pollinations (AI) against Unsplash (fast fallback).
   Whichever loads first wins. User always gets a result. */

const ATTEMPT_TIMEOUT = 30000;
const MAX_ATTEMPTS = 2;

const STOP_WORDS = new Set([
  'a','an','the','of','in','on','at','to','for','with','is','are','was','were',
  'be','been','being','create','make','generate','show','me','my','please',
  'picture','image','photo','i','want','can','you','and','or','but','so',
  'very','really','just','some','there','here','that','this','it','its'
]);

function extractKeywords(prompt) {
  const words = prompt.toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .slice(0, 5);
  return words.length ? words.join(',') : 'art';
}

function buildPollinationsUrl(prompt, model, seed) {
  const encoded = encodeURIComponent(prompt.trim());
  return `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&model=${model}&seed=${seed}`;
}

function buildUnsplashUrl(prompt) {
  const keywords = extractKeywords(prompt);
  return `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(keywords)}`;
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
      buildUnsplashUrl(prompt),
      buildPollinationsUrl(prompt, 'turbo', base),
      buildPollinationsUrl(prompt, 'turbo', base + 1),
      buildPollinationsUrl(prompt, 'flux-schnell', base + 2),
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
