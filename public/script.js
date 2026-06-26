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
// ============================================================
//  CALENDAR
// ============================================================
const calendarNavBtn  = document.getElementById("calendar-nav-btn");
const calendarView    = document.getElementById("calendar-view");
const mainPanel       = document.querySelector(".main");
const detailPanel     = document.getElementById("detail-panel");
const calPrevBtn      = document.getElementById("cal-prev");
const calNextBtn      = document.getElementById("cal-next");
const calMonthTitle   = document.getElementById("cal-month-title");
const calGrid         = document.getElementById("cal-grid");
const calEventsPanel  = document.getElementById("cal-events-panel");

let calState = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  selectedDate: null
};

// Sample deadlines — will come from API later
const DEADLINES = [
  { id: 1, company: "Google", role: "SWE Intern", category: "internship", deadline: new Date(2025, 6, 30) },
  { id: 2, company: "Microsoft", role: "Research Intern", category: "research", deadline: new Date(2025, 7, 15) },
  { id: 3, company: "Qualcomm", role: "Embedded Intern", category: "internship", deadline: new Date(2025, 6, 20) },
  { id: 4, company: "Infosys", role: "Systems Engineer", category: "placement", deadline: new Date(2025, 6, 25) },
];

function getDeadlinesForDate(date) {
  return DEADLINES.filter(d =>
    d.deadline.getFullYear() === date.getFullYear() &&
    d.deadline.getMonth() === date.getMonth() &&
    d.deadline.getDate() === date.getDate()
  );
}

function getDaysLeft(deadline) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const diff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  return diff;
}

function renderCalendar() {
  const { year, month } = calState;
  const monthNames = ["January","February","March","April","May","June",
                      "July","August","September","October","November","December"];
  calMonthTitle.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const today = new Date();

  calGrid.innerHTML = "";

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = document.createElement("div");
    day.className = "cal-day other-month";
    day.innerHTML = `<span class="cal-day-num">${daysInPrev - i}</span>`;
    calGrid.appendChild(day);
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const deadlines = getDeadlinesForDate(date);
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    const isSelected = calState.selectedDate &&
      calState.selectedDate.getFullYear() === year &&
      calState.selectedDate.getMonth() === month &&
      calState.selectedDate.getDate() === d;

    const day = document.createElement("div");
    day.className = "cal-day" +
      (isToday ? " today" : "") +
      (deadlines.length > 0 ? " has-events" : "") +
      (isSelected ? " selected" : "");

    const dots = deadlines.map(dl =>
      `<span class="cal-dot cal-dot-${dl.category}"></span>`
    ).join("");

    day.innerHTML = `
      <span class="cal-day-num">${d}</span>
      <div class="cal-dots">${dots}</div>
    `;

    day.addEventListener("click", () => {
      calState.selectedDate = date;
      renderCalendar();
      renderCalendarEvents(date);
    });

    calGrid.appendChild(day);
  }

  // Next month filler days
  const totalCells = calGrid.children.length;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    const day = document.createElement("div");
    day.className = "cal-day other-month";
    day.innerHTML = `<span class="cal-day-num">${i}</span>`;
    calGrid.appendChild(day);
  }
}

function renderCalendarEvents(date) {
  const deadlines = getDeadlinesForDate(date);
  const dateStr = date.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" });

  if (deadlines.length === 0) {
    calEventsPanel.innerHTML = `
      <p class="cal-events-date-title">${dateStr}</p>
      <p class="cal-events-placeholder">No deadlines on this date</p>
    `;
    return;
  }

  const items = deadlines.map(dl => {
    const daysLeft = getDaysLeft(dl.deadline);
    const urgencyClass = daysLeft <= 2 ? "urgent" : daysLeft <= 7 ? "soon" : "";
    const label = daysLeft === 0 ? "Today!" : daysLeft < 0 ? "Expired" : `${daysLeft}d left`;
    return `
      <div class="cal-event-item">
        <span class="cal-dot cal-event-dot cal-dot-${dl.category}"></span>
        <div class="cal-event-info">
          <div class="cal-event-role">${dl.role}</div>
          <div class="cal-event-company">${dl.company}</div>
        </div>
        <span class="cal-event-days-left ${urgencyClass}">${label}</span>
      </div>
    `;
  }).join("");

  calEventsPanel.innerHTML = `
    <p class="cal-events-date-title">${dateStr}</p>
    ${items}
  `;
}

// Nav buttons
calPrevBtn.addEventListener("click", () => {
  calState.month--;
  if (calState.month < 0) { calState.month = 11; calState.year--; }
  renderCalendar();
});

calNextBtn.addEventListener("click", () => {
  calState.month++;
  if (calState.month > 11) { calState.month = 0; calState.year++; }
  renderCalendar();
});

// Toggle calendar view
calendarNavBtn.addEventListener("click", () => {
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
    renderCalendar();
  }
});