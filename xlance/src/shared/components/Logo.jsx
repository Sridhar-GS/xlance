import React, { useState } from 'react';

/**
 * Logo component
 * - tries to render `/logo.png` from project public root
 * - falls back to an inline SVG if the image fails to load
 * Props:
 * - size: 'sm' | 'md' | 'lg' or a pixel number
 * - className: extra classes
 */
const Logo = ({ size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: 24,
    md: 36,
    lg: 48,
  };

  const px = typeof size === 'number' ? size : sizeMap[size] || sizeMap.md;

  // scale text inside SVG proportionally to pixel size for consistent appearance
  const fontSize = Math.round((px / sizeMap.lg) * 48);
  const textY = Math.round((px / sizeMap.lg) * 62);

  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ width: px, height: px }}>
      {!imgError ? (
        // try public root image first (public preferred in production)
        <img
          src="/src/assets/logo.png"
          alt="XLance"
          width={px}
          height={px}
          onError={() => setImgError(true)}
          className="object-contain"
        />
      ) : (
        // fallback inline SVG that matches the XLance style
        <svg viewBox="0 0 100 100" width={px} height={px} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#003d99" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="16" fill="url(#g)" />
          <text x="50" y={textY} fontFamily="Inter, Arial, sans-serif" fontSize={fontSize} fontWeight="700" fill="#fff" textAnchor="middle">X</text>
        </svg>
      )}
    </div>
  );
};

export default Logo;
