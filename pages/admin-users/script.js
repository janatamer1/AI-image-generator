const admin = requireAuth('admin');
if (admin) initManageUsers();

function initManageUsers() {
  const store = getStore();
  renderSummary(store.users);
  renderUsersTable(store.users);
}

function renderSummary(users) {
  document.getElementById('sumTotal').textContent = users.length;
  document.getElementById('sumAdmins').textContent = users.filter(u => u.role === 'admin').length;
  document.getElementById('sumPro').textContent = users.filter(u => u.plan === 'pro' || u.plan === 'enterprise').length;
  document.getElementById('sumImages').textContent = users.reduce((s, u) => s + (u.images || []).length, 0);
}

function renderUsersTable(users) {
  const tbody = document.getElementById('adminManageUsersBody');
  const badge = document.getElementById('usersCountBadge');
  if (badge) badge.textContent = users.length + ' user' + (users.length !== 1 ? 's' : '');
  if (!tbody) return;
  const currentUserId = getStore().currentUser;

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">No users found</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(user => {
    const isSelf = user.id === currentUserId;
    const plan = user.plan || 'free';
    const favCount = (user.favorites || []).length;
    const imgCount = (user.images || []).length;
    return `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="user-avatar-circle">${user.name.charAt(0).toUpperCase()}</div>
          <div>
            <div style="color:var(--text-main);font-weight:500;font-size:0.88rem;">${user.name}${isSelf ? ' <span class="self-tag">(You)</span>' : ''}</div>
            <div style="color:var(--text-muted);font-size:0.75rem;">${user.email}</div>
          </div>
        </div>
      </td>
      <td><span class="role-tag role-${user.role}">${user.role === 'admin' ? 'Admin' : 'User'}</span></td>
      <td><span class="plan-tag plan-${plan}">${plan.charAt(0).toUpperCase() + plan.slice(1)}</span></td>
      <td style="white-space:nowrap;">${user.joinedAt || '—'}</td>
      <td>
        <span class="count-chip">${imgCount}</span>
      </td>
      <td>
        <span class="count-chip fav-chip">${favCount > 0 ? '♥ ' + favCount : '—'}</span>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" title="View Images" onclick="openViewImagesModal('${user.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="btn-icon" title="Edit" onclick="openEditModal('${user.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon btn-icon-danger" title="Delete" ${isSelf ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : `onclick="openDeleteModal('${user.id}', '${user.name.replace(/'/g, "\\'")}')"`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterUsers() {
  const q = document.getElementById('userSearchInput').value.toLowerCase().trim();
  const roleFilter = document.getElementById('roleFilter').value;
  const planFilter = document.getElementById('planFilter').value;
  const store = getStore();

  let filtered = store.users;
  if (q) filtered = filtered.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  if (roleFilter) filtered = filtered.filter(u => u.role === roleFilter);
  if (planFilter) filtered = filtered.filter(u => (u.plan || 'free') === planFilter);
  renderUsersTable(filtered);
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
});

function openAddModal() {
  document.getElementById('addName').value = '';
  document.getElementById('addEmail').value = '';
  document.getElementById('addPassword').value = '';
  document.getElementById('addRole').value = 'user';
  document.getElementById('addPlan').value = 'free';
  document.getElementById('addError').style.display = 'none';
  openModal('addUserModal');
}

function handleAddUser() {
  const name = document.getElementById('addName').value.trim();
  const email = document.getElementById('addEmail').value.trim();
  const password = document.getElementById('addPassword').value;
  const role = document.getElementById('addRole').value;
  const plan = document.getElementById('addPlan').value;
  const errorEl = document.getElementById('addError');

  errorEl.style.display = 'none';
  if (!name || !email || !password) { errorEl.textContent = 'All fields are required.'; errorEl.style.display = 'block'; return; }
  if (password.length < 6) { errorEl.textContent = 'Password must be at least 6 characters.'; errorEl.style.display = 'block'; return; }

  const store = getStore();
  if (store.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    errorEl.textContent = 'A user with this email already exists.';
    errorEl.style.display = 'block';
    return;
  }

  store.users.push({
    id: 'user_' + Date.now(),
    name, email, password,
    role,
    plan,
    joinedAt: new Date().toISOString().split('T')[0],
    images: [], chats: [], favorites: []
  });

  saveStore(store);
  closeModal('addUserModal');
  renderSummary(store.users);
  renderUsersTable(store.users);
}

