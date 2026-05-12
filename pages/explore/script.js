initNavbar();
updateExploreNav();

let allExploreEntries = [];

function updateExploreNav() {
  const user = getCurrentUser();
  const actions = document.getElementById('exploreAuthActions');
  if (!actions) return;
  if (user) {
    const dashUrl = user.role === 'admin' ? '/pages/admin-dashboard/index.html' : '/pages/user-dashboard/index.html';
    actions.innerHTML = `
      <a href="${dashUrl}" class="btn btn-ghost">Dashboard</a>
      <button onclick="logout()" class="btn btn-primary">Log Out</button>
    `;
  }
}

function buildEntries() {
  const store = getStore();
  allExploreEntries = [];
  store.users.forEach(u => {
    (u.images || []).forEach(img => {
      allExploreEntries.push({ user: u, img });
    });
  });
  sortEntries();
}

function sortEntries() {
  const sort = document.getElementById('exploreSort')?.value || 'newest';
  if (sort === 'newest') {
    allExploreEntries.sort((a, b) => (b.img.createdAt || '').localeCompare(a.img.createdAt || ''));
  } else {
    allExploreEntries.sort((a, b) => (a.img.createdAt || '').localeCompare(b.img.createdAt || ''));
  }
}

function renderStats() {
  const store = getStore();
  const total = allExploreEntries.length;
  const creators = new Set(allExploreEntries.map(e => e.user.id)).size;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = allExploreEntries.filter(e => e.img.createdAt === today).length;
  document.getElementById('statImages').textContent = total;
  document.getElementById('statCreators').textContent = creators;
  document.getElementById('statToday').textContent = todayCount;
}

function filterExplore() {
  sortEntries();
  const q = document.getElementById('exploreSearch').value.toLowerCase().trim();
  const filtered = q ? allExploreEntries.filter(e => e.img.prompt.toLowerCase().includes(q)) : allExploreEntries;
  renderGrid(filtered);
}

function renderGrid(entries) {
  const grid = document.getElementById('exploreGrid');
  const count = document.getElementById('exploreCount');
  count.textContent = entries.length + ' image' + (entries.length !== 1 ? 's' : '');

  if (entries.length === 0) {
    grid.innerHTML = `<div class="explore-empty">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="opacity:0.2;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
      <h3>No images found</h3>
      <p>Try a different search term.</p>
    </div>`;
    return;
  }

  grid.innerHTML = entries.map(({ user: u, img }) => `
    <div class="explore-card" onclick="openExploreModal('${escape(img.url)}','${escape(img.prompt)}','${escape(u.name)}','${img.createdAt || ''}')">
      <div class="explore-card-img">
        <img src="${img.url}" alt="${img.prompt}" loading="lazy">
        <div class="explore-card-hover">
          <div class="explore-card-prompt">${img.prompt.length > 80 ? img.prompt.slice(0, 80) + '…' : img.prompt}</div>
        </div>
      </div>
      <div class="explore-card-footer">
        <div class="explore-card-avatar">${u.name.charAt(0).toUpperCase()}</div>
        <span class="explore-card-name">${u.name}</span>
        <span class="explore-card-date">${img.createdAt || ''}</span>
      </div>
    </div>
  `).join('');
}

function openExploreModal(url, prompt, userName, date) {
  const img = document.getElementById('exploreModalImg');
  img.src = unescape(url);
  img.dataset.url = unescape(url);
  img.dataset.prompt = unescape(prompt);
  document.getElementById('exploreModalPrompt').textContent = `"${unescape(prompt)}"`;
  document.getElementById('exploreModalUser').textContent = unescape(userName);
  document.getElementById('exploreModalDate').textContent = date;
  document.getElementById('exploreModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeExploreModal(e) {
  if (!e || e.target === document.getElementById('exploreModal') || !e.target.closest) {
    document.getElementById('exploreModal').classList.remove('active');
    document.body.style.overflow = '';
  }
}

function tryPrompt() {
  const prompt = document.getElementById('exploreModalImg').dataset.prompt;
  sessionStorage.setItem('regen_prompt', prompt);
  window.location.href = '/pages/user-dashboard/index.html';
}

function downloadExploreModal() {
  const url = document.getElementById('exploreModalImg').dataset.url;
  const a = document.createElement('a');
  a.href = url;
  a.download = 'AI_Image.jpg';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

document.addEventListener('DOMContentLoaded', () => {
  buildEntries();
  renderStats();
  renderGrid(allExploreEntries);
});

window.filterExplore = filterExplore;
window.openExploreModal = openExploreModal;
window.closeExploreModal = closeExploreModal;
window.tryPrompt = tryPrompt;
window.downloadExploreModal = downloadExploreModal;
