import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  trailingIcon: TrailingIcon,
  onTrailingIconClick,
  className = '',
  id,
  type = 'text',
  isTextArea = false,
  rows = 3,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const inputStyles = `
    w-full rounded-xl text-sm transition-all duration-200 outline-none
    bg-white dark:bg-[#161821] 
    text-slate-900 dark:text-slate-100
    border border-slate-200 dark:border-white/10
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    focus:border-blue-500 dark:focus:border-blue-500
    focus:ring-2 focus:ring-blue-500/20
    disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900
    ${Icon ? 'pl-10' : 'pl-3.5'}
    ${TrailingIcon ? 'pr-10' : 'pr-3.5'}
    ${isTextArea ? 'py-2.5' : 'h-10 py-2'}
    ${error ? '!border-rose-500 focus:!ring-rose-500/20' : ''}
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center justify-center">
            <Icon size={16} />
          </div>
        )}

        {isTextArea ? (
          <textarea
            ref={ref}
            id={inputId}
            rows={rows}
            className={inputStyles}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={inputStyles}
            {...props}
          />
        )}

        {TrailingIcon && (
          <button
            type="button"
            onClick={onTrailingIconClick}
            disabled={!onTrailingIconClick}
            className={`absolute right-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 flex items-center justify-center ${
              !onTrailingIconClick ? 'pointer-events-none' : 'cursor-pointer'
            }`}
          >
            <TrailingIcon size={16} />
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
