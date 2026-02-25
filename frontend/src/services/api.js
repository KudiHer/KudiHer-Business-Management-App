// ─────────────────────────────────────────────────────────────────────────────
// api.js  —  KudiHer API service
// Base URL: https://kudiher-business-management-app.onrender.com
//
// Auth endpoints  :  POST /api/auth/register  |  POST /api/auth/login
// Transaction CRUD:  POST /api/transactions
//                    GET  /api/transactions
//                    GET  /api/transactions/:id
//                    PUT  /api/transactions/:id
//                    DELETE /api/transactions/:id
//
// The JWT token returned by login/register is stored in localStorage and
// attached automatically to every subsequent request via the Authorization
// header.
// ─────────────────────────────────────────────────────────────────────────────

export const BASE_URL = "https://kudiher-business-management-app.onrender.com";

// ── Token helpers ─────────────────────────────────────────────────────────────
const TOKEN_KEY = "kudiher_token";
const USER_KEY  = "kudiher_user";

export const tokenStorage = {
  get:    ()      => localStorage.getItem(TOKEN_KEY),
  set:    (token) => localStorage.setItem(TOKEN_KEY, token),
  remove: ()      => localStorage.removeItem(TOKEN_KEY),
};

export const userStorage = {
  get: () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
  },
  set:    (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  remove: ()     => localStorage.removeItem(USER_KEY),
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function apiFetch(path, options = {}, requiresAuth = true) {
  const headers = { "Content-Type": "application/json", ...options.headers };

  if (requiresAuth) {
    const token = tokenStorage.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  let body = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) body = await res.json();

  if (!res.ok) {
    const msg = body?.message || body?.error || `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return body;
}

// ═════════════════════════════════════════════════════════════════════════════
// AUTH
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Register a new user.
 * POST /api/auth/register
 * Body: { name, email, password }
 * Returns: { token, user: { id, name, email, ... } }
 */
export async function register({ name, email, password }) {
  const data = await apiFetch(
    "/api/auth/register",
    { method: "POST", body: JSON.stringify({ name, email, password }) },
    false
  );
  if (data.token) tokenStorage.set(data.token);
  if (data.user)  userStorage.set(data.user);
  return data;
}

/**
 * Log in an existing user.
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { token, user: { id, name, email, ... } }
 */
export async function login({ email, password }) {
  const data = await apiFetch(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
    false
  );
  if (data.token) tokenStorage.set(data.token);
  if (data.user)  userStorage.set(data.user);
  return data;
}

/** Clear all local auth state — call on logout. */
export function logout() {
  tokenStorage.remove();
  userStorage.remove();
}

// ═════════════════════════════════════════════════════════════════════════════
// TRANSACTIONS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/transactions
 * Returns the authenticated user's full transaction list.
 */
export async function fetchTransactions() {
  const data = await apiFetch("/api/transactions");
  return Array.isArray(data) ? data : data.transactions ?? data.data ?? [];
}

/**
 * GET /api/transactions/:id
 */
export async function fetchTransactionById(id) {
  return apiFetch(`/api/transactions/${id}`);
}

/**
 * POST /api/transactions
 * Body: { description, category, amount, type, date? }
 *   type = "income" | "expense" | "loan"
 */
export async function createTransaction(payload) {
  return apiFetch("/api/transactions", {
    method: "POST",
    body:   JSON.stringify(payload),
  });
}

/**
 * PUT /api/transactions/:id
 */
export async function updateTransaction(id, payload) {
  return apiFetch(`/api/transactions/${id}`, {
    method: "PUT",
    body:   JSON.stringify(payload),
  });
}

/**
 * DELETE /api/transactions/:id
 */
export async function deleteTransaction(id) {
  return apiFetch(`/api/transactions/${id}`, { method: "DELETE" });
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPUTED HELPERS  (derived from real transaction data)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Derive summary card figures from a real transactions array.
 * @param {string} period  "today" | "week" | "month"
 * @param {Array}  txns    Full list from fetchTransactions()
 */
export function computeSummary(period, txns = []) {
  const now   = new Date();
  const start = new Date();

  if (period === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }

  const current = txns.filter((t) => new Date(t.date ?? t.createdAt) >= start);

  const totalIncome   = current.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = current.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const netProfit     = totalIncome - totalExpenses;
  const margin        = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  // Previous period window for trend comparison
  const prevStart = new Date(start);
  if (period === "today")      prevStart.setDate(prevStart.getDate() - 1);
  else if (period === "week")  prevStart.setDate(prevStart.getDate() - 7);
  else                         prevStart.setMonth(prevStart.getMonth() - 1);

  const prev      = txns.filter((t) => { const d = new Date(t.date ?? t.createdAt); return d >= prevStart && d < start; });
  const prevInc   = prev.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const prevExp   = prev.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  const pLabel  = { today: "yesterday", week: "last week", month: "last month" }[period];
  const diff    = (cur, old) => old > 0 ? Math.round(((cur - old) / old) * 100) : null;

  const incDiff  = diff(totalIncome, prevInc);
  const expDiff  = diff(totalExpenses, prevExp);

  return {
    totalIncome: {
      amount:    totalIncome,
      trend:     incDiff !== null ? `${incDiff >= 0 ? "+" : ""}${incDiff}% vs ${pLabel}` : "No prior data",
      trendType: incDiff === null || incDiff >= 0 ? "up" : "down",
    },
    totalExpenses: {
      amount:    totalExpenses,
      trend:     expDiff !== null ? `${expDiff >= 0 ? "+" : ""}${expDiff}% vs ${pLabel}` : "No prior data",
      trendType: expDiff === null || expDiff <= 0 ? "down" : "up",
    },
    netProfit: {
      amount:    netProfit,
      trend:     `${margin}% margin`,
      trendType: netProfit >= 0 ? "up" : "down",
    },
  };
}

/**
 * Derive cash-flow chart series from real transactions.
 * @param {string} period  "today" | "week" | "month"
 * @param {Array}  txns    Full list from fetchTransactions()
 */
export function computeCashFlow(period, txns = []) {
  const now = new Date();

  if (period === "today") {
    return [6, 9, 12, 15, 18, 21].map((h) => {
      const label = h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`;
      const slice = txns.filter((t) => {
        const d = new Date(t.date ?? t.createdAt);
        return d.toDateString() === now.toDateString() && d.getHours() <= h;
      });
      return {
        day:      label,
        income:   slice.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
        expenses: slice.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
      };
    });
  }

  if (period === "week") {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const slice    = txns.filter((t) => new Date(t.date ?? t.createdAt).toDateString() === d.toDateString());
      return {
        day:      dayLabel,
        income:   slice.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
        expenses: slice.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
      };
    });
  }

  // month — 4 ISO weeks
  return Array.from({ length: 4 }, (_, i) => {
    const wStart = new Date(now.getFullYear(), now.getMonth(), 1 + i * 7);
    const wEnd   = new Date(now.getFullYear(), now.getMonth(), 1 + (i + 1) * 7);
    const slice  = txns.filter((t) => { const d = new Date(t.date ?? t.createdAt); return d >= wStart && d < wEnd; });
    return {
      day:      `Wk ${i + 1}`,
      income:   slice.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
      expenses: slice.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
    };
  });
}

// ── ActionButton wrappers (keeps component API unchanged) ─────────────────────
export const postAddIncome  = (p) => createTransaction({ ...p, type: "income"  });
export const postAddExpense = (p) => createTransaction({ ...p, type: "expense" });
export const postRecordLoan = (p) => createTransaction({ ...p, type: "loan"    });


export async function fetchLowStockItems() {
  // Option A: Return empty (the alert will simply stay hidden)
  // return []; 

  // Option B: Return dummy data so you can still see the UI works
  return [
    { id: 1, name: "Golden Penny Semovita (2kg)", quantity: 3, threshold: 10 },
    { id: 2, name: "Peak Milk (Tin)", quantity: 5, threshold: 15 }
  ];
}