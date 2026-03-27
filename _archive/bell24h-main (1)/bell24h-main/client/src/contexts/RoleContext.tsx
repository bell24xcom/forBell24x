'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'buyer' | 'supplier';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  switchRole: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('buyer');

  // Load role from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('userRole') as UserRole;
      if (savedRole === 'buyer' || savedRole === 'supplier') {
        setRoleState(savedRole);
      }
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', newRole);
    }
  };

  const switchRole = () => {
    const newRole = role === 'buyer' ? 'supplier' : 'buyer';
    setRole(newRole);
  };

  return (
    <RoleContext.Provider value={{ role, setRole, switchRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