function openEditModal(userId) {
  const store = getStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) return;
  document.getElementById('editUserId').value = userId;
  document.getElementById('editName').value = user.name;
  document.getElementById('editEmail').value = user.email;
  document.getElementById('editRole').value = user.role || 'user';
  document.getElementById('editPlan').value = user.plan || 'free';
  document.getElementById('editPassword').value = '';
  document.getElementById('editError').style.display = 'none';
  openModal('editUserModal');
}

function handleEditUser() {
  const userId = document.getElementById('editUserId').value;
  const name = document.getElementById('editName').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const role = document.getElementById('editRole').value;
  const plan = document.getElementById('editPlan').value;
  const password = document.getElementById('editPassword').value;
  const errorEl = document.getElementById('editError');

  errorEl.style.display = 'none';
  if (!name || !email) { errorEl.textContent = 'Name and email are required.'; errorEl.style.display = 'block'; return; }

  const store = getStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) return;

  if (store.users.find(u => u.id !== userId && u.email.toLowerCase() === email.toLowerCase())) {
    errorEl.textContent = 'Another user with this email exists.';
    errorEl.style.display = 'block';
    return;
  }

  user.name = name;
  user.email = email;
  user.role = role;
  user.plan = plan;
  if (password) {
    if (password.length < 6) { errorEl.textContent = 'New password must be at least 6 characters.'; errorEl.style.display = 'block'; return; }
    user.password = password;
  }

  saveStore(store);
  closeModal('editUserModal');
  renderSummary(store.users);
  renderUsersTable(store.users);
}

function openDeleteModal(userId, userName) {
  document.getElementById('deleteUserId').value = userId;
  document.getElementById('deleteUserName').textContent = userName;
  openModal('deleteUserModal');
}

function confirmDeleteUser() {
  const userId = document.getElementById('deleteUserId').value;
  const store = getStore();
  store.users = store.users.filter(u => u.id !== userId);
  saveStore(store);
  closeModal('deleteUserModal');
  renderSummary(store.users);
  renderUsersTable(store.users);
}

function openViewImagesModal(userId) {
  const store = getStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) return;

  const images = user.images || [];
  document.getElementById('viewImagesTitle').textContent = `${user.name}'s Images`;
  document.getElementById('viewImagesSubtitle').textContent = `${images.length} image${images.length !== 1 ? 's' : ''} generated`;

  const grid = document.getElementById('viewImagesGrid');
  if (images.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:32px 0;grid-column:1/-1;">This user hasn't generated any images yet.</p>`;
  } else {
    grid.innerHTML = images.map(img => `
      <div class="view-img-card">
        <img src="${img.url}" alt="${img.prompt}" loading="lazy">
        <div class="view-img-overlay">
          <p title="${img.prompt}">${img.prompt.length > 40 ? img.prompt.slice(0, 40) + '…' : img.prompt}</p>
        </div>
      </div>
    `).join('');
  }
  openModal('viewImagesModal');
}

window.openAddModal = openAddModal;
window.handleAddUser = handleAddUser;
window.openEditModal = openEditModal;
window.handleEditUser = handleEditUser;
window.openDeleteModal = openDeleteModal;
window.confirmDeleteUser = confirmDeleteUser;
window.openViewImagesModal = openViewImagesModal;
window.filterUsers = filterUsers;
window.openModal = openModal;
window.closeModal = closeModal;
