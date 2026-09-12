// src/components/home/HomeGreeting.jsx
import { useApp } from "../../context/useApp";
import { useProfile } from "../../context/ProfileContext";
import { useTheme } from "../../context/ThemeContext";

const HomeGreeting = () => {
  const { userName } = useApp();
  const { activeProfile } = useProfile();
  const { isDark } = useTheme();

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Display name — prefer active dependent, else user name
  const isDependent = activeProfile && !activeProfile.isSelf;
  const displayName = isDependent
    ? activeProfile.name
    : userName || "there";

  // Format today's date (e.g. "Today, Wed Aug 12")
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="mb-3 mt-2">
      <h1
        className="fw-bold m-0"
        style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
      >
        {greeting}, {displayName}
      </h1>
      <p
        className="m-0"
        style={{ fontSize: "15px", color: isDark ? "#A0A0A0" : "#000" }}
      >
        {isDependent
          ? `Here is ${activeProfile.name}'s health overview for today.`
          : `Today, ${dateLabel}`}
      </p>
    </div>
  );
};

export default HomeGreeting;