import type { OrdemServico, Cliente, Veiculo } from '../types';
import { statusLabel, statusFromNumber } from './status';
import { formatCurrency, formatDate } from './format';

function onlyDigits(s?: string | null): string {
  return (s ?? '').replace(/\D/g, '');
}

export function buildWhatsAppMessage(os: OrdemServico, cliente?: Cliente | null, veiculo?: Veiculo | null): string {
  const L: string[] = [];
  L.push('*ORDEM DE SERVIÇO — OficinaMecanica*');
  L.push('');
  L.push(`*OS Nº:* ${os.id.slice(0, 8).toUpperCase()}`);
  L.push(`*Cliente:* ${cliente?.nome ?? '—'}`);
  L.push(`*Veículo:* ${veiculo ? `${veiculo.marca} ${veiculo.modelo} — ${veiculo.placa ?? ''}` : '—'}`);
  L.push(`*Status:* ${statusLabel(statusFromNumber(os.status))}`);
  L.push(`*Data:* ${formatDate(os.data_criacao)}`);
  L.push('');
  L.push(`*Descrição:* ${os.descricao || '—'}`);
  L.push('');
  L.push(`*Mão de obra:* ${formatCurrency(os.valor_mao_obra)}`);
  if (os.itens && os.itens.length > 0) {
    L.push('*Peças/Serviços:*');
    os.itens.forEach((item, i) => {
      L.push(`${i + 1}. ${item.descricao} — ${item.quantidade}x ${formatCurrency(item.valor_unitario)} = ${formatCurrency(item.valor_total)}`);
    });
  }
  L.push('');
  L.push(`*VALOR TOTAL:* ${formatCurrency(os.valor_total)}`);
  L.push('');
  L.push('Aguarde a aprovação para iniciarmos o serviço. Obrigado!');
  return L.join('\n');
}

export function whatsappUrl(phone: string, message: string): string {
  const digits = onlyDigits(phone);
  const normalized = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
