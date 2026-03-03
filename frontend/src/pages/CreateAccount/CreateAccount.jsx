

import React, { useState }        from "react";
import "./CreateAccount.css";
import { Eye, EyeOff }            from "lucide-react";
import { useNavigate }             from "react-router-dom";
import { useAuth }                 from "../../context/AuthContext";
import { register as apiRegister } from "../../services/api";

const PHONE_CODES = [
  { label: "NG +234", value: "+234" },
  { label: "US +1",   value: "+1"   },
  { label: "GH +233", value: "+233" },
  { label: "KE +254", value: "+254" },
];

// businessType values that match the backend enum visible in the schema image
const BUSINESS_TYPES = [
  "Retail",
  "Service",
  "Wholesale",
  "Food & Beverage",
  "Fashion",
  "Other",
];

function CreateAccount() {
  // ── UI toggles ─────────────────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  // ── Form fields ─────────────────────────────────────────────────────────────
  const [fullName,        setFullName]        = useState("");
  const [email,           setEmail]           = useState("");
  const [phoneCode,       setPhoneCode]       = useState("+234");
  const [phoneNumber,     setPhoneNumber]     = useState("");
  const [businessName,    setBusinessName]    = useState("");
  const [businessType,    setBusinessType]    = useState("Retail");
  const [businessAddress, setBusinessAddress] = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── Async state ────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const navigate    = useNavigate();
  const { setUser } = useAuth();   // pure state setter — does NOT call the API

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    if (!fullName.trim())        return "Full name is required.";
    if (!email.trim())           return "Email is required.";
    if (!phoneNumber.trim())     return "Phone number is required.";
    if (!businessName.trim())    return "Business name is required.";
    if (!businessAddress.trim()) return "Business address is required.";
    if (!password)               return "Password is required.";
    if (password.length < 8)     return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError("");

    try {
      // api.js register() now forwards all required schema fields exactly.
      // phoneNumber = countryCode + number so the backend gets a full string.
      const data = await apiRegister({
        fullName:     fullName.trim(),
        email:        email.trim(),
        password,
        phoneNumber:  `${phoneCode}${phoneNumber.trim()}`,
        businessName: businessName.trim(),
        businessType,
      });

      // api.js has already written token + user to localStorage.
      // Update React state so components see the user immediately.
      setUser(data.user ?? data);

      // businessAddress is not in the current schema — store it in the
      // enriched user object via setUser so BusinessSetup can display it.
      // If the backend adds it later, it can be added to the register payload.
      setUser({
        ...(data.user ?? data),
        businessAddress: businessAddress.trim(),
      });

      navigate("/business-setup");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="ca-container">

      {/* Back */}
      <button className="ca-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Header */}
      <h1 className="ca-title">Create your account</h1>
      <p className="ca-subtitle">Start tracking your business finances today</p>

      {/* Error banner */}
      {error && (
        <div className="ca-error" role="alert">
          {error}
        </div>
      )}

      {/* Full name & Email */}
      <div className="ca-card">
        <div className="ca-field">
          <label htmlFor="ca-fullname">Full name</label>
          <input
            id="ca-fullname"
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            autoComplete="name"
          />
        </div>
        <div className="ca-field">
          <label htmlFor="ca-email">Email</label>
          <input
            id="ca-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
          />
        </div>
      </div>

      {/* Phone number — country code select + number input */}
      <div className="ca-card">
        <div className="ca-field">
          <label>Phone number</label>
          <div className="ca-phone-row">
            <select
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
              disabled={loading}
              className="ca-phone-code"
            >
              {PHONE_CODES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
              autoComplete="tel-national"
              className="ca-phone-number"
            />
          </div>
        </div>
      </div>

      {/* Business info */}
      <div className="ca-card">
        <div className="ca-field">
          <label htmlFor="ca-bizname">Business name</label>
          <input
            id="ca-bizname"
            type="text"
            placeholder="Business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="ca-field">
          <label htmlFor="ca-biztype">Business Type</label>
          <select
            id="ca-biztype"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            disabled={loading}
          >
            {BUSINESS_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Business address */}
      <div className="ca-card">
        <div className="ca-field">
          <label htmlFor="ca-address">Business address</label>
          <input
            id="ca-address"
            type="text"
            placeholder="Street, City, State"
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Password */}
      <div className="ca-card">
        <div className="ca-field">
          <label htmlFor="ca-password">Password</label>
          <div className="ca-input-icon">
            <input
              id="ca-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
            <span
              onClick={() => setShowPassword((p) => !p)}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>
        <div className="ca-field">
          <label htmlFor="ca-confirm">Confirm password</label>
          <div className="ca-input-icon">
            <input
              id="ca-confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
            <span
              onClick={() => setShowConfirm((p) => !p)}
              style={{ cursor: "pointer" }}
            >
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
        onClick={handleCreate}
        disabled={loading}
      >
        {loading ? "Creating account…" : "Create Account"}
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
