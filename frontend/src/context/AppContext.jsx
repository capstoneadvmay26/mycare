// src/context/AppContext.jsx
import { createContext, useState, useEffect } from 'react';

const AppContext = createContext();

export default AppContext; // <--- Default export ONLY, no named export!

export const AppProvider = ({ children }) => {
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem('mycare_onboarded') === 'true';
  });
  
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('mycare_userName') || '';
  });

  const [currentProfile, setCurrentProfile] = useState(() => {
    return localStorage.getItem('mycare_currentProfile') || 'Tolu (Me)';
  });

  const [currentTab, setCurrentTab] = useState('Home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('mycare_onboarded', isOnboarded);
  }, [isOnboarded]);

  useEffect(() => {
    localStorage.setItem('mycare_userName', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('mycare_currentProfile', currentProfile);
  }, [currentProfile]);

  const handleLogout = () => {
    setUserName('');
    setCurrentTab('Home');
    setIsOnboarded(false);
    setIsMenuOpen(false);
    localStorage.removeItem('mycare_onboarded');
    localStorage.removeItem('mycare_userName');
    localStorage.removeItem('mycare_currentProfile');
  };

  return (
    <AppContext.Provider value={{
      isOnboarded, setIsOnboarded,
      userName, setUserName,
      currentProfile, setCurrentProfile,
      currentTab, setCurrentTab,
      isMenuOpen, setIsMenuOpen,
      handleLogout
    }}>
      {children}
    </AppContext.Provider>
  );
};