import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Users,
  Search,
  Pencil,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Spinner';
import { useToast } from '../components/ui/Toast';

import {
  ClienteForm,
  type ClienteFormValues
} from '../components/forms/ClienteForm';

import {
  listClientes,
  createCliente,
  updateCliente,
  deleteCliente
} from '../services/clientes';

import type { Cliente } from '../types';
import { initials } from '../utils/format';

export function Clientes() {
  const toast = useToast()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [toDelete, setToDelete] = useState<Cliente | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)

    try {
      const data = await listClientes()
      setClientes(data)
    } catch (err) {
      toast.error('Erro ao carregar clientes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return clientes

    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.telefone ?? '').toLowerCase().includes(q)
    )
  }, [clientes, search])

  const handleSubmit = async (values: ClienteFormValues) => {
    setSubmitting(true)

    try {
      if (editing) {
        await updateCliente(editing.id, values)
        toast.success('Cliente atualizado com sucesso')
      } else {
        await createCliente(values)
        toast.success('Cliente cadastrado com sucesso')
      }

      setModalOpen(false)
      setEditing(null)
      await load()
    } catch (err) {
      toast.error(
        editing
          ? 'Erro ao atualizar cliente'
          : 'Erro ao cadastrar cliente'
      )

      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return

    setDeleting(true)

    try {
      await deleteCliente(toDelete.id)
      toast.success('Cliente excluído com sucesso')
      setToDelete(null)
      await load()
    } catch (err) {
      toast.error('Erro ao excluir cliente')
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />

          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          <Plus className="h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      {loading ? (
        <PageLoader label="Carregando clientes..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title={
              search
                ? 'Nenhum cliente encontrado'
                : 'Nenhum cliente cadastrado'
            }
            description={
              search
                ? 'Tente outra busca.'
                : 'Cadastre o primeiro cliente da oficina.'
            }
            action={
              !search && (
                <Button
                  onClick={() => {
                    setEditing(null)
                    setModalOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Cadastrar cliente
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} hover className="p-5">
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/clientes/${c.id}`}
                  className="flex min-w-0 items-center gap-3"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-700 to-ink-800 text-sm font-bold text-flame-400">
                    {initials(c.nome)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold text-white hover:text-flame-400">
                      {c.nome}
                    </p>

                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-400">
                      <Phone className="h-3 w-3" />
                      {c.telefone || '—'}
                    </p>
                  </div>
                </Link>

                <div className="flex shrink-0 gap-1">
                  <Link
                    to={`/clientes/${c.id}`}
                    className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-800 hover:text-sky-400"
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>

                  <button
                    onClick={() => {
                      setEditing(c)
                      setModalOpen(true)
                    }}
                    className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-800 hover:text-flame-400"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setToDelete(c)}
                    className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-800 hover:text-red-400"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 border-t border-ink-700/40 pt-3 text-xs text-ink-400">
                <p className="flex items-center gap-1.5 truncate">
                  <Mail className="h-3 w-3 shrink-0" />
                  {c.email || '—'}
                </p>

                <p className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                  {c.endereco || '—'}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar cliente' : 'Cadastrar cliente'}
        description={
          editing
            ? 'Atualize os dados do cliente.'
            : 'Preencha os dados do novo cliente.'
        }
        size="lg"
      >
        <ClienteForm
          initial={editing}
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
        title="Excluir cliente"
        message={`Tem certeza que deseja excluir o cliente "${toDelete?.nome}"?`}
      />
    </div>
  )
}