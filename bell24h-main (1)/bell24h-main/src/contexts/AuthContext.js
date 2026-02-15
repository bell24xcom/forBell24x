"use client";
import React, { useState, useEffect, createContext, useContext } from 'react';

// Authentication Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const userData = localStorage.getItem('bell24h_user');
      const authToken = localStorage.getItem('bell24h_auth_token');
      
      if (userData && authToken) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Check if user exists in localStorage "database"
      const existingUsers = JSON.parse(localStorage.getItem('bell24h_users') || '[]');
      const user = existingUsers.find(u => u.email === email);

      if (!user) {
        throw new Error('User not found. Please register first.');
      }

      // Simple password check (in production, use proper hashing)
      if (user.password !== password) {
        throw new Error('Invalid password');
      }

      // Generate auth token
      const authToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store auth data
      localStorage.setItem('bell24h_user', JSON.stringify({
        ...user,
        password: undefined // Don't store password in auth data
      }));
      localStorage.setItem('bell24h_auth_token', authToken);

      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user, token: authToken };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('bell24h_users') || '[]');
      const existingUser = existingUsers.find(u => u.email === userData.email);

      if (existingUser) {
        throw new Error('User with this email already exists. Please login instead.');
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...userData,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      // Add to "database"
      existingUsers.push(newUser);
      localStorage.setItem('bell24h_users', JSON.stringify(existingUsers));

      // Auto-login after registration
      const authToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      localStorage.setItem('bell24h_user', JSON.stringify({
        ...newUser,
        password: undefined
      }));
      localStorage.setItem('bell24h_auth_token', authToken);

      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, user: newUser, token: authToken };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('bell24h_user');
    localStorage.removeItem('bell24h_auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('bell24h_user', JSON.stringify({
        ...updatedUser,
        password: undefined
      }));
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth }; 
