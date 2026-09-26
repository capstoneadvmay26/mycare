// src/components/layout/IdleWarningModal.jsx
import { ClockHistory } from "react-bootstrap-icons";
import { useTheme } from "../../context/ThemeContext";

const IdleWarningModal = ({ onStaySignedIn, onLogoutNow }) => {
  const { isDark } = useTheme();

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 2000 }}
    >
      <div
        className="modal-dialog modal-dialog-centered mx-auto px-3"
        style={{ maxWidth: "400px" }}
      >
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: "16px", overflow: "hidden" }}
        >
          <div className="modal-body p-4 text-center">
            <div
              className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3"
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "rgba(247, 200, 27, 0.15)",
              }}
            >
              <ClockHistory size={32} color="#B45309" />
            </div>

            <h5
              className="fw-bold mb-2"
              style={{ fontSize: "18px", color: isDark ? "#FFF" : "#000" }}
            >
              Still there?
            </h5>

            <p
              className="mb-4 text-secondary"
              style={{ fontSize: "14px", lineHeight: 1.5 }}
            >
              For your security, you'll be signed out in{" "}
              <strong>60 seconds</strong> due to inactivity.
            </p>

            <button
              className="btn w-100 py-3 fw-bold text-white mb-2"
              style={{
                backgroundColor: "#0033CC",
                borderRadius: "8px",
                border: "none",
              }}
              onClick={onStaySignedIn}
            >
              Stay signed in
            </button>

            <button
              className="btn w-100 py-3 fw-bold"
              style={{
                backgroundColor: "transparent",
                border: "1px solid #0033CC",
                color: "#0033CC",
                borderRadius: "8px",
              }}
              onClick={onLogoutNow}
            >
              Sign out now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdleWarningModal;