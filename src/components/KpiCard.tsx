'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatValue, getKpiStatusColor, formatChangePercent } from '@/lib/utils';
import type { KPI } from '@/lib/supabase';

interface KpiCardProps {
  kpi: KPI;
  value: number | null;
  previousValue?: number | null;
  period: string;
}

export function KpiCard({ kpi, value, previousValue, period }: KpiCardProps) {
  const statusColor = getKpiStatusColor(kpi, value);
  
  let changePercent = 0;
  let trendIcon = null;
  let trendDescription = '';
  
  if (value !== null && previousValue !== null && previousValue !== undefined && previousValue !== 0) {
    changePercent = ((value - previousValue) / previousValue) * 100;
    
    if (changePercent > 0) {
      trendIcon = <TrendingUp className="w-4 h-4 text-emerald-600" aria-hidden="true" />;
      trendDescription = `前月比${changePercent.toFixed(1)}%の増加`;
    } else if (changePercent < 0) {
      trendIcon = <TrendingDown className="w-4 h-4 text-rose-600" aria-hidden="true" />;
      trendDescription = `前月比${Math.abs(changePercent).toFixed(1)}%の減少`;
    } else {
      trendIcon = <Minus className="w-4 h-4 text-gray-400" aria-hidden="true" />;
      trendDescription = '前月と変化なし';
    }
  }

  const goalStatus = kpi.thresholds?.goal && value !== null 
    ? value >= kpi.thresholds.goal ? '目標達成' : '目標未達成'
    : null;

  const goalProgress = kpi.thresholds?.goal && value !== null 
    ? Math.min(100, (value / kpi.thresholds.goal) * 100)
    : 0;

  return (
    <div className={`rounded-xl border p-6 transition-all hover:shadow-md ${statusColor}`} role="article" aria-labelledby={`kpi-${kpi.id}-title`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 id={`kpi-${kpi.id}-title`} className="text-sm font-medium text-slate-600 mb-1">{kpi.name}</h3>
          <div className="text-2xl font-bold text-slate-900" aria-label={`${kpi.name}の値: ${formatValue(kpi.unit_type, value)}`}>
            {formatValue(kpi.unit_type, value)}
          </div>
        </div>
        {trendIcon && (
          <div className="flex items-center space-x-1 text-sm" aria-label={trendDescription}>
            {trendIcon}
            <span className={changePercent > 0 ? 'text-emerald-600' : changePercent < 0 ? 'text-rose-600' : 'text-gray-500'}>
              {formatChangePercent(changePercent)}
            </span>
          </div>
        )}
      </div>
      
      {kpi.thresholds?.goal && value !== null && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>目標: {formatValue(kpi.unit_type, kpi.thresholds.goal)}</span>
            <span>{goalStatus}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2" role="progressbar" aria-valuenow={goalProgress} aria-valuemin={0} aria-valuemax={100} aria-label={`目標達成率: ${goalProgress.toFixed(1)}%`}>
            <div 
              className={`h-2 rounded-full transition-all ${
                value >= kpi.thresholds.goal 
                  ? 'bg-emerald-500' 
                  : value >= (kpi.thresholds.warn || 0)
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ 
                width: `${goalProgress}%` 
              }}
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>期間: {period}</span>
        <span className="text-right">
          最終更新: {new Date().toLocaleDateString('ja-JP')}
        </span>
      </div>
    </div>
  );
}