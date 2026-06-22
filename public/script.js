// ============================================================
//  API HELPERS
// ============================================================
const API_BASE = '';

async function checkAuthStatus() {
  try {
    const res = await fetch(`${API_BASE}/auth/status`, { credentials: 'include' });
    const data = await res.json();
    return data.authenticated;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}

async function getAuthUrl() {
  try {
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const res = await fetch(`${API_BASE}/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`, {
      credentials: 'include'
    });
    const data = await res.json();
    return data.authUrl;
  } catch (error) {
    console.error('Failed to get auth URL:', error);
    return null;
  }
}

async function fetchEmails(category = 'all') {
  try {
    const endpoint = category === 'all' 
      ? `${API_BASE}/api/emails`
      : `${API_BASE}/api/emails/category/${category}`;
    
    const res = await fetch(endpoint, { credentials: 'include' });
    
    if (!res.ok) {
      if (res.status === 401) {
        // Not authenticated
        return null;
      }
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    return data.emails || [];
  } catch (error) {
    console.error('Failed to fetch emails:', error);
    return [];
  }
}

async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    location.reload();
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

// ============================================================
//  MOCK DATA FALLBACK
// ============================================================
const MOCK_LISTINGS = [
  {
    id: 1,
    company: "Google",
    role: "Software Engineering Intern",
    category: "internship",
    logo: "🔵",
    stipend: "₹80,000/mo",
    location: "Bangalore",
    duration: "3 months",
    deadline: "30 Jul 2025",
    batch: ["2026", "2027"],
    branches: ["CSE", "ECE"],
    minCG: 8.0,
    skills: ["Python", "DSA", "System Design"]
  },
  {
    id: 2,
    company: "Microsoft",
    role: "Research Intern — AI/ML",
    category: "research",
    logo: "🪟",
    stipend: "₹70,000/mo",
    location: "Hyderabad",
    deadline: "15 Aug 2025",
    batch: ["2025", "2026"],
    branches: ["CSE", "ECE"],
    minCG: 7.5,
    skills: ["Python", "PyTorch", "NLP"]
  },
  {
    id: 3,
    company: "Tata Steel",
    role: "Graduate Engineer Trainee",
    category: "placement",
    logo: "🏗️",
    stipend: "₹8 LPA",
    location: "Jamshedpur",
    deadline: "5 Aug 2025",
    batch: ["2025"],
    branches: ["ME", "Civil"],
    minCG: 6.5
  }
];

// ============================================================
//  STATE
// ============================================================
let currentEmails = [];
let currentCategory = 'all';
let currentBatch = '';
let currentBranch = '';
let authenticated = false;

// ============================================================
//  UI UPDATES
// ============================================================
function updateEmailUI(emails) {
  const listContainer = document.querySelector('.email-list');
  const countElement = document.getElementById('inbox-count');
  
  if (!listContainer) return;

  // Calculate badge counts
  const counts = {
    all: emails.length,
    internship: emails.filter(e => e.category === 'internship').length,
    placement: emails.filter(e => e.category === 'placement').length,
    research: emails.filter(e => e.category === 'research').length,
    project: emails.filter(e => e.category === 'project').length
  };

  // Update badges
  Object.entries(counts).forEach(([cat, count]) => {
    const badge = document.getElementById(`badge-${cat}`);
    if (badge) badge.textContent = count;
  });

  // Update count
  countElement.textContent = `${emails.length} opportunities`;

  // Render emails
  listContainer.innerHTML = emails.map(email => `
    <div class="email-item ${email.unread ? 'unread' : ''}" data-id="${email.id}">
      <div class="email-from">${email.from || email.company || 'Unknown'}</div>
      <div class="email-subject">${email.subject || 'No subject'}</div>
      <div class="email-snippet">${email.snippet || email.snippet || 'No preview'}</div>
      <div class="email-meta">
        <span class="email-date">${email.date || 'Unknown date'}</span>
        <span class="email-category" data-category="${email.category}">${email.category || 'uncategorized'}</span>
      </div>
    </div>
  `).join('');
}

function showConnectGmailButton() {
  const btn = document.getElementById('connect-gmail-btn');
  if (btn) {
    btn.style.display = 'block';
    btn.textContent = '＋ Connect Gmail';
    btn.disabled = false;
    btn.dataset.authenticated = 'false';
  }
}

function showDisconnectButton() {
  const btn = document.getElementById('connect-gmail-btn');
  if (btn) {
    btn.textContent = 'Sign Out';
    btn.disabled = false;
    btn.dataset.authenticated = 'true';
  }
}

// ============================================================
//  FILTER & SEARCH
// ============================================================
async function applyFilters() {
  let filtered = [...currentEmails];

  // Filter by batch
  if (currentBatch) {
    filtered = filtered.filter(e => e.batch?.includes(currentBatch));
  }

  // Filter by branch
  if (currentBranch) {
    filtered = filtered.filter(e => e.branches?.includes(currentBranch));
  }

  // Filter by category
  if (currentCategory !== 'all') {
    filtered = filtered.filter(e => e.category === currentCategory);
  }

  updateEmailUI(filtered);
}

// ============================================================
//  EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Check if auth param in URL
  const params = new URLSearchParams(window.location.search);
  if (params.get('auth') === 'success') {
    authenticated = true;
    window.history.replaceState({}, document.title, window.location.pathname);
    showDisconnectButton();
    await loadEmails();
  }

  // Check authentication status
  authenticated = await checkAuthStatus();
  if (authenticated) {
    showDisconnectButton();
    await loadEmails();
  } else {
    showConnectGmailButton();
    // Show mock data for demo
    updateEmailUI(MOCK_LISTINGS);
  }

  // Connect Gmail button
  const connectBtn = document.getElementById('connect-gmail-btn');
  if (connectBtn) {
    connectBtn.addEventListener('click', async () => {
      if (connectBtn.dataset.authenticated === 'true') {
        await logout();
        return;
      }

      const authUrl = await getAuthUrl();
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        alert('Failed to connect to Gmail. Check console and backend logs.');
      }
    });
  }

  // Category filters
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      await applyFilters();
    });
  });

  // Batch filter
  const batchSelect = document.getElementById('filter-batch');
  if (batchSelect) {
    batchSelect.addEventListener('change', (e) => {
      currentBatch = e.target.value;
      applyFilters();
    });
  }

  // Branch filter
  const branchSelect = document.getElementById('filter-branch');
  if (branchSelect) {
    branchSelect.addEventListener('change', (e) => {
      currentBranch = e.target.value;
      applyFilters();
    });
  }

  // Detail panel click
  document.addEventListener('click', (e) => {
    if (e.target.closest('.email-item')) {
      const emailItem = e.target.closest('.email-item');
      document.querySelectorAll('.email-item').forEach(item => item.classList.remove('active'));
      emailItem.classList.add('active');
    }
  });
});

// ============================================================
//  LOAD EMAILS
// ============================================================
async function loadEmails() {
  const emails = await fetchEmails(currentCategory);
  
  if (emails === null) {
    alert('Not authenticated. Please connect Gmail first.');
    authenticated = false;
    showConnectGmailButton();
    updateEmailUI(MOCK_LISTINGS);
    return;
  }

  if (emails.length === 0) {
    console.log('No emails found, using mock data');
    currentEmails = MOCK_LISTINGS;
  } else {
    currentEmails = emails;
  }

  updateEmailUI(currentEmails);
}
