// ============================================================
//  DATA — mock listings (replace with real API calls later)
// ============================================================
const LISTINGS = [
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
    branches: ["CSE", "ECE", "CEE"],
    minCG: 8.0,
    gender: "All",
    skills: ["Python", "DSA", "System Design", "Go"],
    interview: ["Online Assessment (DSA)", "Technical Interview × 2", "HR Round"],
    applyLink: "#",
    unread: true,
    date: "Today"
  },
  {
    id: 2,
    company: "Microsoft",
    role: "Research Intern — AI/ML",
    category: "research",
    logo: "🪟",
    stipend: "₹70,000/mo",
    location: "Hyderabad",
    duration: "6 months",
    deadline: "15 Aug 2025",
    batch: ["2025", "2026"],
    branches: ["CSE", "ECE"],
    minCG: 7.5,
    gender: "All",
    skills: ["Python", "PyTorch", "NLP", "Linear Algebra"],
    interview: ["CV Shortlist", "Technical Interview", "Research Talk (15 min)", "HR Round"],
    applyLink: "#",
    unread: true,
    date: "Yesterday"
  },
  {
    id: 3,
    company: "Tata Steel",
    role: "Graduate Engineer Trainee",
    category: "placement",
    logo: "🏗️",
    stipend: "₹8 LPA",
    location: "Jamshedpur",
    duration: "Full-time",
    deadline: "5 Aug 2025",
    batch: ["2025"],
    branches: ["ME", "Civil", "Chemical"],
    minCG: 6.5,
    gender: "All",
    skills: ["AutoCAD", "MATLAB", "Project Management"],
    interview: ["Written Test", "Group Discussion", "Technical Interview", "HR Interview"],
    applyLink: "#",
    unread: false,
    date: "2 days ago"
  },
  {
    id: 4,
    company: "Qualcomm",
    role: "Embedded Systems Intern",
    category: "internship",
    logo: "📡",
    stipend: "₹60,000/mo",
    location: "Noida",
    duration: "4 months",
    deadline: "20 Jul 2025",
    batch: ["2026", "2027"],
    branches: ["ECE", "CEE"],
    minCG: 7.0,
    gender: "All",
    skills: ["C", "C++", "ARM", "RTOS", "Embedded Linux"],
    interview: ["Online Test (C/C++)", "Technical Round × 2", "Manager Round"],
    applyLink: "#",
    unread: true,
    date: "3 days ago"
  },
  {
    id: 5,
    company: "IIT Delhi Lab",
    role: "Research Collaboration — IoT",
    category: "research",
    logo: "🔬",
    stipend: "Unpaid + Certificate",
    location: "Remote",
    duration: "2 months",
    deadline: "1 Aug 2025",
    batch: ["2026", "2027", "2028"],
    branches: ["ECE", "CEE", "CSE"],
    minCG: 7.0,
    gender: "All",
    skills: ["Arduino", "Raspberry Pi", "Python", "Sensor Interfacing"],
    interview: ["SOP Submission", "Faculty Interview"],
    applyLink: "#",
    unread: false,
    date: "4 days ago"
  },
  {
    id: 6,
    company: "Startuphouse",
    role: "Full Stack Developer Intern",
    category: "project",
    logo: "🚀",
    stipend: "₹15,000/mo",
    location: "Remote",
    duration: "3 months",
    deadline: "10 Aug 2025",
    batch: ["2026", "2027", "2028"],
    branches: ["CSE", "ECE", "CEE"],
    minCG: 6.0,
    gender: "All",
    skills: ["React", "Node.js", "MongoDB", "REST APIs"],
    interview: ["Assignment", "Technical Call"],
    applyLink: "#",
    unread: false,
    date: "5 days ago"
  },
  {
    id: 7,
    company: "Infosys",
    role: "Systems Engineer — Java",
    category: "placement",
    logo: "🏢",
    stipend: "₹3.6 LPA",
    location: "Multiple",
    duration: "Full-time",
    deadline: "25 Jul 2025",
    batch: ["2025"],
    branches: ["CSE", "ECE", "CEE", "ME"],
    minCG: 6.0,
    gender: "All",
    skills: ["Java", "SQL", "OOPs", "Aptitude"],
    interview: ["Aptitude Test", "Coding Round", "HR Interview"],
    applyLink: "#",
    unread: true,
    date: "6 days ago"
  }
];

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
    // Category
    if (state.activeCategory !== "all" && item.category !== state.activeCategory) return false;

    // Batch
    if (state.filterBatch && !item.batch.includes(state.filterBatch)) return false;

    // Branch
    if (state.filterBranch && !item.branches.includes(state.filterBranch)) return false;

    // Search query — match company, role, skills
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const haystack = `${item.company} ${item.role} ${item.skills.join(" ")}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    // Min CG
    if (state.filterCG > 0 && item.minCG > state.filterCG) return false;

    // Gender
    if (state.filterGender && item.gender.toLowerCase() !== state.filterGender && item.gender.toLowerCase() !== "all") return false;

    return true;
  });
}

// ============================================================
//  RENDER — LISTING CARDS
// ============================================================
function renderListings() {
  const filtered = getFilteredListings();

  // Update badges
  ["all", "internship", "placement", "research", "project"].forEach(cat => {
    const count = cat === "all"
      ? LISTINGS.length
      : LISTINGS.filter(l => l.category === cat).length;
    const el = document.getElementById(`badge-${cat}`);
    if (el) el.textContent = count;
  });

  // Update count
  inboxCountEl.textContent = `${filtered.length} opportunit${filtered.length === 1 ? "y" : "ies"}`;

  listingListEl.innerHTML = "";

  if (filtered.length === 0) {
    emptyStateEl.style.display = "flex";
    return;
  }

  emptyStateEl.style.display = "none";

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "listing-card" + (item.unread ? " unread" : "") + (state.selectedId === item.id ? " active" : "");
    card.dataset.id = item.id;

    card.innerHTML = `
      <div class="card-logo">${item.logo}</div>
      <div class="card-body">
        <div class="card-top">
          <span class="card-company">${item.company}</span>
          <span class="card-date">${item.date}</span>
        </div>
        <div class="card-role">${item.role}</div>
        <div class="card-tags">
          <span class="tag tag-${item.category}">${capitalize(item.category)}</span>
          <span class="tag tag-cg">CG ${item.minCG}+</span>
          <span class="tag tag-stipend">${item.stipend}</span>
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
function selectListing(id) {
  // Mark as read
  const listing = LISTINGS.find(l => l.id === id);
  if (!listing) return;
  listing.unread = false;

  state.selectedId = id;

  // Populate detail panel
  dLogo.textContent = listing.logo;
  dRole.textContent = listing.role;
  dCompany.textContent = listing.company;

  dCategory.textContent = capitalize(listing.category);
  dCategory.className = "detail-category-badge tag tag-" + listing.category;

  dStipend.textContent  = listing.stipend;
  dLocation.textContent = listing.location;
  dDuration.textContent = listing.duration;
  dDeadline.textContent = "Deadline: " + listing.deadline;

  dBranches.textContent = listing.branches.join(", ");
  dCG.textContent       = listing.minCG + " and above";
  dBatch.textContent    = listing.batch.join(", ");
  dGender.textContent   = listing.gender;

  // Skills
  dSkills.innerHTML = listing.skills
    .map(s => `<span class="skill-pill">${s}</span>`)
    .join("");

  // Interview steps
  dInterview.innerHTML = listing.interview
    .map(step => `<li>${step}</li>`)
    .join("");

  // Save button state
  dSaveBtn.textContent = state.savedIds.has(id) ? "Saved ✓" : "Save";
  dSaveBtn.className   = "btn-save" + (state.savedIds.has(id) ? " saved" : "");

  // Apply button
  dApplyBtn.onclick = () => {
    showToast(`Opening application for ${listing.company}…`);
    // window.open(listing.applyLink, "_blank");
  };

  dSaveBtn.onclick = () => toggleSave(id);

  // Show detail content
  detailPlaceholder.style.display = "none";
  detailContent.style.display = "block";

  // Re-render cards to update active + unread state
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

// Category nav
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

// Batch filter
filterBatchSel.addEventListener("change", () => {
  state.filterBatch = filterBatchSel.value;
  renderListings();
});

// Branch filter
filterBranchSel.addEventListener("change", () => {
  state.filterBranch = filterBranchSel.value;
  renderListings();
});

// Search
let searchDebounce = null;
searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    state.searchQuery = searchInput.value.trim();
    renderListings();
  }, 250);
});

// Filter bar toggle
filterToggleBtn.addEventListener("click", () => {
  filterBar.classList.toggle("open");
  filterToggleBtn.classList.toggle("active");
});

// Apply advanced filters
applyFilterBtn.addEventListener("click", () => {
  state.filterCG        = parseFloat(filterCGInput.value) || 0;
  state.filterGender    = filterGenderSel.value;
  state.filterStipendMin= parseFloat(filterStipendIn.value) || 0;
  renderListings();
  showToast("Filters applied");
});

// Clear filters
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

// Connect Gmail button
document.getElementById("connect-gmail-btn").addEventListener("click", () => {
  showToast("Gmail OAuth coming soon — stay tuned!");
});

// ============================================================
//  INIT
// ============================================================
renderListings();