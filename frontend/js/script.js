// ============================================================
//  DATA & STATE
// ============================================================
let LISTINGS = [];
let authenticated = false;
let currentUser = null;

const state = {
  activeCategory: "all",
  searchQuery: "",
  selectedId: null,
  savedIds: new Set()
};

const CATEGORIES = ["all", "internship", "placement", "research", "project"];

// ============================================================
//  DOM REFS
// ============================================================
const listingListEl     = document.getElementById("listing-list");
const emptyStateEl      = document.getElementById("empty-state");
const inboxCountEl      = document.getElementById("inbox-count");
const searchInput       = document.getElementById("search-input");
const detailPlaceholder = document.getElementById("detail-placeholder");
const detailContent     = document.getElementById("detail-content");
const toastEl           = document.getElementById("toast");
const signoutBtn        = document.getElementById("signout-btn");
const connectedStatusEl = document.getElementById("connected-status");
const profileAvatarEl   = document.getElementById("profile-avatar");
const userAvatarEl      = document.getElementById("user-avatar");
const userNameEl        = document.getElementById("user-name");
const userEmailEl       = document.getElementById("user-email");
const navItems          = document.querySelectorAll(".nav-item[data-category]");

// Old filter UI (kept in HTML, but no longer wired to filtering logic)
const filterToggleBtn = document.getElementById("filter-toggle-btn");
const filterBar       = document.getElementById("filter-bar");

// Detail panel fields
const dRole      = document.getElementById("d-role");
const dCompany   = document.getElementById("d-company");
const dCategory  = document.getElementById("d-category");
const dApplyBtn  = document.getElementById("d-apply-btn");
const dSaveBtn   = document.getElementById("d-save-btn");

// Fields tied to data that no longer exists — hidden if present in HTML
const obsoleteDetailEls = [
  "d-logo", "d-stipend", "d-location", "d-duration", "d-deadline",
  "d-branches", "d-cg", "d-batch", "d-gender", "d-skills", "d-interview"
].map(id => document.getElementById(id)).filter(Boolean);

// Calendar refs
const calendarNavBtn = document.getElementById("calendar-nav-btn");
const calendarView   = document.getElementById("calendar-view");
const mainPanel      = document.querySelector(".main");
const detailPanel    = document.getElementById("detail-panel");
const calGrid        = document.getElementById("cal-grid");
const calMonthTitle  = document.getElementById("cal-month-title");
const calEventsPanel = document.getElementById("cal-events-panel");
const calPrevBtn     = document.getElementById("cal-prev");
const calNextBtn     = document.getElementById("cal-next");

// ============================================================
//  HELPERS
// ============================================================
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

let toastTimer = null;
function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2500);
}

function getInitials(name, email) {
  const source = name || email || "OpportunityBox";
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 1).toUpperCase();
}

function setAvatar(el, user) {
  if (!el) return;

  const label = getInitials(user?.name, user?.email);
  el.textContent = label;
  el.style.backgroundImage = "";

  if (user?.picture) {
    el.textContent = "";
    el.style.backgroundImage = `url("${user.picture}")`;
  }
}

// Dashboard auth state is read-only: the landing page owns Google connection.
function renderUserProfile(user) {
  currentUser = user || null;
  const displayName = currentUser?.name || "Google account";
  const displayEmail = currentUser?.email || "Connected to Gmail";

  if (userNameEl) userNameEl.textContent = displayName;
  if (userEmailEl) userEmailEl.textContent = displayEmail;
  if (connectedStatusEl) connectedStatusEl.classList.toggle("is-connected", authenticated);

  setAvatar(profileAvatarEl, currentUser);
  setAvatar(userAvatarEl, currentUser);
}

function clearAuthQueryParam() {
  const url = new URL(window.location.href);
  if (url.searchParams.has("auth")) {
    url.searchParams.delete("auth");
    window.history.replaceState({}, document.title, url.pathname + url.search);
  }
}

// Normalize a raw Gmail-shaped email into the shape the UI uses
function normalizeEmail(raw) {
  return {
    id: raw.id,
    sender: raw.from || "Unknown Sender",
    subject: raw.subject || "No Subject",
    preview: raw.snippet || "",
    date: raw.date || "",
    category: raw.category || "other",
    unread: !!raw.unread
  };
}

// ============================================================
//  AUTH
// ============================================================
async function checkAuth() {
  try {
    const res = await fetch("/auth/status", { credentials: "include" });
    const data = await res.json();
    currentUser = data.user || null;
    return !!data.authenticated;
  } catch (err) {
    console.error(err);
    return false;
  }
}

signoutBtn?.addEventListener("click", async () => {
  try {
    await fetch("/auth/logout", { method: "POST", credentials: "include" });
  } catch (err) {
    console.error(err);
  }

  authenticated = false;
  LISTINGS = [];
  state.selectedId = null;
  showDetailPlaceholder();
  renderListings();
  window.location.href = "/";
});

// ============================================================
//  EMAIL FETCHING
// ============================================================
async function fetchEmails() {
  try {
    const res = await fetch("/api/emails", { credentials: "include" });
    if (!res.ok) {
      LISTINGS = [];
      renderListings();
      return;
    }
    const data = await res.json();
    const raw = Array.isArray(data.emails) ? data.emails : [];
    LISTINGS = raw.map(normalizeEmail);
    renderListings();
  } catch (err) {
    console.error(err);
    LISTINGS = [];
    renderListings();
  }
}

