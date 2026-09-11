// EventHub — frontend logic.
// Two views share one API:
//   Attendee view -> POST /items  (register for an event)
//   Organizer view -> GET /items, PATCH /items/{id} (manage registrations)
//
// Organizer view adds client-side search (by event title or student name)
// and pagination on top of the status/category filters the API already
// supports server-side.

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