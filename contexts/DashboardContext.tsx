'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type DashboardMode = 'buyer' | 'supplier';

interface DashboardContextType {
  mode: DashboardMode;
  setMode: (mode: DashboardMode) => void;
  toggleMode: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<DashboardMode>('buyer');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bell24h_dashboard_mode');
    if (saved === 'buyer' || saved === 'supplier') {
      setModeState(saved);
    }
  }, []);

  // Save to localStorage when changed
  const setMode = (newMode: DashboardMode) => {
    setModeState(newMode);
    localStorage.setItem('bell24h_dashboard_mode', newMode);
  };

  const toggleMode = () => {
    setMode(mode === 'buyer' ? 'supplier' : 'buyer');
  };

  return (
    <DashboardContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardMode() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardMode must be used within a DashboardProvider');
  }
  return context;
}
