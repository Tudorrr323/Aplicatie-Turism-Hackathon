import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface ChatbotAction {
    type: 'navigate_to_location' | 'apply_city_filter';
    payload: { id: number } | { city: string };
}

interface ChatbotActionContextType {
    action: ChatbotAction | null;
    dispatchAction: (action: ChatbotAction) => void;
    clearAction: () => void;
}

const ChatbotActionContext = createContext<ChatbotActionContextType | undefined>(undefined);

export const ChatbotActionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [action, setAction] = useState<ChatbotAction | null>(null);
    const dispatchAction = (newAction: ChatbotAction) => setAction(newAction);
    const clearAction = () => setAction(null);

    return (
        <ChatbotActionContext.Provider value={{ action, dispatchAction, clearAction }}>
            {children}
        </ChatbotActionContext.Provider>
    );
};

export const useChatbotAction = () => {
    const context = useContext(ChatbotActionContext);
    if (context === undefined) throw new Error('useChatbotAction must be used within a ChatbotActionProvider');
    return context;
};