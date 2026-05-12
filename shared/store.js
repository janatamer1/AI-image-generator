const STORAGE_KEY = 'aiimagegen_data';
const SESSION_KEY = 'aiimagegen_session';

function getStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  let store;
  if (raw) {
    store = JSON.parse(raw);
  } else {
    store = {
      users: [
        {
          id: 'admin1',
          name: 'Admin',
          email: 'admin@imagegen.com',
          password: 'admin123',
          role: 'admin',
          plan: 'enterprise',
          joinedAt: '2026-02-20',
          images: [],
          chats: []
        }
      ]
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
  store.currentUser = sessionStorage.getItem(SESSION_KEY);
  return store;
}

function saveStore(store) {
  const toPersist = { users: store.users };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
  if (store.currentUser) {
    sessionStorage.setItem(SESSION_KEY, store.currentUser);
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
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
