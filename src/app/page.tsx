import Link from "next/link";
import { Building2, BarChart3, Settings, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 text-white p-4 rounded-full" aria-hidden="true">
              <Building2 className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            OrgShift Executive Dashboard
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            経営が「ひと目で」会社の状態を把握し、学び→モチベ→利益の関係を明確化する
            <br />
            次世代エグゼクティブダッシュボード
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center" aria-hidden="true">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">KPI可視化</h3>
            <p className="text-slate-600">
              利益/人、成約率、離職率、採用コスト、学習進捗、モチベ指数を統合表示
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center" aria-hidden="true">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">AIインサイト</h3>
            <p className="text-slate-600">
              データを自動分析し、経営判断に必要な洞察を自然言語で提供
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="bg-violet-100 text-violet-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center" aria-hidden="true">
              <Settings className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">拡張設計</h3>
            <p className="text-slate-600">
              KPIメタデータ管理により、コード変更なしで指標追加・変更が可能
            </p>
          </div>
        </div>

        <div className="text-center space-y-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-3 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <BarChart3 className="w-6 h-6" aria-hidden="true" />
            <span>ダッシュボードを開く</span>
          </Link>

          <div className="flex justify-center space-x-4 text-sm text-slate-500">
            <Link 
              href="/admin/inputs?admin=ADMIN-ORG-A"
              className="hover:text-slate-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              管理者ページ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
