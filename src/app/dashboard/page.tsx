import { Suspense } from 'react';
import { DashboardContent } from '@/components/DashboardContent';
import Link from 'next/link';
import { Settings, ArrowLeft } from 'lucide-react';

export default function DashboardPage() {
  return (
    <>
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="inline-flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg cursor-pointer"
              aria-label="ホームページに戻る"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>ホームに戻る</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/admin/inputs?admin=ADMIN-ORG-A" 
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer"
              aria-label="管理者画面を開く"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              <span>管理者画面</span>
            </Link>
          </div>
        </div>
      </nav>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 bg-slate-200 rounded animate-pulse w-64 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded animate-pulse w-48"></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded mb-3 w-24"></div>
                  <div className="h-8 bg-slate-200 rounded mb-4 w-32"></div>
                  <div className="h-2 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-20"></div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded mb-4 w-48"></div>
                <div className="h-80 bg-slate-100 rounded"></div>
              </div>
              <div className="bg-white rounded-lg border p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded mb-4 w-48"></div>
                <div className="h-80 bg-slate-100 rounded"></div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-white rounded-lg border p-6 animate-pulse h-fit">
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