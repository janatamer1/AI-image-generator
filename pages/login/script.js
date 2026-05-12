/* ========================================
   Login Page Logic
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

function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

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

function togglePasswordVisibility() {
  const passwordInput = document.getElementById('loginPassword');
  const toggleCheckbox = document.getElementById('togglePassword');
  if (toggleCheckbox.checked) {
    passwordInput.type = 'text';
  } else {
    passwordInput.type = 'password';
  }
}

window.handleLogin = handleLogin;
window.togglePasswordVisibility = togglePasswordVisibility;
