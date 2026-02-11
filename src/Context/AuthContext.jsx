import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const sesionGuardada = localStorage.getItem("sesionActiva");
    return sesionGuardada ? JSON.parse(sesionGuardada) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("sesionActiva", JSON.stringify(user));
    } else {
      localStorage.removeItem("sesionActiva");
    }
  }, [user]);

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;