interface ProgressBarProps {
  value: number;
  targetValue?: number;
  color?: string;
}

export function ProgressBar({ value, targetValue, color = '#2E86C1' }: ProgressBarProps) {
  const normalizedValue = Math.max(0, Math.min(value, 100));
  const normalizedTarget = typeof targetValue === 'number' ? Math.max(0, Math.min(targetValue, 100)) : null;
  const delta = normalizedTarget === null ? null : Math.round((normalizedValue - normalizedTarget) * 100) / 100;
  const deltaText = delta === null ? null : `${delta > 0 ? '+' : ''}${delta}%`;
  const deltaColor = delta === null ? '#7A8699' : delta >= 0 ? '#1A7A42' : '#C93B2E';

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 flex-1 rounded-full bg-[#E4E0D8] overflow-hidden">
        {normalizedTarget !== null && (
          <div
            className="absolute inset-y-0 left-0 bg-[#A9B1BF]"
            style={{ width: `${normalizedTarget}%` }}
            aria-label="target progress"
          />
        )}
        <div
          className="absolute inset-y-0 left-0"
          style={{ width: `${normalizedValue}%`, backgroundColor: color }}
          aria-label="actual progress"
        />
      </div>
      <div className="min-w-[70px] text-right font-mono text-xs font-bold text-[#1A2744]">
        {normalizedValue}%
      </div>
      {deltaText && (
        <div className="min-w-[52px] text-right font-mono text-[11px] font-bold" style={{ color: deltaColor }}>
          {deltaText}
        </div>
      )}
    </div>
  );
}
