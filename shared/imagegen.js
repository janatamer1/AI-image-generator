/* Image generation strategy:
   1. Try `flux` model with prompt enhancement — most accurate, prompt-faithful.
   2. If it times out, fall back to `flux-schnell` — faster, still good accuracy.
   3. Never race models; always prefer quality over speed.
   4. Auto-enrich short/vague prompts so the model has enough context. */

const FLUX_TIMEOUT        = 55000;
const FLUX_SCHNELL_TIMEOUT = 35000;

/* Enrich very short prompts so the model understands the intent clearly */
function enrichPrompt(prompt) {
  const trimmed = prompt.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  /* Already a detailed prompt — leave it alone */
  if (wordCount >= 5) return trimmed;

  /* Short prompt: wrap it so the model knows we want a clear, realistic image */
  return `A high-quality, photorealistic image of ${trimmed}, detailed, sharp focus, well-lit`;
}

function buildPollinationsUrl(prompt, model, seed, enhance) {
  const encoded = encodeURIComponent(prompt.trim());
  return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&enhance=${enhance}&model=${model}&seed=${seed}&safe=false`;
}

function loadImageUrl(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.src = '';
      reject(new Error('timeout'));
    }, timeoutMs);
    img.onload = () => { clearTimeout(timer); resolve(url); };
    img.onerror = () => { clearTimeout(timer); reject(new Error('load error')); };
    img.src = url;
  });
}

async function generateImageFromPrompt(prompt, onAttempt) {
  const seed = Math.floor(Math.random() * 999999);
  const enriched = enrichPrompt(prompt);

  /* ── Phase 1: flux — highest accuracy, prompt-faithful ── */
  if (onAttempt) onAttempt(1, 2);

  const fluxUrl = buildPollinationsUrl(enriched, 'flux', seed, 'true');

  try {
    return await loadImageUrl(fluxUrl, FLUX_TIMEOUT);
  } catch {
    /* flux timed out or failed — try flux-schnell */
  }

  /* ── Phase 2: flux-schnell — faster, still accurate ── */
  if (onAttempt) onAttempt(2, 2);

  const schnellUrl = buildPollinationsUrl(enriched, 'flux-schnell', seed, 'true');
  return await loadImageUrl(schnellUrl, FLUX_SCHNELL_TIMEOUT);
}

window.generateImageFromPrompt = generateImageFromPrompt;
