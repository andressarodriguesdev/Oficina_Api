export type OSStatus =
| 'aberta'
| 'aguardando_aprovacao'
| 'aprovada'
| 'recusada'
| 'concluida'
| 'cancelada'
| 'reaberta';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mecanico';
  avatar?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  quantidadeVeiculos?: number;
}

export interface Veiculo {
  id: string;
  clienteId: string;
  modelo: string;
  marca: string;
  ano: string;
  placa: string;
}

export interface OSItem {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

export interface OSTimelineEvent {
  id: string;
  status: OSStatus;
  label: string;
  timestamp: string;
  user: string;
}

export interface OrdemServico {
  id: string;
  numero: string;
  clienteId: string;
  veiculoId: string;
  descricao: string;
  valorMaoObra: number;
  itens: OSItem[];
  status: OSStatus;
  data: string;
  timeline: OSTimelineEvent[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}
