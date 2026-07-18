import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, ClipboardList } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';

const WORKSHOP_IMAGE =
  'https://images.pexels.com/photos/4116231/pexels-photo-4116231.jpeg?auto=crop&fit=crop&w=1200&q=80';

export function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Sem autenticação por enquanto — apenas redireciona para o painel
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    toast.success('Bem-vindo ao sistema!');
    navigate('/painel');
  };

  return (
    <div className="flex min-h-screen bg-ink-950">
      {/* Lado esquerdo — imagem + frase de impacto */}
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
              <p className="font-display text-xl font-extrabold text-white">OficinaMecânica</p>
              <p className="text-xs text-ink-300">Painel Administrativo</p>
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="font-display text-4xl font-extrabold leading-tight text-white">
              Gerencie sua oficina com{' '}
              <span className="text-flame-400">precisão</span> e{' '}
              <span className="text-flame-400">velocidade</span>.
            </h2>
            <p className="mt-4 text-lg text-ink-200">
              Controle completo de ordens de serviço, clientes, veículos e faturamento em um só lugar.
            </p>

            <div className="mt-8 space-y-3">
              {[
                { icon: ClipboardList, text: 'Ordens de serviço com fluxo de aprovação completo' },
                { icon: Zap, text: 'Envio de orçamentos via WhatsApp em um clique' },
                { icon: ShieldCheck, text: 'Histórico e rastreabilidade de cada OS' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-3 text-sm text-ink-200">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-flame-500/20 text-flame-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    {item.text}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} OficinaMecânica. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Lado direito — formulário de login */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md animate-scale-in">
          {/* Logo mobile */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-flame-500 to-flame-600 shadow-glow">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-white">OficinaMecânica</h1>
            <p className="mt-1 text-sm text-ink-400">Painel Administrativo</p>
          </div>

          <div className="card p-8">
            <h2 className="font-display text-xl font-bold text-white">Bem-vindo de volta</h2>
            <p className="mt-1 text-sm text-ink-400">Acesse o painel de gerenciamento da oficina.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="label-base">E-mail</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@oficina.com"
                    className="input-base pl-9"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label-base">Senha</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-base px-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-300">
                  <input type="checkbox" className="h-4 w-4 accent-flame-500" />
                  Lembrar-me
                </label>
                <button type="button" className="text-sm font-semibold text-flame-400 transition hover:text-flame-300">
                  Esqueceu a senha?
                </button>
              </div>

              <Button type="submit" className="w-full" loading={loading} size="lg">
                Entrar
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-ink-400">
              Sistema de gerenciamento para oficinas mecânicas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
