export type OSStatus =
  | 'Aberta'
  | 'AguardandoAprovacao'
  | 'Aprovada'
  | 'Recusada'
  | 'Concluida'
  | 'Cancelada'
  | 'Reaberta';

export interface Cliente {
  id: string;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
}

export interface Veiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  clienteId: string;
  cliente?: Cliente | null;
}
export interface OrdemServicoItem {
  id: string;
  ordemServicoId: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface HistoricoOrdemServico {
  id: string;
  ordemServicoId: string;
  statusAnterior: number | null;
  novoStatus: number;
  observacao?: string | null;
  dataAlteracao: string;
}

export interface OrdemServico {
  id: string;
  clienteId: string;
  veiculoId: string;
  descricao: string;
  valorMaoObra: number;
  valorTotal: number;
  status: number;
  dataCriacao: string;
  dataEnvioAprovacao?: string | null;
  dataConclusao?: string | null;
  observacao?: string | null;
  itens?: OrdemServicoItem[];
  historicos?: HistoricoOrdemServico[];
}
export interface VeiculoResumo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
}

export interface ClienteDetalhado {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  veiculos: VeiculoResumo[];
}