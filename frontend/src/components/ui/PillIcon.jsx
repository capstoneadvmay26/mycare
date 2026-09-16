// src/components/ui/PillIcon.jsx
const PillIcon = ({ size = 40, color = '#0033CC', bgColor = '#B1C0DB' }) => {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bgColor,
        borderRadius: '8px',
      }}
    >
      {/* Clean Capsule/Pill SVG aligned with Figma mockups */}
      <svg 
        width={size * 0.6} 
        height={size * 0.6} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Capsule body */}
        <rect 
          x="4" 
          y="8" 
          width="16" 
          height="8" 
          rx="4" 
          transform="rotate(-45 12 12)" 
          stroke={color} 
          strokeWidth="2"
        />
        {/* Center line dividing capsule halves */}
        <line 
          x1="9.17" 
          y1="9.17" 
          x2="14.83" 
          y2="14.83" 
          stroke={color} 
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

export default PillIcon;