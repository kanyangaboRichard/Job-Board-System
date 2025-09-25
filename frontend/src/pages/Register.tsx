import React, { useState } from "react";
import { register } from "../api/auth";
import { Link, useLocation } from "react-router-dom";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ check passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register(name, email, password);
      window.location.href = "/login";
    } catch {
      setError("Registration failed");
    }
  };

  const handleGoogleRegister = () => {
    const redirect = new URLSearchParams(location.search).get("redirect") || "/";
    window.location.href = `http://localhost:3005/api/auth/google?redirect=${redirect}`;
  };

  return (
    <div className="container mt-5">
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <h2 className="mb-3">Register</h2>
        {error && <p className="text-danger">{error}</p>}

        <input
          type="text"
          className="form-control mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          required
        />

        <input
          type="email"
          className="form-control mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />

        <input
          type="password"
          className="form-control mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="form-control mb-3"
          placeholder="Confirm Password"
          required
        />

        <button type="submit" className="btn btn-success w-100">
          Register
        </button>

        {/* Divider */}
        <div className="text-center my-3">OR</div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          className="btn btn-danger w-100 mb-3"
        >
          <i className="bi bi-google me-2"></i> Sign up with Google
        </button>

        {/* Back to login */}
        <div className="text-center">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
