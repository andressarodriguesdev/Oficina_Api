
import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="
          absolute
          inset-0
          bg-[var(--overlay)]
          backdrop-blur-sm
          animate-fade-in
        "
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`relative w-full ${sizeClasses[size]} animate-scale-in`}
      >
        <div className="card overflow-hidden">
          {/* Header */}
          {(title || description) && (
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
                border-b
                border-[var(--app-border-subtle)]
                px-6
                py-5
              "
            >
              <div>
                {title && (
                  <h2
                    className="
                      font-display
                      text-lg
                      font-bold
                      text-[var(--app-text)]
                    "
                  >
                    {title}
                  </h2>
                )}

                {description && (
                  <p
                    className="
                      mt-1
                      text-sm
                      text-[var(--app-text-muted)]
                    "
                  >
                    {description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="
                  rounded-lg
                  p-1.5
                  text-[var(--app-text-muted)]
                  transition-all
                  duration-200
                  hover:bg-[var(--app-surface-hover)]
                  hover:text-[var(--app-text)]
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[var(--accent)]/40
                "
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className="
                flex
                items-center
                justify-end
                gap-3
                border-t
                border-[var(--app-border-subtle)]
                bg-[var(--app-surface-raised)]
                px-6
                py-4
              "
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

