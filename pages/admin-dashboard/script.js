const admin = requireAuth('admin');
if (admin) initAdminDashboard(admin);

function initAdminDashboard(admin) {
  document.getElementById('adminBadgeUser').textContent = admin.name;
  renderStats();
  renderRecentUsers();
}

function renderStats() {
  const store = getStore();
  const totalUsers = store.users.length;
  const totalImages = store.users.reduce((sum, u) => sum + (u.images || []).length, 0);

  document.getElementById('statTotalUsers').textContent = totalUsers;
  document.getElementById('statTotalImages').textContent = totalImages;

  const regularUsers = store.users.filter(u => u.role !== 'admin');
  const free = regularUsers.filter(u => !u.plan || u.plan === 'free').length;
  const pro = regularUsers.filter(u => u.plan === 'pro').length;
  const ent = regularUsers.filter(u => u.plan === 'enterprise').length;
  const total = regularUsers.length || 1;

  document.getElementById('planCountFree').textContent = free;
  document.getElementById('planCountPro').textContent = pro;
  document.getElementById('planCountEnt').textContent = ent;
  document.getElementById('planBarFree').style.width = Math.round(free/total*100) + '%';
  document.getElementById('planBarPro').style.width = Math.round(pro/total*100) + '%';
  document.getElementById('planBarEnt').style.width = Math.round(ent/total*100) + '%';
}

function renderRecentUsers() {
  const store = getStore();
  const tbody = document.getElementById('recentUsersBody');
  const recent = store.users.slice(-6).reverse();
  tbody.innerHTML = recent.map(u => `
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
      <td>${u.joinedAt || '—'}</td>
      <td>${(u.images || []).length}</td>
    </tr>
  `).join('');
}
