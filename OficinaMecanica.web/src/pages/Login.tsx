import { login } from "../services/authService";
import { ApiError } from "../services/api";
import { obterMinhaOficina } from "../services/oficinaService";
import { Link, useNavigate } from "react-router-dom";
import { type FormEvent, useState } from "react";
import {
  Wrench,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";
import { useToast } from "../components/ui/Toast";
import { Button } from "../components/ui/Button";

const WORKSHOP_IMAGE =
  "https://images.pexels.com/photos/4116231/pexels-photo-4116231.jpeg?auto=crop&fit=crop&w=1200&q=80";

const STATS = [
  { value: "500+", label: "OS/mês" },
  { value: "98%", label: "Satisfação" },
  { value: "24/7", label: "Disponível" },
];

function getInitialTheme(): "dark" | "light" {
  const fromDom = document.documentElement.getAttribute("data-theme") as
    | "dark"
    | "light"
    | null;

  if (fromDom) return fromDom;

  const stored = localStorage.getItem("theme") as "dark" | "light" | null;

  return stored ?? "dark";
}

export function Login() {
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // TEMA
  // =====================================================

  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);

    setTheme(nextTheme);
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(email, password);

      localStorage.setItem("accessToken", response.token);

      toast.success(`Bem-vindo, ${response.nome}!`);

      try {
        await obterMinhaOficina();

        // Usuário já possui uma oficina
        navigate("/painel");
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          // Usuário ainda não possui uma oficina
          navigate("/criar-oficina");
          return;
        }

        throw error;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "E-mail ou senha inválidos.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login visual flex min-h-screen bg-ink-950">
      {/* =====================================================
          LADO ESQUERDO — IMAGEM
          ===================================================== */}

      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <img
          src={WORKSHOP_IMAGE}
          alt="Mecânico trabalhando em uma oficina automotiva"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-ink-950/20" />

        <div className="relative flex h-full flex-col justify-end p-12">
          {/* Logo + Nome — agora maior e junto do texto de baixo */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-flame-500 to-flame-600 shadow-glow">
              <Wrench className="h-7 w-7 text-white" />
            </div>

            <div>
              <p className="font-display text-3xl font-extrabold leading-none text-white">
                OficinaMecânica
              </p>

              <p className="mt-1 text-sm text-white/70">
                Sistema de Gestão Automotiva
              </p>
            </div>
          </div>

          {/* Texto + Stats */}
          <div className="max-w-md">
            <p className="text-lg text-white/85">
              Gerencie ordens de serviço, clientes e veículos com eficiência e
              profissionalismo.
            </p>

            <div className="mt-8 flex items-center gap-8">
              {STATS.map((stat, index) => (
                <div key={stat.label} className="flex items-center gap-8">
                  <div>
                    <p className="font-display text-2xl font-extrabold text-flame-400">
                      {stat.value}
                    </p>
                    <p className="text-xs text-white/70">{stat.label}</p>
                  </div>

                  {index < STATS.length - 1 && (
                    <div className="h-8 w-px bg-white/15" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          LADO DIREITO — LOGIN
          ===================================================== */}

      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md animate-scale-in">
          {/* Botão de tema */}
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={theme === "light"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-700/60 bg-ink-900/70 text-ink-300 transition hover:bg-ink-800 hover:text-flame-400"
              title={
                theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
              }
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Logo mobile */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-flame-500 to-flame-600 shadow-glow">
              <Wrench className="h-8 w-8 text-white" />
            </div>

            <h1 className="font-display text-2xl font-extrabold text-white">
              OficinaMecânica
            </h1>

            <p className="mt-1 text-sm text-ink-400">
              Sistema de Gestão Automotiva
            </p>
          </div>

          {/* Card sutil */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            <h2 className="font-display text-xl font-bold text-white">
              Bem-vindo de volta
            </h2>

            <p className="mt-1 text-sm text-ink-400">
              Acesse sua conta para continuar
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Usuário / E-mail */}
              <div>
                <label htmlFor="email" className="label-base">
                  Usuário / Email
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />

                  <input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@oficinamecanica.com"
                    className="input-base pl-9"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="password" className="label-base">
                  Senha
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="current-password"
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-base px-9"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Lembrar / Esqueci senha */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 accent-flame-500"
                  />
                  Lembrar-me
                </label>

                <Link
                  to="/esqueci-senha"
                  className="text-sm font-semibold text-flame-400 transition hover:text-flame-300"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Entrar */}
              <Button
                type="submit"
                className="w-full"
                loading={loading}
                size="lg"
              >
                Entrar
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            {/* Cadastro */}
            <p className="mt-6 text-center text-sm text-ink-400">
              Ainda não possui uma conta?{" "}
              <Link
                to="/cadastro"
                className="font-semibold text-flame-400 transition hover:text-flame-300"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
