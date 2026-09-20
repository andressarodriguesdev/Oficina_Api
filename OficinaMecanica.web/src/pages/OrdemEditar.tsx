
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Pencil,
  Wrench,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageLoader } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import { useToast } from "../components/ui/Toast";

import {
  OrdemServicoForm,
  type OrdemFormValues,
} from "../components/forms/OrdemServicoForm";

import {
  getOrdem,
  updateOrdem,
  type OrdemWithRelations,
} from "../services/ordens";

import { listClientes } from "../services/clientes";
import { listVeiculos } from "../services/veiculos";
import { listMecanico } from "../services/mecanico";

import type {
  Cliente,
  Veiculo,
  OrdemServicoItem,
  Mecanico,
} from "../types";

export function OrdemEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [ordem, setOrdem] =
    useState<OrdemWithRelations | null>(null);

  const [itens, setItens] = useState<OrdemServicoItem[]>([]);
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;

    try {
      const [o, c, v, m] = await Promise.all([
        getOrdem(id),
        listClientes(),
        listVeiculos(),
        listMecanico(),
      ]);

      setOrdem(o);
      setItens(o?.itens ?? []);
      setClientes(c);
      setVeiculos(v);
      setMecanicos(m);
    } catch (err) {
      toast.error("Erro ao carregar ordem de serviço");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (values: OrdemFormValues) => {
    if (!id) return;

    setSubmitting(true);

    try {
      const totalItens = values.itens.reduce(
        (s, i) =>
          s +
          Number(i.quantidade || 0) *
            Number(i.valorUnitario || 0),
        0,
      );

      const valorTotal = Number(
        (values.valorMaoObra + totalItens).toFixed(2),
      );

      await updateOrdem(id, {
        clienteId: values.clienteId,
        veiculoId: values.veiculoId,
        mecanicoId: values.mecanicoId,
        descricao: values.descricao,
        valorMaoObra: values.valorMaoObra,
        valorTotal,
        observacao: values.observacao || null,

        itens: values.itens
          .filter(
            (item) => item.descricao.trim() !== "",
          )
          .map((item) => ({
            id: item.id,
            pecaId: item.pecaId || undefined,
            descricao: item.descricao,
            quantidade: Number(item.quantidade),
            valorUnitario: Number(item.valorUnitario),
            valorTotal: Number(
              (
                Number(item.quantidade) *
                Number(item.valorUnitario)
              ).toFixed(2),
            ),
          })),
      });

      toast.success(
        "Ordem de serviço atualizada com sucesso",
      );

      navigate(`/ordens-servico/${id}`);
    } catch (err) {
      toast.error("Erro ao atualizar ordem de serviço");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageLoader label="Carregando ordem de serviço..." />
    );
  }

  if (!ordem) {
    return (
      <Card className="overflow-hidden">
        <EmptyState
          icon={<ClipboardList className="h-7 w-7" />}
          title="Ordem de serviço não encontrada"
          action={
            <Link to="/ordens-servico">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navegação */}
      <div className="flex items-center justify-between gap-4">
        <Link to={`/ordens-servico/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Voltar para a ordem
          </Button>
        </Link>
      </div>

      {/* Cabeçalho editorial */}
      <section className="border-b border-[var(--app-border-subtle)] pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-text)]">
              <Pencil className="h-3.5 w-3.5" />
              Edição
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--app-text)] sm:text-4xl">
                Ordem de serviço
              </h1>

              <span className="inline-flex items-center rounded-full border border-[var(--app-border)] bg-[var(--app-surface-raised)] px-3 py-1 text-xs font-semibold text-[var(--app-text-secondary)]">
                #{ordem.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-text-muted)]">
              Atualize os dados do atendimento, valores,
              peças utilizadas e responsável técnico.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden h-10 w-px bg-[var(--app-border-subtle)] sm:block" />

            <div className="flex items-center gap-2 text-[var(--app-text-muted)]">
              <Wrench className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-[0.12em]">
                Dados técnicos
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Formulário */}
      <Card className="overflow-hidden">
        <div className="border-b border-[var(--app-border-subtle)] bg-[var(--app-surface-raised)] px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--accent-text)]">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-display text-base font-bold text-[var(--app-text)]">
                Dados da ordem
              </h2>

              <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                Revise as informações antes de salvar as
                alterações.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 lg:p-8">
          <OrdemServicoForm
            initial={{
              id: ordem.id,
              clienteId: ordem.clienteId,
              veiculoId: ordem.veiculoId,
              mecanicoId: ordem.mecanicoId,
              descricao: ordem.descricao,
              valorMaoObra: ordem.valorMaoObra,
              observacao: ordem.observacao ?? "",
              itens: itens.map((it) => ({
                id: it.id,
                pecaId: it.pecaId ?? "",
                descricao: it.descricao,
                quantidade: it.quantidade,
                valorUnitario: it.valorUnitario,
                valorTotal: it.valorTotal,
              })),
            }}
            clientes={clientes}
            veiculos={veiculos}
            mecanico={mecanicos}
            onSubmit={handleSubmit}
            onCancel={() =>
              navigate(`/ordens-servico/${id}`)
            }
            submitting={submitting}
          />
        </div>
      </Card>

      {/* Rodapé informativo */}
      <div className="flex flex-col gap-2 border-t border-[var(--app-border-subtle)] pt-4 text-xs text-[var(--app-text-faint)] sm:flex-row sm:items-center sm:justify-between">
        <span>
          As alterações serão aplicadas à ordem de serviço
          atual.
        </span>

        <span className="font-mono tracking-wide">
          OS / {ordem.id.slice(0, 8).toUpperCase()}
        </span>
      </div>
    </div>
  );
}

