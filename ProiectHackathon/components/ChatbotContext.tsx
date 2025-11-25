import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ChatbotContextType {
    isChatOpen: boolean;
    toggleChat: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const toggleChat = () => setIsChatOpen(prev => !prev);

    return (
        <ChatbotContext.Provider value={{ isChatOpen, toggleChat }}>
            {children}
        </ChatbotContext.Provider>
    );
};

export const useChatbot = () => {
    const context = useContext(ChatbotContext);
    if (context === undefined) throw new Error('useChatbot must be used within a ChatbotProvider');
    return context;
};