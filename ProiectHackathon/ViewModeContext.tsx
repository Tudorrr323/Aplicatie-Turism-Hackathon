import React, { createContext, useState, useContext, ReactNode } from 'react';

// Definirea tipului pentru context
interface ViewModeContextType {
  isMapView: boolean;
  toggleView: () => void;
}

// Crearea contextului
const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

// Provider-ul care va încapsula componentele ce au nevoie de acest state
export const ViewModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMapView, setIsMapView] = useState(true); // Starea inițială este vizualizarea hărții

  const toggleView = () => {
    setIsMapView(prev => !prev);
  };

  return <ViewModeContext.Provider value={{ isMapView, toggleView }}>{children}</ViewModeContext.Provider>;
};

// Hook custom pentru a folosi contextul mai ușor
export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (context === undefined) { throw new Error('useViewMode must be used within a ViewModeProvider'); }
  return context;
};