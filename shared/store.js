const STORAGE_KEY = 'aiimagegen_data';
const SESSION_KEY = 'aiimagegen_session';

function defaultStore() {
  return {
    users: [
      {
        id: 'admin1',
        name: 'Admin',
        email: 'admin@admin.com',
        password: 'admin123',
        role: 'admin',
        plan: 'enterprise',
        joinedAt: '2026-02-20',
        images: [],
        chats: []
      }
    ]
  };
}

function getStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  let store;
  if (raw) {
    try {
      store = JSON.parse(raw);
    } catch (e) {
      console.warn('Store data corrupted, resetting.', e);
      localStorage.removeItem(STORAGE_KEY);
      store = defaultStore();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  } else {
    store = defaultStore();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
  store.currentUser = sessionStorage.getItem(SESSION_KEY);
  
  // Ensure default admin is always available with the new credentials
  const admin = store.users.find(u => u.id === 'admin1');
  if (admin) {
    admin.email = 'admin@admin.com';
    admin.password = 'admin123';
  } else {
    store.users.push(defaultStore().users[0]);
  }
  
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

function getFavorites() {
  const store = getStore();
  if (!store.currentUser) return [];
  const user = store.users.find(u => u.id === store.currentUser);
  return user ? (user.favorites || []) : [];
}

function toggleFavorite(imageData) {
  const store = getStore();
  if (!store.currentUser) return false;
  const user = store.users.find(u => u.id === store.currentUser);
  if (!user) return false;
  if (!user.favorites) user.favorites = [];
  const idx = user.favorites.findIndex(f => f.url === imageData.url);
  if (idx >= 0) {
    user.favorites.splice(idx, 1);
    saveStore(store);
    return false;
  } else {
    user.favorites.push(imageData);
    saveStore(store);
    return true;
  }
}

function isFavorite(url) {
  return getFavorites().some(f => f.url === url);
}

window.getStore = getStore;
window.saveStore = saveStore;
window.getCurrentUser = getCurrentUser;
window.requireAuth = requireAuth;
window.logout = logout;
window.getFavorites = getFavorites;
window.toggleFavorite = toggleFavorite;
window.isFavorite = isFavorite;
