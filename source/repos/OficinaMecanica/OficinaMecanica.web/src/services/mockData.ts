import type {
  Cliente,
  Notification,
  OrdemServico,
  Veiculo,
} from '../types';

export const mockClientes: Cliente[] = [
  {
    id: 'c1',
    nome: 'João Silva',
    telefone: '(11) 98765-4321',
    email: 'joao.silva@email.com',
    quantidadeVeiculos: 2,
  },
  {
    id: 'c2',
    nome: 'Maria Oliveira',
    telefone: '(11) 91234-5678',
    email: 'maria.oliveira@email.com',
    quantidadeVeiculos: 1,
  },
  {
    id: 'c3',
    nome: 'Carlos Souza',
    telefone: '(11) 99876-5432',
    email: 'carlos.souza@email.com',
    quantidadeVeiculos: 1,
  },
  {
    id: 'c4',
    nome: 'Ana Santos',
    telefone: '(11) 95555-1234',
    email: 'ana.santos@email.com',
    quantidadeVeiculos: 1,
  },
  {
    id: 'c5',
    nome: 'Roberto Lima',
    telefone: '(11) 94444-9876',
    email: 'roberto.lima@email.com',
    quantidadeVeiculos: 1,
  },
];


export const mockVeiculos: Veiculo[] = [
  {
    id: 'v1',
    clienteId: 'c1',
    modelo: 'Corolla',
    marca: 'Toyota',
    ano: '2022',
    placa: 'ABC-1234',
  },
  {
    id: 'v2',
    clienteId: 'c1',
    modelo: 'Civic',
    marca: 'Honda',
    ano: '2021',
    placa: 'DEF-5678',
  },
  {
    id: 'v3',
    clienteId: 'c2',
    modelo: 'Onix',
    marca: 'Chevrolet',
    ano: '2023',
    placa: 'GHI-9012',
  },
  {
    id: 'v4',
    clienteId: 'c3',
    modelo: 'HB20',
    marca: 'Hyundai',
    ano: '2020',
    placa: 'JKL-3456',
  },
  {
    id: 'v5',
    clienteId: 'c4',
    modelo: 'Pulse',
    marca: 'Fiat',
    ano: '2024',
    placa: 'MNO-7890',
  },
  {
    id: 'v6',
    clienteId: 'c5',
    modelo: 'Tracker',
    marca: 'Chevrolet',
    ano: '2023',
    placa: 'PQR-1234',
  },
];


export const mockOrdens: OrdemServico[] = [
  {
    id: 'os1',
    numero: 'OS-2025-001',
    clienteId: 'c1',
    veiculoId: 'v1',
    descricao: 'Troca de óleo e filtros',
    valorMaoObra: 150,
    itens: [
      {
        id: 'i1',
        descricao: 'Óleo motor 5W30',
        quantidade: 4,
        valorUnitario: 35,
      },
      {
        id: 'i2',
        descricao: 'Filtro de óleo',
        quantidade: 1,
        valorUnitario: 45,
      },
    ],
    status: 'concluida',
    data: '2025-07-01',
    timeline: [
      {
        id: 't1',
        status: 'aberta',
        label: 'OS Criada',
        timestamp: '2025-07-01 08:00',
        user: 'Sistema',
      },
      {
        id: 't2',
        status: 'aguardando_aprovacao',
        label: 'Enviada para aprovação',
        timestamp: '2025-07-01 09:30',
        user: 'Mecânico Carlos',
      },
      {
        id: 't3',
        status: 'aprovada',
        label: 'Aprovada pelo cliente',
        timestamp: '2025-07-01 11:00',
        user: 'Cliente',
      },
      {
        id: 't4',
        status: 'concluida',
        label: 'Serviço concluído',
        timestamp: '2025-07-01 15:00',
        user: 'Mecânico Carlos',
      },
    ],
  },
];


export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Nova aprovação pendente',
    message: 'OS-2025-002 aguarda aprovação do cliente',
    time: 'há 10 min',
    read: false,
    type: 'warning',
  },
  {
    id: 'n2',
    title: 'Serviço concluído',
    message: 'OS-2025-001 foi finalizada com sucesso',
    time: 'há 2 horas',
    read: false,
    type: 'success',
  },
  {
    id: 'n3',
    title: 'Nova OS criada',
    message: 'OS-2025-003 adicionada ao sistema',
    time: 'há 5 horas',
    read: true,
    type: 'info',
  },
];