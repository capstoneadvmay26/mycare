// src/pages/HelpSupport.jsx
import { ChevronLeft } from "react-bootstrap-icons";
import { useTheme } from "../context/ThemeContext";

const HelpSupport = ({ onBack }) => {
  const { isDark } = useTheme();

  const rowStyle = {
    cursor: "pointer",
    borderBottom: `1px solid ${isDark ? "#333" : "rgba(0,0,0,0.1)"}`,
  };

  const handleContact = () => {
    window.location.href =
      "mailto:mycareapk@gmail.com?subject=MyCare Support Request";
  };
  const handleFAQ = () => {
    window.open("https://mycare-consortium.com/faq", "_blank");
  };

  const handleGuide = () => {
    window.open("https://mycare-consortium.com/guide", "_blank");
  };

  const handleHealthResources = () => {
    window.open("https://www.who.int/health-topics", "_blank");
  };

  const handleFindCare = () => {
    window.open(
      "https://www.google.com/maps/search/hospitals+near+me",
      "_blank",
    );
  };

  return (
    <div
      className="d-flex flex-column h-100"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      <div
        className="d-flex align-items-center p-3 border-bottom"
        style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
      >
        <button
          className="btn p-0 border-0"
          onClick={onBack}
          style={{ color: isDark ? "#FFF" : "#000" }}
        >
          <ChevronLeft size={28} />
        </button>
        <h1
          className="fw-bold m-0 ms-3"
          style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
        >
          Help & Support
        </h1>
      </div>

      <div className="p-3 overflow-auto">
        <p className="text-secondary fw-bold mb-2" style={{ fontSize: "14px" }}>
          Get Help
        </p>

        <div className="border rounded-3 overflow-hidden mb-4">
          <div
            className="d-flex align-items-center p-3"
            style={rowStyle}
            onClick={handleFAQ}
          >
            <div className="flex-grow-1">
              <p className="m-0 fw-bold" style={{ fontSize: "15px" }}>
                FAQs
              </p>
              <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
                Find answers to common questions
              </p>
            </div>
            <span className="text-secondary">›</span>
          </div>

          <div
            className="d-flex align-items-center p-3"
            style={{ ...rowStyle, borderBottom: "none" }}
            onClick={handleContact}
          >
            <div className="flex-grow-1">
              <p className="m-0 fw-bold" style={{ fontSize: "15px" }}>
                Contact Us
              </p>
              <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
                Email us at mycareapk@gmail.com
              </p>
            </div>
            <span className="text-secondary">›</span>
          </div>
        </div>

        <p className="text-secondary fw-bold mb-2" style={{ fontSize: "14px" }}>
          Resources
        </p>

        <div className="border rounded-3 overflow-hidden">
          <div
            className="d-flex align-items-center p-3"
            style={rowStyle}
            onClick={handleGuide}
          >
            <div className="flex-grow-1">
              <p className="m-0 fw-bold" style={{ fontSize: "15px" }}>
                User Guide
              </p>
              <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
                Learn how to use MyCare
              </p>
            </div>
            <span className="text-secondary">›</span>
          </div>

          <div
            className="d-flex align-items-center p-3"
            style={rowStyle}
            onClick={handleHealthResources}
          >
            <div className="flex-grow-1">
              <p className="m-0 fw-bold" style={{ fontSize: "15px" }}>
                Health Resources
              </p>
              <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
                Trusted health information
              </p>
            </div>
            <span className="text-secondary">›</span>
          </div>

          <div
            className="d-flex align-items-center p-3"
            style={{ ...rowStyle, borderBottom: "none" }}
            onClick={handleFindCare}
          >
            <div className="flex-grow-1">
              <p className="m-0 fw-bold" style={{ fontSize: "15px" }}>
                Find Care
              </p>
              <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
                Find doctors and facilities near you
              </p>
            </div>
            <span className="text-secondary">›</span>
          </div>
        </div>

        <p
          className="text-secondary text-center mt-4 mb-0"
          style={{ fontSize: "11px", fontStyle: "italic" }}
        >
          For urgent medical issues, please contact your doctor or emergency
          services directly.
        </p>
      </div>
    </div>
  );
};

export default HelpSupport;
