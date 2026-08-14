import { type SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="label-base"
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          className={[
            'input-base',
            'w-full',
            'appearance-auto',
            error ? 'border-red-500' : '',
            className ?? '',
          ].join(' ')}
          {...props}
        >
          {children}
        </select>

        {error && (
          <p className="mt-1 text-xs font-medium text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';