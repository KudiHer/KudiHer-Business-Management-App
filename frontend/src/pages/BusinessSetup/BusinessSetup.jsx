import React from "react";
import "./BusinessSetup.css";
import { useNavigate } from "react-router-dom";

function BusinessSetup() {
  const navigate = useNavigate();

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

        {/* Revenue & Employees */}
        <div className="bs-card">
          <div className="bs-field">
            <label>Monthly Revenue Range</label>
            <select>
              <option value="">Select range</option>
              <option>Below ₦100,000</option>
              <option>₦100,000 - ₦500,000</option>
              <option>₦500,000 - ₦1,000,000</option>
              <option>Above ₦1,000,000</option>
            </select>
          </div>
          <div className="bs-field">
            <label>Number of Employees</label>
            <select>
              <option value="">Select</option>
              <option>Just me</option>
              <option>2 - 5</option>
              <option>6 - 20</option>
              <option>20+</option>
            </select>
          </div>
        </div>

        {/* Address & Currency */}
        <div className="bs-card">
          <div className="bs-field">
            <label>Business Address</label>
            <input type="text" placeholder="Street, City, State" />
          </div>
          <div className="bs-field">
            <label>Currency</label>
            <input type="text" defaultValue="NG Nigeria" />
          </div>
        </div>

        {/* Submit */}
        <button
          className="bs-btn-primary"
          onClick={() => navigate("/dashboard")}
        >
          Start using KudiHer
        </button>
      </div>
    </div>
  );
}

export default BusinessSetup;
