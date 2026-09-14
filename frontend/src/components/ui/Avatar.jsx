// src/components/ui/Avatar.jsx
import { useState } from "react";

/**
 * Reusable avatar component.
 * Falls back to a colored letter circle if no image is provided
 * or the image fails to load.
 */
const Avatar = ({
  src = null,
  name = "?",
  size = 48,
  color = "#0033CC",
  fontSize = null,
  border = "none",
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  const computedFontSize = fontSize || Math.round(size * 0.42);

  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    overflow: "hidden",
    flexShrink: 0,
    border,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color,
    color: "#FFF",
    fontWeight: "700",
    fontSize: `${computedFontSize}px`,
    userSelect: "none",
  };

  // Show uploaded image if available and not errored
  if (src && !imageError) {
    return (
      <div style={containerStyle} className={className}>
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
    );
  }

  // Fallback: letter circle
  return (
    <div style={containerStyle} className={className}>
      {initial}
    </div>
  );
};

export default Avatar;