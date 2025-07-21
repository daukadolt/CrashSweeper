import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import CrashPage from './CrashPage';

interface CrashContextType {
  crashApp: () => void;
}

const CrashContext = createContext<CrashContextType>({ crashApp: () => {} });

export const useCrash = () => useContext(CrashContext);

export const CrashProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [crashed, setCrashed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.crashsweeper.amirdnur.dev/minesweeper-monitor')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'crashed') {
          setCrashed(true);
          setError(new Error('Crash detected by monitor'));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const crashApp = () => {
    setCrashed(true);
    setError(new Error('Crash test'));
  };

  if (loading) return null;
  if (error) throw error;

  return (
    <CrashContext.Provider value={{ crashApp }}>
      {crashed ? <CrashPage /> : children}
    </CrashContext.Provider>
  );
}; 