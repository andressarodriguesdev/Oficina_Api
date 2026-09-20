import { type FormEvent, useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  Wrench,
  Phone,
  MapPin,
  Building2,
  Image,
  ArrowRight,
  ArrowLeft,
  FileText,
  Mail,
  Hash,
  Map,
} from 'lucide-react';

import { useToast } from '../components/ui/Toast';

import { Button } from '../components/ui/Button';

import {
  atualizarOficina,
  obterMinhaOficina,
  type OficinaResponse,
} from '../services/oficinaService';

export function EditarOficina() {
  const navigate = useNavigate();
  const toast = useToast();

  const [oficina, setOficina] =
    useState<OficinaResponse | null>(null);

  const [nome, setNome] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] =
    useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [logotipo, setLogotipo] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const carregarOficina = async () => {
      try {
        const dados = await obterMinhaOficina();

        setOficina(dados);
        setNome(dados.nome);
        setRazaoSocial(dados.razaoSocial);
        setCnpj(dados.cnpj);
        setInscricaoEstadual(dados.inscricaoEstadual);
        setTelefone(dados.telefone);
        setEmail(dados.email);
        setCep(dados.cep);
        setLogradouro(dados.logradouro);
        setNumero(dados.numero);
        setComplemento(dados.complemento);
        setBairro(dados.bairro);
        setCidade(dados.cidade);
        setUf(dados.uf);
        setEndereco(dados.endereco);
        setLogotipo(dados.logotipo ?? '');
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os dados da oficina.';

        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    carregarOficina();
  }, [toast]);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!oficina) {
      toast.error(
        'Não foi possível identificar a oficina.',
      );
      return;
    }

    setSaving(true);

    try {
      await atualizarOficina(oficina.id, {
        nome,
        razaoSocial,
        cnpj,
        inscricaoEstadual,
        telefone,
        email,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        endereco,
        logotipo: logotipo || undefined,
      });

      toast.success(
        'Dados da oficina atualizados com sucesso!',
      );

      navigate('/painel');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar a oficina.';

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[var(--app-bg)]
        "
      >
        <div
          className="
            text-sm
            text-[var(--app-text-muted)]
          "
        >
          Carregando dados da oficina...
        </div>
      </div>
    );
  }

  if (!oficina) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[var(--app-bg)]
          px-6
        "
      >
        <div className="card w-full max-w-lg p-8 text-center">
          <h2
            className="
              font-display
              text-xl
              font-bold
              text-[var(--app-text)]
            "
          >
            Oficina não encontrada
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-[var(--app-text-muted)]
            "
          >
            Não foi possível carregar os dados da oficina.
          </p>

          <Button
            type="button"
            className="mt-6 w-full"
            onClick={() => navigate('/painel')}
          >
            Voltar ao painel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen
        bg-[var(--app-bg)]
        px-6
        py-8
      "
    >
      <div className="mx-auto w-full max-w-2xl animate-scale-in">

        {/* VOLTAR */}
        <button
          type="button"
          onClick={() => navigate('/painel')}
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-[var(--app-text-muted)]
            transition
            hover:text-[var(--app-text)]
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao painel
        </button>

        {/* LOGO */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="
              mb-4
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-[var(--accent)]
              shadow-glow
            "
          >
            <Wrench
              className="
                h-8
                w-8
                text-[var(--accent-dark)]
              "
            />
          </div>

          <h1
            className="
              font-display
              text-2xl
              font-extrabold
              text-[var(--app-text)]
            "
          >
            OficinaMecânica
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-[var(--app-text-muted)]
            "
          >
            Atualize os dados da sua oficina
          </p>
        </div>

        {/* FORMULÁRIO */}
        <div className="card p-8">
          <div className="mb-6">
            <h2
              className="
                font-display
                text-xl
                font-bold
                text-[var(--app-text)]
              "
            >
              Editar oficina
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-[var(--app-text-muted)]
              "
            >
              Altere os dados da sua oficina e salve as
              modificações.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* DADOS DA EMPRESA */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Building2
                  className="
                    h-4
                    w-4
                    text-[var(--accent)]
                  "
                />

                <h3
                  className="
                    text-sm
                    font-semibold
                    text-[var(--app-text)]
                  "
                >
                  Dados da oficina
                </h3>
              </div>

              <div className="space-y-4">
                {/* NOME */}
                <div>
                  <label
                    htmlFor="nome"
                    className="label-base"
                  >
                    Nome da oficina
                  </label>

                  <div className="relative">
                    <Building2
                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        text-[var(--app-text-muted)]
                      "
                    />

                    <input
                      id="nome"
                      type="text"
                      required
                      value={nome}
                      onChange={(e) =>
                        setNome(e.target.value)
                      }
                      className="
                        input-base
                        pl-9
                      "
                    />
                  </div>
                </div>

                {/* RAZÃO SOCIAL */}
                <div>
                  <label
                    htmlFor="razaoSocial"
                    className="label-base"
                  >
                    Razão social
                  </label>

                  <div className="relative">
                    <FileText
                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        text-[var(--app-text-muted)]
                      "
                    />

                    <input
                      id="razaoSocial"
                      type="text"
                      required
                      value={razaoSocial}
                      onChange={(e) =>
                        setRazaoSocial(e.target.value)
                      }
                      className="
                        input-base
                        pl-9
                      "
                    />
                  </div>
                </div>

                {/* CNPJ + INSCRIÇÃO ESTADUAL */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="cnpj"
                      className="label-base"
                    >
                      CNPJ
                    </label>

                    <div className="relative">
                      <Hash
                        className="
                          pointer-events-none
                          absolute
                          left-3
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-[var(--app-text-muted)]
                        "
                      />

                      <input
                        id="cnpj"
                        type="text"
                        required
                        value={cnpj}
                        onChange={(e) =>
                          setCnpj(e.target.value)
                        }
                        className="
                          input-base
                          pl-9
                        "
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="inscricaoEstadual"
                      className="label-base"
                    >
                      Inscrição estadual
                    </label>

                    <div className="relative">
                      <Hash
                        className="
                          pointer-events-none
                          absolute
                          left-3
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-[var(--app-text-muted)]
                        "
                      />

                      <input
                        id="inscricaoEstadual"
                        type="text"
                        value={inscricaoEstadual}
                        onChange={(e) =>
                          setInscricaoEstadual(
                            e.target.value,
                          )
                        }
                        placeholder="Opcional"
                        className="
                          input-base
                          pl-9
                        "
                      />
                    </div>
                  </div>
                </div>

                {/* TELEFONE + E-MAIL */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="telefone"
                      className="label-base"
                    >
                      Telefone
                    </label>

                    <div className="relative">
                      <Phone
                        className="
                          pointer-events-none
                          absolute
                          left-3
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-[var(--app-text-muted)]
                        "
                      />

                      <input
                        id="telefone"
                        type="tel"
                        required
                        value={telefone}
                        onChange={(e) =>
                          setTelefone(e.target.value)
                        }
                        className="
                          input-base
                          pl-9
                        "
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="label-base"
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
                          text-[var(--app-text-muted)]
                        "
                      />

                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        className="
                          input-base
                          pl-9
                        "
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ENDEREÇO */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <MapPin
                  className="
                    h-4
                    w-4
                    text-[var(--accent)]
                  "
                />

                <h3
                  className="
                    text-sm
                    font-semibold
                    text-[var(--app-text)]
                  "
                >
                  Endereço
                </h3>
              </div>

              <div className="space-y-4">
                {/* CEP + UF */}
                <div className="grid gap-4 md:grid-cols-[1fr_120px]">
                  <div>
                    <label
                      htmlFor="cep"
                      className="label-base"
                    >
                      CEP
                    </label>

                    <div className="relative">
                      <MapPin
                        className="
                          pointer-events-none
                          absolute
                          left-3
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-[var(--app-text-muted)]
                        "
                      />

                      <input
                        id="cep"
                        type="text"
                        required
                        value={cep}
                        onChange={(e) =>
                          setCep(e.target.value)
                        }
                        className="
                          input-base
                          pl-9
                        "
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="uf"
                      className="label-base"
                    >
                      UF
                    </label>

                    <input
                      id="uf"
                      type="text"
                      required
                      maxLength={2}
                      value={uf}
                      onChange={(e) =>
                        setUf(
                          e.target.value.toUpperCase(),
                        )
                      }
                      className="input-base"
                    />
                  </div>
                </div>

                {/* LOGRADOURO */}
                <div>
                  <label
                    htmlFor="logradouro"
                    className="label-base"
                  >
                    Logradouro
                  </label>

                  <input
                    id="logradouro"
                    type="text"
                    required
                    value={logradouro}
                    onChange={(e) =>
                      setLogradouro(e.target.value)
                    }
                    className="input-base"
                  />
                </div>

                {/* NÚMERO + COMPLEMENTO */}
                <div className="grid gap-4 md:grid-cols-[160px_1fr]">
                  <div>
                    <label
                      htmlFor="numero"
                      className="label-base"
                    >
                      Número
                    </label>

                    <input
                      id="numero"
                      type="text"
                      required
                      value={numero}
                      onChange={(e) =>
                        setNumero(e.target.value)
                      }
                      className="input-base"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="complemento"
                      className="label-base"
                    >
                      Complemento
                    </label>

                    <input
                      id="complemento"
                      type="text"
                      value={complemento}
                      onChange={(e) =>
                        setComplemento(e.target.value)
                      }
                      placeholder="Sala, loja, bloco..."
                      className="input-base"
                    />
                  </div>
                </div>

                {/* BAIRRO + CIDADE */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="bairro"
                      className="label-base"
                    >
                      Bairro
                    </label>

                    <input
                      id="bairro"
                      type="text"
                      required
                      value={bairro}
                      onChange={(e) =>
                        setBairro(e.target.value)
                      }
                      className="input-base"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cidade"
                      className="label-base"
                    >
                      Cidade
                    </label>

                    <input
                      id="cidade"
                      type="text"
                      required
                      value={cidade}
                      onChange={(e) =>
                        setCidade(e.target.value)
                      }
                      className="input-base"
                    />
                  </div>
                </div>

                {/* ENDEREÇO COMPLETO */}
                <div>
                  <label
                    htmlFor="endereco"
                    className="label-base"
                  >
                    Endereço completo
                  </label>

                  <div className="relative">
                    <Map
                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-3
                        h-4
                        w-4
                        text-[var(--app-text-muted)]
                      "
                    />

                    <textarea
                      id="endereco"
                      required
                      value={endereco}
                      onChange={(e) =>
                        setEndereco(e.target.value)
                      }
                      rows={3}
                      className="
                        input-base
                        resize-none
                        pl-9
                      "
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* LOGOTIPO */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Image
                  className="
                    h-4
                    w-4
                    text-[var(--accent)]
                  "
                />

                <h3
                  className="
                    text-sm
                    font-semibold
                    text-[var(--app-text)]
                  "
                >
                  Logotipo
                </h3>

                <span
                  className="
                    text-xs
                    text-[var(--app-text-faint)]
                  "
                >
                  (opcional)
                </span>
              </div>

              <div className="relative">
                <Image
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-[var(--app-text-muted)]
                  "
                />

                <input
                  id="logotipo"
                  type="url"
                  value={logotipo}
                  onChange={(e) =>
                    setLogotipo(e.target.value)
                  }
                  placeholder="https://..."
                  className="
                    input-base
                    pl-9
                  "
                />
              </div>

              <p
                className="
                  mt-1
                  text-xs
                  text-[var(--app-text-faint)]
                "
              >
                Informe a URL da imagem do logotipo.
              </p>
            </div>

            {/* BOTÃO SALVAR */}
            <Button
              type="submit"
              className="w-full"
              loading={saving}
              size="lg"
            >
              Salvar alterações

              {!saving && (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>

        <p
          className="
            mt-6
            text-center
            text-xs
            text-[var(--app-text-faint)]
          "
        >
          Sistema de gerenciamento para oficinas
          mecânicas
        </p>
      </div>
    </div>
  );
}