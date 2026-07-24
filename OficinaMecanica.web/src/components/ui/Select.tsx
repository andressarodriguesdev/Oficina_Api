import { type SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; error?: string; }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="w-full">
        {label && <label htmlFor={selectId} className="label-base">{label}</label>}
        <select
          ref={ref}
          id={selectId}
          className={['input-base appearance-none bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10', error ? 'border-red-500' : '', className ?? ''].join(' ')}
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")" }}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs font-medium text-red-400">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
