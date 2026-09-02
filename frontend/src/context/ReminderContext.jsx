// src/context/ReminderContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ReminderContext = createContext();

export const ReminderProvider = ({ children }) => {
  const [dueMedication, setDueMedication] = useState(null);

  // Mock data for demo
  const [medications] = useState([
    { id: '1', name: 'Amlodipine', dosage: '5mg, 1 tablet', time: '8:00 AM', is_archived: false },
    { id: '2', name: 'Paracetamol', dosage: '500mg, 1 tablet', time: '12:30 PM', is_archived: false },
  ]);

  // 🔔 NEW FUNCTION: Play a "Beep" sound
  const playReminderSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Could not play reminder sound:", e);
    }
  };

  const closeReminder = () => setDueMedication(null);

  // Scheduler Logic (Safe)
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; 
      const currentTime = `${hours}:${minutes} ${ampm}`;

      const foundMed = medications.find(med => !med.is_archived && med.time === currentTime);

      if (foundMed && !dueMedication) {
        playReminderSound(); // Play sound!
        setDueMedication(foundMed);
      }
    };

    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [medications, dueMedication]);

  return (
    <ReminderContext.Provider value={{ dueMedication, closeReminder }}>
      {children}
    </ReminderContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useReminder = () => useContext(ReminderContext);