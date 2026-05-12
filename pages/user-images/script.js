let allImages = [];
let allFavorites = [];
let activeTab = 'all';

const user = requireAuth('user');
if (user) initImagesPage(user);

function initImagesPage(user) {
  initNavbar();
  document.getElementById('userBadge').textContent = user.name;
  allImages = user.images || [];
  allFavorites = getFavorites();

  const now = new Date().toISOString().slice(0, 7);
  const thisMonth = allImages.filter(img => img.createdAt && img.createdAt.startsWith(now)).length;
  document.getElementById('totalImagesCount').textContent = allImages.length;
  document.getElementById('thisMonthCount').textContent = thisMonth;
  document.getElementById('favoritesCount').textContent = allFavorites.length;

  renderImages(allImages);
}

function switchTab(tab) {
  activeTab = tab;
  document.getElementById('tab-all').classList.toggle('active', tab === 'all');
  document.getElementById('tab-favorites').classList.toggle('active', tab === 'favorites');
  document.getElementById('imageSearchInput').value = '';

  const searchWrap = document.getElementById('searchBarWrap');
  searchWrap.style.display = tab === 'favorites' ? 'none' : '';

  if (tab === 'favorites') {
    renderFavorites(allFavorites);
  } else {
    renderImages(allImages);
  }
}

function renderFavorites(favs) {
  const grid = document.getElementById('historyGrid');
  if (!grid) return;

  if (favs.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-muted);opacity:0.3;">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <p>No favorites yet. Heart images on the <a href="/index.html#gallery" style="color:var(--accent-purple);">homepage gallery</a> to save them here.</p>
      </div>`;
    return;
  }

  grid.innerHTML = favs.map(img => `
    <div class="history-card" onclick="openImageModal('${img.url}', '${img.prompt.replace(/'/g, "\\'")}')">
      <div class="history-card-img-wrap">
        <img src="${img.url}" alt="${img.prompt}" loading="lazy">
        <div class="history-card-overlay">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <span class="fav-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </span>
      </div>
      <div class="history-card-info">
        <p title="${img.prompt}">${img.prompt}</p>
        <span>Gallery favorite</span>
      </div>
    </div>
  `).join('');
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
        <button class="card-delete-btn" onclick="event.stopPropagation(); deleteOneImage('${img.url.replace(/'/g, "\\'")}')" title="Delete image">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="history-card-info">
        <p title="${img.prompt}">${img.prompt}</p>
        <span>${img.createdAt || ''}</span>
      </div>
    </div>
  `).join('');
}

function filterImages() {
  if (activeTab === 'favorites') return;
  const q = document.getElementById('imageSearchInput').value.toLowerCase().trim();
  const filtered = q ? allImages.filter(img => img.prompt.toLowerCase().includes(q)) : allImages;
  renderImages(filtered);
}

function openImageModal(url, prompt) {
  const img = document.getElementById('modalImage');
  img.src = url;
  img.dataset.prompt = prompt;
  document.getElementById('modalPrompt').textContent = `"${prompt}"`;
  document.getElementById('imageModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function regenerateImage() {
  const prompt = document.getElementById('modalImage').dataset.prompt;
  if (prompt) {
    sessionStorage.setItem('regen_prompt', prompt);
    window.location.href = '/pages/user-dashboard/index.html';
  }
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

function deleteOneImage(imgUrl) {
  const store = getStore();
  const u = store.users.find(u => u.id === store.currentUser);
  if (!u) return;
  u.images = (u.images || []).filter(img => img.url !== imgUrl);
  saveStore(store);
  allImages = u.images;
  const now = new Date().toISOString().slice(0, 7);
  document.getElementById('totalImagesCount').textContent = allImages.length;
  document.getElementById('thisMonthCount').textContent = allImages.filter(img => img.createdAt && img.createdAt.startsWith(now)).length;
  filterImages();
}

function clearMyImages() {
  if (!confirm('This will permanently delete all your generated images. Are you sure?')) return;
  const store = getStore();
  const u = store.users.find(u => u.id === store.currentUser);
  if (!u) return;
  u.images = [];
  u.favorites = [];
  saveStore(store);
  allImages = [];
  allFavorites = [];
  document.getElementById('totalImagesCount').textContent = '0';
  document.getElementById('thisMonthCount').textContent = '0';
  document.getElementById('favoritesCount').textContent = '0';
  renderImages([]);
}

window.filterImages = filterImages;
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.downloadModalImage = downloadModalImage;
window.regenerateImage = regenerateImage;
window.clearMyImages = clearMyImages;
window.deleteOneImage = deleteOneImage;
