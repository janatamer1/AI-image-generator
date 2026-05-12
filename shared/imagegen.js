/* Image generation strategy:
   1. Fire 6 parallel Pollinations requests (AI — generates the actual prompt).
   2. Wait up to 40 s for any of them to load.
   3. Only if every AI request fails, fall back to LoremFlickr (relevant photo). */

const AI_TIMEOUT    = 40000;
const FLICKR_TIMEOUT = 10000;

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

function buildPollinationsUrl(prompt, model, seed) {
  const encoded = encodeURIComponent(prompt.trim());
  return `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&nologo=true&enhance=false&model=${model}&seed=${seed}`;
}

function buildLoremFlickrUrl(prompt, seed) {
  const keywords = extractKeywords(prompt);
  return `https://loremflickr.com/800/800/${encodeURIComponent(keywords)}?random=${seed}`;
}

function loadImageUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(url);
    img.onerror = () => reject(new Error('failed: ' + url));
    img.src = url;
  });
}

async function generateImageFromPrompt(prompt, onAttempt) {
  const seed = Math.floor(Math.random() * 999999);

  /* ── Phase 1: AI generation (Pollinations) ── */
  if (onAttempt) onAttempt(1, 2);

  const aiUrls = [
    buildPollinationsUrl(prompt, 'turbo',       seed),
    buildPollinationsUrl(prompt, 'turbo',       seed + 1),
    buildPollinationsUrl(prompt, 'turbo',       seed + 2),
    buildPollinationsUrl(prompt, 'flux-schnell', seed + 3),
    buildPollinationsUrl(prompt, 'flux-schnell', seed + 4),
    buildPollinationsUrl(prompt, 'flux',         seed + 5),
  ];

  try {
    return await Promise.race([
      Promise.any(aiUrls.map(url => loadImageUrl(url))),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI timeout')), AI_TIMEOUT)
      ),
    ]);
  } catch {
    /* AI failed — fall through to photo fallback */
  }

  /* ── Phase 2: Photo fallback (LoremFlickr) ── */
  if (onAttempt) onAttempt(2, 2);

  return await Promise.race([
    loadImageUrl(buildLoremFlickrUrl(prompt, seed)),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Flickr timeout')), FLICKR_TIMEOUT)
    ),
  ]);
}

window.generateImageFromPrompt = generateImageFromPrompt;
