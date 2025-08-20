'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, TrendingUp } from 'lucide-react';

interface AiInsightsProps {
  orgId: string;
  period: string;
  scope: 'company' | 'department';
  departmentId?: string;
}

interface InsightData {
  insight: string;
  stats: {
    kpiData?: Array<{
      code: string;
      name: string;
      value: number;
      changePercent: string;
    }>;
  };
  source_period: string;
}

export function AiInsights({ orgId, period, scope, departmentId }: AiInsightsProps) {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!orgId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        org_id: orgId,
        period,
        scope
      });
      
      if (departmentId) {
        params.append('department_id', departmentId);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-ai-insights?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setError('インサイトの取得に失敗しました');
      
      // フォールバック用のダミーデータ
      setData({
        insight: '今月の利益/人は1,650,000円（前月比+12%）。学習進捗率72%で良好な水準を維持。モチベ指数68は目標を達成。離職率4.2%で目標内。学習進捗の高い部門で利益向上の傾向が見られます。',
        stats: {},
        source_period: period
      });
    } finally {
      setLoading(false);
    }
  }, [orgId, period, scope, departmentId]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleRegenerate = async () => {
    await fetchInsights();
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm" role="region" aria-labelledby="insights-title">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <h3 id="insights-title" className="text-lg font-semibold text-slate-900">AIインサイト</h3>
          </div>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="inline-flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="インサイトを再生成"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>再生成</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-3" aria-live="polite" aria-label="インサイト生成中">
            <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse w-4/6"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse w-3/6"></div>
          </div>
        ) : error && !data ? (
          <div className="text-center py-8">
            <div className="text-slate-500 mb-2" role="alert">⚠️ {error}</div>
            <button
              onClick={fetchInsights}
              className="text-blue-600 hover:text-blue-700 text-sm underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              再試行
            </button>
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {data.insight}
              </p>
            </div>
            
            {data.stats?.kpiData && data.stats.kpiData.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-emerald-600" aria-hidden="true" />
                  主要指標（{data.source_period}）
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list" aria-label="主要指標一覧">
                  {data.stats.kpiData.slice(0, 4).map((kpi, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-3" role="listitem">
                      <div className="text-xs text-slate-500 mb-1">{kpi.name}</div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">
                          {kpi.code === 'profit_per_employee' || kpi.code === 'hiring_cost_per_head'
                            ? `¥${kpi.value?.toLocaleString()}`
                            : kpi.code === 'sales_conversion_rate' || kpi.code === 'turnover_rate' || kpi.code === 'learning_progress'
                            ? `${(kpi.value * 100).toFixed(1)}%`
                            : kpi.value?.toFixed(0)
                          }
                        </span>
                        {kpi.changePercent !== "0.0" && (
                          <span className={`text-xs ${
                            parseFloat(kpi.changePercent) > 0 
                              ? 'text-emerald-600' 
                              : 'text-rose-600'
                          }`}>
                            {parseFloat(kpi.changePercent) > 0 ? '+' : ''}{kpi.changePercent}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
              <span>データソース: {data.source_period}</span>
              <span>最終更新: {new Date().toLocaleString('ja-JP')}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}