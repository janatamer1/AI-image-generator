initNavbar();

const user = getCurrentUser();
if (user) {
  const navActions = document.getElementById('pricingNavActions');
  if (navActions) {
    const dashUrl = user.role === 'admin' ? '/pages/admin-dashboard/index.html' : '/pages/user-dashboard/index.html';
    navActions.innerHTML = `
      <a href="${dashUrl}" class="btn btn-ghost">Dashboard</a>
      <button onclick="logout()" class="btn btn-primary">Log Out</button>
    `;
  }
}

let isYearly = false;

function toggleBilling() {
  isYearly = !isYearly;

  const knob = document.getElementById('billingKnob');
  const track = document.getElementById('billingTrack');
  const monthlyLabel = document.getElementById('monthlyLabel');
  const yearlyLabel = document.getElementById('yearlyLabel');
  const proPrice = document.getElementById('proPrice');
  const proOriginal = document.getElementById('proOriginal');
  const enterprisePrice = document.getElementById('enterprisePrice');
  const enterpriseOriginal = document.getElementById('enterpriseOriginal');

  if (isYearly) {
    knob.style.transform = 'translateX(24px)';
    track.classList.add('track-active');
    monthlyLabel.classList.remove('active');
    yearlyLabel.classList.add('active');
    proPrice.textContent = '$10';
    enterprisePrice.textContent = '$39';
    if (proOriginal) proOriginal.style.display = 'inline';
    if (enterpriseOriginal) enterpriseOriginal.style.display = 'inline';
  } else {
    knob.style.transform = 'translateX(0)';
    track.classList.remove('track-active');
    monthlyLabel.classList.add('active');
    yearlyLabel.classList.remove('active');
    proPrice.textContent = '$12';
    enterprisePrice.textContent = '$49';
    if (proOriginal) proOriginal.style.display = 'none';
    if (enterpriseOriginal) enterpriseOriginal.style.display = 'none';
  }

  const billingParam = isYearly ? 'yearly' : 'monthly';
  const proBtn = document.getElementById('proPlanBtn');
  const entBtn = document.getElementById('enterprisePlanBtn');
  if (proBtn) proBtn.href = `/pages/checkout/index.html?plan=pro&billing=${billingParam}`;
  if (entBtn) entBtn.href = `/pages/checkout/index.html?plan=enterprise&billing=${billingParam}`;
}

window.toggleBilling = toggleBilling;
