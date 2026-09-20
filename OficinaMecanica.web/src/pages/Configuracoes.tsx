
import { useState } from 'react';
import {
  Save,
  Building2,
  Bell,
  Shield,
  Link2,
  Info,
} from 'lucide-react';

import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

export function Configuracoes() {
  const toast = useToast();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nomeOficina: 'OficinaMecanica',
    telefone: '(11) 99999-9999',
    email: 'contato@oficina.com',
    endereco:
      'Av. Principal, 1000 — São Paulo, SP',
    apiBaseUrl:
      'https://api.oficina.com/api',
    notificacoesEmail: true,
    notificacoesWhatsApp: true,
  });

  const handleSave = async () => {
    setSaving(true);

    await new Promise((r) =>
      setTimeout(r, 600),
    );

    setSaving(false);

    toast.success(
      'Configurações salvas com sucesso',
    );
  };

  return (
    <div className="space-y-5">
      {/* DADOS DA OFICINA */}
      <Card>
        <CardHeader
          title="Dados da oficina"
          subtitle="Informações exibidas no sistema e nos documentos"
          action={
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-[var(--app-surface-raised)]
                text-[var(--accent-text)]
              "
            >
              <Building2
                className="h-5 w-5"
              />
            </div>
          }
        />

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Input
            label="Nome da oficina"
            value={form.nomeOficina}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                nomeOficina: e.target.value,
              }))
            }
          />

          <Input
            label="Telefone"
            value={form.telefone}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                telefone: e.target.value,
              }))
            }
          />

          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                email: e.target.value,
              }))
            }
          />

          <Input
            label="Endereço"
            value={form.endereco}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                endereco: e.target.value,
              }))
            }
          />
        </div>
      </Card>

      {/* INTEGRAÇÃO COM API */}
      <Card>
        <CardHeader
          title="Integração com API"
          subtitle="Configurações de conexão com o backend .NET"
          action={
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-sky-500/10
                text-sky-500
              "
            >
              <Link2 className="h-5 w-5" />
            </div>
          }
        />

        <div className="space-y-4 p-5">
          <Input
            label="URL base da API"
            value={form.apiBaseUrl}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                apiBaseUrl: e.target.value,
              }))
            }
            hint="Ex: https://api.oficina.com/api — as rotas /clientes, /veiculos, /ordens-servico serão consumidas a partir desta URL."
          />

          <div
            className="
              rounded-xl
              border
              border-[var(--app-border-subtle)]
              bg-[var(--app-surface-raised)]
              p-4
            "
          >
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-[var(--app-text-muted)]
              "
            >
              Rotas disponíveis
            </p>

            <div
              className="
                mt-2
                grid
                gap-1.5
                font-mono
                text-xs
                text-[var(--app-text-secondary)]
              "
            >
              <p>
                <span className="text-emerald-500">
                  GET
                </span>{' '}
                /api/clientes
              </p>

              <p>
                <span className="text-emerald-500">
                  POST
                </span>{' '}
                /api/clientes
              </p>

              <p>
                <span className="text-amber-500">
                  PUT
                </span>{' '}
                /api/clientes/{'{id}'}
              </p>

              <p>
                <span className="text-red-500">
                  DELETE
                </span>{' '}
                /api/clientes/{'{id}'}
              </p>

              <p>
                <span className="text-emerald-500">
                  GET
                </span>{' '}
                /api/veiculos
              </p>

              <p>
                <span className="text-emerald-500">
                  POST
                </span>{' '}
                /api/veiculos
              </p>

              <p>
                <span className="text-amber-500">
                  PUT
                </span>{' '}
                /api/veiculos/{'{id}'}
              </p>

              <p>
                <span className="text-red-500">
                  DELETE
                </span>{' '}
                /api/veiculos/{'{id}'}
              </p>

              <p>
                <span className="text-emerald-500">
                  GET
                </span>{' '}
                /api/ordens-servico
              </p>

              <p>
                <span className="text-emerald-500">
                  POST
                </span>{' '}
                /api/ordens-servico
              </p>

              <p>
                <span className="text-amber-500">
                  PUT
                </span>{' '}
                /api/ordens-servico/{'{id}'}
              </p>

              <p>
                <span className="text-red-500">
                  DELETE
                </span>{' '}
                /api/ordens-servico/{'{id}'}
              </p>

              <p>
                <span className="text-emerald-500">
                  POST
                </span>{' '}
                /api/ordens-servico/{'{id}'}/enviar-aprovacao
              </p>

              <p>
                <span className="text-emerald-500">
                  POST
                </span>{' '}
                /api/ordens-servico/{'{id}'}/aprovar
              </p>

              <p>
                <span className="text-emerald-500">
                  POST
                </span>{' '}
                /api/ordens-servico/{'{id}'}/recusar
              </p>

              <p>
                <span className="text-emerald-500">
                  POST
                </span>{' '}
                /api/ordens-servico/{'{id}'}/concluir
              </p>

              <p>
                <span className="text-emerald-500">
                  POST
                </span>{' '}
                /api/ordens-servico/{'{id}'}/cancelar
              </p>

              <p>
                <span className="text-emerald-500">
                  POST
                </span>{' '}
                /api/ordens-servico/{'{id}'}/reabrir
              </p>

              <p>
                <span className="text-emerald-500">
                  GET
                </span>{' '}
                /api/ordens-servico/{'{id}'}/pdf
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* NOTIFICAÇÕES */}
      <Card>
        <CardHeader
          title="Notificações"
          subtitle="Preferências de alertas do sistema"
          action={
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-amber-500/10
                text-amber-500
              "
            >
              <Bell className="h-5 w-5" />
            </div>
          }
        />

        <div className="space-y-3 p-5">
          <label
            className="
              flex
              cursor-pointer
              items-center
              justify-between
              rounded-xl
              border
              border-[var(--app-border-subtle)]
              bg-[var(--app-surface-raised)]
              px-4
              py-3
              transition-colors
              hover:bg-[var(--app-surface-hover)]
            "
          >
            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-[var(--app-text)]
                "
              >
                Notificações por e-mail
              </p>

              <p
                className="
                  text-xs
                  text-[var(--app-text-muted)]
                "
              >
                Receber alertas sobre novas OS e mudanças de status
              </p>
            </div>

            <input
              type="checkbox"
              checked={form.notificacoesEmail}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  notificacoesEmail:
                    e.target.checked,
                }))
              }
              className="
                h-5
                w-5
                accent-[var(--accent)]
              "
            />
          </label>

          <label
            className="
              flex
              cursor-pointer
              items-center
              justify-between
              rounded-xl
              border
              border-[var(--app-border-subtle)]
              bg-[var(--app-surface-raised)]
              px-4
              py-3
              transition-colors
              hover:bg-[var(--app-surface-hover)]
            "
          >
            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-[var(--app-text)]
                "
              >
                Notificações por WhatsApp
              </p>

              <p
                className="
                  text-xs
                  text-[var(--app-text-muted)]
                "
              >
                Enviar automaticamente ao criar/enviar OS
              </p>
            </div>

            <input
              type="checkbox"
              checked={form.notificacoesWhatsApp}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  notificacoesWhatsApp:
                    e.target.checked,
                }))
              }
              className="
                h-5
                w-5
                accent-[var(--accent)]
              "
            />
          </label>
        </div>
      </Card>

      {/* SEGURANÇA */}
      <Card>
        <CardHeader
          title="Segurança"
          subtitle="Preparação para autenticação JWT"
          action={
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-emerald-500/10
                text-emerald-500
              "
            >
              <Shield className="h-5 w-5" />
            </div>
          }
        />

        <div className="p-5">
          <div
            className="
              rounded-xl
              border
              border-[var(--app-border-subtle)]
              bg-[var(--app-surface-raised)]
              p-4
            "
          >
            <div className="flex items-start gap-3">
              <Info
                className="
                  mt-0.5
                  h-5
                  w-5
                  shrink-0
                  text-sky-500
                "
              />

              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-[var(--app-text)]
                  "
                >
                  Autenticação JWT
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[var(--app-text-muted)]
                  "
                >
                  O sistema está preparado para
                  integração futura com autenticação
                  JWT. As chamadas de API já seguem o
                  padrão REST e podem incluir o header
                  <code
                    className="
                      mx-1
                      rounded
                      bg-[var(--app-surface-hover)]
                      px-1.5
                      py-0.5
                      font-mono
                      text-xs
                      text-[var(--accent-text)]
                    "
                  >
                    Authorization: Bearer {'{token}'}
                  </code>
                  quando a autenticação for ativada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* SALVAR */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={saving}
          size="lg"
        >
          <Save className="h-4 w-4" />
          Salvar configurações
        </Button>
      </div>
    </div>
  );
}
