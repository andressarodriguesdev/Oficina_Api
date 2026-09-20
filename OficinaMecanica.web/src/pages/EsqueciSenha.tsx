import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";

import {
  redefinirSenha,
  solicitarRecuperacaoSenha,
} from "../services/authService";
import { useToast } from "../components/ui/Toast";
import { Button } from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";

// Mesma regra do login (minLength=6) e da API.
const SENHA_MINIMA = 6;

// Tempo de espera para pedir um novo código (a API também aplica o intervalo).
const INTERVALO_REENVIO_SEGUNDOS = 60;

type Etapa = "email" | "codigo";

const LABEL_CLASSES = `
  mb-2
  block
  text-[0.68rem]
  font-bold
  uppercase
  tracking-[0.16em]
  text-[var(--app-text-muted)]
`;

const ICON_CLASSES = `
  pointer-events-none
  absolute
  left-3
  top-1/2
  h-4
  w-4
  -translate-y-1/2
  text-[var(--input-placeholder)]
`;

export function EsqueciSenha() {
  const navigate = useNavigate();
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();

  const [etapa, setEtapa] = useState<Etapa>("email");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Contagem regressiva para liberar o "Reenviar código"
  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCooldown((segundos) => segundos - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldown]);

  // =========================================================
  // ETAPA 1 — PEDIR O CÓDIGO
  // =========================================================

  const handleSolicitar = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await solicitarRecuperacaoSenha(
        email.trim()
      );

      toast.success(
        response?.mensagem ??
          "Se o e-mail estiver cadastrado, enviaremos um código de recuperação."
      );

      setCode("");
      setNovaSenha("");
      setConfirmarSenha("");
      setCooldown(INTERVALO_REENVIO_SEGUNDOS);
      setEtapa("codigo");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível solicitar a recuperação de senha.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // REENVIAR CÓDIGO
  // =========================================================

  const handleReenviar = async () => {
    if (loading || cooldown > 0) {
      return;
    }

    setLoading(true);

    try {
      const response = await solicitarRecuperacaoSenha(
        email.trim()
      );

      toast.success(
        response?.mensagem ??
          "Se o e-mail estiver cadastrado, enviaremos um código de recuperação."
      );

      setCode("");
      setCooldown(INTERVALO_REENVIO_SEGUNDOS);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível reenviar o código.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ETAPA 2 — CÓDIGO + NOVA SENHA
  // =========================================================

  const handleRedefinir = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (code.length !== 6) {
      toast.error("Digite o código de 6 dígitos.");
      return;
    }

    if (novaSenha.length < SENHA_MINIMA) {
      toast.error(
        `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres.`
      );
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.error("A confirmação não confere com a nova senha.");
      return;
    }

    setLoading(true);

    try {
      await redefinirSenha(email.trim(), code, novaSenha);

      toast.success(
        "Senha redefinida com sucesso! Entre com a nova senha."
      );

      // O login recebe o e-mail e já vem preenchido
      navigate("/login", {
        state: {
          email: email.trim().toLowerCase(),
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível redefinir a senha.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // VOLTAR PARA A ETAPA DO E-MAIL
  // =========================================================

  const handleVoltar = () => {
    setEtapa("email");
    setCode("");
    setNovaSenha("");
    setConfirmarSenha("");
    setLoading(false);
  };

  return (
    <main className="login min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
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
              CABEÇALHO
              ================================================= */}

          {etapa === "email" ? (

            <div className="mb-10">

              <Link
                to="/login"
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
                "
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar ao login
              </Link>

              <div className="mb-5 flex items-center gap-3">

                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--accent-text)]">
                  Recuperação
                </span>

                <span className="h-px w-8 bg-[var(--accent)]/40" />

                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--app-text-faint)]">
                  01
                </span>

              </div>

              <h2 className="font-display text-4xl font-extrabold leading-none tracking-[-0.045em] text-[var(--app-text)]">
                Esqueceu
                <br />
                <span className="text-[var(--app-text-faint)]">
                  a senha?
                </span>
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--app-text-muted)]">
                Informe o e-mail da sua conta e enviaremos um código para
                você criar uma nova senha.
              </p>

            </div>

          ) : (

            <div className="mb-10">

              <button
                type="button"
                onClick={handleVoltar}
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
                Crie uma
                <br />
                <span className="text-[var(--app-text-faint)]">
                  nova senha.
                </span>
              </h2>

              <p className="mt-5 text-sm leading-6 text-[var(--app-text-muted)]">
                Se o e-mail abaixo estiver cadastrado, enviamos um código de
                6 dígitos para ele.
              </p>

              <p className="mt-2 text-sm font-medium text-[var(--app-text-secondary)]">
                {email}
              </p>

            </div>

          )}

          {/* =================================================
              FORMULÁRIOS
              ================================================= */}

          {etapa === "email" ? (

            <form
              onSubmit={handleSolicitar}
              className="space-y-5"
            >

              <div>

                <label htmlFor="email" className={LABEL_CLASSES}>
                  E-mail
                </label>

                <div className="relative">

                  <Mail className={ICON_CLASSES} />

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
                    className="input-base h-12 pl-10"
                  />

                </div>

              </div>

              <Button
                type="submit"
                className="mt-2 w-full"
                loading={loading}
                size="lg"
              >
                Enviar código

                {!loading && (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>

            </form>

          ) : (

            <form
              onSubmit={handleRedefinir}
              className="space-y-5"
            >

              {/* Código */}

              <div>

                <label htmlFor="resetCode" className={LABEL_CLASSES}>
                  Código de verificação
                </label>

                <input
                  id="resetCode"
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
                    setCode(e.target.value.replace(/\D/g, ""));
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

              {/* Nova senha */}

              <div>

                <label htmlFor="novaSenha" className={LABEL_CLASSES}>
                  Nova senha
                </label>

                <div className="relative">

                  <Lock className={ICON_CLASSES} />

                  <input
                    id="novaSenha"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={SENHA_MINIMA}
                    autoComplete="new-password"
                    disabled={loading}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="••••••••"
                    className="input-base h-12 px-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
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

              {/* Confirmar senha */}

              <div>

                <label htmlFor="confirmarSenha" className={LABEL_CLASSES}>
                  Confirmar nova senha
                </label>

                <div className="relative">

                  <Lock className={ICON_CLASSES} />

                  <input
                    id="confirmarSenha"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={SENHA_MINIMA}
                    autoComplete="new-password"
                    disabled={loading}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="••••••••"
                    className="input-base h-12 pl-10"
                  />

                </div>

              </div>

              <Button
                type="submit"
                className="mt-2 w-full"
                loading={loading}
                size="lg"
              >
                Redefinir senha

                {!loading && (
                  <ShieldCheck className="h-4 w-4" />
                )}
              </Button>

              {/* Reenviar */}

              <div className="pt-1 text-center text-[11px] leading-5 text-[var(--app-text-faint)]">

                <p>
                  O código expira em 10 minutos.
                </p>

                <button
                  type="button"
                  onClick={handleReenviar}
                  disabled={loading || cooldown > 0}
                  className="
                    mt-2
                    text-xs
                    font-semibold
                    text-[var(--accent-text)]
                    transition-colors
                    hover:text-[var(--accent-text-hover)]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {cooldown > 0
                    ? `Reenviar código em ${cooldown}s`
                    : "Reenviar código"}
                </button>

              </div>

            </form>

          )}

        </div>

      </section>
    </main>
  );
}
