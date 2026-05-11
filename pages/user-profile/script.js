/* ========================================
   User Profile Page Logic
   ======================================== */

const user = requireAuth('user');
if (user) initProfilePage(user);

function initProfilePage(user) {
  initNavbar();
  document.getElementById('userBadge').textContent = user.name;
  document.getElementById('profileAvatar').textContent = user.name.charAt(0).toUpperCase();
  document.getElementById('profileName').value = user.name;
  document.getElementById('profileEmail').value = user.email;
  document.getElementById('profileRole').value = user.role === 'admin' ? 'Administrator' : 'User';
  document.getElementById('profileDate').value = user.joinedAt;
}

function saveProfile() {
  const name = document.getElementById('profileName').value.trim();
  const email = document.getElementById('profileEmail').value.trim();
  const errorEl = document.getElementById('profileError');
  const successEl = document.getElementById('profileSuccess');

  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  if (!name || !email) {
    errorEl.textContent = 'Name and email are required.';
    errorEl.style.display = 'block';
    return;
  }

  const store = getStore();
  const user = getCurrentUser();
  if (!user) return;

  const emailTaken = store.users.find(u => u.id !== user.id && u.email.toLowerCase() === email.toLowerCase());
  if (emailTaken) {
    errorEl.textContent = 'This email is already used by another account.';
    errorEl.style.display = 'block';
    return;
  }

  user.name = name;
  user.email = email;
  saveStore(store);

  document.getElementById('profileAvatar').textContent = name.charAt(0).toUpperCase();
  document.getElementById('userBadge').textContent = name;

  successEl.style.display = 'block';
}

function changePassword() {
  const currentPwd = document.getElementById('currentPassword').value;
  const newPwd = document.getElementById('newPassword').value;
  const confirmPwd = document.getElementById('confirmPassword').value;
  const errorEl = document.getElementById('passwordError');
  const successEl = document.getElementById('passwordSuccess');

  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  if (!currentPwd || !newPwd || !confirmPwd) {
    errorEl.textContent = 'Please fill in all password fields.';
    errorEl.style.display = 'block';
    return;
  }

  const user = getCurrentUser();
  if (!user) return;

  if (currentPwd !== user.password) {
    errorEl.textContent = 'Current password is incorrect.';
    errorEl.style.display = 'block';
    return;
  }

  if (newPwd.length < 6) {
    errorEl.textContent = 'New password must be at least 6 characters.';
    errorEl.style.display = 'block';
    return;
  }

  if (newPwd !== confirmPwd) {
    errorEl.textContent = 'New passwords do not match.';
    errorEl.style.display = 'block';
    return;
  }

  if (newPwd === currentPwd) {
    errorEl.textContent = 'New password must be different from current password.';
    errorEl.style.display = 'block';
    return;
  }

  const store = getStore();
  const storeUser = store.users.find(u => u.id === user.id);
  storeUser.password = newPwd;
  saveStore(store);

  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';

  successEl.style.display = 'block';
}

window.saveProfile = saveProfile;
window.changePassword = changePassword;
