

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
  ativo: boolean;
}

export interface Veiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  clienteId: string;
  ativo: boolean;
  cliente?: Cliente | null;

  ordensServico?: {
  ordemServicoId: string;
  valorTotal: number;
  statusAtual: number;
  dataCriacao: string;
  dataConclusao?: string | null;
}[];
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
  mecanicoId: string;
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
  ativo: boolean;
}

export interface ClienteDetalhado {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  ativo: boolean;
  veiculos: VeiculoResumo[];
}


export interface Mecanico {
  id: string;
  nome: string;
  telefone?: string;
  especialidade?: string;
  ativo: boolean;
  oficinaId: string;
  oficina?: OficinaResumo;

  quantidadeOrdensServico: number;
  quantidadeConcluidas: number;
  quantidadeCanceladas: number;
  totalMaoObra: number;

  ordensServico: MecanicoOrdemServicoResumo[];
}

export interface MecanicoOrdemServicoResumo {
  ordemServicoId: string;
  clienteNome: string;
  veiculo: string;
  valorMaoObra: number;
  status: number;
  dataCriacao: string;
  dataConclusao?: string | null;
}

export interface ProdutividadeMecanico {
  mecanicoId: string;
  nome: string;
  quantidadeOrdens: number;
  quantidadeConcluidas: number;
  totalMaoObra: number;
  ticketMedio: number;
}

export interface OficinaResumo {
  id: string;
  nome: string;
  telefone?: string;
  endereco?: string;
  logotipo?: string;
}

export interface ClienteHistorico {
  ordemServicoId: string;
  valorTotal: number;
  statusAtual: number;
  dataCriacao: string;
  historicos: HistoricoOrdemServico[];
}

