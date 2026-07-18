import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  Car,
  ClipboardList,
  Pencil,
  Trash2,
  Plus,
  User,
} from 'lucide-react';

import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { ClienteForm, type ClienteFormValues } from '../components/forms/ClienteForm';

import {
  getCliente,
  updateCliente,
  deleteCliente,
} from '../services/clientes';

import type {
  ClienteDetalhado,
  VeiculoResumo,
  OrdemServico,
} from '../types';

import { initials, formatCurrency } from '../utils/format';

export function ClienteDetalhes() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [cliente, setCliente] = useState<ClienteDetalhado | null>(null)
  const [veiculos, setVeiculos] = useState<VeiculoResumo[]>([])
  const [ordens] = useState<OrdemServico[]>([])

  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return

    ;(async () => {
      try {
        const detalhe = await getCliente(id)

        setCliente(detalhe)
        setVeiculos(detalhe?.veiculos ?? [])
      } catch (err) {
        toast.error('Erro ao carregar cliente')
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id, toast])

  const handleEdit = async (values: ClienteFormValues) => {
    if (!id) return

    setSubmitting(true)

    try {
      await updateCliente(id, values)

      toast.success('Cliente atualizado com sucesso')
      setEditOpen(false)

      const atualizado = await getCliente(id)
      setCliente(atualizado)
      setVeiculos(atualizado?.veiculos ?? [])
    } catch (err) {
      toast.error('Erro ao atualizar cliente')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return

    setDeleting(true)

    try {
      await deleteCliente(id)
      toast.success('Cliente excluído com sucesso')
      navigate('/clientes')
    } catch (err) {
      toast.error('Erro ao excluir cliente')
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <PageLoader label="Carregando cliente..." />
  }

  if (!cliente) {
    return (
      <Card>
        <EmptyState
          icon={<User className="h-7 w-7" />}
          title="Cliente não encontrado"
          action={
            <Link to="/clientes">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          }
        />
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link to="/clientes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Editar
          </Button>

          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-700 to-ink-800 text-xl font-bold text-flame-400">
            {initials(cliente.nome)}
          </div>

          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold text-white">
              {cliente.nome}
            </h2>

            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-ink-300">
                <Phone className="h-4 w-4 text-ink-400" />
                {cliente.telefone || '—'}
              </div>

              <div className="flex items-center gap-2 text-sm text-ink-300">
                <Mail className="h-4 w-4 text-ink-400" />
                {cliente.email || '—'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-flame-400">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Veículos
              </p>
              <p className="font-display text-xl font-bold text-white">
                {veiculos.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-sky-400">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Ordens de Serviço
              </p>
              <p className="font-display text-xl font-bold text-white">
                {ordens.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-emerald-400">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Total em OS
              </p>
              <p className="font-display text-xl font-bold text-white">
                {formatCurrency(0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Veículos do cliente"
          subtitle={`${veiculos.length} veículo(s)`}
        />

        {veiculos.length === 0 ? (
          <EmptyState
            icon={<Car className="h-7 w-7" />}
            title="Nenhum veículo"
            description="Este cliente ainda não possui veículos cadastrados."
            action={
              <Link to="/veiculos">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Cadastrar veículo
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-ink-700/40">
            {veiculos.map((v) => (
              <Link
                key={v.id}
                to={`/veiculos/${v.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-ink-800/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-800 text-ink-300">
                    <Car className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      {v.marca} {v.modelo}
                    </p>
                    <p className="text-xs text-ink-400">
                      {v.placa || '—'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Histórico de Ordens de Serviço"
          subtitle="Em breve"
        />

        <EmptyState
          icon={<ClipboardList className="h-7 w-7" />}
          title="Histórico será implementado"
          description="A próxima etapa será integrar as ordens de serviço do cliente."
        />
      </Card>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar cliente"
        description="Atualize os dados do cliente."
        size="lg"
      >
        <ClienteForm
          initial={cliente}
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir cliente"
        message={`Tem certeza que deseja excluir o cliente "${cliente.nome}"?`}
      />
    </div>
  )
}