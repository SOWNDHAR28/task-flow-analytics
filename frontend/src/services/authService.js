import API from "./api";

// POST /api/auth/register/
export const register = async (name, email, password) => {
  const response = await API.post("/auth/register/", {
    name,
    email,
    password,
  });
  return response.data; // { success: true, data: { id, name, email } }
};

// POST /api/auth/login/
export const login = async (email, password) => {
  const response = await API.post("/auth/login/", { email, password });
  const { token, user } = response.data.data;

  // Save to localStorage so token persists on refresh
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  return response.data; // { success: true, data: { token, user } }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};