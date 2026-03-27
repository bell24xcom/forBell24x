declare module '../contexts/AuthContext' {
  export interface AuthContextType {
    user: any;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; user?: any; token?: string; error?: string }>;
    register: (userData: any) => Promise<{ success: boolean; user?: any; error?: string }>;
    logout: () => void;
    updateUser: (updates: any) => void;
  }

  export function useAuth(): AuthContextType;
} 
