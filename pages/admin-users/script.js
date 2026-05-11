/* ========================================
   Admin Manage Users Logic
   ======================================== */

const admin = requireAuth('admin');
if (admin) initAdminUsersPage();

function initAdminUsersPage() {
  initNavbar();
  renderUsersTable('adminManageUsersBody', getStore().users);
}

function renderUsersTable(tbodyId, users) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const currentUserId = getStore().currentUser;

  tbody.innerHTML = users.map(user => {
    const isSelf = user.id === currentUserId;
    return `
    <tr>
      <td style="color:var(--text-main);font-weight:500;">${user.name}${isSelf ? ' <span style="font-size:0.7rem;color:var(--accent-purple);">(You)</span>' : ''}</td>
      <td>${user.email}</td>
      <td><span class="role-tag role-${user.role}">${user.role === 'admin' ? 'Admin' : 'User'}</span></td>
      <td>${user.joinedAt}</td>
      <td>${user.images.length}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" title="Edit" onclick="openEditModal('${user.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon btn-icon-danger" title="Delete" ${isSelf ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : `onclick="openDeleteModal('${user.id}', '${user.name.replace(/'/g, "\\'")}')"`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ==========================================
// Modal Logic
// ==========================================
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal.id);
  });
});

// ==========================================
// Add User
// ==========================================
function openAddModal() {
  document.getElementById('addName').value = '';
  document.getElementById('addEmail').value = '';
  document.getElementById('addPassword').value = '';
  document.getElementById('addRole').value = 'user';
  document.getElementById('addError').style.display = 'none';
  openModal('addUserModal');
}

function handleAddUser() {
  const name = document.getElementById('addName').value.trim();
  const email = document.getElementById('addEmail').value.trim();
  const password = document.getElementById('addPassword').value;
  const role = document.getElementById('addRole').value;
  const errorEl = document.getElementById('addError');

  if (!name || !email || !password) {
    errorEl.textContent = 'Please fill in all fields.';
    errorEl.style.display = 'block';
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = 'Password must be at least 6 characters.';
    errorEl.style.display = 'block';
    return;
  }

  const store = getStore();
  const exists = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    errorEl.textContent = 'A user with this email already exists.';
    errorEl.style.display = 'block';
    return;
  }

  store.users.push({
    id: 'user_' + Date.now(),
    name,
    email,
    password,
    role,
    joinedAt: new Date().toISOString().split('T')[0],
    images: []
  });

  saveStore(store);
  closeModal('addUserModal');
  renderUsersTable('adminManageUsersBody', store.users);
}

// ==========================================
// Edit User
// ==========================================
function openEditModal(userId) {
  const store = getStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) return;

  document.getElementById('editUserId').value = userId;
  document.getElementById('editName').value = user.name;
  document.getElementById('editEmail').value = user.email;
  document.getElementById('editRole').value = user.role;
  document.getElementById('editPassword').value = '';
  document.getElementById('editError').style.display = 'none';
  openModal('editUserModal');
}

function handleEditUser() {
  const userId = document.getElementById('editUserId').value;
  const name = document.getElementById('editName').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const role = document.getElementById('editRole').value;
  const password = document.getElementById('editPassword').value;
  const errorEl = document.getElementById('editError');

  if (!name || !email) {
    errorEl.textContent = 'Name and email are required.';
    errorEl.style.display = 'block';
    return;
  }

  const store = getStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) {
    errorEl.textContent = 'User not found.';
    errorEl.style.display = 'block';
    return;
  }

  const emailExists = store.users.find(u => u.id !== userId && u.email.toLowerCase() === email.toLowerCase());
  if (emailExists) {
    errorEl.textContent = 'Another user with this email already exists.';
    errorEl.style.display = 'block';
    return;
  }

  user.name = name;
  user.email = email;
  user.role = role;
  if (password && password.length >= 6) {
    user.password = password;
  } else if (password && password.length < 6) {
    errorEl.textContent = 'New password must be at least 6 characters.';
    errorEl.style.display = 'block';
    return;
  }

  saveStore(store);
  closeModal('editUserModal');
  renderUsersTable('adminManageUsersBody', store.users);
}

// ==========================================
// Delete User
// ==========================================
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
  renderUsersTable('adminManageUsersBody', store.users);
}

// ==========================================
// Search / Filter
// ==========================================
function filterUsers() {
  const query = document.getElementById('userSearchInput').value.toLowerCase().trim();
  const store = getStore();
  const filtered = store.users.filter(u =>
    u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
  );
  renderUsersTable('adminManageUsersBody', filtered);
}

// ==========================================
// Expose to window
// ==========================================
window.openAddModal = openAddModal;
window.handleAddUser = handleAddUser;
window.openEditModal = openEditModal;
window.handleEditUser = handleEditUser;
window.openDeleteModal = openDeleteModal;
window.confirmDeleteUser = confirmDeleteUser;
window.filterUsers = filterUsers;
window.openModal = openModal;
window.closeModal = closeModal;
