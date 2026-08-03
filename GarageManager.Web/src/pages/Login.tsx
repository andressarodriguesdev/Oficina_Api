import { type FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wrench, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, ClipboardList } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { useAuth } from '../auth/AuthProvider';
import { ApiError } from '../services/api';

const WORKSHOP_IMAGE =
  'https://images.pexels.com/photos/4116231/pexels-photo-4116231.jpeg?auto=crop&fit=crop&w=1200&q=80';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Whatever the guard turned them away from, or the dashboard.
  const destination = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  useEffect(() => {
    if (user) navigate(destination, { replace: true });
  }, [user, destination, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Welcome to GarageManager!');
      navigate(destination, { replace: true });
    } catch (error) {
      // The API answers 401 for both a wrong password and an unknown email, and it
      // stays that way here: saying which one is wrong tells you which emails exist.
      toast.error(
        error instanceof ApiError && error.status !== 401
          ? error.message
          : 'Those details were not recognised.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-ink-950">
      {/* Left side — image + impact statement */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <img
          src={WORKSHOP_IMAGE}
          alt="Vehicle repair workshop"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950/90 via-ink-950/70 to-flame-600/40" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-flame-500 to-flame-600 shadow-glow">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-display text-xl font-extrabold text-white">GarageManager</p>
              <p className="text-xs text-ink-300">Admin Panel</p>
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="font-display text-4xl font-extrabold leading-tight text-white">
              Run your workshop with{' '}
              <span className="text-flame-400">precision</span> and{' '}
              <span className="text-flame-400">speed</span>.
            </h2>
            <p className="mt-4 text-lg text-ink-200">
              Full control of job cards, customers, vehicles and billing in one place.
            </p>

            <div className="mt-8 space-y-3">
              {[
                { icon: ClipboardList, text: 'Job cards with a full approval workflow' },
                { icon: Zap, text: 'Send quotes via WhatsApp in one click' },
                { icon: ShieldCheck, text: 'History and traceability for every job card' },
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
            © {new Date().getFullYear()} GarageManager. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side — login form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md animate-scale-in">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-flame-500 to-flame-600 shadow-glow">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-white">GarageManager</h1>
            <p className="mt-1 text-sm text-ink-400">Admin Panel</p>
          </div>

          <div className="card p-8">
            <h2 className="font-display text-xl font-bold text-white">Welcome back</h2>
            <p className="mt-1 text-sm text-ink-400">Sign in to the workshop management panel.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="label-base">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@garagemanager.com"
                    className="input-base pl-9"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label-base">Password</label>
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
                  Remember me
                </label>
                <button type="button" className="text-sm font-semibold text-flame-400 transition hover:text-flame-300">
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full" loading={loading} size="lg">
                Sign in
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-ink-400">
              Management system for vehicle repair workshops
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
