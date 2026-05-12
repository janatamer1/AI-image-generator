const user = requireAuth('user');
if (user) initStudio(user);

let currentChatId = null;

function initStudio(user) {
  document.getElementById('sidebarUserName').textContent = user.name;
  document.getElementById('sidebarAvatar').textContent = user.name.charAt(0).toUpperCase();
  const plan = user.plan || 'free';
  document.getElementById('sidebarUserPlan').textContent = plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan';
  renderChatHistory(user);
  renderRecentPrompts(user);
}

function renderRecentPrompts(user) {
  const section = document.getElementById('recentPromptsSection');
  const list = document.getElementById('recentPromptsList');
  if (!section || !list) return;

  const prompts = [];
  const seen = new Set();
  for (const chat of (user.chats || []).slice().reverse()) {
    for (const msg of (chat.messages || []).slice().reverse()) {
      if (msg.type === 'user' && msg.text && !seen.has(msg.text)) {
        seen.add(msg.text);
        prompts.push(msg.text);
        if (prompts.length >= 5) break;
      }
    }
    if (prompts.length >= 5) break;
  }

  if (prompts.length === 0) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  list.innerHTML = prompts.map(p => `
    <button class="recent-prompt-chip" onclick="fillStudioPrompt(${JSON.stringify(p)})">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;opacity:0.6;"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>
      <span>${p.length > 50 ? p.slice(0, 50) + '…' : p}</span>
    </button>
  `).join('');
}

function renderChatHistory(user) {
  const list = document.getElementById('chatHistoryList');
  const chats = (user.chats || []).slice().reverse();
  if (chats.length === 0) {
    list.innerHTML = '<p class="sidebar-empty">No chats yet</p>';
    return;
  }
  list.innerHTML = chats.map(chat => `
    <button class="chat-history-item ${chat.id === currentChatId ? 'active' : ''}" onclick="loadChat('${chat.id}')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>${chat.title || 'New Chat'}</span>
    </button>
  `).join('');
}

function startNewChat() {
  currentChatId = null;
  document.getElementById('welcomeScreen').style.display = 'flex';
  document.getElementById('chatArea').style.display = 'none';
  document.getElementById('chatMessages').innerHTML = '';
  document.getElementById('studioPrompt').value = '';

  const store = getStore();
  const u = store.users.find(u => u.id === store.currentUser);
  renderChatHistory(u);
}

function loadChat(chatId) {
  const store = getStore();
  const u = store.users.find(u => u.id === store.currentUser);
  const chat = (u.chats || []).find(c => c.id === chatId);
  if (!chat) return;

  currentChatId = chatId;
  document.getElementById('welcomeScreen').style.display = 'none';
  document.getElementById('chatArea').style.display = 'flex';
  document.getElementById('chatMessages').innerHTML = '';

  (chat.messages || []).forEach(msg => {
    if (msg.type === 'user') appendUserMessage(msg.text, false);
    else if (msg.type === 'image') appendImageMessage(msg.imageUrl, msg.prompt, false);
  });

  scrollToBottom();
  renderChatHistory(u);
}

function fillStudioPrompt(text) {
  document.getElementById('studioPrompt').value = text;
  document.getElementById('studioPrompt').focus();
}

function handleStudioKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendStudioMessage();
  }
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}

function sendStudioMessage() {
  const textarea = document.getElementById('studioPrompt');
  const prompt = textarea.value.trim();
  if (!prompt) return;

  textarea.value = '';
  textarea.style.height = 'auto';

  document.getElementById('welcomeScreen').style.display = 'none';
  document.getElementById('chatArea').style.display = 'flex';

  const sendBtn = document.getElementById('studioSendBtn');
  sendBtn.disabled = true;
  sendBtn.classList.add('loading');

  appendUserMessage(prompt, true);

  const loadingId = appendLoadingMessage();

  generateImageFromPrompt(prompt).then(imageUrl => {
    removeLoadingMessage(loadingId);
    appendImageMessage(imageUrl, prompt, true);
    sendBtn.disabled = false;
    sendBtn.classList.remove('loading');
    saveMessage(prompt, imageUrl);
    scrollToBottom();
  }).catch(() => {
    removeLoadingMessage(loadingId);
    appendErrorMessage(prompt);
    sendBtn.disabled = false;
    sendBtn.classList.remove('loading');
    scrollToBottom();
  });
}

