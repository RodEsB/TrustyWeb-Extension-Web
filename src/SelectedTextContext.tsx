import React, { createContext, useState, ReactNode, useContext } from 'react';

interface SelectedTextContextProps {
  selectedText: string;
  setSelectedText: (text: string) => void;
}

const SelectedTextContext = createContext<SelectedTextContextProps | undefined>(undefined);

export const SelectedTextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedText, setSelectedText] = useState<string>('');

  return (
    <SelectedTextContext.Provider value={{ selectedText, setSelectedText }}>
      {children}
    </SelectedTextContext.Provider>
  );
};

export const useSelectedText = () => {
  const context = useContext(SelectedTextContext);
  if (!context) {
    throw new Error('useSelectedText must be used within a SelectedTextProvider');
  }
  return context;
};
