// src/context/useApp.js
import { useContext } from 'react';
import { AppContext } from './AppContext';

// ✅ Change to named export (remove 'default')
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};