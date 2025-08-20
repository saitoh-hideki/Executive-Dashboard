'use client';

import { Users, UserPlus, TrendingUp, Target } from 'lucide-react';

interface PeopleUtilizationProps {
  orgId: string;
}

export function PeopleUtilization({ orgId }: PeopleUtilizationProps) {
  // サンプルデータ
  const workLinkData = {
    totalProjects: 15,
    activeMembers: 28,
    grossProfit: 8500000,
    utilizationRate: 0.82
  };

  const localData = {
    totalPosts: 42,
    applications: 18,
    conversionRate: 0.43,
    recentActivity: 7
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* WorkLink */}
      <div className="bg-white rounded-lg border p-6" role="region" aria-labelledby="worklink-heading">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <h3 id="worklink-heading" className="text-lg font-semibold text-slate-900">WorkLink 活用</h3>
          </div>
          <div className="text-sm text-slate-500">案件・参画・粗利寄与</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1" aria-label={`進行中案件数: ${workLinkData.totalProjects}件`}>
              {workLinkData.totalProjects}
            </div>
            <div className="text-sm text-slate-600">進行中案件</div>
          </div>
          
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600 mb-1" aria-label={`参画メンバー数: ${workLinkData.activeMembers}人`}>
              {workLinkData.activeMembers}
            </div>
            <div className="text-sm text-slate-600">参画メンバー</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
            <span className="text-slate-600">粗利寄与額</span>
            <span className="font-semibold text-slate-900" aria-label={`粗利寄与額: ¥${workLinkData.grossProfit.toLocaleString()}`}>
              ¥{workLinkData.grossProfit.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-600">稼働率</span>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-900" aria-label={`稼働率: ${(workLinkData.utilizationRate * 100).toFixed(1)}%`}>
                {(workLinkData.utilizationRate * 100).toFixed(1)}%
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Local */}
      <div className="bg-white rounded-lg border p-6" role="region" aria-labelledby="local-heading">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-violet-600" aria-hidden="true" />
            <h3 id="local-heading" className="text-lg font-semibold text-slate-900">Local 採用</h3>
          </div>
          <div className="text-sm text-slate-500">投稿・応募ファネル</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-violet-50 rounded-lg">
            <div className="text-2xl font-bold text-violet-600 mb-1" aria-label={`求人投稿数: ${localData.totalPosts}件`}>
              {localData.totalPosts}
            </div>
            <div className="text-sm text-slate-600">求人投稿</div>
          </div>
          
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 mb-1" aria-label={`応募数: ${localData.applications}件`}>
              {localData.applications}
            </div>
            <div className="text-sm text-slate-600">応募数</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-slate-100">
            <span className="text-slate-600">コンバージョン率</span>
            <span className="font-semibold text-slate-900" aria-label={`コンバージョン率: ${(localData.conversionRate * 100).toFixed(1)}%`}>
              {(localData.conversionRate * 100).toFixed(1)}%
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-600">直近1週間の活動</span>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-900" aria-label={`直近1週間の活動: ${localData.recentActivity}件`}>
                {localData.recentActivity} 件
              </span>
              <Users className="w-4 h-4 text-slate-500" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}