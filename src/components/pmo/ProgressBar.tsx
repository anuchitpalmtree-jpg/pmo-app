import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  value: number;
  color?: string;
}

export function ProgressBar({ value, color = '#2E86C1' }: ProgressBarProps) {
  const normalizedValue = Math.max(0, Math.min(value, 100));

  return (
    <Progress
      value={normalizedValue}
      style={{ '--progress-color': color } as React.CSSProperties}
      className="flex-nowrap items-center gap-2 [&_[data-slot='progress-indicator']]:bg-[var(--progress-color)] [&_[data-slot='progress-track']]:h-1.5 [&_[data-slot='progress-track']]:flex-1 [&_[data-slot='progress-track']]:bg-[#E4E0D8]"
    >
      <span className="min-w-[36px] font-mono text-xs font-bold text-[#1A2744]">{value}%</span>
    </Progress>
  );
}
