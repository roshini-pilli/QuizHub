import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAuthData = (token, userData) => {
    sessionStorage.setItem("quizhub_token", token);
    sessionStorage.setItem("quizhub_user", JSON.stringify(userData));
    setUser(userData);
  };

  const signup = async (name, email, password) => {
    const response = await axios.post(
      `${API_URL}/api/auth/signup`,
      {
        name,
        email,
        password
      }
    );

    return response.data;
  };

  const login = async (email, password) => {
    const response = await axios.post(
      `${API_URL}/api/auth/login`,
      {
        email,
        password
      }
    );

    setAuthData(response.data.token, response.data.user);
  };

  const logout = () => {
    sessionStorage.removeItem("quizhub_token");
    sessionStorage.removeItem("quizhub_user");
    setUser(null);
  };

  useEffect(() => {
    const storedToken = sessionStorage.getItem("quizhub_token");
    const storedUser = sessionStorage.getItem("quizhub_user");

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        sessionStorage.removeItem("quizhub_token");
        sessionStorage.removeItem("quizhub_user");
      }
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        setAuthData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);