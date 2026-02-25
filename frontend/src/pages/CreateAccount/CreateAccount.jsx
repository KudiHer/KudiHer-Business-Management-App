import React, { useState } from "react";
import "./CreateAccount.css";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

function CreateAccount() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="ca-container">
      {/* Back */}
      <button className="ca-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Header */}
      <h1 className="ca-title">Create your account</h1>
      <p className="ca-subtitle">Start tracking your business finances today</p>

      {/* Full name & Email */}
      <div className="ca-card">
        <div className="ca-field">
          <label>Full name</label>
          <input type="text" placeholder="Full name" />
        </div>
        <div className="ca-field">
          <label>Email</label>
          <input type="email" placeholder="Email" />
        </div>
      </div>

      {/* Phone number */}
      <div className="ca-card">
        <div className="ca-field">
          <label>Phone number</label>
          <select>
            <option>NG +234</option>
            <option>US +1</option>
            <option>GH +233</option>
            <option>KE +254</option>
          </select>
        </div>
      </div>

      {/* Business info */}
      <div className="ca-card">
        <div className="ca-field">
          <label>Business name</label>
          <input type="text" placeholder="Business name" />
        </div>
        <div className="ca-field">
          <label>Business Type</label>
          <select>
            <option>Retail</option>
            <option>Food & Beverage</option>
            <option>Services</option>
            <option>Fashion</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      {/* Business address */}
      <div className="ca-card">
        <div className="ca-field">
          <label>Business address</label>
          <input type="text" placeholder="Street, City, State" />
        </div>
      </div>

      {/* Password */}
      <div className="ca-card">
        <div className="ca-field">
          <label>Password</label>
          <div className="ca-input-icon">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>
        <div className="ca-field">
          <label>Confirm password</label>
          <div className="ca-input-icon">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm your password"
            />
            <span onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          <p className="ca-hint">
            Use a strong password with a symbol, number, and uppercase character
          </p>
        </div>
      </div>

      {/* Submit */}
      <button
        className="ca-btn-primary"
        onClick={() => navigate("/business-setup")}
      >
        Create Account
      </button>
      {/* Sign in link */}
      <p className="ca-signin">
        Already have an account?{" "}
        <a onClick={() => navigate("/signin")} href="#">
          Sign in
        </a>
      </p>
    </div>
  );
}

export default CreateAccount;
