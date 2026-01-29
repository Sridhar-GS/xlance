import React, { useState } from 'react';
import { cn } from '../utils/helpers';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(({ label, error, icon, className, type, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          ref={ref}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 transition-colors duration-200',
            'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
            'placeholder-gray-400 text-gray-900',
            icon && 'pl-10',
            isPassword && 'pr-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-2 animate-in slide-in-from-top-1 fade-in duration-300">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <p className="text-xs font-bold text-red-500 uppercase tracking-wide">{error}</p>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
