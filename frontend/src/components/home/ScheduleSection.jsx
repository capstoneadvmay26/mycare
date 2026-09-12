// src/components/home/ScheduleSection.jsx
import { Alarm, Clock, CheckCircle, ChevronRight } from "react-bootstrap-icons";
import { useTheme } from "../../context/ThemeContext";

const SECTION_CONFIG = {
  dueNow: {
    label: "Due Now",
    accent: "#D92D20",
    bg: "rgba(217, 45, 32, 0.06)",
    border: "rgba(217, 45, 32, 0.3)",
    Icon: Alarm,
  },
  upcoming: {
    label: "Upcoming",
    accent: "#F7C81B",
    bg: "rgba(247, 200, 27, 0.06)",
    border: "rgba(247, 200, 27, 0.3)",
    Icon: Clock,
  },
  completed: {
    label: "Completed",
    accent: "#4CBB17",
    bg: "rgba(76, 187, 23, 0.06)",
    border: "rgba(76, 187, 23, 0.3)",
    Icon: CheckCircle,
  },
};

const ScheduleSection = ({ type, doses = [], onSelectDose }) => {
  const { isDark } = useTheme();
  const config = SECTION_CONFIG[type];

  if (!doses.length) return null;

  const { label, accent, bg, border, Icon } = config;

  const formatTime = (time24) => {
    // "08:00" → "8:00am"
    const [hh, mm] = time24.split(":").map(Number);
    const period = hh >= 12 ? "pm" : "am";
    const displayHour = hh % 12 === 0 ? 12 : hh % 12;
    return `${displayHour}:${mm.toString().padStart(2, "0")}${period}`;
  };

  return (
    <div
      className="rounded-3 p-3 mb-3"
      style={{ backgroundColor: bg, border: `1.054px solid ${border}` }}
    >
      <div className="d-flex justify-content-between mb-2">
        <span style={{ fontSize: "16px", color: accent }}>{label}</span>
        <span style={{ fontSize: "12px", color: accent }}>
          {doses.length} {doses.length === 1 ? "medication" : "medications"}
        </span>
      </div>

      {doses.map((dose) => (
        <div
          key={dose.id}
          className="d-flex align-items-center mb-2"
          style={{ cursor: onSelectDose ? "pointer" : "default" }}
          onClick={() => onSelectDose && onSelectDose(dose)}
        >
          <Icon
            size={32}
            className="me-3"
            style={{ color: isDark ? "#FFF" : "#000", flexShrink: 0 }}
          />
          <div className="flex-grow-1">
            <p
              className="m-0 fw-bold"
              style={{ fontSize: "18px", color: isDark ? "#FFF" : "#000" }}
            >
              {dose.name}{" "}
              <span style={{ fontSize: "13px", fontWeight: "400" }}>
                {dose.dosage}
              </span>
            </p>
            <p
              className="m-0"
              style={{ fontSize: "13px", color: isDark ? "#A0A0A0" : "#000" }}
            >
              {formatTime(dose.time)}
            </p>
          </div>
          <ChevronRight
            size={20}
            style={{ color: isDark ? "#FFF" : "#000" }}
          />
        </div>
      ))}
    </div>
  );
};

export default ScheduleSection;