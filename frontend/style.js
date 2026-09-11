// EventHub styling, injected via JavaScript instead of a linked style.css
// file (avoids MIME-type issues on hosts that misserve .css). This version
// adds hover states, transitions, and small motion touches so the UI feels
// alive — no HTML/JS structure changes required, same class names as before.

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