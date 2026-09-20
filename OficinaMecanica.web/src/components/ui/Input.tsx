
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="label-base"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={[
            'input-base',
            'appearance-none',
            'transition-all',
            'duration-300',

            error
              ? [
                  'border-red-500',
                  'focus:border-red-500',
                  'focus:ring-2',
                  'focus:ring-red-500/20',
                ].join(' ')
              : '',

            className ?? '',
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />

        {error ? (
          <p className="mt-1 text-xs font-medium text-red-400">
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1 text-xs text-[var(--app-text-muted)]">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

