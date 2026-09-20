import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className, hover, children, ...props }: CardProps) {
  return (
    <div
      className={[
        "card",
        hover ? "transition-all duration-200" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={[
        "flex items-start justify-between gap-4",
        "border-b border-[var(--app-border-subtle)]",
        "px-5 py-4",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div>
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

        {subtitle && (
          <p
            className="
              mt-0.5
              text-sm
              text-[var(--app-text-muted)]
            "
          >
            {subtitle}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}
