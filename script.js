/* ========================================
   AI ImageGen - Professional Logic
   ======================================== */

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Modal Logic
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
  document.body.style.overflow = '';
}

// Close modal on outside click
document.querySelectorAll('.modal-overlay').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal.id);
    }
  });
});

// Generator Logic
function generateImage() {
  const promptInput = document.getElementById('promptInput');
  const promptText = promptInput.value.trim();
  
  if (!promptText) {
    alert("Please enter a description to generate an image.");
    return;
  }

  const generatorUI = document.getElementById('generatorUI');
  const generatorOutput = document.getElementById('generatorOutput');
  const outputImage = document.getElementById('outputImage');
  const loadingState = document.getElementById('loadingState');
  const outputActions = document.getElementById('outputActions');
  const outputPromptText = document.getElementById('outputPromptText');
  const loadingTimer = document.getElementById('loadingTimer');
  const generateBtn = document.getElementById('generateBtn');

  // Disable UI
  generateBtn.disabled = true;
  generateBtn.style.opacity = '0.7';
  
  // Show Output area & Loading state
  generatorOutput.classList.add('active');
  outputImage.style.display = 'none';
  outputActions.style.display = 'none';
  loadingState.style.display = 'flex';
  
  // Simulate 15-second generation (We'll use 5s for better UX, but update the text to look like it's processing up to 15s)
  let timeLeft = 15;
  loadingTimer.textContent = timeLeft;
  
  const timerInterval = setInterval(() => {
    timeLeft--;
    loadingTimer.textContent = timeLeft;
  }, 1000);

  // We'll actually finish in 5 seconds to not make the user wait forever in the demo,
  // but let's stick to the 15 seconds required by the charter realistically for the demo if preferred.
  // Actually, I'll stick to a 5-second realistic demo to keep them engaged, but say it takes UP to 15s.
  setTimeout(() => {
    clearInterval(timerInterval);
    
    // Complete Generation
    loadingState.style.display = 'none';
    
    // Set random image from Pexels as a placeholder for AI result
    const randomImages = [
      "https://images.pexels.com/photos/8473930/pexels-photo-8473930.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/8442974/pexels-photo-8442974.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/8474028/pexels-photo-8474028.jpeg?auto=compress&cs=tinysrgb&w=800"
    ];
    const selectedImage = randomImages[Math.floor(Math.random() * randomImages.length)];
    
    outputImage.src = selectedImage;
    outputImage.style.display = 'block';
    
    outputPromptText.textContent = `"${promptText}"`;
    outputActions.style.display = 'flex';

    // Re-enable UI
    generateBtn.disabled = false;
    generateBtn.style.opacity = '1';
    
    // Scroll to result
    generatorOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });

  }, 15000); // 15 seconds as per charter requirement
}

function downloadImage() {
  const outputImage = document.getElementById('outputImage');
  if (!outputImage.src) return;

  // Fake download behavior
  const a = document.createElement('a');
  a.href = outputImage.src;
  a.download = 'AI_Generated_Image.jpg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  alert("Image download started!");
}
