import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Car,  Pencil, Trash2, User, Calendar, Hash } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { VeiculoForm, type VeiculoFormValues } from '../components/forms/VeiculoForm';
import { getVeiculo, updateVeiculo, deleteVeiculo } from '../services/veiculos';
import { listClientes } from '../services/clientes';
import type { Cliente, Veiculo } from '../types';

export function VeiculoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [v, c] = await Promise.all([
            getVeiculo(id),
            listClientes()
          ]);

setVeiculo(v);
setClientes(c);
      } catch (err) { toast.error('Erro ao carregar veículo'); console.error(err); }
      finally { setLoading(false); }
    })();
  }, [id, toast]);

const handleEdit = async (values: VeiculoFormValues) => {
  if (!id) return;

  setSubmitting(true);


  try {
 await updateVeiculo(id, {
  placa: values.placa,
  marca: values.marca,
  modelo: values.modelo,
  ano: values.ano
});

    toast.success('Veículo atualizado com sucesso');

    setEditOpen(false);

    const atualizado = await getVeiculo(id);
    setVeiculo(atualizado);

  } catch (err) {
    toast.error('Erro ao atualizar veículo');
    console.error(err);
  } finally {
    setSubmitting(false);
  }
};

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try { await deleteVeiculo(id); toast.success('Veículo excluído com sucesso'); navigate('/veiculos'); }
    catch (err) { toast.error('Erro ao excluir veículo'); console.error(err); }
    finally { setDeleting(false); }
  };

  if (loading) return <PageLoader label="Carregando veículo..." />;
  if (!veiculo) return <Card><EmptyState icon={<Car className="h-7 w-7" />} title="Veículo não encontrado" action={<Link to="/veiculos"><Button variant="outline"><ArrowLeft className="h-4 w-4" />Voltar</Button></Link>} /></Card>;

  const info = [
    { icon: Hash, label: 'Marca', value: veiculo.marca },
    { icon: Car, label: 'Modelo', value: veiculo.modelo },
    { icon: Calendar, label: 'Ano', value: veiculo.ano ?? '—' },
    { icon: Hash, label: 'Placa', value: veiculo.placa || '—' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link to="/veiculos"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" />Voltar</Button></Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4" />Editar</Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}><Trash2 className="h-4 w-4" />Excluir</Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-700 to-ink-800 text-flame-400"><Car className="h-8 w-8" /></div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold text-white">{veiculo.marca} {veiculo.modelo}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {info.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-2.5 rounded-xl border border-ink-700/50 bg-ink-800/40 px-3.5 py-3">
                    <Icon className="h-4 w-4 shrink-0 text-ink-400" />
                    <div><p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{item.label}</p><p className="text-sm font-semibold text-white">{item.value}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-sky-400"><User className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Cliente proprietário</p>
            {(() => {
                const cliente = clientes.find(
                  (c) => c.id === veiculo.clienteId
                );

                        return cliente ? (
                          <Link
                            to={`/clientes/${cliente.id}`}
                            className="font-display text-lg font-bold text-white transition hover:text-flame-400"
                          >
                            {cliente.nome}
                          </Link>
                        ) : (
                          <p className="font-display text-lg font-bold text-ink-400">
                            Sem proprietário
                          </p>
                        );
                      })()}
        </div>
        </div>
      </Card>

    

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar veículo" description="Atualize os dados do veículo." size="lg">
        <VeiculoForm initial={veiculo} clientes={clientes} onSubmit={handleEdit} onCancel={() => setEditOpen(false)} submitting={submitting} />
      </Modal>
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} loading={deleting} title="Excluir veículo" message={`Tem certeza que deseja excluir o veículo "${veiculo.marca} ${veiculo.modelo}"?`} />
    </div>
  );
}
