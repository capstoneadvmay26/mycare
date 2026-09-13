// src/components/ui/Toast.jsx
import { useEffect } from "react";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const colors = {
    success: { bg: "#10B981", icon: "✓" },
    error: { bg: "#D92D20", icon: "✕" },
    info: { bg: "#0033CC", icon: "ℹ" },
  };

  const { bg, icon } = colors[type] || colors.success;

  return (
    <div
      className="position-fixed start-50 translate-middle-x d-flex align-items-center"
      style={{
        top: "20px",
        zIndex: 2000,
        backgroundColor: bg,
        color: "#FFF",
        padding: "12px 20px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        maxWidth: "90%",
        animation: "toastSlideIn 0.3s ease-out",
      }}
    >
      <span
        style={{
          marginRight: "10px",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        {icon}
      </span>
      <span className="fw-semibold" style={{ fontSize: "14px" }}>
        {message}
      </span>

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

export default Toast;