import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ViewModeContextType {
    isMapView: boolean;
    toggleView: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const ViewModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isMapView, setIsMapView] = useState(true);
    const toggleView = () => setIsMapView(prev => !prev);

    return (
        <ViewModeContext.Provider value={{ isMapView, toggleView }}>
            {children}
        </ViewModeContext.Provider>
    );
};

export const useViewMode = () => {
    const context = useContext(ViewModeContext);
    if (context === undefined) throw new Error('useViewMode must be used within a ViewModeProvider');
    return context;
};