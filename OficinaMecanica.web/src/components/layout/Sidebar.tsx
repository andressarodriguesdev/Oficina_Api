import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Car,
  ClipboardList,
  DollarSignIcon,
  Settings,
  X,
  Building2,
  LogOut,
  WrenchIcon,
  Package,
} from "lucide-react";

const navItems = [
  {
    to: "/painel",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/clientes",
    label: "Clientes",
    icon: Users,
  },
  {
    to: "/veiculos",
    label: "Veículos",
    icon: Car,
  },
  {
    to: "/ordens-servico",
    label: "Ordens de Serviço",
    icon: ClipboardList,
  },
  {
    to: "/mecanicos",
    label: "Mecânicos",
    icon: WrenchIcon,
  },
  {
    to: "/pecas",
    label: "Peças",
    icon: Package,
  },
  {
    to: "/financeiro",
    label: "Finanças",
    icon: DollarSignIcon,
  },
];

const oficinaItem = {
  to: "/configuracoes/oficina",
  label: "Dados da oficina",
  icon: Building2,
};

const settingsItem = {
  to: "/configuracoes",
  label: "Configurações",
  icon: Settings,
};

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    onClose();
    navigate("/login");
  };

  return (
    <>
      {/* =====================================================
          OVERLAY MOBILE
      ====================================================== */}

      {open && (
        <div
          className="
            fixed
            inset-0
            z-30
            bg-black/50
            backdrop-blur-sm
            lg:hidden
          "
          onClick={onClose}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col",
          "border-r border-[var(--sidebar-border)]",
          "bg-[var(--sidebar-bg)]",
          "transition-transform duration-300",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* =====================================================
            BRAND
        ====================================================== */}

        <div
          className="
            border-b
            border-[var(--sidebar-border)]
            px-7
            pb-7
            pt-7
          "
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-px w-5 bg-[var(--accent)]" />

                <span
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.24em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Gestão automotiva
                </span>
              </div>

              <div className="mt-4">
                <p
                  className="
                    font-display
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.3em]
                    text-[var(--app-text-muted)]
                  "
                >
                  Oficina
                </p>

                <p
                  className="
                    font-display
                    text-[27px]
                    font-bold
                    leading-none
                    tracking-[-0.04em]
                    text-[var(--app-text)]
                  "
                >
                  Prime
                </p>
              </div>
            </div>

            {/* FECHAR MOBILE */}

            <button
              type="button"
              onClick={onClose}
              className="
                mt-1
                p-1.5
                text-[var(--app-text-muted)]
                transition
                hover:text-[var(--app-text)]
                lg:hidden
              "
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* =====================================================
            NAVEGAÇÃO
        ====================================================== */}

        <nav className="flex-1 overflow-y-auto px-5 py-7">
          <div className="mb-4 px-2">
            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-[var(--app-text-faint)]
              "
            >
              Operação
            </span>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      "group relative flex items-center gap-3",
                      "border-b border-[var(--app-border-subtle)]",
                      "px-2 py-3",
                      "text-[13px] font-medium",
                      "transition-all duration-200",

                      isActive
                        ? "text-[var(--app-text)]"
                        : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* INDICADOR ATIVO */}

                      <span
                        className={[
                          "absolute -left-5 top-0 h-full w-[2px]",
                          "origin-center transition-transform duration-300",

                          isActive
                            ? "scale-y-100 bg-[var(--accent)]"
                            : "scale-y-0 bg-[var(--accent)] group-hover:scale-y-50",
                        ].join(" ")}
                      />

                      {/* ÍCONE */}

                      <Icon
                        className={[
                          "h-[17px] w-[17px] shrink-0 transition-colors",

                          isActive
                            ? "text-[var(--accent-text)]"
                            : "text-[var(--app-text-faint)] group-hover:text-[var(--app-text-secondary)]",
                        ].join(" ")}
                        strokeWidth={1.7}
                      />

                      {/* LABEL */}

                      <span className="flex-1">{item.label}</span>

                      {/* PONTO ATIVO */}

                      {isActive && (
                        <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* ===================================================
              SISTEMA
          ==================================================== */}

          <div className="mb-4 mt-10 px-2">
            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-[var(--app-text-faint)]
              "
            >
              Sistema
            </span>
          </div>

          <NavLink
            to={settingsItem.to}
            onClick={onClose}
            className={({ isActive }) =>
              [
                "group relative flex items-center gap-3",
                "border-b border-[var(--app-border-subtle)]",
                "px-2 py-3",
                "text-[13px] font-medium",
                "transition-all duration-200",

                isActive
                  ? "text-[var(--app-text)]"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]",
              ].join(" ")
            }
          >
            {({ isActive }) => {
              const Icon = settingsItem.icon;

              return (
                <>
                  {/* INDICADOR */}

                  <span
                    className={[
                      "absolute -left-5 top-0 h-full w-[2px]",
                      "transition-transform duration-300",

                      isActive
                        ? "scale-y-100 bg-[var(--accent)]"
                        : "scale-y-0 bg-[var(--accent)] group-hover:scale-y-50",
                    ].join(" ")}
                  />

                  {/* ÍCONE */}

                  <Icon
                    className={[
                      "h-[17px] w-[17px] transition-colors",

                      isActive
                        ? "text-[var(--accent-text)]"
                        : "text-[var(--app-text-faint)] group-hover:text-[var(--app-text-secondary)]",
                    ].join(" ")}
                    strokeWidth={1.7}
                  />

                  <span>{settingsItem.label}</span>
                </>
              );
            }}
          </NavLink>

          <NavLink
            to={oficinaItem.to}
            onClick={onClose}
            className={({ isActive }) =>
              [
                "group relative flex items-center gap-3",
                "border-b border-[var(--app-border-subtle)]",
                "px-2 py-3",
                "text-[13px] font-medium",
                "transition-all duration-200",
                isActive
                  ? "text-[var(--app-text)]"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]",
              ].join(" ")
            }
          >
            {({ isActive }) => {
              const Icon = oficinaItem.icon;

              return (
                <>
                  <span
                    className={[
                      "absolute -left-5 top-0 h-full w-[2px]",
                      "transition-transform duration-300",
                      isActive
                        ? "scale-y-100 bg-[var(--accent)]"
                        : "scale-y-0 bg-[var(--accent)] group-hover:scale-y-50",
                    ].join(" ")}
                  />

                  <Icon
                    className={[
                      "h-[17px] w-[17px] transition-colors",
                      isActive
                        ? "text-[var(--accent-text)]"
                        : "text-[var(--app-text-faint)] group-hover:text-[var(--app-text-secondary)]",
                    ].join(" ")}
                    strokeWidth={1.7}
                  />

                  <span>{oficinaItem.label}</span>
                </>
              );
            }}
          </NavLink>
        </nav>

        {/* =====================================================
            CONTA
        ====================================================== */}

        <div
          className="
            border-t
            border-[var(--sidebar-border)]
            px-5
            py-5
          "
        >
          <div className="flex items-center gap-3 px-2">
            {/* AVATAR */}

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                border
                border-[var(--app-border)]
                bg-[var(--hover-bg-soft)]
              "
            >
              <span
                className="
                  text-[11px]
                  font-semibold
                  tracking-wide
                  text-[var(--app-text-secondary)]
                "
              >
                AD
              </span>
            </div>

            {/* USUÁRIO */}

            <div className="min-w-0 flex-1">
              <p
                className="
                  truncate
                  text-[12px]
                  font-semibold
                  text-[var(--app-text)]
                "
              >
                Administrador
              </p>

              <p
                className="
                  mt-0.5
                  truncate
                  text-[10px]
                  text-[var(--app-text-faint)]
                "
              >
                admin@oficina.com
              </p>
            </div>
          </div>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            className="
              group
              mt-5
              flex
              w-full
              items-center
              gap-3
              border-t
              border-[var(--app-border-subtle)]
              px-2
              pt-4
              text-[12px]
              font-medium
              text-[var(--app-text-faint)]
              transition
              hover:text-red-400
            "
          >
            <LogOut
              className="
                h-4
                w-4
                transition-transform
                group-hover:-translate-x-0.5
              "
              strokeWidth={1.7}
            />

            <span>Sair da conta</span>
          </button>
        </div>
      </aside>
    </>
  );
}
