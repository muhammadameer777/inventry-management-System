import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl transition-all duration-300
        border border-slate-200/90 dark:border-white/[0.08]
        ${
          glass
            ? 'glass-surface'
            : 'bg-white dark:bg-[#141414] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.65)]'
        }
        ${hoverEffect ? 'hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/50' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
