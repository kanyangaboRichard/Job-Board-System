import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import type { RootState, AppDispatch } from "../store/store";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, user } = useSelector((state: RootState) => state.auth);

  //  Compute redirect safely
  const redirect = useMemo(() => {
    const param = new URLSearchParams(location.search).get("redirect");
    return param && param !== "/login" ? param : "/";
  }, [location.search]);

  //  Handle login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const resultAction = await dispatch(login({ email, password }));

    if (login.fulfilled.match(resultAction)) {
      const role = resultAction.payload.user.role;
      setTimeout(() => {
        navigate(role === "admin" ? "/admin" : redirect, { replace: true });
      }, 50);
    } else {
      const errMsg = resultAction.payload || "Login failed. Please try again.";
      setError(typeof errMsg === "string" ? errMsg : "Login failed.");
    }
  };

  //  Handle Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleToken = params.get("token");

    if (googleToken) {
      localStorage.setItem("googleToken", googleToken);
      if (location.pathname === "/login") navigate("/", { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user && location.pathname === "/login") {
      const target = user.role === "admin" ? "/admin" : redirect;
      setTimeout(() => navigate(target, { replace: true }), 50);
    }
  }, [user, redirect, navigate, location.pathname]);

  // Google login
  const handleGoogleLogin = () => {
    window.location.href = `http://localhost:3005/api/auth/google?redirect=${encodeURIComponent(
      redirect
    )}`;
  };

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "#e6f7ff" }}
      className="container-fluid p-0"
    >
      <div className="row gx-0">
        {/* Left side hero */}
        <div className="col-md-7 d-none d-md-flex align-items-center justify-content-center">
          <div className="w-100 h-100 d-flex align-items-center justify-content-center">
            <div className="text-center">
              <img
                src="assets/pin.jpg"
                alt="Hero"
                style={{ maxWidth: "50%", borderRadius: 8 }}
                className="img-fluid mb-3"
              />
              <h3 className="text-muted">Welcome Back to JobBoard</h3>
            </div>
          </div>
        </div>

        {/* Right side form */}
        <div className="col-12 col-md-5 d-flex align-items-center justify-content-center">
          <div className="w-100" style={{ maxWidth: 420, padding: 24 }}>
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h4 className="card-title mb-3 text-center">Login</h4>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <div className="text-center my-3">OR</div>

                <div className="text-center mb-3">
                  <Link to="/register" className="d-block small">
                    Don’t have an account? Register
                  </Link>
                </div>

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
    </div>
  );
};

export default Login;
