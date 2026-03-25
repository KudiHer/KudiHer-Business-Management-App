const BASE_URL = "https://kudiher-business-management-app.onrender.com";

const getToken = () => localStorage.getItem("kudiher_token");

async function request(path, options = {}) {
  const token = getToken();

  if (!token) {
    console.error("Auth Error: No token found in localStorage.");
    throw new Error("You are not logged in. Please log in and try again.");
  }

  const isFormData = options.body instanceof FormData;

  // 1. Start with the Authorization header
  const headers = {
    "Authorization": `Bearer ${token}`,
    ...options.headers,
  };

  // 2. Logic to handle Content-Type correctly:
  // If it's FormData, we MUST NOT set Content-Type (browser handles it).
  // If it's a plain object, we set it to application/json.
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  } else {
    // Explicitly delete it just in case it was passed in options.headers
    delete headers["Content-Type"];
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let responseBody = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    responseBody = await res.json();
  }

  if (!res.ok) {
    // Return the specific error from the backend if available
    const message = responseBody?.message || responseBody?.error || `Error: ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = responseBody; // Useful for debugging validation errors
    throw error;
  }

  return responseBody;
}

// =============================================================================
// Public API
// =============================================================================

export async function getTransactions() {
  const data = await request("/api/transactions");
  // Normalize the data return because backend wraps it in 'data' or 'transactions'
  return Array.isArray(data) ? data : data.transactions ?? data.data ?? [];
}

/**
 * POST /api/transactions/income  — income entries
 * POST /api/transactions/expense — expense entries
 *
 * @param {Object|FormData} payload
 */
export async function addTransaction(payload) {
  const isFormData = payload instanceof FormData;

  // Read the type from whichever shape we received
  const type     = isFormData ? payload.get("type") : payload.type;
  const typePath = type === "income" ? "income" : "expense";

  // Note: We don't JSON.stringify if it's already FormData
  return request(`/api/transactions/${typePath}`, {
    method: "POST",
    body:   isFormData ? payload : JSON.stringify(payload),
  });
}

export async function editTransaction(id, data) {
  return request(`/api/transactions/${id}`, {
    method: "PUT",
    body:   JSON.stringify(data),
  });
}

export async function removeTransaction(id) {
  return request(`/api/transactions/${id}`, { method: "DELETE" });
}