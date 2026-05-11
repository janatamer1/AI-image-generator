/* ========================================
   Shared Navbar Scroll Effect
   ======================================== */

function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
  if (window.scrollY > 50) navbar.classList.add('scrolled');
}

window.initNavbar = initNavbar;
