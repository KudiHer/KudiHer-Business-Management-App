// =============================================================================
// src/services/TransactionService.js
//
// Self-contained transaction API service.
// Reads the JWT from localStorage — the same key your auth team already uses.
// Does NOT import from any auth file; zero coupling to existing auth logic.
//
// Endpoints used:
//   GET    /api/transactions
//   POST   /api/transactions
//   PUT    /api/transactions/:id
//   DELETE /api/transactions/:id
//
// Expected transaction shape from backend:
//   {
//     _id:      "abc123",
//     title:    "Customer purchase - Rice(50kg)",
//     date:     "2026-02-14",
//     category: "Sales",
//     method:   "Cash",
//     amount:   45000,
//     type:     "income"    // "income" | "expense" | "loan"
//   }
// =============================================================================

const BASE_URL   = "https://kudiher-business-management-app.onrender.com";

// ── Read token from localStorage ─────────────────────────────────────────────
// Change "token" to whatever key your auth team uses if it differs.
const getToken = () => localStorage.getItem("token");

// ── Shared fetch wrapper ──────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Parse body only when content is JSON (DELETE returns 204 with no body)
  let body = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    body = await res.json();
  }

  if (!res.ok) {
    const message =
      body?.message || body?.error || `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return body;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Fetch all transactions for the authenticated user.
 * GET /api/transactions
 * @returns {Promise<Transaction[]>}
 */
export async function getTransactions() {
  const data = await request("/api/transactions");
  // Normalise: backend may return array directly or wrapped in a key
  return Array.isArray(data) ? data : data.transactions ?? data.data ?? [];
}

/**
 * Create a new transaction.
 * POST /api/transactions
 * @param {{ title: string, amount: number, type: string, category?: string, method?: string, date?: string }} data
 * @returns {Promise<Transaction>}
 */
export async function addTransaction(data) {
  return request("/api/transactions", {
    method: "POST",
    body:   JSON.stringify(data),
  });
}

/**
 * Update an existing transaction.
 * PUT /api/transactions/:id
 * @param {string} id
 * @param {Partial<Transaction>} data
 * @returns {Promise<Transaction>}
 */
export async function editTransaction(id, data) {
  return request(`/api/transactions/${id}`, {
    method: "PUT",
    body:   JSON.stringify(data),
  });
}

/**
 * Delete a transaction by ID.
 * DELETE /api/transactions/:id
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function removeTransaction(id) {
  return request(`/api/transactions/${id}`, { method: "DELETE" });
}
