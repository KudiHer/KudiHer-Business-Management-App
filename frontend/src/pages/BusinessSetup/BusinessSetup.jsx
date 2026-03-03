

import React, { useState }           from "react";
import "./BusinessSetup.css";
import { useNavigate }                from "react-router-dom";
import { useAuth }                    from "../../context/AuthContext";
import { userStorage }                from "../../services/api";

const REVENUE_OPTIONS = [
  "",
  "Below ₦100,000",
  "₦100,000 - ₦500,000",
  "₦500,000 - ₦1,000,000",
  "Above ₦1,000,000",
];

const EMPLOYEE_OPTIONS = ["", "Just me", "2 - 5", "6 - 20", "20+"];

function BusinessSetup() {
  // ── Form fields ────────────────────────────────────────────────────────────
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [employees,      setEmployees]      = useState("");
  const [address,        setAddress]        = useState("");
  const [currency,       setCurrency]       = useState("NG Nigeria");

  // ── Async state ────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const navigate     = useNavigate();
  const { user, login } = useAuth();

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleComplete = async () => {
    if (!address.trim()) {
      setError("Please enter your business address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Build the enriched user object by merging setup data into whatever
      // was returned from register/login. This way Dashboard's user?.fullName,
      // SideBar's user?.businessName, and user?.businessType all resolve
      // correctly without an extra network call.
      const enrichedUser = {
        ...user,                         // fullName, email, id, etc. from register
        businessSetup: {
          monthlyRevenue,
          employees,
          address: address.trim(),
          currency,
        },
      };

      // Persist to localStorage so the values survive a page refresh.
      // api.js's userStorage writes to "kudiher_user".
      userStorage.set(enrichedUser);

      // Update the in-memory AuthContext so components re-render immediately.
      login(enrichedUser);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Setup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bs-container">
      <div className="bs-card-wrapper">

        {/* Back */}
        <button className="bs-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* Header */}
        <h1 className="bs-title">Set up your business</h1>
        <p className="bs-subtitle">
          Help us customize KudiHer for your business
        </p>

        {/* Inline error banner */}
        {error && (
          <div className="bs-error" role="alert">
            {error}
          </div>
        )}

        {/* Revenue & Employees */}
        <div className="bs-card">
          <div className="bs-field">
            <label htmlFor="bs-revenue">Monthly Revenue Range</label>
            <select
              id="bs-revenue"
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(e.target.value)}
              disabled={loading}
            >
              {REVENUE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o === "" ? "Select range" : o}
                </option>
              ))}
            </select>
          </div>
          <div className="bs-field">
            <label htmlFor="bs-employees">Number of Employees</label>
            <select
              id="bs-employees"
              value={employees}
              onChange={(e) => setEmployees(e.target.value)}
              disabled={loading}
            >
              {EMPLOYEE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o === "" ? "Select" : o}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Address & Currency */}
        <div className="bs-card">
          <div className="bs-field">
            <label htmlFor="bs-address">Business Address</label>
            <input
              id="bs-address"
              type="text"
              placeholder="Street, City, State"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="bs-field">
            <label htmlFor="bs-currency">Currency</label>
            <input
              id="bs-currency"
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          className="bs-btn-primary"
          onClick={handleComplete}
          disabled={loading}
        >
          {loading ? "Saving…" : "Start using KudiHer"}
        </button>

      </div>
    </div>
  );
}

export default BusinessSetup;
