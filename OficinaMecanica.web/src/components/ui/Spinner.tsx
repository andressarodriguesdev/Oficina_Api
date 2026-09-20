export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={[
        `
          inline-block
          animate-spin
          rounded-full
          border-2
          border-[var(--app-border)]
          border-t-[var(--accent)]
        `,
        className ?? "h-5 w-5",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    />
  );
}

interface PageLoaderProps {
  label?: string;
}

export function PageLoader({ label = "Carregando..." }: PageLoaderProps) {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        py-24
        text-[var(--app-text-muted)]
      "
    >
      <Spinner className="h-8 w-8" />

      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}
