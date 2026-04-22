import { Badge } from '@/components/ui/badge';
import { STATUS_MAP, PRIORITY_COLORS } from '@/lib/pmo-utils';
import type { ProjectStatus, Priority } from '@/types/pmo';

interface StatusBadgeProps {
  status: ProjectStatus | 'delayed' | 'pending';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = STATUS_MAP[status as keyof typeof STATUS_MAP] ?? STATUS_MAP['planning'];
  return (
    <Badge
      className="h-auto gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: s.dot }} />
      {s.label}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className="font-mono font-black text-xs"
      style={{ color: PRIORITY_COLORS[priority] ?? '#1A2744' }}
    >
      {priority}
    </span>
  );
}
