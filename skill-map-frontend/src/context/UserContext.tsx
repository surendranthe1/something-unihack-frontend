// src/context/UserContext.tsx
import React, { createContext, useState, ReactNode } from 'react';
import { UserProfile } from '../types';

interface UserContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
}

export const UserContext = createContext<UserContextType>({
  userProfile: null,
  setUserProfile: () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  return (
    <UserContext.Provider value={{ userProfile, setUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};