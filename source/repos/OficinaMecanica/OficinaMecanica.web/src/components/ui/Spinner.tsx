export function Spinner({ className }: { className?: string }) {
  return <span className={['inline-block animate-spin rounded-full border-2 border-ink-600 border-t-flame-500', className ?? 'h-5 w-5'].join(' ')} />;
}

export function PageLoader({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-ink-400">
      <Spinner className="h-8 w-8" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}
