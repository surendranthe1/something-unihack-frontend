// src/context/SkillContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SkillMap, SkillNode } from '../types';

interface SkillContextProps {
  skillMap: SkillMap | null;
  setSkillMap: (skillMap: SkillMap | null) => void;
  selectedNode: SkillNode | null;
  setSelectedNode: (node: SkillNode | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const defaultContext: SkillContextProps = {
  skillMap: null,
  setSkillMap: () => {},
  selectedNode: null,
  setSelectedNode: () => {},
  loading: false,
  setLoading: () => {},
  error: null,
  setError: () => {},
};

const SkillContext = createContext<SkillContextProps>(defaultContext);

export const useSkillContext = () => useContext(SkillContext);

interface SkillProviderProps {
  children: ReactNode;
}

export const SkillProvider: React.FC<SkillProviderProps> = ({ children }) => {
  const [skillMap, setSkillMap] = useState<SkillMap | null>(null);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <SkillContext.Provider
      value={{
        skillMap,
        setSkillMap,
        selectedNode,
        setSelectedNode,
        loading,
        setLoading,
        error,
        setError,
      }}
    >
      {children}
    </SkillContext.Provider>
  );
};

export default SkillContext;