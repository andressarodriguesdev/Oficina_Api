
import { type FormEvent, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  Wrench,
} from "lucide-react";

import { login, verificarTwoFactor } from "../services/authService";
import { ApiError } from "../services/api";
import { obterMinhaOficina } from "../services/oficinaService";
import { useToast } from "../components/ui/Toast";
import { Button } from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";

const WORKSHOP_IMAGE = "/src/public/oficina-login.jpg";

const STATS = [
  { value: "500+", label: "OS/mês" },
  { value: "98%", label: "Satisfação" },
  { value: "24/7", label: "Disponível" },
];

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();

  // =========================================================
  // E-MAIL VINDO DO CADASTRO
  // =========================================================
  //
  // Quando o cadastro terminar, a tela anterior deve navegar
  // para /login passando:
  //
  // navigate("/login", {
  //   state: {
  //     email: email,
  //   },
  // });
  //
  // Assim o e-mail aparece automaticamente no login.

  const emailFromVerification =
    (location.state as { email?: string } | null)?.email ?? "";

  const [email, setEmail] = useState(emailFromVerification);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);

  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [code, setCode] = useState("");

  // =========================================================
  // FINALIZA LOGIN
  // =========================================================

  const finalizarLogin = async (token: string, nome: string) => {
    localStorage.setItem("accessToken", token);

    toast.success(`Bem-vindo, ${nome}!`);

    try {
      await obterMinhaOficina();

      navigate("/painel");
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        navigate("/criar-oficina");
        return;
      }

      throw error;
    }
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await login(email, password);

      // Login exige 2FA
      if (
        response.requiresTwoFactor &&
        response.twoFactorToken
      ) {
        setTwoFactorToken(response.twoFactorToken);
        setRequiresTwoFactor(true);
        setCode("");

        toast.success(
          "Enviamos um código de verificação para seu e-mail."
        );

        return;
      }

      // Login normal
      if (!response.token || !response.nome) {
        throw new Error(
          "Resposta de autenticação inválida."
        );
      }

      await finalizarLogin(
        response.token,
        response.nome
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "E-mail ou senha inválidos.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // VERIFICAÇÃO 2FA
  // =========================================================

  const handleVerifyTwoFactor = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (code.length !== 6) {
      toast.error(
        "Digite o código de 6 dígitos."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await verificarTwoFactor(
        twoFactorToken,
        code
      );

      if (!response.token || !response.nome) {
        throw new Error(
          "Resposta de autenticação inválida."
        );
      }

      await finalizarLogin(
        response.token,
        response.nome
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível validar o código.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // VOLTAR PARA LOGIN
  // =========================================================

  const handleBackToLogin = () => {
    setRequiresTwoFactor(false);
    setTwoFactorToken("");
    setCode("");
    setLoading(false);
  };

  return (
    <main className="login min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">

        {/* =====================================================
            LADO EDITORIAL
            ===================================================== */}

        <div className="login-visual-panel relative hidden overflow-hidden lg:block">

          <img
            src={WORKSHOP_IMAGE}
            alt="Oficina mecânica"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              brightness-[0.72]
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-ink-950/95
              via-ink-950/75
              to-[#d7ff3f]/10
            "
          />

          <div className="absolute right-0 top-0 h-full w-px bg-white/10" />

          <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d7ff3f]">
                  <Wrench className="h-5 w-5 text-[#101300]" />
                </div>

                <div>
                  <p className="font-display text-sm font-extrabold tracking-tight login-visual-white">
                    OficinaMecânica
                  </p>

                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] login-visual-white-60">
                    Sistema de Gestão
                  </p>
                </div>

              </div>

              <span className="text-[9px] font-semibold uppercase tracking-[0.28em] login-visual-white-45">
                01 — Acesso
              </span>

            </div>

            <div className="max-w-xl">

              <div className="mb-6 flex items-center gap-3">

                <span className="h-px w-10 bg-[#d7ff3f]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.28em] login-visual-accent">
                  Gestão automotiva
                </span>

              </div>

              <h1 className="font-display text-5xl font-extrabold leading-[0.94] tracking-[-0.05em] login-visual-title xl:text-6xl">
                Sua oficina.
                <br />
                <span className="login-visual-title-muted">
                  Mais controle.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-sm leading-7 login-visual-white-80 xl:text-base">
                Gerencie ordens de serviço, clientes e veículos com uma
                experiência criada para deixar sua operação mais simples e
                profissional.
              </p>

              <div className="mt-10 flex max-w-xl border-t border-white/15 pt-6">

                {STATS.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={[
                      "flex-1",
                      index > 0
                        ? "border-l border-white/15 pl-6"
                        : "",
                      index < STATS.length - 1
                        ? "pr-6"
                        : "",
                    ].join(" ")}
                  >

                    <p className="font-display text-2xl font-extrabold tracking-[-0.03em] login-visual-accent">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] login-visual-white-60">
                      {stat.label}
                    </p>

                  </div>
                ))}

              </div>

            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-5">

              <span className="text-[9px] font-medium uppercase tracking-[0.24em] login-visual-white-45">
                Oficina Prime
              </span>

              <span className="text-[9px] login-visual-white-40">
                Seu carro. Nossa precisão.
              </span>

            </div>

          </div>
        </div>

        {/* =====================================================
            LADO DO FORMULÁRIO
            ===================================================== */}

        <section className="login-form-panel relative flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">

          {/* Tema */}

          <div className="absolute right-6 top-6 sm:right-10 sm:top-8">

            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={theme === "light"}
              aria-label={
                theme === "dark"
                  ? "Ativar tema claro"
                  : "Ativar tema escuro"
              }
              title={
                theme === "dark"
                  ? "Ativar tema claro"
                  : "Ativar tema escuro"
              }
              className="theme-toggle group"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

          </div>

          <div className="w-full max-w-[430px]">

            {/* =================================================
                MARCA MOBILE
                ================================================= */}

            <div className="mb-12 lg:hidden">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)]">
                  <Wrench className="h-5 w-5 text-[var(--accent-dark)]" />
                </div>

                <div>

                  <p className="font-display text-lg font-extrabold tracking-tight text-[var(--app-text)]">
                    OficinaMecânica
                  </p>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--app-text-faint)]">
                    Sistema de Gestão
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                CABEÇALHO
                ================================================= */}

            {!requiresTwoFactor ? (

              <div className="mb-10">

                <div className="mb-5 flex items-center gap-3">

                  <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--accent-text)]">
                    Acesso
                  </span>

                  <span className="h-px w-8 bg-[var(--accent)]/40" />

                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--app-text-faint)]">
                    01
                  </span>

                </div>

                <h2 className="font-display text-4xl font-extrabold leading-none tracking-[-0.045em] text-[var(--app-text)]">
                  Bem-vindo
                  <br />
                  <span className="text-[var(--app-text-faint)]">
                    de volta.
                  </span>
                </h2>

                <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--app-text-muted)]">
                  Acesse sua conta para continuar gerenciando sua oficina.
                </p>

              </div>

            ) : (

              <div className="mb-10">

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  disabled={loading}
                  className="
                    mb-8
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-[var(--app-text-muted)]
                    transition-colors
                    hover:text-[var(--accent-text)]
                    disabled:opacity-50
                  "
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar
                </button>

                <div className="mb-5 flex items-center gap-3">

                  <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--accent-text)]">
                    Segurança
                  </span>

                  <span className="h-px w-8 bg-[var(--accent)]/40" />

                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--app-text-faint)]">
                    02
                  </span>

                </div>

                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/[0.06]">
                  <ShieldCheck className="h-5 w-5 text-[var(--accent-text)]" />
                </div>

                <h2 className="font-display text-4xl font-extrabold leading-none tracking-[-0.045em] text-[var(--app-text)]">
                  Confirme
                  <br />
                  <span className="text-[var(--app-text-faint)]">
                    seu acesso.
                  </span>
                </h2>

                <p className="mt-5 text-sm leading-6 text-[var(--app-text-muted)]">
                  Enviamos um código de 6 dígitos para o seu e-mail.
                </p>

                <p className="mt-2 text-sm font-medium text-[var(--app-text-secondary)]">
                  {email}
                </p>

              </div>

            )}

            {/* =================================================
                FORMULÁRIOS
                ================================================= */}

            <div>

              {!requiresTwoFactor ? (

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* E-mail */}

                  <div>

                    <label
                      htmlFor="email"
                      className="
                        mb-2
                        block
                        text-[0.68rem]
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-[var(--app-text-muted)]
                      "
                    >
                      E-mail
                    </label>

                    <div className="relative">

                      <Mail
                        className="
                          pointer-events-none
                          absolute
                          left-3
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-[var(--input-placeholder)]
                        "
                      />

                      <input
                        id="email"
                        type="email"
                        required
                        autoFocus={!email}
                        autoComplete="email"
                        disabled={loading}
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        placeholder="carlos@oficinamecanica.com"
                        className="input-base h-12 pl-10"
                      />

                    </div>

                  </div>

                  {/* Senha */}

                  <div>

                    <label
                      htmlFor="password"
                      className="
                        mb-2
                        block
                        text-[0.68rem]
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-[var(--app-text-muted)]
                      "
                    >
                      Senha
                    </label>

                    <div className="relative">

                      <Lock
                        className="
                          pointer-events-none
                          absolute
                          left-3
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-[var(--input-placeholder)]
                        "
                      />

                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        required
                        minLength={6}
                        autoComplete="current-password"
                        disabled={loading}
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        placeholder="••••••••"
                        className="input-base h-12 px-10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((s) => !s)
                        }
                        disabled={loading}
                        aria-label={
                          showPassword
                            ? "Ocultar senha"
                            : "Mostrar senha"
                        }
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-[var(--input-placeholder)]
                          transition-colors
                          hover:text-[var(--accent-text)]
                          disabled:opacity-50
                        "
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* Opções */}

                  <div className="flex items-center justify-between pt-1">

                    <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--app-text-muted)]">

                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) =>
                          setRememberMe(e.target.checked)
                        }
                        className="h-3.5 w-3.5 accent-[var(--accent)]"
                      />

                      Lembrar-me

                    </label>

                    <Link
                      to="/esqueci-senha"
                      className="
                        text-xs
                        font-semibold
                        text-[var(--accent-text)]
                        transition-colors
                        hover:text-[var(--accent-text-hover)]
                      "
                    >
                      Esqueceu a senha?
                    </Link>

                  </div>

                  {/* Botão */}

                  <Button
                    type="submit"
                    className="mt-2 w-full"
                    loading={loading}
                    size="lg"
                  >
                    Entrar

                    {!loading && (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </Button>

                </form>

              ) : (

                /* =================================================
                   2FA
                   ================================================= */

                <form
                  onSubmit={handleVerifyTwoFactor}
                  className="space-y-5"
                >

                  {/* Código */}

                  <div>

                    <label
                      htmlFor="twoFactorCode"
                      className="
                        mb-2
                        block
                        text-[0.68rem]
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-[var(--app-text-muted)]
                      "
                    >
                      Código de verificação
                    </label>

                    <input
                      id="twoFactorCode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                      disabled={loading}
                      value={code}
                      onChange={(e) => {
                        const value =
                          e.target.value.replace(
                            /\D/g,
                            ""
                          );

                        setCode(value);
                      }}
                      placeholder="000000"
                      className="
                        input-base
                        h-12
                        w-full
                        text-center
                        text-2xl
                        font-bold
                        tracking-[0.4em]
                      "
                    />

                  </div>

                  {/* Botão */}

                  <Button
                    type="submit"
                    className="w-full"
                    loading={loading}
                    size="lg"
                  >
                    Verificar código

                    {!loading && (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Informação */}

                  <p className="pt-1 text-center text-[11px] leading-5 text-[var(--app-text-faint)]">
                    O código expira em 5 minutos.
                    <br />
                    Se você não solicitou esse acesso, ignore este e-mail.
                  </p>

                </form>

              )}

            </div>

            {/* =================================================
                CADASTRO
                ================================================= */}

            {!requiresTwoFactor && (

              <div className="mt-10 border-t border-[var(--app-border-subtle)] pt-6">

                <p className="text-center text-sm text-[var(--app-text-muted)]">
                  Ainda não possui uma conta?{" "}

                  <Link
                    to="/cadastro"
                    className="
                      font-semibold
                      text-[var(--accent-text)]
                      transition-colors
                      hover:text-[var(--accent-text-hover)]
                    "
                  >
                    Criar conta
                  </Link>

                </p>

              </div>

            )}

          </div>

        </section>

      </div>
    </main>
  );
}


