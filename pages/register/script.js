/* ========================================
   Register Page Logic
   ======================================== */

// Redirect if already logged in
(function() {
  const user = getCurrentUser();
  if (user) {
    if (user.role === 'admin') {
      window.location.href = '/pages/admin-dashboard/index.html';
    } else {
      window.location.href = '/pages/user-dashboard/index.html';
    }
  }
})();

function handleRegister() {
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const role = document.querySelector('input[name="role"]:checked').value;
  const errorEl = document.getElementById('registerError');

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
    role,
    joinedAt: new Date().toISOString().split('T')[0],
    images: []
  };

  store.users.push(newUser);
  store.currentUser = newUser.id;
  saveStore(store);

  if (role === 'admin') {
    window.location.href = '/pages/admin-dashboard/index.html';
  } else {
    window.location.href = '/pages/user-dashboard/index.html';
  }
}

window.handleRegister = handleRegister;
