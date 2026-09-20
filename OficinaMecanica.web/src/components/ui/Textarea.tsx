
import {
  type TextareaHTMLAttributes,
  forwardRef,
} from 'react';

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(
  (
    {
      label,
      error,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const textareaId = id ?? props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="label-base"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={[
            'input-base',
            'min-h-[88px]',
            'resize-y',
            'transition-colors',
            'duration-200',

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

        {error && (
          <p className="mt-1 text-xs font-medium text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
