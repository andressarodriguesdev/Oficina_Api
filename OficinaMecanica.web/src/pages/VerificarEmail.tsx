
import {
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  MailCheck,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useToast } from "../components/ui/Toast";
import { Button } from "../components/ui/Button";
import { verificarEmail } from "../services/usuarioService";

export function VerificarEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [code, setCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [loading, setLoading] = useState(false);

  const inputsRef =
    useRef<Array<HTMLInputElement | null>>([]);

  const email =
    (location.state as { email?: string } | null)?.email ?? "";

  // =====================================================
  // FOCO INICIAL
  // =====================================================

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // =====================================================
  // DIGITAÇÃO DO CÓDIGO
  // =====================================================

  const handleChange = (
    index: number,
    value: string,
  ) => {
    const digit = value
      .replace(/\D/g, "")
      .slice(-1);

    const nextCode = [...code];

    nextCode[index] = digit;

    setCode(nextCode);

    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // =====================================================
  // TECLADO
  // =====================================================

  const handleKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      e.key === "Backspace" &&
      !code[index] &&
      index > 0
    ) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // =====================================================
  // COLAR CÓDIGO
  // =====================================================

  const handlePaste = (
    e: ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) {
      return;
    }

    const nextCode = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    pasted
      .split("")
      .forEach((digit, index) => {
        nextCode[index] = digit;
      });

    setCode(nextCode);

    const nextIndex =
      pasted.length >= 6
        ? 5
        : pasted.length;

    inputsRef.current[nextIndex]?.focus();
  };

  // =====================================================
  // CONFIRMAR E-MAIL
  // =====================================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      toast.error(
        "Digite o código de 6 dígitos.",
      );

      return;
    }

    const verificationToken =
      sessionStorage.getItem(
        "emailVerificationToken",
      );

    if (!verificationToken) {
      toast.error(
        "A sessão de verificação expirou.",
      );

      navigate("/cadastro", {
        replace: true,
      });

      return;
    }

    setLoading(true);

    try {
      await verificarEmail(
        verificationToken,
        fullCode,
      );

      // Remove o token temporário somente depois
      // de a API confirmar o e-mail.
      sessionStorage.removeItem(
        "emailVerificationToken",
      );

      toast.success(
        "E-mail verificado com sucesso!",
      );

      // Vai para o LOGIN
      navigate("/login", {
        replace: true,
        state: {
          email,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível verificar seu e-mail.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-6 py-10">
      <div className="w-full max-w-md animate-scale-in">

        {/* =================================================
            VOLTAR
            ================================================= */}

        <div className="mb-6">
          <Link
            to="/cadastro"
            className="inline-flex items-center gap-2 text-sm text-ink-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o cadastro
          </Link>
        </div>

        {/* =================================================
            CARD
            ================================================= */}

        <div className="card p-8">

          {/* =================================================
              CABEÇALHO
              ================================================= */}

          <div className="flex flex-col items-center text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-flame-500/10 text-flame-400">
              <MailCheck className="h-7 w-7" />
            </div>

            <h1 className="mt-5 font-display text-2xl font-extrabold text-white">
              Confirme seu e-mail
            </h1>

            <p className="mt-2 max-w-sm text-sm leading-6 text-ink-400">
              Enviamos um código de 6 dígitos para
              confirmar seu endereço de e-mail.
            </p>

            <p className="mt-3 break-all text-sm font-semibold text-ink-200">
              {email}
            </p>
          </div>

          {/* =================================================
              FORMULÁRIO
              ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >
            <label
              htmlFor="verification-code-0"
              className="label-base text-center"
            >
              Código de verificação
            </label>

            <div className="mt-3 flex justify-center gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`verification-code-${index}`}
                  ref={(element) => {
                    inputsRef.current[index] =
                      element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={
                    index === 0
                      ? "one-time-code"
                      : "off"
                  }
                  maxLength={1}
                  value={digit}
                  disabled={loading}
                  onChange={(e) =>
                    handleChange(
                      index,
                      e.target.value,
                    )
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(index, e)
                  }
                  onPaste={handlePaste}
                  aria-label={`Dígito ${
                    index + 1
                  } do código`}
                  className="h-14 w-12 rounded-xl border border-ink-700 bg-ink-900 text-center text-xl font-bold text-white outline-none transition focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              ))}
            </div>

            <p className="mt-4 text-center text-xs text-ink-500">
              O código é válido por 5 minutos.
            </p>

            <Button
              type="submit"
              className="mt-6 w-full"
              loading={loading}
              size="lg"
            >
              Confirmar e-mail

              {!loading && (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </form>

          {/* =================================================
              AJUDA
              ================================================= */}

          <div className="mt-6 border-t border-white/[0.06] pt-5 text-center">
            <p className="text-xs leading-5 text-ink-500">
              Não recebeu o código? Verifique a caixa
              de spam ou volte ao cadastro para iniciar
              uma nova verificação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

