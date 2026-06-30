import api from "../api/axios";

const TOKEN_KEY = "token";

export const signup = async (userData) => {
  try {
    const response = await api.post("/api/auth/signup", userData);
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "Signup failed";
    throw new Error(message);
  }
};

export const login = async (userData) => {
  try {
    const response = await api.post("/api/auth/login", userData);
    const data = response.data;

    if (data?.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }

    return data;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "Login failed";
    throw new Error(message);
  }
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getProfile = async () => {
  try {
    const response = await api.get("/api/users/profile");
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "Failed to fetch profile";
    throw new Error(message);
  }
};
