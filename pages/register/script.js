(function() {
  const user = getCurrentUser();
  if (user) {
    window.location.href = user.role === 'admin' ? '/pages/admin-dashboard/index.html' : '/pages/user-dashboard/index.html';
  }
})();

function togglePwd(id, btn) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
  btn.style.opacity = input.type === 'text' ? '1' : '0.5';
}

function handleRegister() {
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const errorEl = document.getElementById('registerError');

  errorEl.style.display = 'none';

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
    errorEl.textContent = 'An account with this email already exists.';
    errorEl.style.display = 'block';
    return;
  }

  const newUser = {
    id: 'user_' + Date.now(),
    name,
    email,
    password,
    role: 'user',
    plan: 'free',
    joinedAt: new Date().toISOString().split('T')[0],
    images: [],
    chats: []
  };

  store.users.push(newUser);
  store.currentUser = newUser.id;
  saveStore(store);
  window.location.href = '/pages/user-dashboard/index.html';
}

window.handleRegister = handleRegister;
window.togglePwd = togglePwd;
