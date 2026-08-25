//import React from 'react';

const Logo = ({ height = '40px', className = '' }) => {
  return (
    <img 
      src="/images/mycare-logo.svg" 
      alt="MyCare" 
      className={className}
      style={{ height, objectFit: 'contain' }} 
    />
  );
};

export default Logo;