import React, { useState, useEffect, useContext, createContext } from 'react';

// User type definition
interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  organization_id?: number;
  team_id?: number;
  created_at: string;
  updated_at: string;
}

// Auth context type definition
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    refreshUser();
  }, []);

  // Refresh user data from server
  const refreshUser = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/user', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated
          setUser(null);
          setIsAuthenticated(false);
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      setError('Failed to fetch user data');
      console.error('Error refreshing user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user login
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err: any) {
      setUser(null);
      setIsAuthenticated(false);
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user logout
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      console.error('Error during logout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user registration
  const register = async (userData: Partial<User>, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...userData, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const registeredUser = await response.json();
      setUser(registeredUser);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        refreshUser,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
