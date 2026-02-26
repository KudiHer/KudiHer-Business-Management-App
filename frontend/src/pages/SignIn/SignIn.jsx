import React, { useState } from "react";
import "./SignIn.css";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
        <input type="email" placeholder="Email address" className="si-input" />
        <div className="si-input-icon">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="si-input"
          />
          <span onClick={() => setShowPassword(!showPassword)}>
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
          onClick={() => {
            const userData = {
              name: "Ladunni Tegbe",
              designation: "Business Owner",
              email: "ladunni@email.com",
            };

            login(userData);
            navigate("/dashboard");
          }}
        >
          Sign in
        </button>
        {/* OR divider */}
        <div className="si-divider">
          <span>OR</span>
        </div>

        {/* Google button */}
        <button className="si-btn-google">
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
