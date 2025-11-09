import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div
        role="status"
        aria-label="Loading"
        className="glass-effect flex items-center justify-center w-28 h-28 rounded-xl border border-white/20 shadow-glass"
      >
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-white/30 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin" />
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