// ============================================================
//  FILTERING
// ============================================================
function getFilteredListings() {
  return LISTINGS.filter(item => {
    if (state.activeCategory !== "all" && item.category !== state.activeCategory) return false;
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const haystack = `${item.sender} ${item.subject} ${item.preview}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

// ============================================================
//  RENDER — LISTING CARDS
// ============================================================
function renderListings() {
  const filtered = getFilteredListings();

  CATEGORIES.forEach(cat => {
    const count = cat === "all"
      ? LISTINGS.length
      : LISTINGS.filter(l => l.category === cat).length;
    const el = document.getElementById(`badge-${cat}`);
    if (el) el.textContent = count;
  });

  if (inboxCountEl) {
    inboxCountEl.textContent = `${filtered.length} email${filtered.length === 1 ? "" : "s"}`;
  }

  listingListEl.innerHTML = "";

  if (filtered.length === 0) {
    emptyStateEl.style.display = "flex";
    return;
  }
  emptyStateEl.style.display = "none";

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "listing-card" +
      (item.unread ? " unread" : "") +
      (state.selectedId === item.id ? " active" : "");
    card.dataset.id = item.id;

    card.innerHTML = `
      <div class="card-logo">📧</div>
      <div class="card-body">
        <div class="card-top">
          <span class="card-company">${item.sender}</span>
          <span class="card-date">${item.date}</span>
        </div>
        <div class="card-role">${item.subject}</div>
        <div class="card-preview">${item.preview}</div>
        <div class="card-tags">
          <span class="tag tag-${item.category}">${capitalize(item.category)}</span>
        </div>
      </div>
    `;

    card.addEventListener("click", () => selectListing(item.id));
    listingListEl.appendChild(card);
  });
}

// ============================================================
//  RENDER — DETAIL PANEL
// ============================================================
function showDetailPlaceholder() {
  detailPlaceholder.style.display = "flex";
  detailContent.style.display = "none";
}

function selectListing(id) {
  const listing = LISTINGS.find(l => l.id === id);
  if (!listing) return;

  listing.unread = false;
  state.selectedId = id;
  renderDetail(listing);
  renderListings();
}

function renderDetail(listing) {
  dCompany.textContent = listing.sender;
  dRole.textContent = listing.subject;

  dCategory.textContent = capitalize(listing.category);
  dCategory.className = "detail-category-badge tag tag-" + listing.category;

  // Reuse role/preview area isn't separate in HTML; show full snippet + date inline
  if (dRole) {
    dRole.textContent = listing.subject;
  }

  // Hide fields with no backing data
  obsoleteDetailEls.forEach(el => { el.style.display = "none"; });

  // Apply button hidden for now
  if (dApplyBtn) dApplyBtn.style.display = "none";

  dSaveBtn.textContent = state.savedIds.has(listing.id) ? "Saved ✓" : "Save";
  dSaveBtn.className = "btn-save" + (state.savedIds.has(listing.id) ? " saved" : "");
  dSaveBtn.onclick = () => toggleSave(listing.id);

  detailPlaceholder.style.display = "none";
  detailContent.style.display = "block";
}

function toggleSave(id) {
  if (state.savedIds.has(id)) {
    state.savedIds.delete(id);
    dSaveBtn.textContent = "Save";
    dSaveBtn.classList.remove("saved");
    showToast("Removed from saved");
  } else {
    state.savedIds.add(id);
    dSaveBtn.textContent = "Saved ✓";
    dSaveBtn.classList.add("saved");
    showToast("Saved to your list ✓");
  }
}

// ============================================================
//  EVENT LISTENERS — SIDEBAR / SEARCH
// ============================================================
navItems.forEach(btn => {
  btn.addEventListener("click", () => {
    navItems.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.activeCategory = btn.dataset.category;
    state.selectedId = null;
    showDetailPlaceholder();
    renderListings();
  });
});

let searchDebounce = null;
searchInput?.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    state.searchQuery = searchInput.value.trim();
    renderListings();
  }, 250);
});

// Old filter toggle button kept functional as a no-op UI toggle (no filters left to apply)
filterToggleBtn?.addEventListener("click", () => {
  filterBar?.classList.toggle("open");
  filterToggleBtn.classList.toggle("active");
});

// ============================================================
//  CALENDAR (disabled — no deadline data from Gmail backend)
// ============================================================
function renderCalendarDisabled() {
  if (calMonthTitle) calMonthTitle.textContent = "";
  if (calGrid) {
    calGrid.innerHTML = `<p class="cal-events-placeholder">Deadline extraction coming soon</p>`;
  }
  if (calEventsPanel) {
    calEventsPanel.innerHTML = `<p class="cal-events-placeholder">Deadline extraction coming soon</p>`;
  }
}

calPrevBtn?.addEventListener("click", renderCalendarDisabled);
calNextBtn?.addEventListener("click", renderCalendarDisabled);

calendarNavBtn?.addEventListener("click", () => {
  const isCalendar = calendarView.style.display !== "none";
  if (isCalendar) {
    calendarView.style.display = "none";
    mainPanel.style.display = "flex";
    detailPanel.style.display = "flex";
    calendarNavBtn.classList.remove("active");
  } else {
    calendarView.style.display = "flex";
    mainPanel.style.display = "none";
    detailPanel.style.display = "none";
    calendarNavBtn.classList.add("active");
    renderCalendarDisabled();
  }
});

// ============================================================
//  INIT
// ============================================================
async function initAuthAndEmails() {
  authenticated = await checkAuth();

  if (!authenticated) {
    window.location.replace("/");
    return;
  }

  renderUserProfile(currentUser);
  await fetchEmails();
}

document.addEventListener("DOMContentLoaded", async () => {
  renderListings();

  const params = new URLSearchParams(window.location.search);
  if (params.get("auth") === "success") {
    clearAuthQueryParam();
  }

  await initAuthAndEmails();
});
