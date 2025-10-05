import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { store, type AppDispatch } from "../store/store";

interface DecodedToken {
  id: number;
  role: "user" | "admin";
  email?: string;
  name?: string;
  exp?: number;
}

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get("token") || localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      localStorage.setItem("token", token);

      // ✅ Prevent overwriting an already-logged-in user
      const existingUser = store.getState().auth.user;
      if (!existingUser || !existingUser.id) {
        dispatch({
          type: "auth/login/fulfilled",
          payload: {
            token,
            user: {
              id: decoded.id,
              role: decoded.role,
              email: decoded.email || "unknown",
              name: decoded.name || "User",
            },
          },
        });
      }

      // ✅ Redirect ONLY if this is a Google OAuth callback (?token)
      if (params.get("token")) {
        if (decoded.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
      if (location.pathname !== "/login") navigate("/login", { replace: true });
    }
  }, [dispatch, navigate, location.pathname, location.search]);

  return (
    <div className="container-fluid">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default MainLayout;
