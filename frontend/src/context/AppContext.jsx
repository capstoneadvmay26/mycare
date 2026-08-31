// src/context/AppContext.jsx
import { createContext, useState, useEffect } from 'react';

const AppContext = createContext();

export default AppContext;

export const AppProvider = ({ children }) => {
  const [userName, setUserName] = useState(() => localStorage.getItem('mycare_userName') || '');
  const [dob, setDob] = useState(() => localStorage.getItem('mycare_dob') || ''); 
  const [gender, setGender] = useState(() => localStorage.getItem('mycare_gender') || ''); 
  const [isOnboarded, setIsOnboarded] = useState(() => localStorage.getItem('mycare_onboarded') === 'true');
  const [currentProfile, setCurrentProfile] = useState(() => localStorage.getItem('mycare_currentProfile') || 'Tolu (Me)');

  const [currentTab, setCurrentTab] = useState('Home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('mycare_onboarded', isOnboarded);
  }, [isOnboarded]);

  useEffect(() => {
    localStorage.setItem('mycare_userName', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('mycare_dob', dob);
  }, [dob]);

  useEffect(() => {
    localStorage.setItem('mycare_gender', gender);
  }, [gender]);

  useEffect(() => {
    localStorage.setItem('mycare_currentProfile', currentProfile);
  }, [currentProfile]);

  const handleLogout = () => {
    setUserName('');
    setDob('');
    setGender('');
    setCurrentTab('Home');
    setIsOnboarded(false);
    setIsMenuOpen(false);
    
    localStorage.removeItem('mycare_onboarded');
    localStorage.removeItem('mycare_userName');
    localStorage.removeItem('mycare_dob');
    localStorage.removeItem('mycare_gender');
    localStorage.removeItem('mycare_currentProfile');
  };

  return (
    <AppContext.Provider value={{
      isOnboarded, setIsOnboarded,
      userName, setUserName,
      dob, setDob,
      gender, setGender,
      currentProfile, setCurrentProfile,
      currentTab, setCurrentTab,
      isMenuOpen, setIsMenuOpen,
      handleLogout
    }}>
      {children}
    </AppContext.Provider>
  );
};