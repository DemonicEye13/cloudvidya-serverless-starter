// EventHub — frontend logic.
// Two views share one API:
//   Attendee view -> POST /items  (register for an event)
//   Organizer view -> GET /items, PATCH /items/{id} (manage registrations)

const state = {
  view: "attendee", // "attendee" | "organizer"
  registrations: [],
  statusFilter: "",
  categoryFilter: "",
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
  loadRegistrations();
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
    list.innerHTML = `<p class="feedback error">${err.message}</p>`;
  }
}

function renderRegistrations() {
  const list = document.getElementById("registration-list");
  if (state.registrations.length === 0) {
    list.innerHTML = `<p class="muted">No registrations yet.</p>`;
    return;
  }

  list.innerHTML = "";
  state.registrations.forEach((reg) => {
    const card = document.createElement("div");
    card.className = "reg-card";
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
}

async function updateStatus(id, status) {
  try {
    await apiRequest(`/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
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
