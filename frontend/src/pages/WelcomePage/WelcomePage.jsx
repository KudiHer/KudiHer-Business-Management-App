import React from "react";
import "./WelcomePage.css";
import { Zap, Shield, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function WelcomePage() {
  const navigate = useNavigate(); // ← added this

  return (
    <div className="welcome-container">
      {/* Logo */}
      <div className="logo-box">K</div>

      {/* App name & tagline */}
      <h1 className="app-name">KudiHer</h1>
      <p className="tagline">Smart finances for smart businesses</p>

      {/* Feature cards */}
      <div className="cards-row">
        <div className="card">
          <Zap className="card-icon" />
          <h3>Quick Recording</h3>
          <p>Log income and expenses in seconds</p>
        </div>
        <div className="card">
          <Shield className="card-icon" />
          <h3>Clear Insights</h3>
          <p>See profits and cash flow at a glance</p>
        </div>
        <div className="card">
          <BarChart2 className="card-icon" />
          <h3>Loan - ready</h3>
          <p>Generate reports for lenders instantly</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="buttons-row">
        <button
          className="btn-primary"
          onClick={() => navigate("/create-account")}
        >
          Get Started →
        </button>
        <button className="btn-outline" onClick={() => navigate("/signin")}>
          Sign in
        </button>
      </div>
    </div>
  );
}

export default WelcomePage;
