import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  Sun,
  User,
  Wrench,
} from "lucide-react";

import { useToast } from "../components/ui/Toast";
import { Button } from "../components/ui/Button";
import { cadastrarUsuario } from "../services/usuarioService";
import { useTheme } from "../context/ThemeContext";

const WORKSHOP_IMAGE = "/src/public/oficina-login.jpg";

export function Cadastro() {
  const navigate = useNavigate();
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await cadastrarUsuario({
        nome,
        email,
        senha,
      });

      sessionStorage.setItem(
        "emailVerificationToken",
        response.verificationToken,
      );

      toast.success("Enviamos um código de verificação para seu e-mail.");

      navigate("/verificar-email", {
        state: {
          email,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível realizar o cadastro.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        {/* =====================================================
            LADO EDITORIAL
            Este painel permanece visualmente idêntico nos temas.
            ===================================================== */}

        <div className="auth-visual-panel relative hidden overflow-hidden lg:block">
          <img
            src={WORKSHOP_IMAGE}
            alt="Oficina mecânica"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-ink-950/80 via-ink-950/65 to-[#d7ff3f]/15" />

          <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
            {/* Marca */}

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d7ff3f]">
                <Wrench className="h-5 w-5 text-[#101300]" />
              </div>

              <div>
                <p className="font-display text-lg font-extrabold tracking-tight text-white">
                  OficinaMecânica
                </p>

                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/45">
                  Painel administrativo
                </p>
              </div>
            </div>

            {/* Mensagem */}

            <div className="max-w-xl">
              <p className="mb-5 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#d7ff3f]">
                Comece agora
              </p>

              <h1
                className="
                auth-visual-title
                font-display
                text-5xl
                font-extrabold
                leading-[0.96]
                tracking-[-0.05em]
                xl:text-7xl
              "
              >
                Organize sua
                <br />
                <span className="auth-visual-accent">operação.</span>
              </h1>

              <p className="mt-7 max-w-md text-base leading-7 text-white/70">
                Uma gestão mais simples para acompanhar clientes, veículos,
                serviços e resultados da sua oficina.
              </p>

              {/* Mini informações */}

              <div className="mt-10 grid max-w-md grid-cols-2 gap-x-8 border-t border-white/15 pt-6">
                <div>
                  <p className="font-display text-2xl font-bold text-white">
                    01
                  </p>

                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-white/45">
                    Sua conta
                  </p>
                </div>

                <div>
                  <p className="font-display text-2xl font-bold text-white">
                    02
                  </p>

                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-white/45">
                    Sua oficina
                  </p>
                </div>
              </div>
            </div>

            {/* Rodapé */}

            <div className="flex items-center gap-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/40">
              <span>OficinaMecânica</span>

              <span className="h-px w-12 bg-white/20" />

              <span>02 — Cadastro</span>
            </div>
          </div>
        </div>

        {/* =====================================================
            FORMULÁRIO
            ===================================================== */}

        <div className="auth-form-panel flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            {/* Topo / Toggle */}

            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />

                <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--app-text-faint)]">
                  Cadastro
                </span>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                aria-pressed={theme === "light"}
                aria-label={
                  theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
                }
                title={
                  theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
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

            {/* Marca mobile */}

            <div className="mb-12 lg:hidden">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]">
                <Wrench className="h-5 w-5 text-[var(--accent-dark)]" />
              </div>

              <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[var(--accent-text)]">
                OficinaMecânica
              </p>
            </div>

            {/* Cabeçalho */}

            <div className="mb-10">
              <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[var(--app-text-faint)]">
                Novo acesso
              </p>

              <h2 className="font-display text-4xl font-extrabold tracking-[-0.04em] text-[var(--app-text)] sm:text-5xl">
                Crie sua
                <br />
                <span className="text-[var(--app-text-muted)]">conta.</span>
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--app-text-muted)]">
                Seus dados serão usados para criar seu acesso ao painel
                administrativo.
              </p>
            </div>

            <div className="mb-8 h-px bg-[var(--app-border-subtle)]" />

            {/* Formulário */}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome */}

              <div>
                <label
                  htmlFor="nome"
                  className="mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--app-text-muted)]"
                >
                  Nome
                </label>

                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--input-placeholder)]" />

                  <input
                    id="nome"
                    type="text"
                    required
                    autoComplete="name"
                    disabled={loading}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="input-base h-12 pl-10"
                  />
                </div>
              </div>

              {/* E-mail */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--app-text-muted)]"
                >
                  E-mail
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--input-placeholder)]" />

                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="input-base h-12 pl-10"
                  />
                </div>
              </div>

              {/* Senha */}

              <div>
                <label
                  htmlFor="senha"
                  className="mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--app-text-muted)]"
                >
                  Senha
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--input-placeholder)]" />

                  <input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    disabled={loading}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="input-base h-12 px-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    disabled={loading}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
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
                <label
                  htmlFor="confirmarSenha"
                  className="mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--app-text-muted)]"
                >
                  Confirmar senha
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--input-placeholder)]" />

                  <input
                    id="confirmarSenha"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    disabled={loading}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="••••••••"
                    className="input-base h-12 px-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    disabled={loading}
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar confirmação de senha"
                        : "Mostrar confirmação de senha"
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
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botão */}

              <Button
                type="submit"
                className="mt-2 w-full"
                loading={loading}
                size="lg"
              >
                Criar minha conta
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            {/* Login */}

            <div className="mt-10 border-t border-[var(--app-border-subtle)] pt-6 text-center">
              <p className="text-sm text-[var(--app-text-muted)]">
                Já possui uma conta?{" "}
                <Link
                  to="/login"
                  className="
                    font-semibold
                    text-[var(--accent-text)]
                    transition-colors
                    hover:text-[var(--accent-text-hover)]
                  "
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
