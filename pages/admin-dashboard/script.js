const admin = requireAuth('admin');
if (admin) initAdminDashboard(admin);

function initAdminDashboard(admin) {
  document.getElementById('adminBadgeUser').textContent = admin.name;
  renderStats();
  renderRecentUsers();
  renderTopGenerators();
  startClock();
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

function renderStats() {
  const store = getStore();
  const totalUsers = store.users.length;
  const totalImages = store.users.reduce((sum, u) => sum + (u.images || []).length, 0);
  const activeUsers = store.users.filter(u => (u.images || []).length > 0).length;
  const avgImages = totalUsers > 0 ? Math.round(totalImages / totalUsers) : 0;
  const totalFavorites = store.users.reduce((sum, u) => sum + (u.favorites || []).length, 0);
  const favUsers = store.users.filter(u => (u.favorites || []).length > 0).length;

  document.getElementById('statTotalUsers').textContent = totalUsers;
  document.getElementById('statTotalImages').textContent = totalImages;
  document.getElementById('statTotalFavorites').textContent = totalFavorites;
  document.getElementById('statActiveUsers').textContent = activeUsers + ' with images';
  document.getElementById('statAvgImages').textContent = avgImages + ' avg/user';
  document.getElementById('statFavUsers').textContent = favUsers + ' users saved';

  const regularUsers = store.users.filter(u => u.role !== 'admin');
  const free = regularUsers.filter(u => !u.plan || u.plan === 'free').length;
  const pro = regularUsers.filter(u => u.plan === 'pro').length;
  const ent = regularUsers.filter(u => u.plan === 'enterprise').length;
  const total = regularUsers.length || 1;

  document.getElementById('planCountFree').textContent = free;
  document.getElementById('planCountPro').textContent = pro;
  document.getElementById('planCountEnt').textContent = ent;
  document.getElementById('planBarFree').style.width = Math.round(free / total * 100) + '%';
  document.getElementById('planBarPro').style.width = Math.round(pro / total * 100) + '%';
  document.getElementById('planBarEnt').style.width = Math.round(ent / total * 100) + '%';
}

function renderRecentUsers() {
  const store = getStore();
  const tbody = document.getElementById('recentUsersBody');
  const recent = store.users.slice(-6).reverse();
  tbody.innerHTML = recent.map(u => {
    const plan = u.plan || 'free';
    return `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:30px;height:30px;border-radius:50%;background:var(--gradient-brand);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0;">${u.name.charAt(0).toUpperCase()}</div>
          <div>
            <div style="color:var(--text-main);font-weight:500;font-size:0.88rem;">${u.name}</div>
            <div style="color:var(--text-muted);font-size:0.75rem;">${u.email}</div>
          </div>
        </div>
      </td>
      <td><span class="role-tag role-${u.role}">${u.role === 'admin' ? 'Admin' : 'User'}</span></td>
      <td><span class="plan-tag plan-${plan}">${plan.charAt(0).toUpperCase() + plan.slice(1)}</span></td>
      <td>${u.joinedAt || '—'}</td>
      <td>${(u.images || []).length}</td>
    </tr>`;
  }).join('');
}

function renderTopGenerators() {
  const store = getStore();
  const container = document.getElementById('topGeneratorsList');
  const sorted = [...store.users]
    .sort((a, b) => (b.images || []).length - (a.images || []).length)
    .slice(0, 6);

  const maxImages = (sorted[0]?.images || []).length || 1;

  if (sorted.every(u => (u.images || []).length === 0)) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.88rem;padding:8px 0;">No images generated yet.</p>';
    return;
  }

  container.innerHTML = sorted.map((u, i) => {
    const count = (u.images || []).length;
    const pct = Math.round(count / maxImages * 100);
    const plan = u.plan || 'free';
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
    return `
    <div class="top-gen-row">
      <div class="top-gen-rank">${medal || '#' + (i + 1)}</div>
      <div class="top-gen-avatar">${u.name.charAt(0).toUpperCase()}</div>
      <div class="top-gen-info">
        <div class="top-gen-name">${u.name} <span class="plan-tag plan-${plan}">${plan.charAt(0).toUpperCase() + plan.slice(1)}</span></div>
        <div class="top-gen-bar-wrap">
          <div class="top-gen-bar-track">
            <div class="top-gen-bar-fill" style="width:${pct}%"></div>
          </div>
          <span class="top-gen-count">${count} img${count !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}
