import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';

interface TableProps {
  headers: string[];
  children: ReactNode;
  emptyMessage?: string;
  colCount?: number;
}

export function Table({ headers, children, emptyMessage, colCount }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-graphite-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-graphite-800 border-b border-graphite-700">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left px-4 py-3 font-semibold text-graphite-300 uppercase tracking-wide text-xs"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-graphite-800">
          {children}
        </tbody>
      </table>
      {emptyMessage && (
        <div className="text-center py-8 text-graphite-400 text-sm" colSpan={colCount}>
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

export function TableRow({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-graphite-800/50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) {
  return (
    <td className={`px-4 py-3 text-graphite-200 ${className}`} {...props}>
      {children}
    </td>
  );
}

export function TableHeaderCell({ children, className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) {
  return (
    <th className={`px-4 py-3 ${className}`} {...props}>
      {children}
    </th>
  );
}
