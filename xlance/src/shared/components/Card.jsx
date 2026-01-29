import React from 'react';
import { cn } from '../utils/helpers';

const Card = React.forwardRef(({ variant = 'default', hover = false, className, children, ...props }, ref) => {
  const baseStyles = 'rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200';

  const variantStyles = {
    default: 'border-border',
    flat: 'border-transparent shadow-none bg-secondary/50',
    outline: 'bg-transparent border-dashed',
    interactive: 'cursor-pointer hover:border-primary/50 hover:shadow-md',
  };

  const hoverStyles = hover ? 'hover:shadow-md hover:border-primary/30' : '';

  return (
    <div ref={ref} className={cn(baseStyles, variantStyles[variant], hoverStyles, className)} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
