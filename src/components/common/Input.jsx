import React from 'react';
import { cn } from '../../utils/helpers';

const Input = React.forwardRef(({ label, error, icon, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 transition-colors duration-200',
            'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
            'placeholder-gray-400 text-gray-900',
            icon && 'pl-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
