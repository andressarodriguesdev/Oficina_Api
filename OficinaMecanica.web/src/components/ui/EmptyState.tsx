
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="
          mb-4
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          bg-[var(--app-surface-raised)]
          text-[var(--app-text-muted)]
        "
      >
        {icon}
      </div>

      <h3
        className="
          font-display
          text-base
          font-bold
          text-[var(--app-text)]
        "
      >
        {title}
      </h3>

      {description && (
        <p
          className="
            mt-1
            max-w-sm
            text-sm
            text-[var(--app-text-muted)]
          "
        >
          {description}
        </p>
      )}

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}

