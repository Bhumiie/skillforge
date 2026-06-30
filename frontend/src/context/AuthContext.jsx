import { createContext, useContext, useState, useEffect } from "react";
import { login as loginService, signup as signupService, getProfile } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const profileData = await getProfile();
        setUser(profileData);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (initError) {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setError(initError instanceof Error ? initError.message : "Failed to validate token");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loginUser = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const data = await loginService(credentials);
      if (!data?.token) {
        throw new Error("Login response did not include a token.");
      }

      const profileData = await getProfile();
      setUser(profileData);
      setToken(data.token);
      setIsAuthenticated(true);
      return data;
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : "Login failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signupUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await signupService(userData);
      return data;
    } catch (signupError) {
      const message = signupError instanceof Error ? signupError.message : "Signup failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        error,
        loginUser,
        signupUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
