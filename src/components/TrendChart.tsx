'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatValue } from '@/lib/utils';

interface TrendChartProps {
  data: {
    period: string;
    value: number;
  }[];
  kpiName: string;
  unitType: string;
}

export function TrendChart({ data, kpiName, unitType }: TrendChartProps) {
  const formatTooltipValue = (value: number) => {
    return formatValue(unitType, value);
  };

  const formatYAxisTick = (value: number) => {
    if (unitType === 'currency') {
      return `¥${(value / 1000000).toFixed(1)}M`;
    }
    if (unitType === 'ratio') {
      return `${(value * 100).toFixed(0)}%`;
    }
    return value.toString();
  };

  return (
    <div className="bg-white rounded-lg border p-6" role="region" aria-labelledby={`trend-${kpiName}-title`}>
      <h3 id={`trend-${kpiName}-title`} className="text-lg font-semibold text-slate-900 mb-4">{kpiName} - 12ヶ月推移</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} aria-label={`${kpiName}の12ヶ月推移グラフ`}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}月`;
              }}
              aria-label="期間（月）"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatYAxisTick}
              aria-label={`${kpiName}の値`}
            />
            <Tooltip 
              formatter={(value: number) => [formatTooltipValue(value), kpiName]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return `${date.getFullYear()}年${date.getMonth() + 1}月`;
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#1d4ed8' }}
              aria-label={`${kpiName}の推移線`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}