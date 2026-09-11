// EventHub — frontend logic.
// Two views share one API:
//   Attendee view -> POST /items  (register for an event)
//   Organizer view -> GET /items, PATCH /items/{id} (manage registrations)
//
// Organizer view adds client-side search (by event title or student name)
// and pagination on top of the status/category filters the API already
// supports server-side.

// ---------- Styles ----------
// Injected via JS instead of a linked style.css (avoids MIME-type issues on
// hosts that misserve .css). Runs immediately on load, before init().

const STYLES = `
:root {
  --theme-color: #5b3df6;
  --theme-color-dark: #4a2fd6;
  --bg: #f7f7fb;
  --card-bg: #ffffff;
  --text: #1f2230;
  --muted: #6b7080;
  --border: #e6e6ef;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
}

/* ---------- Header ---------- */

header {
  background: linear-gradient(135deg, var(--theme-color), var(--theme-color-dark));
  color: white;
  padding: 32px 20px 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

header h1 {
  margin: 0 0 4px;
  font-size: 1.9rem;
  animation: dropIn 0.5s var(--ease) both;
}
header p { margin: 0; opacity: 0.9; animation: dropIn 0.5s 0.05s var(--ease) both; }

@keyframes dropIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.badge {
  display: inline-block;
  margin-top: 12px;
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.2);
  transition: background 0.3s var(--ease), transform 0.2s var(--ease);
}
.badge.ok { background: #2ecc7144; }
.badge.error { background: #e74c3c66; animation: shake 0.4s; }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* ---------- Tabs ---------- */

.tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: -18px auto 0;
  max-width: 420px;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.tabs button {
  flex: 1;
  padding: 11px;
  border: none;
  border-radius: 10px;
  background: var(--card-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-weight: 600;
  cursor: pointer;
  color: var(--muted);
  transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease),
    background 0.25s var(--ease), color 0.25s var(--ease);
}

.tabs button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  color: var(--theme-color);
}

.tabs button:active { transform: translateY(0) scale(0.97); }

.tabs button.active {
  background: var(--theme-color);
  color: white;
}
.tabs button.active:hover { color: white; }

/* ---------- Layout ---------- */

main {
  max-width: 640px;
  margin: 24px auto;
  padding: 0 20px 60px;
}

.hidden { display: none; }

.card {
  background: var(--card-bg);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
  animation: fadeUp 0.35s var(--ease) both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ---------- Form ---------- */

label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 14px 0 6px;
}

input, textarea, select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s var(--ease), box-shadow 0.2s var(--ease),
    transform 0.15s var(--ease);
  background: white;
}

input:hover, textarea:hover, select:hover { border-color: #c9c8e0; }

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--theme-color);
  box-shadow: 0 0 0 3px rgba(91, 61, 246, 0.15);
}

textarea { resize: vertical; min-height: 70px; }

.row { display: flex; gap: 12px; }
.row > div { flex: 1; }

button[type="submit"] {
  margin-top: 20px;
  width: 100%;
  padding: 13px;
  background: var(--theme-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s var(--ease), transform 0.15s var(--ease),
    box-shadow 0.2s var(--ease);
}
button[type="submit"]:hover:not(:disabled) {
  background: var(--theme-color-dark);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(91, 61, 246, 0.3);
}
button[type="submit"]:active:not(:disabled) { transform: translateY(0) scale(0.98); }
button[type="submit"]:disabled { opacity: 0.6; cursor: default; }

.feedback {
  margin-top: 14px;
  font-size: 0.9rem;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height 0.3s var(--ease), opacity 0.3s var(--ease);
}
.feedback.success, .feedback.error {
  max-height: 60px;
  opacity: 1;
}
.feedback.success { color: #1b8a4c; }
.feedback.error { color: #c0392b; }

/* ---------- Search ---------- */

#search-input {
  margin-bottom: 12px;
}

/* ---------- Pagination ---------- */

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
}

.page-label {
  font-size: 0.85rem;
  color: var(--muted);
}

.pagination .btn-small:disabled {
  opacity: 0.4;
  cursor: default;
  transform: none;
}

/* ---------- Just-updated highlight ---------- */

.reg-card.just-updated {
  animation: highlightPulse 1.1s var(--ease);
}

@keyframes highlightPulse {
  0% { box-shadow: 0 0 0 0 rgba(91, 61, 246, 0.45); }
  40% { box-shadow: 0 0 0 8px rgba(91, 61, 246, 0); }
  100% { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
}

/* ---------- Filters ---------- */

.filters {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
}
.filters select { flex: 1; }

#refresh-btn {
  padding: 10px 16px;
  border: 1px solid var(--border);
  background: var(--card-bg);
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s var(--ease), border-color 0.2s var(--ease), color 0.2s var(--ease);
}
#refresh-btn:hover { border-color: var(--theme-color); color: var(--theme-color); transform: rotate(20deg); }
#refresh-btn:active { transform: rotate(20deg) scale(0.92); }

.muted { color: var(--muted); text-align: center; }

/* ---------- Registration cards ---------- */

.reg-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 14px;
  transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease);
  animation: fadeUp 0.3s var(--ease) both;
}
.reg-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.1);
}

.reg-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pill {
  background: #eeeaff;
  color: var(--theme-color);
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  transition: background 0.2s var(--ease);
}
.reg-card:hover .pill { background: #e0d9ff; }

.status {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  transition: transform 0.2s var(--ease);
}
.status-pending { background: #fff3cd; color: #8a6d00; }
.status-confirmed { background: #d4f5df; color: #1b8a4c; }
.status-cancelled { background: #fde2e1; color: #c0392b; }
.status-attended { background: #dbe9ff; color: #1a54c4; }
.reg-card:hover .status { transform: scale(1.05); }

.reg-card h3 { margin: 10px 0 4px; }
.reg-desc { margin: 0 0 8px; color: var(--text); }
.reg-meta { margin: 2px 0; font-size: 0.85rem; color: var(--muted); }

.reg-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.btn-small {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: transform 0.15s var(--ease), border-color 0.2s var(--ease),
    color 0.2s var(--ease), background 0.2s var(--ease);
}
.btn-small:hover {
  border-color: var(--theme-color);
  color: var(--theme-color);
  background: #f5f3ff;
  transform: translateY(-1px);
}
.btn-small:active { transform: translateY(0) scale(0.95); }

/* ---------- Respect reduced-motion preference ---------- */

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

(function injectStyles() {
  const tag = document.createElement("style");
  tag.id = "eventhub-styles";
  tag.textContent = STYLES;
  document.head.appendChild(tag);
})();

// ---------- App state & API helpers ----------

const PAGE_SIZE = 5;

const state = {
  view: "attendee", // "attendee" | "organizer"
  registrations: [], // full filtered-by-API list, before search/pagination
  statusFilter: "",
  categoryFilter: "",
  searchTerm: "",
  page: 1,
  lastUpdatedId: null, // drives the "just updated" highlight animation
};

function apiUrl(path) {
  return `${CONFIG.API_BASE_URL}${path}`;
}

async function apiRequest(path, options = {}) {
  const res = await fetch(apiUrl(path), {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

// ---------- Setup ----------

function init() {
  document.getElementById("app-name").textContent = CONFIG.APP_NAME;
  document.getElementById("tagline").textContent = CONFIG.TAGLINE;
  document.documentElement.style.setProperty("--theme-color", CONFIG.THEME_COLOR);

  populateSelect("event-category", CONFIG.CATEGORIES);
  populateSelect("filter-category", ["All", ...CONFIG.CATEGORIES]);
  populateSelect("filter-status", ["All", ...CONFIG.STATUSES]);

  document.getElementById("tab-attendee").addEventListener("click", () => switchView("attendee"));
  document.getElementById("tab-organizer").addEventListener("click", () => switchView("organizer"));
  document.getElementById("registration-form").addEventListener("submit", handleRegister);
  document.getElementById("filter-status").addEventListener("change", handleFilterChange);
  document.getElementById("filter-category").addEventListener("change", handleFilterChange);
  document.getElementById("refresh-btn").addEventListener("click", loadRegistrations);
  document.getElementById("search-input").addEventListener("input", handleSearchInput);

  switchView("attendee");
  checkHealth();
}

function populateSelect(id, values) {
  const select = document.getElementById(id);
  select.innerHTML = "";
  values.forEach((value) => {
    const opt = document.createElement("option");
    opt.value = value === "All" ? "" : value;
    opt.textContent = value;
    select.appendChild(opt);
  });
}

function switchView(view) {
  state.view = view;
  document.getElementById("attendee-view").classList.toggle("hidden", view !== "attendee");
  document.getElementById("organizer-view").classList.toggle("hidden", view !== "organizer");
  document.getElementById("tab-attendee").classList.toggle("active", view === "attendee");
  document.getElementById("tab-organizer").classList.toggle("active", view === "organizer");
  if (view === "organizer") loadRegistrations();
}

async function checkHealth() {
  const badge = document.getElementById("status-badge");
  try {
    await apiRequest("/health");
    badge.textContent = "API connected";
    badge.className = "badge ok";
  } catch (err) {
    badge.textContent = "API unreachable — check config.js";
    badge.className = "badge error";
  }
}

// ---------- Attendee: register for an event ----------

async function handleRegister(e) {
  e.preventDefault();
  const form = e.target;
  const feedback = document.getElementById("register-feedback");
  feedback.textContent = "";
  feedback.className = "feedback";

  const payload = {
    eventTitle: form.eventTitle.value.trim(),
    description: form.description.value.trim(),
    category: form.category.value,
    studentName: form.studentName.value.trim(),
    studentEmail: form.studentEmail.value.trim(),
    eventDate: form.eventDate.value,
    venue: form.venue.value.trim(),
  };

  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  submitBtn.textContent = "Registering...";

  try {
    await apiRequest("/items", { method: "POST", body: JSON.stringify(payload) });
    feedback.textContent = "You're registered! The organizer will confirm your spot soon.";
    feedback.classList.add("success");
    form.reset();
  } catch (err) {
    feedback.textContent = err.message;
    feedback.classList.add("error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Register";
  }
}

// ---------- Organizer: view + manage registrations ----------

function handleFilterChange() {
  state.statusFilter = document.getElementById("filter-status").value;
  state.categoryFilter = document.getElementById("filter-category").value;
  state.page = 1;
  loadRegistrations();
}

let searchDebounceTimer = null;
function handleSearchInput(e) {
  state.searchTerm = e.target.value.trim().toLowerCase();
  state.page = 1;
  // Debounce so we're not re-rendering on every keystroke.
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(renderRegistrations, 150);
}

async function loadRegistrations() {
  const list = document.getElementById("registration-list");
  list.innerHTML = `<p class="muted">Loading registrations...</p>`;

  const query = new URLSearchParams();
  if (state.statusFilter) query.set("status", state.statusFilter);
  if (state.categoryFilter) query.set("category", state.categoryFilter);
  const qs = query.toString() ? `?${query.toString()}` : "";

  try {
    const data = await apiRequest(`/items${qs}`);
    state.registrations = data.items || [];
    renderRegistrations();
  } catch (err) {
    list.innerHTML = `<p class="feedback error visible">${err.message}</p>`;
  }
}

function getFilteredRegistrations() {
  if (!state.searchTerm) return state.registrations;
  return state.registrations.filter((reg) => {
    const haystack = `${reg.eventTitle || ""} ${reg.studentName || ""}`.toLowerCase();
    return haystack.includes(state.searchTerm);
  });
}

function renderRegistrations() {
  const list = document.getElementById("registration-list");
  const pagination = document.getElementById("pagination");
  const filtered = getFilteredRegistrations();

  if (filtered.length === 0) {
    list.innerHTML = `<p class="muted">No registrations match.</p>`;
    pagination.innerHTML = "";
    return;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  list.innerHTML = "";
  pageItems.forEach((reg, i) => {
    const card = document.createElement("div");
    card.className = "reg-card";
    card.style.animationDelay = `${i * 40}ms`;
    if (reg.id === state.lastUpdatedId) card.classList.add("just-updated");
    card.innerHTML = `
      <div class="reg-card-header">
        <span class="pill">${reg.category || "Other"}</span>
        <span class="status status-${(reg.status || "PENDING").toLowerCase()}">${reg.status}</span>
      </div>
      <h3>${escapeHtml(reg.eventTitle)}</h3>
      <p class="reg-desc">${escapeHtml(reg.description || "")}</p>
      <p class="reg-meta">
        ${reg.eventDate ? `📅 ${escapeHtml(reg.eventDate)} &nbsp;` : ""}
        ${reg.venue ? `📍 ${escapeHtml(reg.venue)}` : ""}
      </p>
      <p class="reg-meta">👤 ${escapeHtml(reg.studentName)}${reg.studentEmail ? ` · ${escapeHtml(reg.studentEmail)}` : ""}</p>
      <div class="reg-actions"></div>
    `;
    const actions = card.querySelector(".reg-actions");
    CONFIG.STATUSES.filter((s) => s !== reg.status).forEach((s) => {
      const btn = document.createElement("button");
      btn.textContent = s;
      btn.className = "btn-small";
      btn.addEventListener("click", () => updateStatus(reg.id, s));
      actions.appendChild(btn);
    });
    list.appendChild(card);
  });

  state.lastUpdatedId = null;
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const pagination = document.getElementById("pagination");
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  pagination.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "‹ Prev";
  prevBtn.className = "btn-small";
  prevBtn.disabled = state.page === 1;
  prevBtn.addEventListener("click", () => {
    state.page -= 1;
    renderRegistrations();
  });
  pagination.appendChild(prevBtn);

  const label = document.createElement("span");
  label.className = "page-label";
  label.textContent = `Page ${state.page} of ${totalPages}`;
  pagination.appendChild(label);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next ›";
  nextBtn.className = "btn-small";
  nextBtn.disabled = state.page === totalPages;
  nextBtn.addEventListener("click", () => {
    state.page += 1;
    renderRegistrations();
  });
  pagination.appendChild(nextBtn);
}

async function updateStatus(id, status) {
  try {
    await apiRequest(`/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    state.lastUpdatedId = id; // triggers a highlight animation on re-render
    await loadRegistrations();
  } catch (err) {
    alert(`Couldn't update status: ${err.message}`);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", init);