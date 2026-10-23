import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium tracking-tight transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-xl';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 h-11',
  };

  const variantStyles = {
    primary:
      'bg-amber-500 hover:bg-amber-400 text-[#101010] shadow-sm shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 focus-visible:ring-amber-500 border border-amber-400/40',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 focus-visible:ring-slate-400',
    glass:
      'bg-white/80 hover:bg-white text-slate-800 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm focus-visible:ring-blue-400',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-sm hover:shadow-md focus-visible:ring-rose-500 border border-rose-500/30',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-white/5 focus-visible:ring-slate-400',
    outline:
      'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 focus-visible:ring-slate-400',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 16} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
        </>
      )}
    </button>
  );
};
