// src/context/ProfileContext.jsx
import { createContext, useContext, useState } from 'react';
import { useApp } from './useApp';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { userName, dob, gender } = useApp();

  const [profiles, setProfiles] = useState([
    { id: '1', name: 'Tolu', relationship: 'Me', initial: 'T', color: '#0033CC', isDependent: false, email: 'tolu@gmail.com', phone: '+234 8701 234 5678', dob: 'May 15, 1995', gender: 'Male' },
    { id: '2', name: 'Mum', relationship: 'Parent', initial: 'M', color: '#2196F3', isDependent: true, email: 'mum@gmail.com', phone: '+234 802 345 6789', dob: 'Jan 10, 1960', gender: 'Female' },
    { id: '3', name: 'Younger Brother', relationship: 'Sibling', initial: 'Y', color: '#4CBB17', isDependent: true, email: 'bro@gmail.com', phone: '+234 803 456 7890', dob: 'Mar 20, 2003', gender: 'Male' },
  ]);

  const [activeProfile, setActiveProfile] = useState(profiles[0]);

  const displayActiveProfile = userName ? { 
    ...activeProfile, 
    name: userName, 
    initial: userName.charAt(0).toUpperCase(),
    dob: dob || activeProfile.dob,
    gender: gender || activeProfile.gender
  } : activeProfile;

  const displayProfiles = userName 
    ? profiles.map(p => p.isDependent ? p : { ...p, name: userName, initial: userName.charAt(0).toUpperCase(), dob: dob || p.dob, gender: gender || p.gender })
    : profiles;

  const switchProfile = (id) => {
    const newProfile = profiles.find(p => p.id === id);
    if (newProfile) {
      setActiveProfile(newProfile);
    }
  };

  const updateActiveProfile = (updatedData) => {
    setProfiles(prevProfiles => 
      prevProfiles.map(p => p.id === activeProfile.id ? { ...p, ...updatedData, initial: updatedData.name.charAt(0).toUpperCase() } : p)
    );
    setActiveProfile(prev => ({ ...prev, ...updatedData, initial: updatedData.name.charAt(0).toUpperCase() }));
  };

  const addDependent = (newDep) => {
    const newProfile = {
      id: Date.now().toString(),
      name: newDep.name,
      relationship: newDep.relationship,
      initial: newDep.name.charAt(0).toUpperCase(),
      color: '#4CBB17',
      isDependent: true,
      email: newDep.email || '',
      phone: newDep.phone || '',
      dob: newDep.dob || '',
      gender: newDep.gender || ''
    };
    setProfiles(prev => [...prev, newProfile]);
  };

  return (
    <ProfileContext.Provider value={{ 
      profiles: displayProfiles, 
      activeProfile: displayActiveProfile, 
      switchProfile, 
      updateActiveProfile,
      addDependent
    }}>
      {children}
    </ProfileContext.Provider>
  );
};


// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};