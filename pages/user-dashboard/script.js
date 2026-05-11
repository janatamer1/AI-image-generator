/* ========================================
   User Dashboard Logic
   ======================================== */

const user = requireAuth('user');
if (user) initDashboard(user);

function initDashboard(user) {
  initNavbar();
  document.getElementById('userDisplayName').textContent = user.name;
  document.getElementById('userBadge').textContent = user.name;
  document.getElementById('userTotalImages').textContent = user.images.length;
  renderRecentImages(user);
}

function renderRecentImages(user) {
  const grid = document.getElementById('userRecentGrid');
  if (!grid) return;

  if (user.images.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-muted);opacity:0.4;">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
        </svg>
        <p>No images generated yet. Try creating one above!</p>
      </div>`;
    return;
  }

  const recent = user.images.slice(0, 6);
  grid.innerHTML = recent.map(img => `
    <div class="recent-card">
      <img src="${img.url}" alt="${img.prompt}" loading="lazy">
      <div class="recent-card-info">
        <p>${img.prompt}</p>
        <span>${img.createdAt}</span>
      </div>
    </div>
  `).join('');
}

function dashGenerateImage() {
  const promptInput = document.getElementById('dashPromptInput');
  const promptText = promptInput.value.trim();

  if (!promptText) {
    alert("Please enter a description to generate an image.");
    return;
  }

  const dashOutput = document.getElementById('dashOutput');
  const dashLoading = document.getElementById('dashLoading');
  const dashOutputImage = document.getElementById('dashOutputImage');
  const dashOutputActions = document.getElementById('dashOutputActions');
  const dashOutputPrompt = document.getElementById('dashOutputPrompt');
  const dashTimer = document.getElementById('dashTimer');
  const dashGenerateBtn = document.getElementById('dashGenerateBtn');

  dashGenerateBtn.disabled = true;

  dashOutput.style.display = 'block';
  dashOutputImage.style.display = 'none';
  dashOutputActions.style.display = 'none';
  dashLoading.style.display = 'flex';

  let timeLeft = 15;
  dashTimer.textContent = timeLeft;

  const timerInterval = setInterval(() => {
    timeLeft--;
    dashTimer.textContent = timeLeft;
  }, 1000);

  setTimeout(() => {
    clearInterval(timerInterval);
    dashLoading.style.display = 'none';

    const randomImages = [
      "https://images.pexels.com/photos/2881232/pexels-photo-2881232.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3573383/pexels-photo-3573383.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1762973/pexels-photo-1762973.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/2732042/pexels-photo-2732042.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800"
    ];
    const selectedImage = randomImages[Math.floor(Math.random() * randomImages.length)];

    dashOutputImage.src = selectedImage;
    dashOutputImage.style.display = 'block';

    dashOutputPrompt.textContent = `"${promptText}"`;
    dashOutputActions.style.display = 'flex';

    dashGenerateBtn.disabled = false;

    // Save to user's images
    const store = getStore();
    const currentUser = store.users.find(u => u.id === store.currentUser);
    if (currentUser) {
      currentUser.images.unshift({
        id: 'img_' + Date.now(),
        prompt: promptText,
        url: selectedImage,
        createdAt: new Date().toISOString().split('T')[0]
      });
      saveStore(store);
      document.getElementById('userTotalImages').textContent = currentUser.images.length;
      renderRecentImages(currentUser);
    }

    promptInput.value = '';
  }, 15000);
}

function dashDownloadImage() {
  const img = document.getElementById('dashOutputImage');
  if (!img.src) return;
  const a = document.createElement('a');
  a.href = img.src;
  a.download = 'AI_Generated_Image.jpg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

window.dashGenerateImage = dashGenerateImage;
window.dashDownloadImage = dashDownloadImage;
