const BASE_URL = "https://kudiher-business-management-app.onrender.com";

// 1. Get the token. Ensure "token" matches the key used by your login logic.
const getToken = () => localStorage.getItem("token");

async function request(path, options = {}) {
  const token = getToken();

  // Guard: If no token exists, don't even hit the backend
  if (!token) {
    console.error("Auth Error: No token found in localStorage.");
    throw new Error("You are not logged in. Please log in and try again.");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`, // Attaching the JWT here
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  let body = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    body = await res.json();
  }

  if (!res.ok) {
    const message = body?.message || body?.error || `Error: ${res.status}`;
    throw new Error(message);
  }

  return body;
}

// =============================================================================
// Public API
// =============================================================================

export async function getTransactions() {
  const data = await request("/api/transactions");
  return Array.isArray(data) ? data : data.transactions ?? data.data ?? [];
}

/**
 * Updated to use the new split endpoints:
 * POST /api/transactions/income
 * POST /api/transactions/expense
 */
export async function addTransaction(data) {
  // Determine which endpoint to hit based on the type
  const typePath = data.type === "income" ? "income" : "expense";
  
  return request(`/api/transactions/${typePath}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function editTransaction(id, data) {
  return request(`/api/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function removeTransaction(id) {
  return request(`/api/transactions/${id}`, { method: "DELETE" });
}