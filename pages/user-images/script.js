/* ========================================
   User Images Page Logic
   ======================================== */

const user = requireAuth('user');
if (user) initImagesPage(user);

function initImagesPage(user) {
  initNavbar();
  document.getElementById('userBadge').textContent = user.name;
  renderHistoryImages(user);
}

function renderHistoryImages(user) {
  const grid = document.getElementById('historyGrid');
  if (!grid) return;

  if (user.images.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-muted);opacity:0.4;">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
        </svg>
        <p>No images yet. Start generating from your dashboard!</p>
      </div>`;
    return;
  }

  grid.innerHTML = user.images.map(img => `
    <div class="history-card">
      <img src="${img.url}" alt="${img.prompt}" loading="lazy">
      <div class="history-card-info">
        <p>${img.prompt}</p>
        <span>${img.createdAt}</span>
      </div>
    </div>
  `).join('');
}
