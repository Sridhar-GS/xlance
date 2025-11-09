import React from 'react';
import { cn } from '../../utils/helpers';

const Card = React.forwardRef(({ variant = 'glass', hover = true, className, children, ...props }, ref) => {
  const baseStyles = 'rounded-2xl transition-all duration-300';

  const variantStyles = {
    glass: 'glass-effect',
    solid: 'bg-white shadow-lg',
    outline: 'border-2 border-gray-200 bg-white',
  };

  const hoverStyles = hover ? 'hover:shadow-glass-lg hover:scale-105' : '';

  return (
    <div ref={ref} className={cn(baseStyles, variantStyles[variant], hoverStyles, className)} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
