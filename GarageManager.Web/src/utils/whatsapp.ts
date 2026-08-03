import type { JobCard, Customer, Vehicle } from '../types';
import { statusLabel, statusFromNumber } from './status';
import { formatCurrency, formatDate } from './format';

function onlyDigits(s?: string | null): string {
  return (s ?? '').replace(/\D/g, '');
}

export function buildWhatsAppMessage(jobCard: JobCard, customer?: Customer | null, vehicle?: Vehicle | null): string {
  const L: string[] = [];
  L.push('*JOB CARD — GarageManager*');
  L.push('');
  L.push(`*Job Card No:* ${jobCard.id.slice(0, 8).toUpperCase()}`);
  L.push(`*Customer:* ${customer?.name ?? '—'}`);
  L.push(`*Vehicle:* ${vehicle ? `${vehicle.make} ${vehicle.model} — ${vehicle.registrationNumber ?? ''}` : '—'}`);
  L.push(`*Status:* ${statusLabel(statusFromNumber(jobCard.status))}`);
  L.push(`*Date:* ${formatDate(jobCard.createdAt)}`);
  L.push('');
  L.push(`*Description:* ${jobCard.description || '—'}`);
  L.push('');
  L.push(`*Labour:* ${formatCurrency(jobCard.labourCharge)}`);
  if (jobCard.parts && jobCard.parts.length > 0) {
    L.push('*Parts/Services:*');
    jobCard.parts.forEach((part, i) => {
      const partTotal = part.quantity * part.unitPrice;

      L.push(
        `${i + 1}. ${part.description} — ${part.quantity}x ${formatCurrency(part.unitPrice)} = ${formatCurrency(partTotal)}`
      );
    });
  }
  L.push('');
  L.push(`*TOTAL AMOUNT:* ${formatCurrency(jobCard.totalAmount)}`);
  L.push('');
  L.push('Please wait for approval before we start the work. Thank you!');
  return L.join('\n');
}

export function whatsappUrl(phone: string, message: string): string {
  const digits = onlyDigits(phone);
  const normalized = digits.startsWith('356') ? digits : `356${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
