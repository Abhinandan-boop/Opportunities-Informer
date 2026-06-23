// ============================================================
//  DATA — empty, will be populated from API
// ============================================================
const LISTINGS = [];

// ============================================================
//  STATE
// ============================================================
let state = {
  activeCategory: "all",
  searchQuery: "",
  filterBatch: "",
  filterBranch: "",
  filterCG: 0,
  filterGender: "",
  filterStipendMin: 0,
  selectedId: null,
  savedIds: new Set()
};

// ============================================================
//  DOM REFS
// ============================================================
const listingListEl   = document.getElementById("listing-list");
const emptyStateEl    = document.getElementById("empty-state");
const inboxCountEl    = document.getElementById("inbox-count");
const searchInput     = document.getElementById("search-input");
const filterBatchSel  = document.getElementById("filter-batch");
const filterBranchSel = document.getElementById("filter-branch");
const filterToggleBtn = document.getElementById("filter-toggle-btn");
const filterBar       = document.getElementById("filter-bar");
const filterCGInput   = document.getElementById("filter-cg");
const filterGenderSel = document.getElementById("filter-gender");
const filterStipendIn = document.getElementById("filter-stipend");
const applyFilterBtn  = document.getElementById("apply-filter-btn");
const clearFilterBtn  = document.getElementById("clear-filter-btn");
const detailPlaceholder = document.getElementById("detail-placeholder");
const detailContent   = document.getElementById("detail-content");
const toastEl         = document.getElementById("toast");

// Category nav items
const navItems = document.querySelectorAll(".nav-item");

// Detail panel fields
const dLogo     = document.getElementById("d-logo");
const dRole     = document.getElementById("d-role");
const dCompany  = document.getElementById("d-company");
const dCategory = document.getElementById("d-category");
const dStipend  = document.getElementById("d-stipend");
const dLocation = document.getElementById("d-location");
const dDuration = document.getElementById("d-duration");
const dDeadline = document.getElementById("d-deadline");
const dBranches = document.getElementById("d-branches");
const dCG       = document.getElementById("d-cg");
const dBatch    = document.getElementById("d-batch");
const dGender   = document.getElementById("d-gender");
const dSkills   = document.getElementById("d-skills");
const dInterview= document.getElementById("d-interview");
const dApplyBtn = document.getElementById("d-apply-btn");
const dSaveBtn  = document.getElementById("d-save-btn");

// ============================================================
//  FILTERING
// ============================================================
function getFilteredListings() {
  return LISTINGS.filter(item => {
    if (state.activeCategory !== "all" && item.category !== state.activeCategory) return false;
    if (state.filterBatch && !item.batch.includes(state.filterBatch)) return false;
    if (state.filterBranch && !item.branches.includes(state.filterBranch)) return false;
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const haystack = `${item.company} ${item.role} ${item.skills.join(" ")}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (state.filterCG > 0 && item.minCG > state.filterCG) return false;
    if (state.filterGender && item.gender.toLowerCase() !== state.filterGender && item.gender.toLowerCase() !== "all") return false;
    return true;
  });
}

// ============================================================
//  RENDER — LISTING CARDS
// ============================================================
function renderListings() {
  const filtered = getFilteredListings();

  // Update badges — all 0 since no data yet
  ["all", "internship", "placement", "research", "project"].forEach(cat => {
    const count = cat === "all"
      ? LISTINGS.length
      : LISTINGS.filter(l => l.category === cat).length;
    const el = document.getElementById(`badge-${cat}`);
    if (el) el.textContent = count;
  });

  inboxCountEl.textContent = `${filtered.length} opportunit${filtered.length === 1 ? "y" : "ies"}`;

  listingListEl.innerHTML = "";
  emptyStateEl.style.display = "flex";
}

// ============================================================
//  RENDER — DETAIL PANEL
// ============================================================
function selectListing(id) {
  const listing = LISTINGS.find(l => l.id === id);
  if (!listing) return;
  listing.unread = false;
  state.selectedId = id;

  dLogo.textContent     = listing.logo;
  dRole.textContent     = listing.role;
  dCompany.textContent  = listing.company;

  dCategory.textContent = capitalize(listing.category);
  dCategory.className   = "detail-category-badge tag tag-" + listing.category;

  dStipend.textContent  = listing.stipend;
  dLocation.textContent = listing.location;
  dDuration.textContent = listing.duration;
  dDeadline.textContent = "Deadline: " + listing.deadline;

  dBranches.textContent = listing.branches.join(", ");
  dCG.textContent       = listing.minCG + " and above";
  dBatch.textContent    = listing.batch.join(", ");
  dGender.textContent   = listing.gender;

  dSkills.innerHTML = listing.skills
    .map(s => `<span class="skill-pill">${s}</span>`)
    .join("");

  dInterview.innerHTML = listing.interview
    .map(step => `<li>${step}</li>`)
    .join("");

  dSaveBtn.textContent = state.savedIds.has(id) ? "Saved ✓" : "Save";
  dSaveBtn.className   = "btn-save" + (state.savedIds.has(id) ? " saved" : "");

  dApplyBtn.onclick = () => {
    showToast(`Opening application for ${listing.company}…`);
  };

  dSaveBtn.onclick = () => toggleSave(id);

  detailPlaceholder.style.display = "none";
  detailContent.style.display = "block";

  renderListings();
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
//  TOAST
// ============================================================
let toastTimer = null;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2500);
}

// ============================================================
//  HELPERS
// ============================================================
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
//  EVENT LISTENERS
// ============================================================

navItems.forEach(btn => {
  btn.addEventListener("click", () => {
    navItems.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.activeCategory = btn.dataset.category;
    state.selectedId = null;
    detailPlaceholder.style.display = "flex";
    detailContent.style.display = "none";
    renderListings();
  });
});

filterBatchSel.addEventListener("change", () => {
  state.filterBatch = filterBatchSel.value;
  renderListings();
});

filterBranchSel.addEventListener("change", () => {
  state.filterBranch = filterBranchSel.value;
  renderListings();
});

let searchDebounce = null;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    state.searchQuery = searchInput.value.trim();
    renderListings();
  }, 250);
});

filterToggleBtn.addEventListener("click", () => {
  filterBar.classList.toggle("open");
  filterToggleBtn.classList.toggle("active");
});

applyFilterBtn.addEventListener("click", () => {
  state.filterCG         = parseFloat(filterCGInput.value) || 0;
  state.filterGender     = filterGenderSel.value;
  state.filterStipendMin = parseFloat(filterStipendIn.value) || 0;
  renderListings();
  showToast("Filters applied");
});

clearFilterBtn.addEventListener("click", () => {
  filterCGInput.value    = "";
  filterGenderSel.value  = "";
  filterStipendIn.value  = "";
  state.filterCG         = 0;
  state.filterGender     = "";
  state.filterStipendMin = 0;
  renderListings();
  showToast("Filters cleared");
});

document.getElementById("connect-gmail-btn").addEventListener("click", () => {
  showToast("Gmail OAuth coming soon — stay tuned!");
});

// ============================================================
//  INIT
// ============================================================
renderListings();
