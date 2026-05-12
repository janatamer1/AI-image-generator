let allEntries = [];

const admin = requireAuth('admin');
if (admin) initAdminImages();

function initAdminImages() {
  startClock();
  buildEntries();
  renderSummary();
  populateUserFilter();
  renderGrid(allEntries);
}

function startClock() {
  const el = document.getElementById('adminClock');
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ' · ' + now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
  tick();
  setInterval(tick, 1000);
}

function buildEntries() {
  const store = getStore();
  allEntries = [];
  store.users.forEach(u => {
    (u.images || []).forEach(img => {
      allEntries.push({ user: u, img });
    });
  });
  allEntries.sort((a, b) => (b.img.createdAt || '').localeCompare(a.img.createdAt || ''));
}

function renderSummary() {
  const store = getStore();
  const total = allEntries.length;
  const creators = new Set(allEntries.map(e => e.user.id)).size;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = allEntries.filter(e => e.img.createdAt === today).length;
  document.getElementById('sumTotal').textContent = total;
  document.getElementById('sumUsers').textContent = creators;
  document.getElementById('sumToday').textContent = todayCount;
}

function populateUserFilter() {
  const store = getStore();
  const sel = document.getElementById('userFilter');
  store.users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.textContent = u.name;
    sel.appendChild(opt);
  });
}

function filterImages() {
  const q = document.getElementById('imgSearch').value.toLowerCase().trim();
  const uid = document.getElementById('userFilter').value;
  const filtered = allEntries.filter(e => {
    const matchQ = !q || e.img.prompt.toLowerCase().includes(q);
    const matchU = !uid || e.user.id === uid;
    return matchQ && matchU;
  });
  renderGrid(filtered);
}

function renderGrid(entries) {
  const grid = document.getElementById('aiGrid');
  const badge = document.getElementById('imgCount');
  badge.textContent = entries.length + ' image' + (entries.length !== 1 ? 's' : '');

  if (entries.length === 0) {
    grid.innerHTML = `<div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:0.3;"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
      <p>No images match your search.</p>
    </div>`;
    return;
  }

  grid.innerHTML = entries.map(({ user: u, img }) => `
    <div class="ai-card" onclick="openImgModal('${escapeAttr(img.url)}','${escapeAttr(img.prompt)}','${escapeAttr(u.name)}','${img.createdAt || ''}')">
      <div class="ai-card-img-wrap">
        <img src="${img.url}" alt="${escapeAttr(img.prompt)}" loading="lazy">
        <div class="ai-card-overlay">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
      </div>
      <div class="ai-card-info">
        <div class="ai-card-user">
          <div class="ai-card-avatar">${u.name.charAt(0).toUpperCase()}</div>
          <span>${u.name}</span>
        </div>
        <p class="ai-card-prompt" title="${escapeAttr(img.prompt)}">${img.prompt}</p>
        <span class="ai-card-date">${img.createdAt || ''}</span>
      </div>
    </div>
  `).join('');
}

function openImgModal(url, prompt, userName, date) {
  document.getElementById('aiModalImg').src = url;
  document.getElementById('aiModalImg').dataset.url = url;
  document.getElementById('aiModalPrompt').textContent = `"${prompt}"`;
  document.getElementById('aiModalUser').textContent = userName;
  document.getElementById('aiModalDate').textContent = date;
  document.getElementById('imgModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeImgModal(e) {
  if (!e || e.target === document.getElementById('imgModal') || !e.target.closest) {
    document.getElementById('imgModal').classList.remove('active');
    document.body.style.overflow = '';
  }
}

function downloadAiModal() {
  const url = document.getElementById('aiModalImg').dataset.url;
  const a = document.createElement('a');
  a.href = url;
  a.download = 'AI_Image.jpg';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function escapeAttr(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

window.filterImages = filterImages;
window.openImgModal = openImgModal;
window.closeImgModal = closeImgModal;
window.downloadAiModal = downloadAiModal;
