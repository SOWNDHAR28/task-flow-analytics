import API from './api';

export const register = async (name, email, password) => {
  const res = await API.post('/auth/register/', { name, email, password });
  return res.data;
};

export const login = async (email, password) => {
  const res = await API.post('/auth/login/', { email, password });
  const { token, user } = res.data.data;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  return res.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getCurrentUser = () => {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};

export const isAuthenticated = () => !!localStorage.getItem('token');
