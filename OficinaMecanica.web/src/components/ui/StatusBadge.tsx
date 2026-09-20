import { Badge } from "./Badge";
import { statusLabel, statusTone } from "../../utils/status";

interface StatusBadgeProps {
  status: number;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge tone={statusTone(status)}>
      <span
        className="
          h-1.5
          w-1.5
          rounded-full
          bg-current
          opacity-80
        "
        aria-hidden="true"
      />

      {statusLabel(status)}
    </Badge>
  );
}
