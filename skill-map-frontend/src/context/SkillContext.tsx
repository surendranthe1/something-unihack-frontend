// src/context/SkillContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SkillMap, SkillProgram } from '../types';

interface SkillContextType {
  skillMap: SkillMap | null;
  setSkillMap: (skillMap: SkillMap | null) => void;
  skillProgram: SkillProgram | null;
  setSkillProgram: (skillProgram: SkillProgram | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

// Create context with default values
const SkillContext = createContext<SkillContextType>({
  skillMap: null,
  setSkillMap: () => {},
  skillProgram: null,
  setSkillProgram: () => {},
  loading: false,
  setLoading: () => {},
  error: null,
  setError: () => {},
});

// Provider component
export const SkillProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [skillMap, setSkillMap] = useState<SkillMap | null>(null);
  const [skillProgram, setSkillProgram] = useState<SkillProgram | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <SkillContext.Provider value={{
      skillMap,
      setSkillMap,
      skillProgram,
      setSkillProgram,
      loading,
      setLoading,
      error,
      setError,
    }}>
      {children}
    </SkillContext.Provider>
  );
};

// Custom hook for using the context
export const useSkillContext = () => useContext(SkillContext);