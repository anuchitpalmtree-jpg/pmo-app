export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const today = () => new Date().toISOString().split('T')[0];

export const thaiDate = (d: string) => {
  if (!d) return '-';
  const dt = new Date(d);
  return dt.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
};

export const weekNum = () => {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
};

export const STATUS_MAP = {
  'on-track': { label: 'On Track', bg: '#E8F8EE', color: '#1A7A42', dot: '#2D9F5E' },
  'at-risk': { label: 'At Risk', bg: '#FFF3E0', color: '#B87315', dot: '#D48A1A' },
  'critical': { label: 'Critical', bg: '#FDECEB', color: '#A82A1F', dot: '#C93B2E' },
  'completed': { label: 'Completed', bg: '#E3F0FA', color: '#1E6FA6', dot: '#2E86C1' },
  'planning': { label: 'Planning', bg: '#F0E8F5', color: '#6C3D8F', dot: '#8E5BB0' },
} as const;

export const PRIORITY_COLORS = {
  P1: '#C93B2E',
  P2: '#D48A1A',
  P3: '#2E86C1',
} as const;

export const LEVEL_COLORS = {
  high: { bg: '#FDECEB', color: '#C93B2E' },
  medium: { bg: '#FFF3E0', color: '#D48A1A' },
  low: { bg: '#E8F8EE', color: '#2D9F5E' },
} as const;

type ProjectLike = {
  progress: number;
  targetProgress: number;
  budget: number;
  spent: number;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

export const clampPercentage = (value: number) => Math.max(0, Math.min(value, 100));

export const calculateProjectMetrics = (project: ProjectLike) => {
  const progress = clampPercentage(Number(project.progress) || 0);
  const targetProgress = clampPercentage(Number(project.targetProgress) || 0);
  const budget = Number(project.budget) || 0;
  const spent = Number(project.spent) || 0;

  const spi = targetProgress > 0 ? round2(progress / targetProgress) : null;
  const earnedValue = budget > 0 ? (budget * progress) / 100 : 0;
  const cpi = spent > 0 ? round2(earnedValue / spent) : null;
  const progressDelta = round2(progress - targetProgress);

  const missingFields: string[] = [];
  if (targetProgress <= 0) missingFields.push('เป้าหมายการดำเนินงานปัจจุบัน');
  if (budget <= 0) missingFields.push('งบ (ลบ.)');
  if (spent < 0) missingFields.push('ใช้แล้ว (ลบ.)');

  let autoStatus: keyof typeof STATUS_MAP = 'on-track';
  if (!missingFields.length) {
    const hasCpi = cpi !== null;
    if (progress >= 100) {
      autoStatus = 'completed';
    } else if ((spi ?? 0) < 0.85 || (hasCpi && cpi < 0.85) || progressDelta <= -10) {
      autoStatus = 'critical';
    } else if ((spi ?? 0) < 1 || (hasCpi && cpi < 1) || progressDelta < 0) {
      autoStatus = 'at-risk';
    }
  } else {
    autoStatus = 'planning';
  }

  return {
    spi,
    cpi,
    progress,
    targetProgress,
    progressDelta,
    autoStatus,
    isComplete: missingFields.length === 0,
    missingFields,
  };
};
