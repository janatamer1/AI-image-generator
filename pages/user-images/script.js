const user = requireAuth('user');
if (user) initImagesPage(user);

let allImages = [];

function initImagesPage(user) {
  initNavbar();
  document.getElementById('userBadge').textContent = user.name;
  allImages = user.images || [];

  const now = new Date().toISOString().slice(0, 7);
  const thisMonth = allImages.filter(img => img.createdAt && img.createdAt.startsWith(now)).length;
  document.getElementById('totalImagesCount').textContent = allImages.length;
  document.getElementById('thisMonthCount').textContent = thisMonth;

  renderImages(allImages);
}

function renderImages(images) {
  const grid = document.getElementById('historyGrid');
  if (!grid) return;

  if (images.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-muted);opacity:0.3;">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
        </svg>
        <p>No images found. <a href="/pages/user-dashboard/index.html" style="color:var(--accent-purple);">Start generating!</a></p>
      </div>`;
    return;
  }

  grid.innerHTML = images.map(img => `
    <div class="history-card" onclick="openImageModal('${img.url}', '${img.prompt.replace(/'/g, "\\'")}')">
      <div class="history-card-img-wrap">
        <img src="${img.url}" alt="${img.prompt}" loading="lazy">
        <div class="history-card-overlay">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
      </div>
      <div class="history-card-info">
        <p title="${img.prompt}">${img.prompt}</p>
        <span>${img.createdAt || ''}</span>
      </div>
    </div>
  `).join('');
}

function filterImages() {
  const q = document.getElementById('imageSearchInput').value.toLowerCase().trim();
  const filtered = q ? allImages.filter(img => img.prompt.toLowerCase().includes(q)) : allImages;
  renderImages(filtered);
}

function openImageModal(url, prompt) {
  document.getElementById('modalImage').src = url;
  document.getElementById('modalPrompt').textContent = `"${prompt}"`;
  document.getElementById('imageModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeImageModal(e) {
  if (!e || e.target === document.getElementById('imageModal') || !e.target.closest) {
    document.getElementById('imageModal').classList.remove('active');
    document.body.style.overflow = '';
  }
}

function downloadModalImage() {
  const img = document.getElementById('modalImage');
  const a = document.createElement('a');
  a.href = img.src;
  a.download = 'AI_Image.jpg';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

window.filterImages = filterImages;
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.downloadModalImage = downloadModalImage;
