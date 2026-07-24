import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> { hover?: boolean; }

export function Card({ className, hover, children, ...props }: CardProps) {
  return <div className={['card', hover ? 'transition-all duration-200 hover:border-ink-600 hover:shadow-glow' : '', className ?? ''].join(' ')} {...props}>{children}</div>;
}

export function CardHeader({ title, subtitle, action, className, ...props }: { title: string; subtitle?: string; action?: React.ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['flex items-start justify-between gap-4 border-b border-ink-700/60 px-5 py-4', className ?? ''].join(' ')} {...props}>
      <div>
        <h3 className="font-display text-base font-bold text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
