import api from "../api/api";

export const signup = async (userData) => {
  try {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "Signup failed";
    throw new Error(message);
  }
};

export const login = async (userData) => {
  try {
    const response = await api.post("/auth/login", userData);
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "Login failed";
    throw new Error(message);
  }
};

export const logout = () => {
  // Pure service layer logout is a placeholder since token removal is handled in AuthContext
};

export const getProfile = async () => {
  try {
    const response = await api.get("/users/profile");
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || "Failed to fetch profile";
    throw new Error(message);
  }
};
