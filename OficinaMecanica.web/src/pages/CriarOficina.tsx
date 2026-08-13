
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Phone,
  MapPin,
  Building2,
  Image,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { criarOficina } from '../services/oficinaService';

export function CriarOficina() {
  const navigate = useNavigate();
  const toast = useToast();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [logotipo, setLogotipo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      await criarOficina({
        nome,
        telefone,
        endereco,
        logotipo: logotipo || undefined,
      });

      toast.success('Oficina cadastrada com sucesso!');

      navigate('/painel');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível cadastrar a oficina.';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-6 py-10">
      <div className="w-full max-w-lg animate-scale-in">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-flame-500 to-flame-600 shadow-glow">
            <Wrench className="h-8 w-8 text-white" />
          </div>

          <h1 className="font-display text-2xl font-extrabold text-white">
            OficinaMecânica
          </h1>

          <p className="mt-1 text-sm text-ink-400">
            Configure sua oficina para começar
          </p>
        </div>

        {/* Formulário */}
        <div className="card p-8">
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-white">
              Cadastre sua oficina
            </h2>

            <p className="mt-1 text-sm text-ink-400">
              Informe os dados da sua oficina. Você poderá alterá-los depois.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="label-base">
                Nome da oficina
              </label>

              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />

                <input
                  id="nome"
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Oficina Rodrigues"
                  className="input-base pl-9"
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="label-base">
                Telefone
              </label>

              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />

                <input
                  id="telefone"
                  type="tel"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(61) 99999-9999"
                  className="input-base pl-9"
                />
              </div>
            </div>

            {/* Endereço */}
            <div>
              <label htmlFor="endereco" className="label-base">
                Endereço
              </label>

              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-400" />

                <textarea
                  id="endereco"
                  required
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ex.: Rua das Oficinas, 123 - Brasília/DF"
                  rows={3}
                  className="input-base resize-none pl-9"
                />
              </div>
            </div>

            {/* Logotipo */}
            <div>
              <label htmlFor="logotipo" className="label-base">
                Logotipo
                <span className="ml-1 text-ink-500">(opcional)</span>
              </label>

              <div className="relative">
                <Image className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />

                <input
                  id="logotipo"
                  type="url"
                  value={logotipo}
                  onChange={(e) => setLogotipo(e.target.value)}
                  placeholder="https://..."
                  className="input-base pl-9"
                />
              </div>

              <p className="mt-1 text-xs text-ink-500">
                Informe a URL da imagem do logotipo.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              size="lg"
            >
              Cadastrar oficina
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">
          Sistema de gerenciamento para oficinas mecânicas
        </p>
      </div>
    </div>
  );
}

