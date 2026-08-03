import { Badge } from './Badge';
import { statusLabel, statusTone } from '../../utils/status';

export function StatusBadge({ status }: { status: number }) {
  return (
    <Badge tone={statusTone(status)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {statusLabel(status)}
    </Badge>
  );
}
