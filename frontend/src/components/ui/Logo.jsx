const Logo = ({ height = '40px', className }) => {
  return (
    <div>
      {/* Render Image */}
      <img 
        src="/images/mycare-logo.svg" 
        alt="MyCare" 
        className={className}
        style={{ height, objectFit: 'contain' }} 
        onError={(e) => {
          // If the image isn't found, hide it and show text fallback
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
      {/* Fallback Text Logo if image is missing */}
      <h1 
        className="text-primary fw-bold m-0 d-none"
        style={{ fontSize: '24px' }}
      >
        MyCare
      </h1>
    </div>
  );
};

export default Logo;