const user = requireAuth('user');
if (user) initProfilePage(user);

function initProfilePage(user) {
  initNavbar();
  document.getElementById('userBadge').textContent = user.name;
  document.getElementById('profileAvatarLg').textContent = user.name.charAt(0).toUpperCase();
  document.getElementById('profileNameDisplay').textContent = user.name;
  document.getElementById('profileEmailDisplay').textContent = user.email;
  document.getElementById('profileName').value = user.name;
  document.getElementById('profileEmail').value = user.email;
  document.getElementById('profileRole').value = user.role === 'admin' ? 'Administrator' : 'Standard User';
  document.getElementById('profileDate').value = user.joinedAt || '—';
  const plan = user.plan || 'free';
  document.getElementById('profilePlanBadge').textContent = plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan';
  document.getElementById('profileTotalImages').textContent = (user.images || []).length;
  document.getElementById('profileTotalChats').textContent = (user.chats || []).length;

  if (user.joinedAt) {
    const joined = new Date(user.joinedAt);
    const days = Math.floor((new Date() - joined) / (1000 * 60 * 60 * 24));
    document.getElementById('profileMemberDays').textContent = days;
  }
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

  document.getElementById('profileAvatarLg').textContent = name.charAt(0).toUpperCase();
  document.getElementById('profileNameDisplay').textContent = name;
  document.getElementById('profileEmailDisplay').textContent = email;
  document.getElementById('userBadge').textContent = name;

  successEl.style.display = 'block';
  setTimeout(() => { successEl.style.display = 'none'; }, 3000);
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
    errorEl.textContent = 'Please fill in all three password fields.';
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

  if (newPwd === currentPwd) {
    errorEl.textContent = 'New password must be different from your current password.';
    errorEl.style.display = 'block';
    return;
  }

  if (newPwd !== confirmPwd) {
    errorEl.textContent = 'New passwords do not match.';
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
  updateStrength('');
  checkMatch();
  document.getElementById('pwdRequirements').style.display = 'none';

  successEl.style.display = 'flex';
  setTimeout(() => { successEl.style.display = 'none'; }, 4000);
}

function toggleEye(inputId, btn) {
  const input = document.getElementById(inputId);
  const showIcon = btn.querySelector('.eye-show');
  const hideIcon = btn.querySelector('.eye-hide');
  if (input.type === 'password') {
    input.type = 'text';
    showIcon.style.display = 'none';
    hideIcon.style.display = '';
  } else {
    input.type = 'password';
    showIcon.style.display = '';
    hideIcon.style.display = 'none';
  }
}

function updateStrength(val) {
  const wrap = document.getElementById('strengthWrap');
  const label = document.getElementById('strengthLabel');
  const reqWrap = document.getElementById('pwdRequirements');
  const reqLength = document.getElementById('reqLength');
  const reqDifferent = document.getElementById('reqDifferent');
  const currentPwd = document.getElementById('currentPassword').value;

  if (!val) {
    wrap.style.display = 'none';
    reqWrap.style.display = 'none';
    return;
  }

  wrap.style.display = 'flex';
  reqWrap.style.display = 'block';

  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
  if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) score++;

  const bars = ['sBar1','sBar2','sBar3','sBar4'];
  const colors = ['#ef4444','#f97316','#eab308','#22c55e'];
  const labels = ['Weak','Fair','Good','Strong'];
  bars.forEach((id, i) => {
    const el = document.getElementById(id);
    el.style.background = i < score ? colors[score - 1] : 'rgba(255,255,255,0.06)';
  });
  label.textContent = labels[score - 1] || 'Weak';
  label.style.color = colors[score - 1] || colors[0];

  setReq(reqLength, val.length >= 6);
  setReq(reqDifferent, val !== currentPwd && currentPwd.length > 0);
}

function setReq(el, met) {
  const icon = el.querySelector('svg');
  if (met) {
    el.classList.add('req-met');
    icon.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
    icon.setAttribute('viewBox','0 0 24 24');
  } else {
    el.classList.remove('req-met');
    icon.innerHTML = '<circle cx="12" cy="12" r="10"/>';
  }
}

function checkMatch() {
  const newPwd = document.getElementById('newPassword').value;
  const confirmPwd = document.getElementById('confirmPassword').value;
  const hint = document.getElementById('matchHint');
  if (!confirmPwd) { hint.style.display = 'none'; return; }
  hint.style.display = 'block';
  if (newPwd === confirmPwd) {
    hint.textContent = '✓ Passwords match';
    hint.className = 'match-hint match-ok';
  } else {
    hint.textContent = '✗ Passwords do not match';
    hint.className = 'match-hint match-fail';
  }
}

window.saveProfile = saveProfile;
window.changePassword = changePassword;
window.toggleEye = toggleEye;
window.updateStrength = updateStrength;
window.checkMatch = checkMatch;
