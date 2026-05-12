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
  const monthlyLabel = document.getElementById('monthlyLabel');
  const yearlyLabel = document.getElementById('yearlyLabel');
  const proPrice = document.getElementById('proPrice');
  const enterprisePrice = document.getElementById('enterprisePrice');

  if (isYearly) {
    knob.style.transform = 'translateX(22px)';
    monthlyLabel.classList.remove('active');
    yearlyLabel.classList.add('active');
    proPrice.textContent = '$10';
    enterprisePrice.textContent = '$39';
  } else {
    knob.style.transform = 'translateX(0)';
    monthlyLabel.classList.add('active');
    yearlyLabel.classList.remove('active');
    proPrice.textContent = '$12';
    enterprisePrice.textContent = '$49';
  }
}

window.toggleBilling = toggleBilling;
