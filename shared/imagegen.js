/* Image generation — races LoremFlickr (instant keyword photos) + Pollinations (AI).
   LoremFlickr is the reliable backbone; Pollinations wins if it's fast. */

const ATTEMPT_TIMEOUT = 20000;
const MAX_ATTEMPTS = 2;

const STOP_WORDS = new Set([
  'a','an','the','of','in','on','at','to','for','with','is','are','was','were',
  'be','been','being','create','make','generate','show','me','my','please',
  'picture','image','photo','i','want','can','you','and','or','but','so',
  'very','really','just','some','there','here','that','this','it','its','give'
]);

function extractKeywords(prompt) {
  const words = prompt.toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .slice(0, 4);
  return words.length ? words.join(',') : 'nature,scenery';
}

function buildLoremFlickrUrl(prompt, seed) {
  const keywords = extractKeywords(prompt);
  return `https://loremflickr.com/800/800/${encodeURIComponent(keywords)}?random=${seed}`;
}

function buildPollinationsUrl(prompt, model, seed) {
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

    const seed = Math.floor(Math.random() * 999999);

    const candidates = [
      buildLoremFlickrUrl(prompt, seed),
      buildLoremFlickrUrl(prompt, seed + 1),
      buildPollinationsUrl(prompt, 'turbo', seed),
      buildPollinationsUrl(prompt, 'flux-schnell', seed + 1),
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
