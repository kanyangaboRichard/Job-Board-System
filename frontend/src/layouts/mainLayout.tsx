import { useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      login(token); // update AuthContext
      navigate("/", { replace: true }); // clean URL & stay on Home
    }
  }, [location.search, login, navigate]);

  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default MainLayout;
