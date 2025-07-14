import React, { createContext, useContext, useState } from 'react';
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

  const crashApp = () => {
    setCrashed(true);
    setError(new Error('Crash test'));
  };

  if (error) {
    throw error;
  }

  return (
    <CrashContext.Provider value={{ crashApp }}>
      {crashed ? <CrashPage /> : children}
    </CrashContext.Provider>
  );
}; 