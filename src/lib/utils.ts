export function formatValue(unitType: string, value: number | null): string {
  if (value === null) return '---';
  
  switch (unitType) {
    case 'currency':
      return `¥${value.toLocaleString()}`;
    case 'ratio':
      return `${(value * 100).toFixed(1)}%`;
    case 'per_capita':
      return `¥${value.toLocaleString()}`;
    case 'index':
      return value.toFixed(0);
    case 'count':
      return value.toString();
    default:
      return value.toString();
  }
}

export function getKpiStatusColor(kpi: { thresholds?: { goal?: number; warn?: number } }, value: number | null): string {
  if (value === null) return 'bg-slate-200';
  
  const { goal, warn } = kpi.thresholds || {};
  
  if (goal !== undefined && value >= goal) return 'bg-emerald-100 border-emerald-200';
  if (warn !== undefined && value >= warn) return 'bg-amber-100 border-amber-200';
  return 'bg-rose-100 border-rose-200';
}

export function calculateChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function formatChangePercent(changePercent: number): string {
  const sign = changePercent > 0 ? '+' : '';
  return `${sign}${changePercent.toFixed(1)}%`;
}