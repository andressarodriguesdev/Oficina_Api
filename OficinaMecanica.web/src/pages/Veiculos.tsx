import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Car, Search, Pencil, Trash2, Eye, User } from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { PageLoader } from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";
import { useCallback } from "react";

import {
  VeiculoForm,
  type VeiculoFormValues,
} from "../components/forms/VeiculoForm";

import {
  listVeiculos,
  createVeiculo,
  updateVeiculo,
  deleteVeiculo,
} from "../services/veiculos";

import { listClientes } from "../services/clientes";

import type { Cliente, Veiculo } from "../types";

export function Veiculos() {
  const toast = useToast();

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editing, setEditing] = useState<Veiculo | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [toDelete, setToDelete] = useState<Veiculo | null>(null);

  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [veiculosResponse, clientesResponse] = await Promise.all([
        listVeiculos(),
        listClientes(),
      ]);

      const veiculosComCliente = veiculosResponse.map((veiculo) => ({
        ...veiculo,
        cliente:
          clientesResponse.find(
            (cliente) => cliente.id === veiculo.clienteId,
          ) ?? null,
      }));

      setVeiculos(veiculosComCliente);
      setClientes(clientesResponse);
    } catch (error) {
      toast.error("Erro ao carregar veículos");

      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return veiculos;

    return veiculos.filter(
      (v) =>
        v.marca.toLowerCase().includes(q) ||
        v.modelo.toLowerCase().includes(q) ||
        v.placa.toLowerCase().includes(q),
    );
  }, [veiculos, search]);

  async function handleSubmit(values: VeiculoFormValues) {
    setSubmitting(true);

    try {
      const payload = {
        clienteId: values.cliente_id,
        marca: values.marca,
        modelo: values.modelo,
        ano: values.ano,
        placa: values.placa,
      };

      if (editing) {
        await updateVeiculo(editing.id, payload);

        toast.success("Veículo atualizado com sucesso");
      } else {
        await createVeiculo(payload);

        toast.success("Veículo cadastrado com sucesso");
      }

      setModalOpen(false);

      setEditing(null);

      await load();
    } catch (error) {
      toast.error(
        editing ? "Erro ao atualizar veículo" : "Erro ao cadastrar veículo",
      );

      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;

    setDeleting(true);

    try {
      await deleteVeiculo(toDelete.id);

      toast.success("Veículo excluído com sucesso");

      setToDelete(null);

      await load();
    } catch (error) {
      toast.error("Erro ao excluir veículo");

      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="
            pointer-events-none
            absolute
            left-3
            top-1/2
            h-4
            w-4
            -translate-y-1/2
            text-ink-400
            "
          />

          <Input
            placeholder="Buscar por marca, modelo ou placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo veículo
        </Button>
      </div>

      {loading ? (
        <PageLoader label="Carregando veículos..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Car className="h-7 w-7" />}
            title="Nenhum veículo cadastrado"
            description="Cadastre o primeiro veículo da oficina."
            action={
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Cadastrar veículo
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v) => (
            <Card key={v.id} hover className="p-5">
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/veiculos/${v.id}`}
                  className="flex items-center gap-3"
                >
                  <div
                    className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-ink-800
                    text-flame-400
                    "
                  >
                    <Car className="h-5 w-5" />
                  </div>

                  <div>
                    <p
                      className="
                    font-display
                    text-sm
                    font-bold
                    text-white
                    "
                    >
                      {v.marca} {v.modelo}
                    </p>

                    <p className="text-xs text-ink-400">
                      {v.ano} · {v.placa}
                    </p>
                  </div>
                </Link>

                <div className="flex gap-1">
                  <Link
                    to={`/veiculos/${v.id}`}
                    className="rounded-lg p-2 text-ink-400 hover:text-sky-400"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>

                  <button
                    onClick={() => {
                      setEditing(v);
                      setModalOpen(true);
                    }}
                    className="rounded-lg p-2 text-ink-400 hover:text-flame-400"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setToDelete(v)}
                    className="rounded-lg p-2 text-ink-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div
                className="
              mt-3
              border-t
              border-ink-700/40
              pt-3
              text-xs
              text-ink-400
              flex
              items-center
              gap-2
              "
              >
                <User className="h-3 w-3" />
                Cliente:
                <span className="truncate"> {v.cliente?.nome ?? '—'}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar veículo" : "Cadastrar veículo"}
        size="lg"
      >
        <VeiculoForm
          initial={editing}
          clientes={clientes}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir veículo"
        message={`Tem certeza que deseja excluir o veículo "${toDelete?.marca} ${toDelete?.modelo}"?`}
      />
    </div>
  );
}
