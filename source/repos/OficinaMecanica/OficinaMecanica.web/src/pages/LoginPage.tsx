import { useState } from 'react';
import { Wrench, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('carlos@oficinamecanica.com');
  const [password, setPassword] = useState('demo1234');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(email, password);
    if (!ok) setError('Credenciais inválidas. Tente novamente.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-graphite-950">
        <div className="absolute inset-0 bg-gradient-to-br from-graphite-900 via-graphite-950 to-black" />
        <img
          src="https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Oficina mecânica"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite-950 via-graphite-950/60 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-accent-500/15 border border-accent-500/25">
              <Wrench size={32} className="text-accent-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">OficinaMecanica</h1>
              <p className="text-sm text-graphite-400">Sistema de Gestão Automotiva</p>
            </div>
          </div>
          <p className="text-graphite-300 text-lg leading-relaxed max-w-md">
            Gerencie ordens de serviço, clientes e veículos com eficiência e profissionalismo.
          </p>
          <div className="flex gap-6 mt-8">
            <div>
              <p className="text-3xl font-bold text-accent-500">500+</p>
              <p className="text-sm text-graphite-400">OS/mês</p>
            </div>
            <div className="w-px bg-graphite-700" />
            <div>
              <p className="text-3xl font-bold text-accent-500">98%</p>
              <p className="text-sm text-graphite-400">Satisfação</p>
            </div>
            <div className="w-px bg-graphite-700" />
            <div>
              <p className="text-3xl font-bold text-accent-500">24/7</p>
              <p className="text-sm text-graphite-400">Disponível</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-graphite-950">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-accent-500/15 border border-accent-500/25">
              <Wrench size={28} className="text-accent-500" />
            </div>
            <h1 className="text-xl font-bold text-graphite-100">OficinaMecanica</h1>
          </div>

          <h2 className="text-2xl font-bold text-graphite-100 mb-1">Bem-vindo de volta</h2>
          <p className="text-graphite-400 mb-8">Acesse sua conta para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-graphite-300 mb-1.5">
                Usuário / Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite-300 mb-1.5">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite-400 hover:text-graphite-200"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-graphite-400 cursor-pointer">
                <input type="checkbox" className="accent-accent-500" /> Lembrar-me
              </label>
              <a href="#" className="text-accent-500 hover:text-accent-400 transition-colors">
                Esqueceu a senha?
              </a>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-graphite-500 mt-8">
            Demo: use qualquer email e senha para entrar
          </p>
        </div>
      </div>
    </div>
  );
}
