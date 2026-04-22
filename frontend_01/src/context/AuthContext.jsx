import { createContext, useContext, useState } from 'react';
import { getCurrentUser, isAuthenticated, logout } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(getCurrentUser);
  const [loggedIn, setLoggedIn] = useState(isAuthenticated);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setLoggedIn(false);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loggedIn, handleLogin, handleLogout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
