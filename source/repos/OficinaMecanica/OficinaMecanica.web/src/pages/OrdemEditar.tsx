import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, ClipboardList } from "lucide-react";
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
import type { Cliente, Veiculo, OrdemServicoItem } from "../types";

export function OrdemEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [ordem, setOrdem] = useState<OrdemWithRelations | null>(null);
  const [itens, setItens] = useState<OrdemServicoItem[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [o, c, v] = await Promise.all([
        getOrdem(id),
        listClientes(),
        listVeiculos(),
      ]);

      setOrdem(o);
      setItens(o?.itens ?? []);
      setClientes(c);
      setVeiculos(v);
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
        (s, it) => s + (it.valorTotal || 0),
        0,
      );
      const valorTotal = Number((values.valorMaoObra + totalItens).toFixed(2));
      await updateOrdem(id, {
        clienteId: values.clienteId,
        veiculoId: values.veiculoId,
        descricao: values.descricao,
        valorMaoObra: values.valorMaoObra,
        valorTotal: valorTotal,
        observacao: values.observacao || null,
      });
      toast.success("Ordem de serviço atualizada com sucesso");
      navigate(`/ordens-servico/${id}`);
    } catch (err) {
      toast.error("Erro ao atualizar ordem de serviço");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader label="Carregando ordem de serviço..." />;
  if (!ordem)
    return (
      <Card>
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

  return (
    <div className="space-y-5">
      <Link to={`/ordens-servico/${id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </Link>
      <Card className="p-6">
        <h2 className="mb-1 font-display text-lg font-bold text-white">
          Editar ordem de serviço
        </h2>
        <p className="mb-5 text-sm text-ink-400">
          OS #{ordem.id.slice(0, 8).toUpperCase()}
        </p>
        <OrdemServicoForm
          initial={{
            id: ordem.id,
            clienteId: ordem.clienteId,
            veiculoId: ordem.veiculoId,
            descricao: ordem.descricao,
            valorMaoObra: ordem.valorMaoObra,
            observacao: ordem.observacao ?? "",
            itens: itens.map((it) => ({
              id: it.id,
              descricao: it.descricao,
              quantidade: it.quantidade,
              valorUnitario: it.valorUnitario,
              valorTotal: it.valorTotal,
            })),
          }}
          clientes={clientes}
          veiculos={veiculos}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/ordens-servico/${id}`)}
          submitting={submitting}
        />
      </Card>
    </div>
  );
}
