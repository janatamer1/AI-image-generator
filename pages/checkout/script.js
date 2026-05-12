const PLANS = {
  pro: {
    name: 'Pro',
    monthlyPrice: 12,
    yearlyPrice: 10,
    color: 'rgba(147,51,234,0.12)',
    borderColor: 'rgba(147,51,234,0.25)',
    iconColor: 'var(--accent-purple)',
    iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
    features: [
      '500 image generations/month',
      'HD resolution (1024×1024)',
      'Priority generation queue',
      'Advanced style controls',
      'Unlimited image history',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 49,
    yearlyPrice: 39,
    color: 'rgba(234,179,8,0.08)',
    borderColor: 'rgba(234,179,8,0.2)',
    iconColor: '#eab308',
    iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    features: [
      'Unlimited image generations',
      '4K resolution (2048×2048)',
      'Full API access',
      'Instant priority generation',
      'Full style & model control',
    ],
  },
};

const params = new URLSearchParams(window.location.search);
const planKey = params.get('plan') || 'pro';
const billing = params.get('billing') || 'monthly';
const plan = PLANS[planKey] || PLANS.pro;
const isYearly = billing === 'yearly';

const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
const total = isYearly ? price * 12 : price;
const subtotal = isYearly ? plan.monthlyPrice * 12 : price;
const discount = isYearly ? subtotal - total : 0;

function renderSummary() {
  const icon = document.getElementById('summaryIcon');
  icon.style.background = plan.color;
  icon.style.border = `1px solid ${plan.borderColor}`;
  icon.style.color = plan.iconColor;
  icon.innerHTML = plan.iconSvg;

  document.getElementById('summaryPlanName').textContent = `AI ImageGen ${plan.name}`;
  document.getElementById('summaryBilling').textContent = isYearly ? 'Billed annually' : 'Billed monthly';

  const featuresList = document.getElementById('summaryFeatures');
  featuresList.innerHTML = plan.features.map(f => `
    <div class="summary-feature">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      ${f}
    </div>
  `).join('');

  document.getElementById('summarySubtotal').textContent = isYearly
    ? `$${plan.monthlyPrice}/mo × 12`
    : `$${price}/month`;

  if (isYearly) {
    document.getElementById('discountLine').style.display = 'flex';
    document.getElementById('summaryDiscount').textContent = `-$${discount}`;
  }

  document.getElementById('summaryTotal').textContent = isYearly
    ? `$${total}/year`
    : `$${price}/month`;

  document.getElementById('payBtnAmount').textContent = isYearly ? `$${total}` : `$${price}`;
}

renderSummary();

const user = getCurrentUser();
if (user) {
  document.getElementById('firstName').value = (user.name || '').split(' ')[0] || '';
  document.getElementById('lastName').value = (user.name || '').split(' ').slice(1).join(' ') || '';
  document.getElementById('checkoutEmail').value = user.email || '';
}

let currentStep = 1;

function goToPayment() {
  const first = document.getElementById('firstName').value.trim();
  const last = document.getElementById('lastName').value.trim();
  const email = document.getElementById('checkoutEmail').value.trim();
  const err = document.getElementById('accountError');

  if (!first || !last) {
    err.textContent = 'Please enter your first and last name.';
    err.style.display = 'block';
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    err.textContent = 'Please enter a valid email address.';
    err.style.display = 'block';
    return;
  }
  err.style.display = 'none';
  showStep(2);
}

function goToAccount() {
  showStep(1);
}

function showStep(n) {
  currentStep = n;
  document.getElementById('stepAccount').style.display = n === 1 ? 'block' : 'none';
  document.getElementById('stepPayment').style.display = n === 2 ? 'block' : 'none';
  document.getElementById('stepSuccess').style.display = n === 3 ? 'block' : 'none';

  [1, 2, 3].forEach(i => {
    const el = document.getElementById(`step${i}Indicator`);
    el.classList.toggle('active', i === n);
    el.classList.toggle('done', i < n);
  });

  if (n === 3) {
    document.getElementById('orderSummary').style.display = 'none';
  }
}

function formatCardNumber(input) {
  let val = input.value.replace(/\D/g, '').slice(0, 16);
  input.value = val.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(input) {
  let val = input.value.replace(/\D/g, '').slice(0, 4);
  if (val.length >= 3) val = val.slice(0, 2) + ' / ' + val.slice(2);
  input.value = val;
}

function submitPayment() {
  const name = document.getElementById('cardName').value.trim();
  const number = document.getElementById('cardNumber').value.replace(/\s/g, '');
  const expiry = document.getElementById('cardExpiry').value.replace(/\s/g, '');
  const cvv = document.getElementById('cardCvv').value.trim();
  const err = document.getElementById('paymentError');

  if (!name) {
    err.textContent = 'Please enter the cardholder name.';
    err.style.display = 'block';
    return;
  }
  if (number.length < 13 || number.length > 16 || !/^\d+$/.test(number)) {
    err.textContent = 'Please enter a valid card number.';
    err.style.display = 'block';
    return;
  }
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    err.textContent = 'Please enter a valid expiry date (MM / YY).';
    err.style.display = 'block';
    return;
  }
  if (cvv.length < 3) {
    err.textContent = 'Please enter a valid CVV.';
    err.style.display = 'block';
    return;
  }
  err.style.display = 'none';

  const payBtn = document.getElementById('payBtn');
  payBtn.classList.add('loading-pay');
  payBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Processing…`;

  setTimeout(() => {
    processSuccess();
  }, 1800);
}

function processSuccess() {
  const first = document.getElementById('firstName').value.trim();
  const last = document.getElementById('lastName').value.trim();
  const email = document.getElementById('checkoutEmail').value.trim();

  if (user) {
    const store = getStore();
    const u = store.users.find(u => u.id === store.currentUser);
    if (u) {
      u.plan = planKey;
      u.name = `${first} ${last}`.trim() || u.name;
      saveStore(store);
    }
  }

  document.getElementById('successPlanName').textContent = `${plan.name} Plan`;

  const now = new Date();
  const nextBilling = new Date(now);
  isYearly ? nextBilling.setFullYear(nextBilling.getFullYear() + 1) : nextBilling.setMonth(nextBilling.getMonth() + 1);
  const fmt = d => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const cardNum = document.getElementById('cardNumber').value.slice(-4);

  document.getElementById('successDetails').innerHTML = `
    <div class="success-detail-row"><span>Plan</span><strong>AI ImageGen ${plan.name}</strong></div>
    <div class="success-detail-row"><span>Amount charged</span><strong>${isYearly ? `$${total}/year` : `$${price}/month`}</strong></div>
    <div class="success-detail-row"><span>Email</span><strong>${email}</strong></div>
    <div class="success-detail-row"><span>Card</span><strong>•••• •••• •••• ${cardNum}</strong></div>
    <div class="success-detail-row"><span>Next billing</span><strong>${fmt(nextBilling)}</strong></div>
  `;

  showStep(3);
}

window.goToPayment = goToPayment;
window.goToAccount = goToAccount;
window.submitPayment = submitPayment;
window.formatCardNumber = formatCardNumber;
window.formatExpiry = formatExpiry;
