
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { cadastrarUsuario } from '../services/usuarioService';

const WORKSHOP_IMAGE =
  'https://images.pexels.com/photos/4116231/pexels-photo-4116231.jpeg?auto=crop&fit=crop&w=1200&q=80';

export function Cadastro() {
  const navigate = useNavigate();
  const toast = useToast();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      await cadastrarUsuario({
        nome,
        email,
        senha,
      });

      toast.success('Usuário cadastrado com sucesso!');

      navigate('/login');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível realizar o cadastro.';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-ink-950">
      {/* Lado esquerdo */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <img
          src={WORKSHOP_IMAGE}
          alt="Oficina mecânica"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-ink-950/90 via-ink-950/70 to-flame-600/40" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-flame-500 to-flame-600 shadow-glow">
              <Wrench className="h-6 w-6 text-white" />
            </div>

            <div>
              <p className="font-display text-xl font-extrabold text-white">
                OficinaMecânica
              </p>

              <p className="text-xs text-ink-300">
                Painel Administrativo
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="font-display text-4xl font-extrabold leading-tight text-white">
              Sua oficina organizada em{' '}
              <span className="text-flame-400">um só lugar</span>.
            </h2>

            <p className="mt-4 text-lg text-ink-200">
              Crie sua conta e tenha controle completo de clientes, veículos,
              ordens de serviço e faturamento.
            </p>
          </div>

          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} OficinaMecânica. Todos os direitos
            reservados.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md animate-scale-in">
          {/* Logo mobile */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-flame-500 to-flame-600 shadow-glow">
              <Wrench className="h-8 w-8 text-white" />
            </div>

            <h1 className="font-display text-2xl font-extrabold text-white">
              OficinaMecânica
            </h1>

            <p className="mt-1 text-sm text-ink-400">
              Painel Administrativo
            </p>
          </div>

          <div className="card p-8">
            <h2 className="font-display text-xl font-bold text-white">
              Crie sua conta
            </h2>

            <p className="mt-1 text-sm text-ink-400">
              Cadastre seus dados para começar.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Nome */}
              <div>
                <label htmlFor="nome" className="label-base">
                  Nome
                </label>

                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />

                  <input
                    id="nome"
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="input-base pl-9"
                  />
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label htmlFor="email" className="label-base">
                  E-mail
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />

                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="input-base pl-9"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="senha" className="label-base">
                  Senha
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />

                  <input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="input-base px-9"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
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

              {/* Confirmar senha */}
              <div>
                <label htmlFor="confirmarSenha" className="label-base">
                  Confirmar senha
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />

                  <input
                    id="confirmarSenha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="••••••••"
                    className="input-base px-9"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((s) => !s)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                size="lg"
              >
                Criar minha conta
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-400">
              Já possui uma conta?{' '}
              <Link
                to="/login"
                className="font-semibold text-flame-400 transition hover:text-flame-300"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

