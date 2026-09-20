import { Menu, Search, Bell, Sun, Moon } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  actions?: React.ReactNode;
}

export function Topbar({
  title,
  subtitle,
  onMenuClick,
  actions,
}: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="
        sticky
        top-0
        z-20
        border-b
        border-[var(--topbar-border)]
        bg-[var(--topbar-bg)]
        backdrop-blur-xl
      "
    >
      <div
        className="
          flex
          min-h-[88px]
          items-center
          justify-between
          gap-6
          px-5
          py-5
          lg:px-10
        "
      >
        {/* =====================================================
            ESQUERDA
        ====================================================== */}

        <div className="flex min-w-0 items-center gap-4">

          {/* MENU MOBILE */}

          <button
            type="button"
            onClick={onMenuClick}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              border
              border-[var(--app-border)]
              text-[var(--app-text-muted)]
              transition-colors
              hover:border-[var(--app-border-strong)]
              hover:text-[var(--app-text)]
              lg:hidden
            "
            aria-label="Abrir menu"
          >
            <Menu
              className="h-[18px] w-[18px]"
              strokeWidth={1.7}
            />
          </button>

          {/* CABEÇALHO EDITORIAL */}

          <div className="min-w-0">

            {subtitle && (
              <div className="mb-1.5 flex items-center gap-2">

                <span
                  className="
                    h-px
                    w-4
                    bg-[var(--accent)]
                  "
                />

                <span
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-[var(--app-text-muted)]
                  "
                >
                  {subtitle}
                </span>

              </div>
            )}

            <h1
              className="
                truncate
                font-display
                text-[25px]
                font-semibold
                leading-none
                tracking-[-0.04em]
                text-[var(--app-text)]
                sm:text-[28px]
                lg:text-[32px]
              "
            >
              {title}
            </h1>

          </div>
        </div>

        {/* =====================================================
            DIREITA
        ====================================================== */}

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">

          {actions}

          {/* =================================================
              BUSCA
          ================================================== */}

          <div className="group relative hidden md:block">

            <Search
              className="
                pointer-events-none
                absolute
                left-0
                top-1/2
                h-[16px]
                w-[16px]
                -translate-y-1/2
                text-[var(--app-text-faint)]
                transition-colors
                group-focus-within:text-[var(--accent-text)]
              "
              strokeWidth={1.7}
            />

            <input
              type="text"
              placeholder="Buscar"
              className="
                h-9
                w-44
                border-b
                border-[var(--app-border)]
                bg-transparent
                pl-7
                pr-2
                text-[12px]
                font-medium
                text-[var(--app-text)]
                outline-none
                placeholder:text-[var(--app-text-faint)]
                transition-all
                duration-200
                focus:w-56
                focus:border-[var(--accent-text)]
              "
            />

          </div>

          {/* =================================================
              TEMA
          ================================================== */}

          <button
            type="button"
            onClick={toggleTheme}
            title={
              theme === "dark"
                ? "Mudar para tema claro"
                : "Mudar para tema escuro"
            }
            aria-label={
              theme === "dark"
                ? "Mudar para tema claro"
                : "Mudar para tema escuro"
            }
            className="
              theme-toggle
              flex
              h-9
              w-9
              items-center
              justify-center
            "
          >
            {theme === "dark" ? (
              <Sun
                className="h-[17px] w-[17px]"
                strokeWidth={1.7}
              />
            ) : (
              <Moon
                className="h-[17px] w-[17px]"
                strokeWidth={1.7}
              />
            )}
          </button>

          {/* =================================================
              NOTIFICAÇÕES
          ================================================== */}

          <button
            type="button"
            aria-label="Notificações"
            className="
              relative
              flex
              h-9
              w-9
              items-center
              justify-center
              text-[var(--app-text-muted)]
              transition-colors
              hover:text-[var(--app-text)]
            "
          >
            <Bell
              className="h-[17px] w-[17px]"
              strokeWidth={1.7}
            />

            {/* INDICADOR */}

            <span
              className="
                absolute
                right-[8px]
                top-[7px]
                h-[5px]
                w-[5px]
                rounded-full
                bg-[var(--accent)]
              "
            />

          </button>

        </div>
      </div>
    </header>
  );
}