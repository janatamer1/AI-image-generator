/* ========================================
   Homepage Logic
   ======================================== */

function updateNavbarAuth() {
  const user = getCurrentUser();
  const authActions = document.getElementById('homeAuthActions');
  if (!authActions) return;

  if (user) {
    const dashboardUrl = user.role === 'admin' ? '/pages/admin-dashboard/index.html' : '/pages/user-dashboard/index.html';
    authActions.innerHTML = `
      <a href="${dashboardUrl}" class="btn btn-ghost">Dashboard</a>
      <button onclick="logout()" class="btn btn-primary">Log Out</button>
    `;
  }
}

initNavbar();
updateNavbarAuth();

function generateImage() {
  const promptInput = document.getElementById('promptInput');
  const promptText = promptInput.value.trim();

  if (!promptText) {
    alert("Please enter a description to generate an image.");
    return;
  }

  const generatorOutput = document.getElementById('generatorOutput');
  const outputImage = document.getElementById('outputImage');
  const loadingState = document.getElementById('loadingState');
  const outputActions = document.getElementById('outputActions');
  const outputPromptText = document.getElementById('outputPromptText');
  const loadingTimer = document.getElementById('loadingTimer');
  const generateBtn = document.getElementById('generateBtn');

  generateBtn.disabled = true;

  generatorOutput.classList.add('active');
  outputImage.style.display = 'none';
  outputActions.style.display = 'none';
  loadingState.style.display = 'flex';

  let timeLeft = 15;
  loadingTimer.textContent = timeLeft;

  const timerInterval = setInterval(() => {
    timeLeft--;
    loadingTimer.textContent = timeLeft;
  }, 1000);

  setTimeout(() => {
    clearInterval(timerInterval);
    loadingState.style.display = 'none';

    const randomImages = [
      "https://images.pexels.com/photos/2881232/pexels-photo-2881232.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3573383/pexels-photo-3573383.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1762973/pexels-photo-1762973.jpeg?auto=compress&cs=tinysrgb&w=800"
    ];
    const selectedImage = randomImages[Math.floor(Math.random() * randomImages.length)];

    outputImage.src = selectedImage;
    outputImage.style.display = 'block';

    outputPromptText.textContent = `"${promptText}"`;
    outputActions.style.display = 'flex';

    generateBtn.disabled = false;

    generatorOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 15000);
}

function downloadImage() {
  const outputImage = document.getElementById('outputImage');
  if (!outputImage.src) return;
  const a = document.createElement('a');
  a.href = outputImage.src;
  a.download = 'AI_Generated_Image.jpg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

window.generateImage = generateImage;
window.downloadImage = downloadImage;
