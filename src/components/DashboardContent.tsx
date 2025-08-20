'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { KpiCard } from './KpiCard';
import { TrendAndCorrelation } from './TrendAndCorrelation';
import { AiInsights } from './AiInsights';
import { AiChatFab } from './AiChatFab';
import { PeopleUtilization } from './PeopleUtilization';
import { Building2, Calendar, Users } from 'lucide-react';
import type { KPI, KPISnapshot } from '@/lib/supabase';

export function DashboardContent() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [snapshots, setSnapshots] = useState<KPISnapshot[]>([]);
  const [previousSnapshots, setPreviousSnapshots] = useState<KPISnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string>('');
  const [orgName, setOrgName] = useState<string>('');

  const currentPeriod = '2025-07-01';
  const previousPeriod = '2025-06-01';

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // 組織情報を取得
      const { data: orgs, error: orgError } = await supabase
        .from('orgs')
        .select('id, name')
        .limit(1)
        .single();

      if (orgError) {
        console.error('Error fetching orgs:', orgError);
        return;
      }

      if (orgs) {
        setOrgId(orgs.id);
        setOrgName(orgs.name);
      }

      // KPI定義を取得
      const { data: kpiData, error: kpiError } = await supabase
        .from('kpis')
        .select('*')
        .in('code', [
          'profit_per_employee',
          'sales_conversion_rate',
          'turnover_rate',
          'hiring_cost_per_head',
          'learning_progress',
          'motivation_index'
        ])
        .order('code', { ascending: true });

      if (kpiError) {
        console.error('Error fetching KPIs:', kpiError);
        return;
      }

      if (kpiData) {
        setKpis(kpiData);
      }

      if (orgs && kpiData) {
        // 現在の期間のスナップショットを取得
        const { data: currentSnapshots, error: currentError } = await supabase
          .from('kpi_snapshots')
          .select('*')
          .eq('org_id', orgs.id)
          .eq('period_date', currentPeriod)
          .in('kpi_id', kpiData.map(k => k.id));

        if (currentError) {
          console.error('Error fetching current snapshots:', currentError);
        } else if (currentSnapshots) {
          setSnapshots(currentSnapshots);
        }

        // 前の期間のスナップショットを取得
        const { data: prevSnapshots, error: prevError } = await supabase
          .from('kpi_snapshots')
          .select('*')
          .eq('org_id', orgs.id)
          .eq('period_date', previousPeriod)
          .in('kpi_id', kpiData.map(k => k.id));

        if (prevError) {
          console.error('Error fetching previous snapshots:', prevError);
        } else if (prevSnapshots) {
          setPreviousSnapshots(prevSnapshots);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPeriod, previousPeriod]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getCurrentValue = (kpiId: string): number | null => {
    const snapshot = snapshots.find(s => s.kpi_id === kpiId);
    return snapshot?.value || null;
  };

  const getPreviousValue = (kpiId: string): number | null => {
    const snapshot = previousSnapshots.find(s => s.kpi_id === kpiId);
    return snapshot?.value || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50" aria-live="polite" aria-label="データ読み込み中">
        <div className="mx-auto max-w-7xl p-6">
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-48"></div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border p-6 animate-pulse" aria-hidden="true">
                    <div className="h-4 bg-slate-200 rounded mb-3 w-24"></div>
                    <div className="h-8 bg-slate-200 rounded mb-4 w-32"></div>
                    <div className="h-2 bg-slate-200 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-6 animate-pulse h-fit" aria-hidden="true">
              <div className="h-6 bg-slate-200 rounded mb-4 w-32"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                エグゼクティブダッシュボード
              </h1>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center space-x-1">
                  <Building2 className="w-4 h-4" aria-hidden="true" />
                  <span>{orgName || 'Sample Corp'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>2025年7月</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" aria-hidden="true" />
                  <span>全社</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-slate-500">最終更新</div>
              <div className="text-sm font-medium text-slate-900">
                {new Date().toLocaleString('ja-JP')}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* KPI Cards */}
            <section aria-labelledby="kpi-heading">
              <h2 id="kpi-heading" className="text-lg font-semibold text-slate-900 mb-4">主要業績指標</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {kpis.map((kpi) => (
                  <KpiCard
                    key={kpi.id}
                    kpi={kpi}
                    value={getCurrentValue(kpi.id)}
                    previousValue={getPreviousValue(kpi.id)}
                    period="2025-07"
                  />
                ))}
              </div>
            </section>

            {/* Trends and Correlation */}
            <section aria-labelledby="trends-heading">
              <h2 id="trends-heading" className="text-lg font-semibold text-slate-900 mb-4">トレンド分析</h2>
              <TrendAndCorrelation
                orgId={orgId}
                currentPeriod={currentPeriod}
              />
            </section>

            {/* People Utilization */}
            <section aria-labelledby="utilization-heading">
              <h2 id="utilization-heading" className="text-lg font-semibold text-slate-900 mb-4">人材活用状況</h2>
              <PeopleUtilization orgId={orgId} />
            </section>
          </div>

          {/* Sidebar - AI Insights */}
          <aside aria-labelledby="insights-heading">
            <h2 id="insights-heading" className="sr-only">AIインサイト</h2>
            <AiInsights
              orgId={orgId}
              period={currentPeriod}
              scope="company"
            />
          </aside>
        </div>
      </main>

      {/* AI Chat FAB */}
      <AiChatFab
        orgId={orgId}
        period={currentPeriod}
      />
    </div>
  );
}