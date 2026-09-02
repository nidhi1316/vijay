import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IMAGES } from '../constants/assets';

interface AppContextType {
  activeMapSource: any;
  setActiveMapSource: (source: any) => void;
  currentMode: '2D Map' | '3D Visuals';
  setCurrentMode: (mode: '2D Map' | '3D Visuals') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeMapSource, setActiveMapSource] = useState<any>(IMAGES.hero.flag);
  const [currentMode, setCurrentMode] = useState<'2D Map' | '3D Visuals'>('2D Map');

  return (
    <AppContext.Provider
      value={{
        activeMapSource,
        setActiveMapSource,
        currentMode,
        setCurrentMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
