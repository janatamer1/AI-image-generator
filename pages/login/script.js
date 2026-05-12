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

function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  errorEl.style.display = 'none';

  if (!email || !password) {
    errorEl.textContent = 'Please enter your email and password.';
    errorEl.style.display = 'block';
    return;
  }

  const store = getStore();
  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    errorEl.textContent = 'Invalid email or password. Please try again.';
    errorEl.style.display = 'block';
    return;
  }

  store.currentUser = user.id;
  saveStore(store);

  if (user.role === 'admin') {
    window.location.href = '/pages/admin-dashboard/index.html';
  } else {
    window.location.href = '/pages/user-dashboard/index.html';
  }
}

window.handleLogin = handleLogin;
window.togglePwd = togglePwd;
