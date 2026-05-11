/* ========================================
   Shared Data Store - localStorage-based
   ======================================== */

const STORAGE_KEY = 'aiimagegen_data';

function getStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  const initial = {
    users: [
      { id: 'admin1', name: 'Admin', email: 'admin@imagegen.com', password: 'admin123', role: 'admin', joinedAt: '2026-02-20', images: [] }
    ],
    currentUser: null
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getCurrentUser() {
  const store = getStore();
  if (!store.currentUser) return null;
  return store.users.find(u => u.id === store.currentUser) || null;
}

function requireAuth(requiredRole) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '/pages/login/index.html';
    return null;
  }
  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'admin') {
      window.location.href = '/pages/admin-dashboard/index.html';
    } else {
      window.location.href = '/pages/user-dashboard/index.html';
    }
    return null;
  }
  return user;
}

function logout() {
  const store = getStore();
  store.currentUser = null;
  saveStore(store);
  window.location.href = '/index.html';
}

window.getStore = getStore;
window.saveStore = saveStore;
window.getCurrentUser = getCurrentUser;
window.requireAuth = requireAuth;
window.logout = logout;
