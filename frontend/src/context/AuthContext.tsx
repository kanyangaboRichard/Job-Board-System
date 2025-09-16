import React, {
  createContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  id: number;
  role: string;
  exp: number;
}

interface AuthContextType {
  user: { id: number; role: string } | null;
  login: (token: string) => void;
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: number; role: string } | null>(null);

  // Check localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser({ id: decoded.id, role: decoded.role });
        } else {
          localStorage.removeItem("token"); // expired
        }
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Login function
  const login = (token: string) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode<TokenPayload>(token);
    setUser({ id: decoded.id, role: decoded.role });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;