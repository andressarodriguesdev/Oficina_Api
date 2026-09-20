import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'outline'
  | 'success';

type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  /*
   * PRIMARY
   * Lime da identidade Oficina Prime.
   *
   * O lime permanece igual nos dois temas.
   * O texto continua escuro porque o contraste
   * do botão é intencional.
   */
  primary:
    'bg-[var(--accent)] !text-[var(--accent-dark)] hover:bg-[var(--accent-hover)]',

  /*
   * SECONDARY
   * Botão discreto.
   *
   * No Dark:
   * texto claro + hover lime.
   *
   * No Light:
   * texto grafite + hover lime.
   */
  secondary:
    'border border-[var(--app-border)] bg-transparent !text-[var(--app-text)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:!text-[var(--accent-dark)]',

  /*
   * GHOST
   *
   * Sem borda e sem fundo.
   * O texto de destaque usa --accent-text,
   * portanto fica lime no Dark e grafite no Light.
   */
  ghost:
    'bg-transparent !text-[var(--app-text-muted)] hover:!text-[var(--accent-text)]',

  /*
   * DANGER
   *
   * Vermelho permanece semântico nos dois temas.
   */
  danger:
    'border border-red-500/30 bg-red-500/10 !text-red-400 hover:border-red-400/40 hover:bg-red-500/15 hover:!text-red-300',

  /*
   * OUTLINE
   *
   * Contorno discreto.
   * O texto acompanha o tema.
   */
  outline:
    'border border-[var(--app-border)] bg-transparent !text-[var(--app-text)] hover:border-[var(--accent)] hover:!text-[var(--accent-text)]',

  /*
   * SUCCESS
   *
   * Verde continua semântico.
   */
  success:
    'border border-[var(--success-border)] bg-[var(--success-bg)] !text-[var(--success-text)] hover:bg-[var(--success-bg-hover)]',
};

const sizeClasses: Record<Size, string> = {
  sm: [
    'min-h-[40px]',
    'px-4',
    'text-xs',
  ].join(' '),

  md: [
    'min-h-[46px]',
    'px-[21px]',
    'text-[0.76rem]',
  ].join(' '),

  lg: [
    'min-h-[52px]',
    'px-6',
    'text-sm',
  ].join(' '),

  icon: [
    'h-10',
    'w-10',
    'px-0',
  ].join(' '),
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          /*
           * Estrutura
           */
          'inline-flex',
          'items-center',
          'justify-center',
          'gap-3',

          /*
           * Linguagem visual
           */
          'rounded-full',

          /*
           * Tipografia
           */
          'font-extrabold',
          'tracking-[0.01em]',

          /*
           * Transição
           */
          'transition-all',
          'duration-[350ms]',
          'ease-[cubic-bezier(0.22,1,0.36,1)]',

          /*
           * Movimento sutil
           */
          'hover:-translate-y-0.5',

          /*
           * Retorno ao clicar
           */
          'active:translate-y-0',

          /*
           * Acessibilidade
           */
          'focus:outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-[var(--accent)]/40',

          /*
           * Disabled
           */
          'disabled:pointer-events-none',
          'disabled:cursor-not-allowed',
          'disabled:opacity-50',

          /*
           * Variante
           */
          variantClasses[variant],

          /*
           * Tamanho
           */
          sizeClasses[size],

          /*
           * Classes adicionais
           */
          className ?? '',
        ].join(' ')}
        {...props}
      >
        {loading && (
          <span
            className="
              h-4
              w-4
              animate-spin
              rounded-full
              border-2
              border-current
              border-t-transparent
            "
            aria-hidden="true"
          />
        )}

        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';