function appendUserMessage(text, animate) {
  const messages = document.getElementById('chatMessages');
  const el = document.createElement('div');
  el.className = 'chat-message user-message' + (animate ? ' animate-in' : '');
  el.innerHTML = `
    <div class="user-bubble">
      <p>${escapeHtml(text)}</p>
    </div>
  `;
  messages.appendChild(el);
  if (animate) scrollToBottom();
}

function appendLoadingMessage() {
  const messages = document.getElementById('chatMessages');
  const id = 'loading_' + Date.now();
  const el = document.createElement('div');
  el.className = 'chat-message ai-message';
  el.id = id;

  let elapsed = 0;
  el.innerHTML = `
    <div class="ai-avatar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
    </div>
    <div class="ai-bubble">
      <div class="generating-indicator">
        <div class="gen-spinner"></div>
        <div class="gen-text">
          <span>Generating your image...</span>
          <span class="gen-timer" id="genTimer_${id}">0s</span>
        </div>
      </div>
    </div>
  `;
  messages.appendChild(el);

  const timerInterval = setInterval(() => {
    elapsed += 1;
    const timerEl = document.getElementById('genTimer_' + id);
    if (timerEl) timerEl.textContent = elapsed + 's';
    else clearInterval(timerInterval);
  }, 1000);
  el._timerInterval = timerInterval;

  scrollToBottom();
  return id;
}

function appendErrorMessage(prompt) {
  const messages = document.getElementById('chatMessages');
  const el = document.createElement('div');
  el.className = 'chat-message ai-message animate-in';
  el.innerHTML = `
    <div class="ai-avatar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
    </div>
    <div class="ai-bubble">
      <div style="color:#f87171;margin-bottom:10px;font-size:0.9rem;">Generation timed out. The AI servers are busy — please try again.</div>
      <button class="btn btn-primary btn-xs" onclick="fillStudioPrompt(${JSON.stringify(prompt)});sendStudioMessage()">Retry</button>
    </div>
  `;
  messages.appendChild(el);
}

function removeLoadingMessage(id) {
  const el = document.getElementById(id);
  if (el) {
    if (el._timerInterval) clearInterval(el._timerInterval);
    el.remove();
  }
}

function appendImageMessage(imageUrl, prompt, animate) {
  const messages = document.getElementById('chatMessages');
  const el = document.createElement('div');
  el.className = 'chat-message ai-message' + (animate ? ' animate-in' : '');
  el.innerHTML = `
    <div class="ai-avatar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
    </div>
    <div class="ai-bubble">
      <div class="generated-image-card">
        <img src="${imageUrl}" alt="${escapeHtml(prompt)}" class="generated-image" loading="lazy">
        <div class="generated-image-actions">
          <span class="gen-prompt-label">"${escapeHtml(prompt)}"</span>
          <div class="gen-action-btns">
            <button class="btn btn-ghost btn-xs" onclick="downloadGenerated('${imageUrl}', '${escapeHtml(prompt)}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  messages.appendChild(el);
}

function downloadGenerated(url, prompt) {
  const a = document.createElement('a');
  a.href = url;
  a.download = 'AI_Image.jpg';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function saveMessage(prompt, imageUrl) {
  const store = getStore();
  const u = store.users.find(u => u.id === store.currentUser);
  if (!u) return;
  if (!u.chats) u.chats = [];
  if (!u.images) u.images = [];

  const now = new Date().toISOString().split('T')[0];

  if (!currentChatId) {
    currentChatId = 'chat_' + Date.now();
    const newChat = {
      id: currentChatId,
      title: prompt.length > 40 ? prompt.substring(0, 40) + '…' : prompt,
      createdAt: now,
      messages: []
    };
    u.chats.push(newChat);
  }

  const chat = u.chats.find(c => c.id === currentChatId);
  if (chat) {
    chat.messages.push({ type: 'user', text: prompt });
    chat.messages.push({ type: 'image', imageUrl, prompt });
  }

  u.images.unshift({ id: 'img_' + Date.now(), prompt, url: imageUrl, createdAt: now });
  saveStore(store);
  renderChatHistory(u);
}

function scrollToBottom() {
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function escapeHtml(text) {
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

window.startNewChat = startNewChat;
window.loadChat = loadChat;
window.fillStudioPrompt = fillStudioPrompt;
window.handleStudioKey = handleStudioKey;
window.autoResizeTextarea = autoResizeTextarea;
window.sendStudioMessage = sendStudioMessage;
window.downloadGenerated = downloadGenerated;
window.toggleSidebar = toggleSidebar;
