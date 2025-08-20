'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendChart } from './TrendChart';
import { CorrelationChart } from './CorrelationChart';
import { supabase } from '@/lib/supabase';
import type { KPISnapshot } from '@/lib/supabase';

interface TrendAndCorrelationProps {
  orgId: string;
  currentPeriod: string;
}

interface TrendData {
  period: string;
  value: number;
}

interface CorrelationData {
  x: number;
  y: number;
  period: string;
}

export function TrendAndCorrelation({ orgId, currentPeriod }: TrendAndCorrelationProps) {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([]);
  const [correlation, setCorrelation] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchTrendAndCorrelationData = useCallback(async () => {
    if (!orgId) return;
    
    try {
      setLoading(true);
      
      // 過去12ヶ月のデータを取得
      const endDate = new Date(currentPeriod);
      const startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 11);

      const { data: snapshots, error } = await supabase
        .from('kpi_snapshots')
        .select(`
          value,
          period_date,
          kpi:kpis(code, name, unit_type)
        `)
        .eq('org_id', orgId)
        .gte('period_date', startDate.toISOString().split('T')[0])
        .lte('period_date', currentPeriod)
        .in('kpi.code', ['profit_per_employee', 'learning_progress'])
        .order('period_date', { ascending: true });

      if (error) {
        console.error('Error fetching snapshots:', error);
        return;
      }

      // 型安全なデータ処理
      const typedSnapshots = (snapshots || []) as unknown as Array<{
        value: number;
        period_date: string;
        kpi: {
          code: string;
          name: string;
          unit_type: string;
        };
      }>;

      // 利益/従業員のトレンドデータ
      const profitData = typedSnapshots.filter(s => s.kpi?.code === 'profit_per_employee');
      const learningData = typedSnapshots.filter(s => s.kpi?.code === 'learning_progress');

      setTrendData(profitData.map(item => ({
        period: item.period_date,
        value: item.value
      })));

      // 相関データを作成
      const corrData = profitData.map(profit => {
        const learning = learningData.find(l => l.period_date === profit.period_date);
        if (!learning) return null;
        
        return {
          x: learning.value,
          y: profit.value,
          period: profit.period_date
        };
      }).filter((item): item is CorrelationData => item !== null);

      setCorrelationData(corrData);

      // 相関係数を計算
      if (corrData.length > 1) {
        const xValues = corrData.map(d => d.x);
        const yValues = corrData.map(d => d.y);
        const corr = calculateCorrelation(xValues, yValues);
        setCorrelation(corr);
      }
    } catch (error) {
      console.error('Error fetching trend and correlation data:', error);
    } finally {
      setLoading(false);
    }
  }, [orgId, currentPeriod]);

  useEffect(() => {
    fetchTrendAndCorrelationData();
  }, [fetchTrendAndCorrelationData]);

  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    if (n < 2) return 0;

    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;

    for (let i = 0; i < n; i++) {
      const xVal = x[i];
      const yVal = y[i];
      if (xVal === undefined || yVal === undefined) continue;
      
      const deltaX = xVal - meanX;
      const deltaY = yVal - meanY;
      numerator += deltaX * deltaY;
      denominatorX += deltaX * deltaX;
      denominatorY += deltaY * deltaY;
    }

    const denominator = Math.sqrt(denominatorX * denominatorY);
    return denominator === 0 ? 0 : numerator / denominator;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4"></div>
          <div className="h-80 bg-slate-100 rounded"></div>
        </div>
        <div className="bg-white rounded-lg border p-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4"></div>
          <div className="h-80 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TrendChart
        data={trendData}
        kpiName="利益/従業員"
        unitType="currency"
      />
      <CorrelationChart
        data={correlationData}
        xKpi={{ name: '学習進捗率', unitType: 'ratio' }}
        yKpi={{ name: '利益/従業員', unitType: 'currency' }}
        correlation={correlation}
      />
    </div>
  );
}