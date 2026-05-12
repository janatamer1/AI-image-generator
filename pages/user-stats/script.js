const user = requireAuth('user');
if (user) initStatsPage(user);

function initStatsPage(user) {
  initNavbar();
  document.getElementById('userBadge').textContent = user.name;

  const images = user.images || [];
  const chats = user.chats || [];
  const favs = user.favorites || [];

  document.getElementById('ovImages').textContent = images.length;
  document.getElementById('ovChats').textContent = chats.length;
  document.getElementById('ovFavs').textContent = favs.length;

  if (user.joinedAt) {
    const days = Math.floor((new Date() - new Date(user.joinedAt)) / (1000 * 60 * 60 * 24));
    document.getElementById('ovDays').textContent = days;
  }

  renderMonthlyChart(images);
  renderTopWords(images);
  renderRecentPrompts(images);
}

function renderMonthlyChart(images) {
  const container = document.getElementById('monthlyChart');
  if (images.length === 0) return;

  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString([], { month: 'short', year: '2-digit' });
    months.push({ key, label, count: 0 });
  }

  images.forEach(img => {
    if (!img.createdAt) return;
    const m = img.createdAt.slice(0, 7);
    const entry = months.find(mo => mo.key === m);
    if (entry) entry.count++;
  });

  const max = Math.max(...months.map(m => m.count), 1);

  container.innerHTML = `
    <div class="chart-bars">
      ${months.map(m => `
        <div class="chart-col">
          <span class="chart-val">${m.count > 0 ? m.count : ''}</span>
          <div class="chart-bar-wrap">
            <div class="chart-bar" style="height:${Math.max(m.count / max * 100, m.count > 0 ? 4 : 0)}%"></div>
          </div>
          <span class="chart-label">${m.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderTopWords(images) {
  const container = document.getElementById('topWordsList');
  if (images.length === 0) return;

  const stopWords = new Set([
    'a','an','the','of','in','on','at','to','for','with','is','are','was','were',
    'be','been','being','create','make','generate','show','me','my','please',
    'picture','image','photo','i','want','can','you','and','or','but','so',
    'very','really','just','some','there','here','that','this','it','its','give',
    'style','high','quality','detailed','realistic','art','by'
  ]);

  const freq = {};
  images.forEach(img => {
    if (!img.prompt) return;
    img.prompt.toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w))
      .forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  });

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (sorted.length === 0) return;

  const maxCount = sorted[0][1];

  container.innerHTML = sorted.map(([word, count]) => `
    <div class="word-item">
      <span class="word-text">${word}</span>
      <div class="word-bar-track">
        <div class="word-bar-fill" style="width:${Math.round(count / maxCount * 100)}%"></div>
      </div>
      <span class="word-count">${count}×</span>
    </div>
  `).join('');
}

function renderRecentPrompts(images) {
  const container = document.getElementById('recentPromptsTable');
  const recent = images.slice(0, 10);
  if (recent.length === 0) return;

  container.innerHTML = `
    <div class="rp-list">
      ${recent.map((img, i) => `
        <div class="rp-item">
          <div class="rp-num">${i + 1}</div>
          <img src="${img.url}" class="rp-thumb" alt="${img.prompt}" loading="lazy">
          <div class="rp-info">
            <p class="rp-prompt">${img.prompt}</p>
            <span class="rp-date">${img.createdAt || ''}</span>
          </div>
          <a href="/pages/user-dashboard/index.html" onclick="sessionStorage.setItem('regen_prompt',${JSON.stringify(img.prompt)})" class="btn btn-ghost btn-sm rp-regen">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>
            Regenerate
          </a>
        </div>
      `).join('')}
    </div>
  `;
}
