import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("aia_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("aia_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("aia_user");
    }
  }, [user]);

  const login = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setUser({ name: trimmed, joined: new Date().toISOString() });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
