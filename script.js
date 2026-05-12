/* ========================================
   Homepage Logic
   ======================================== */

function updateNavbarAuth() {
  const user = getCurrentUser();
  const authActions = document.getElementById('homeAuthActions');
  if (!authActions) return;

  if (user) {
    const dashboardUrl = user.role === 'admin' ? '/pages/admin-dashboard/index.html' : '/pages/user-dashboard/index.html';
    authActions.innerHTML = `
      <a href="${dashboardUrl}" class="btn btn-ghost">Dashboard</a>
      <button onclick="logout()" class="btn btn-primary">Log Out</button>
    `;
  }
}

initNavbar();
updateNavbarAuth();

function fillPrompt(text) {
  const input = document.getElementById('promptInput');
  if (input) {
    input.value = text;
    input.focus();
  }
}

function generateImage() {
  const promptInput = document.getElementById('promptInput');
  const promptText = promptInput.value.trim();

  if (!promptText) {
    promptInput.focus();
    return;
  }

  const generatorOutput = document.getElementById('generatorOutput');
  const outputImage = document.getElementById('outputImage');
  const loadingState = document.getElementById('loadingState');
  const outputActions = document.getElementById('outputActions');
  const outputPromptText = document.getElementById('outputPromptText');
  const generateBtn = document.getElementById('generateBtn');

  generateBtn.disabled = true;
  generateBtn.innerHTML = `<div class="btn-spinner"></div> Generating...`;

  generatorOutput.classList.add('active');
  outputImage.style.display = 'none';
  outputActions.style.display = 'none';
  function buildLoadingHTML(attempt, max) {
    const attemptText = max > 1 && attempt > 1 ? ` · Attempt ${attempt}/${max}` : '';
    return `
      <div class="loading-ring"></div>
      <div class="loading-text">
        <p>Creating your image<span id="loadingAttempt">${attemptText}</span></p>
        <span id="loadingTimer">0</span><span>s</span>
      </div>`;
  }

  loadingState.innerHTML = buildLoadingHTML(1, 3);
  loadingState.style.display = 'flex';

  let elapsed = 0;
  const timerInterval = setInterval(() => {
    elapsed += 1;
    const el = document.getElementById('loadingTimer');
    if (el) el.textContent = elapsed;
  }, 1000);

  function resetBtn() {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg> Generate`;
  }

  generateImageFromPrompt(promptText, (attempt, max) => {
    loadingState.innerHTML = buildLoadingHTML(attempt, max);
  }).then(imageUrl => {
    clearInterval(timerInterval);
    loadingState.style.display = 'none';

    outputImage.src = imageUrl;
    outputImage.style.display = 'block';
    outputPromptText.textContent = `"${promptText}"`;
    outputActions.style.display = 'flex';
    resetBtn();
    generatorOutput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }).catch(() => {
    clearInterval(timerInterval);
    loadingState.innerHTML = `
      <div style="text-align:center;">
        <p style="color:#f87171;margin-bottom:12px;">Could not generate image. Please try again.</p>
        <button class="btn btn-primary btn-sm" onclick="generateImage()">Try Again</button>
      </div>`;
    resetBtn();
  });
}

function downloadImage() {
  const outputImage = document.getElementById('outputImage');
  if (!outputImage.src) return;
  const a = document.createElement('a');
  a.href = outputImage.src;
  a.download = 'AI_Generated_Image.jpg';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const GALLERY_IMAGES = [
  { url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800', prompt: 'Misty forest at dawn with golden light rays' },
  { url: 'https://images.pexels.com/photos/3573383/pexels-photo-3573383.jpeg?auto=compress&cs=tinysrgb&w=800', prompt: 'Dark minimalist luxury interior design' },
  { url: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=800', prompt: 'Dramatic ocean waves at sunset' },
];

function initGalleryFavorites() {
  GALLERY_IMAGES.forEach((img, i) => {
    const btn = document.getElementById(`fav-${i}`);
    if (!btn) return;
    if (isFavorite(img.url)) {
      btn.classList.add('active');
    }
  });
}

function toggleGalleryFavorite(event, index, url, prompt) {
  event.stopPropagation();
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '/pages/login/index.html';
    return;
  }
  const btn = document.getElementById(`fav-${index}`);
  const isFav = toggleFavorite({ url, prompt, source: 'gallery' });
  btn.classList.toggle('active', isFav);

  const toast = document.createElement('div');
  toast.className = 'fav-toast';
  toast.textContent = isFav ? '♥ Saved to Favorites' : '♡ Removed from Favorites';
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('promptInput');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') generateImage();
    });
  }
  initGalleryFavorites();
});

window.generateImage = generateImage;
window.downloadImage = downloadImage;
window.fillPrompt = fillPrompt;
window.toggleGalleryFavorite = toggleGalleryFavorite;
