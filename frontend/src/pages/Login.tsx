import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../context/AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth(); // from AuthContext

  // Capture token from Google callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleToken = params.get("token");
    if (googleToken) {
      login(googleToken); // 👈 use AuthContext login
      navigate("/"); // redirect after login
    }
  }, [location, login, navigate]);

  // Email/Password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("http://localhost:3005/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      login(data.token); // 👈 decode + save user in context
      navigate("/"); // redirect to home
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error, could not connect to server");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3005/auth/google";
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title mb-4 text-center">Login</h3>

              {error && <div className="alert alert-danger">{error}</div>}

              {/* Email login form */}
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">Email address</label>
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

              {/* Google Sign-In */}
              <button onClick={handleGoogleLogin} className="btn btn-danger w-100">
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
