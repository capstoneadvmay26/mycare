// src/components/ui/MedicationCard.jsx
import { ChevronRight } from "react-bootstrap-icons";

const MedicationCard = ({ medication, onClick }) => {
  // Format scheduleTime array → "8:00 AM" or "7:00 AM, 12:00 PM"
  const timeDisplay = (() => {
    if (!Array.isArray(medication.scheduleTime) || medication.scheduleTime.length === 0) {
      return "No time set";
    }
    return medication.scheduleTime
      .map((t) => {
        const [hh, mm] = t.split(":").map(Number);
        const period = hh >= 12 ? "PM" : "AM";
        const h = hh % 12 === 0 ? 12 : hh % 12;
        return `${h}:${String(mm).padStart(2, "0")} ${period}`;
      })
      .join(", ");
  })();

  // Split dosage into "amount" (e.g. "5mg") and "form" (e.g. "1 tablet")
  const [dosageAmount, dosageForm] = (medication.dosage || "")
    .split(",")
    .map((s) => s.trim());

  return (
    <div
      className="d-flex align-items-center justify-content-between bg-white p-3 mb-2"
      style={{
        border: "1px solid rgba(0, 0, 0, 0.15)",
        borderRadius: "8px",
        cursor: "pointer",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
      onClick={() => onClick && onClick(medication)}
    >
      <div className="d-flex align-items-center">
        {/* Pill icon */}
        <div
          className="d-flex justify-content-center align-items-center me-3"
          style={{
            width: "42px",
            height: "42px",
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #000",
            borderRadius: "8px",
            flexShrink: 0,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.5 20.5L3.5 13.5C1.5 11.5 1.5 8.5 3.5 6.5C5.5 4.5 8.5 4.5 10.5 6.5L17.5 13.5C19.5 15.5 19.5 18.5 17.5 20.5C15.5 22.5 12.5 22.5 10.5 20.5Z"
              stroke="#0033CC"
              strokeWidth="2"
            />
            <path
              d="M6.5 12.5L11.5 17.5"
              stroke="#0033CC"
              strokeWidth="2"
            />
          </svg>
        </div>

        <div>
          <p className="m-0" style={{ fontSize: "16px", color: "#000" }}>
            <span className="fw-bold">{medication.name}</span>{" "}
            {dosageAmount || ""}
          </p>
          <p className="m-0" style={{ fontSize: "13px", color: "#000" }}>
            {dosageForm || ""}
          </p>
        </div>
      </div>

      <div className="d-flex align-items-center">
        <div className="text-end me-2">
          <p className="m-0" style={{ fontSize: "13px", color: "#000" }}>
            {timeDisplay}
          </p>
        </div>
        <ChevronRight size={18} color="#000" />
      </div>
    </div>
  );
};

export default MedicationCard;