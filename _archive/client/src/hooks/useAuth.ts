'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'buyer' | 'supplier' | 'admin';
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for authentication token in localStorage or cookies
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('auth-token') || 
                     localStorage.getItem('user-token') ||
                     localStorage.getItem('next-auth.session-token');
        
        if (token) {
          // Parse user data from token or fetch from API
          const userData = localStorage.getItem('user-data');
          if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            // Mock user data for demo
            setUser({
              id: 'demo-user',
              name: 'Rajesh Kumar',
              email: 'rajesh@example.com',
              phone: '+91 98765 43210',
              role: 'buyer'
            });
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('auth-token', token);
    localStorage.setItem('user-data', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-token');
    localStorage.removeItem('next-auth.session-token');
    localStorage.removeItem('user-data');
    setUser(null);
    setIsAuthenticated(false);
  };

  return { 
    isAuthenticated, 
    user, 
    loading, 
    login, 
    logout 
  };
}