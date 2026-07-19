import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mirrors the web app's buyer/supplier toggle (CLAUDE.md: "A buyer/supplier
// toggle switches view mode only — it does not change permissions... role in
// DB is a display preference"). The server always creates new accounts with
// role SUPPLIER (see /api/auth/otp/verify), so which dashboard to show first
// has to be a local, user-chosen preference rather than read from the API.
export type ViewMode = 'buyer' | 'supplier';
const STORAGE_KEY = 'vyaparsethu_view_mode';

interface ViewModeContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  ready: boolean;
}

const ViewModeContext = createContext<ViewModeContextValue | undefined>(undefined);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>('buyer');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'buyer' || stored === 'supplier') setViewModeState(stored);
      setReady(true);
    })();
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  }, []);

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, ready }}>{children}</ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error('useViewMode must be used within ViewModeProvider');
  return ctx;
}
