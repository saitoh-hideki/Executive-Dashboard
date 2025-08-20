'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatValue } from '@/lib/utils';

interface CorrelationChartProps {
  data: {
    x: number;
    y: number;
    period: string;
  }[];
  xKpi: {
    name: string;
    unitType: string;
  };
  yKpi: {
    name: string;
    unitType: string;
  };
  correlation: number;
}

export function CorrelationChart({ data, xKpi, yKpi, correlation }: CorrelationChartProps) {
  const formatTooltipValue = (value: number, unitType: string) => {
    return formatValue(unitType, value);
  };

  const getCorrelationColor = (corr: number) => {
    if (corr >= 0.7) return 'text-emerald-600';
    if (corr >= 0.3) return 'text-blue-600';
    if (corr >= -0.3) return 'text-slate-600';
    if (corr >= -0.7) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getCorrelationStrength = (corr: number) => {
    const abs = Math.abs(corr);
    if (abs >= 0.7) return '強い';
    if (abs >= 0.3) return '中程度の';
    return '弱い';
  };

  const correlationDescription = `${getCorrelationStrength(correlation)}${correlation >= 0 ? '正' : '負'}の相関（相関係数: ${correlation.toFixed(3)}）`;

  return (
    <div className="bg-white rounded-lg border p-6" role="region" aria-labelledby={`correlation-${xKpi.name}-${yKpi.name}-title`}>
      <div className="flex items-center justify-between mb-4">
        <h3 id={`correlation-${xKpi.name}-${yKpi.name}-title`} className="text-lg font-semibold text-slate-900">
          {yKpi.name} × {xKpi.name} 相関分析
        </h3>
        <div className="text-right">
          <div className={`text-sm font-medium ${getCorrelationColor(correlation)}`}>
            相関係数: {correlation.toFixed(3)}
          </div>
          <div className="text-xs text-slate-500">
            {getCorrelationStrength(correlation)}{correlation >= 0 ? '正' : '負'}の相関
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 20 }} aria-label={`${yKpi.name}と${xKpi.name}の相関分析グラフ`}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              type="number"
              dataKey="x"
              name={xKpi.name}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (xKpi.unitType === 'currency') return `¥${(value / 1000000).toFixed(1)}M`;
                if (xKpi.unitType === 'ratio') return `${(value * 100).toFixed(0)}%`;
                return value.toString();
              }}
              aria-label={`${xKpi.name}の値`}
            />
            <YAxis 
              type="number"
              dataKey="y"
              name={yKpi.name}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (yKpi.unitType === 'currency') return `¥${(value / 1000000).toFixed(1)}M`;
                if (yKpi.unitType === 'ratio') return `${(value * 100).toFixed(0)}%`;
                return value.toString();
              }}
              aria-label={`${yKpi.name}の値`}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: number, name: string) => {
                if (name === xKpi.name) {
                  return [formatTooltipValue(value, xKpi.unitType), xKpi.name];
                }
                return [formatTooltipValue(value, yKpi.unitType), yKpi.name];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0 && payload[0]) {
                  const data = payload[0].payload;
                  return `期間: ${new Date(data.period).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}`;
                }
                return '';
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Scatter name="データポイント" dataKey="y" fill="#3b82f6" aria-label={`${yKpi.name}と${xKpi.name}の相関データポイント`}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#3b82f6" />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-xs text-slate-500 border-t pt-3">
        <p aria-label="相関の解釈について">
          相関係数が0.7以上で強い相関、0.3〜0.7で中程度の相関、-0.3〜0.3で弱い相関を示します。
          正の相関は一方が増加すると他方も増加することを、負の相関は一方が増加すると他方が減少することを示します。
        </p>
        <p className="sr-only">{correlationDescription}</p>
      </div>
    </div>
  );
}