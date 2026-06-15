import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user details
  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error loading user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      loadUser();
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // Register user
  const registerUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Registration failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const loginUser = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Invalid email or password';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Update profile failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Refresh user data (like notifications count or profiles status)
  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Error refreshing user details:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register: registerUser,
        login: loginUser,
        logout,
        updateProfile,
        refreshUser,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
