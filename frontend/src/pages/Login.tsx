import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Capture token from Google callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleToken = params.get("token");
    const redirect = params.get("redirect") || "/";

    if (googleToken) {
      const decoded = login(googleToken);
      if (decoded?.role === "admin") {
        navigate("/admin");
      } else {
        navigate(redirect);
      }
    }
  }, [location.search, navigate, login]);

  // Email/Password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("http://localhost:3005/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // role removed 🚀
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Save user + redirect by role
      const decoded = login(data.token); // role decoded from JWT
      const params = new URLSearchParams(location.search);
      const redirect = params.get("redirect") || "/";

      if (decoded?.role === "admin") {
        navigate("/admin");
      } else {
        navigate(redirect);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error, could not connect to server!");
    }
  };

  // Google login
  const handleGoogleLogin = () => {
    const redirect = new URLSearchParams(location.search).get("redirect") || "/";
    window.location.href = `http://localhost:3005/api/auth/google?redirect=${redirect}`;
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4 col-sm-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h4 className="card-title mb-3 text-center">Login</h4>

              {error && <div className="alert alert-danger">{error}</div>}

              {/* Email login form */}
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Login with Email
                </button>
              </form>

              {/* Divider */}
              <div className="text-center my-3">OR</div>

              {/* Register link */}
              <div className="text-center mb-3">
                <Link to="/register" className="d-block small">
                  Don't have an account? Register
                </Link>
              </div>

              {/* Google Sign-In */}
              <button
                onClick={handleGoogleLogin}
                className="btn btn-danger w-100"
              >
                <i className="bi bi-google me-2"></i> Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
