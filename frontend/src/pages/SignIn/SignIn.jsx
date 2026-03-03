

import React, { useState }          from "react";
import "./SignIn.css";
import { Eye, EyeOff }              from "lucide-react";
import { useNavigate }               from "react-router-dom";
import { useAuth }                   from "../../context/AuthContext";
import { loginRequest }              from "../../services/api";

function SignIn() {
  // ── UI toggle ──────────────────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  // ── Async state ────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const navigate      = useNavigate();
  const { setUser }   = useAuth();   // pure state setter — does NOT call the API

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1 — hit the API. loginRequest writes the JWT to localStorage
      // under "kudiher_token" and the user under "kudiher_user", then returns
      // { token, user }.
      const data = await loginRequest({ email: email.trim(), password });

      // Step 2 — update React state so every component that reads useAuth()
      // sees the logged-in user immediately. No API call happens here.
      setUser(data.user ?? data);

      navigate("/dashboard");
    } catch (err) {
      // api.js extracts body.message | body.error from the response, so
      // err.message is always the backend's own wording (e.g. "Invalid credentials").
      setError(err.message || "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSignIn();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="si-container">

      {/* Back */}
      <button className="si-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Header */}
      <h1 className="si-title">Welcome Back</h1>
      <p className="si-subtitle">Sign in to your KudiHer account</p>

      {/* Form */}
      <div className="si-form">

        {/* Error banner */}
        {error && (
          <div className="si-error" role="alert">
            {error}
          </div>
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          className="si-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="email"
          disabled={loading}
        />

        {/* Password */}
        <div className="si-input-icon">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="si-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="current-password"
            disabled={loading}
          />
          <span
            onClick={() => setShowPassword((p) => !p)}
            style={{ cursor: "pointer" }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        {/* Forgot password */}
        <div className="si-forgot-row">
          <a href="#" className="si-forgot">
            Forgot password?
          </a>
        </div>

        {/* Sign in button */}
        <button
          className="si-btn-primary"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {/* OR divider */}
        <div className="si-divider">
          <span>OR</span>
        </div>

        {/* Google button */}
        <button className="si-btn-google" disabled={loading}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            width={20}
            height={20}
          />
          Continue with Google
        </button>

        {/* Sign up link */}
        <p className="si-signup">
          Don't have an account?{" "}
          <a onClick={() => navigate("/create-account")} href="#">
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
}

export default SignIn;
