// src/components/layout/GlobalReminderOverlay.jsx
import { useReminder } from '../../context/ReminderContext';
import ReminderActionSheet from '../medications/ReminderActionSheet';

const GlobalReminderOverlay = () => {
  const { dueMedication, closeReminder } = useReminder();

  if (!dueMedication) return null;

  return (
    <ReminderActionSheet 
      medication={dueMedication}
      onClose={closeReminder}
      onAction={closeReminder}
    />
  );
};

export default GlobalReminderOverlay;