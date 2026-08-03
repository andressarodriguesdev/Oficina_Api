import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-flame-500 text-white hover:bg-flame-600 active:bg-flame-600 shadow-[0_4px_14px_-4px_rgba(249,115,22,0.5)]',
  secondary: 'bg-ink-700 text-ink-100 hover:bg-ink-600 border border-ink-600/60',
  ghost: 'text-ink-200 hover:bg-ink-800 hover:text-white',
  danger: 'bg-red-500/90 text-white hover:bg-red-600 active:bg-red-600 shadow-[0_4px_14px_-4px_rgba(239,68,68,0.5)]',
  outline: 'border border-ink-600 text-ink-100 hover:bg-ink-800 hover:border-ink-500',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_4px_14px_-4px_rgba(16,185,129,0.45)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5', md: 'h-10 px-4 text-sm gap-2', lg: 'h-12 px-6 text-base gap-2', icon: 'h-10 w-10',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-flame-500/30 disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant], sizeClasses[size], className ?? '',
      ].join(' ')}
      {...props}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
