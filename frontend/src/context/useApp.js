// src/context/useApp.js
import { useContext } from 'react';
import AppContext from './AppContext'; // <--- NO CURLY BRACES! This is the default import!

export const useApp = () => useContext(AppContext);