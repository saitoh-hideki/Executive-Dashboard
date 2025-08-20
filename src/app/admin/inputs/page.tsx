'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { Settings, Download, Upload, Save, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatValue } from '@/lib/utils';
import type { KPI, KPISnapshot } from '@/lib/supabase';

interface InputData {
  [kpiId: string]: { [period: string]: number | null };
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

interface NewKPI {
  code: string;
  name: string;
  description: string;
  unit_type: 'ratio' | 'currency' | 'count' | 'index' | 'per_capita';
  source_type: 'manual' | 'internal' | 'external';
  goal?: number;
  warn?: number;
}

function AdminInputsContent() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [inputData, setInputData] = useState<InputData>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  
  // KPI管理用の状態
  const [showKpiForm, setShowKpiForm] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);
  const [newKpi, setNewKpi] = useState<NewKPI>({
    code: '',
    name: '',
    description: '',
    unit_type: 'ratio',
    source_type: 'manual'
  });

  const fetchData = useCallback(async () => {
    try {
      // KPI定義を取得
      const { data: kpiData, error: kpiError } = await supabase
        .from('kpis')
        .select('*')
        .order('code', { ascending: true });

      if (kpiError) {
        console.error('Error fetching KPIs:', kpiError);
        return;
      }

      setKpis(kpiData || []);

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
      }

      // 既存のスナップショットデータを取得
      const { data: snapshots, error: snapshotsError } = await supabase
        .from('kpi_snapshots')
        .select(`
          kpi_id,
          period_date,
          value
        `)
        .eq('org_id', orgs.id);

      if (snapshotsError) {
        console.error('Error fetching snapshots:', snapshotsError);
        return;
      }

      // データを整形
      const dataMap: {[key: string]: {[period: string]: number}} = {};
      snapshots.forEach(snapshot => {
        const kpiId = snapshot.kpi_id;
        const periodDate = snapshot.period_date;
        
        if (kpiId && periodDate) {
          if (!dataMap[kpiId]) {
            dataMap[kpiId] = {};
          }
          dataMap[kpiId][periodDate] = snapshot.value;
        }
      });
      setInputData(dataMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  const generatePeriods = useCallback(() => {
    const periods: string[] = [];
    const current = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(current.getFullYear(), current.getMonth() - i, 1);
      const isoString = date.toISOString();
      const dateString = isoString.split('T')[0];
      if (dateString) {
        periods.push(dateString);
      }
    }
    return periods;
  }, []);

  useEffect(() => {
    // URLパラメータからadminCodeを取得
    const urlParams = new URLSearchParams(window.location.search);
    const adminCode = urlParams.get('admin');
    
    if (adminCode === 'ADMIN-ORG-A') {
      fetchData();
    }
  }, [fetchData]);

  const handleInputChange = (kpiId: string, period: string, value: string) => {
    setInputData(prev => ({
      ...prev,
      [kpiId]: {
        ...prev[kpiId],
        [period]: value === '' ? null : parseFloat(value)
      }
    }));
  };

  const handleSave = async () => {
    if (!orgId) return;
    
    try {
      setLoading(true);
      setMessage(null);

      const periods = generatePeriods();
      const snapshots: Partial<KPISnapshot>[] = [];

      // 入力データからスナップショットを作成
      Object.entries(inputData).forEach(([kpiId, periodData]) => {
        periods.forEach(period => {
          const value = periodData[period];
          if (value !== null && value !== undefined) {
            snapshots.push({
              org_id: orgId,
              kpi_id: kpiId,
              period_date: period,
              value: value,
              created_at: new Date().toISOString()
            });
          }
        });
      });

      if (snapshots.length === 0) {
        setMessage({ type: 'error', text: '保存するデータがありません。' });
        return;
      }

      // 既存データを削除
      const { error: deleteError } = await supabase
        .from('kpi_snapshots')
        .delete()
        .eq('org_id', orgId)
        .in('kpi_id', Object.keys(inputData));

      if (deleteError) {
        console.error('Error deleting existing data:', deleteError);
        setMessage({ type: 'error', text: '既存データの削除に失敗しました。' });
        return;
      }

      // 新しいデータを挿入
      const { error: insertError } = await supabase
        .from('kpi_snapshots')
        .insert(snapshots);

      if (insertError) {
        console.error('Error inserting data:', insertError);
        setMessage({ type: 'error', text: 'データの保存に失敗しました。' });
        return;
      }

      setMessage({ type: 'success', text: 'データが正常に保存されました。' });
    } catch (error) {
      console.error('Error saving data:', error);
      setMessage({ type: 'error', text: '予期しないエラーが発生しました。' });
    } finally {
      setLoading(false);
    }
  };

  // KPI管理用の関数
  const handleAddKpi = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const kpiData = {
        code: newKpi.code,
        name: newKpi.name,
        description: newKpi.description,
        unit_type: newKpi.unit_type,
        source_type: newKpi.source_type,
        thresholds: {
          goal: newKpi.goal,
          warn: newKpi.warn
        }
      };

      const { error } = await supabase
        .from('kpis')
        .insert(kpiData);

      if (error) {
        console.error('Error adding KPI:', error);
        setMessage({ type: 'error', text: 'KPIの追加に失敗しました。' });
        return;
      }

      setMessage({ type: 'success', text: 'KPIが正常に追加されました。' });
      setShowKpiForm(false);
      setNewKpi({
        code: '',
        name: '',
        description: '',
        unit_type: 'ratio',
        source_type: 'manual'
      });
      fetchData(); // データを再取得
    } catch (error) {
      console.error('Error adding KPI:', error);
      setMessage({ type: 'error', text: '予期しないエラーが発生しました。' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditKpi = async () => {
    if (!editingKpi) return;
    
    try {
      setLoading(true);
      setMessage(null);

      const kpiData = {
        code: newKpi.code,
        name: newKpi.name,
        description: newKpi.description,
        unit_type: newKpi.unit_type,
        source_type: newKpi.source_type,
        thresholds: {
          goal: newKpi.goal,
          warn: newKpi.warn
        }
      };

      const { error } = await supabase
        .from('kpis')
        .update(kpiData)
        .eq('id', editingKpi.id);

      if (error) {
        console.error('Error updating KPI:', error);
        setMessage({ type: 'error', text: 'KPIの更新に失敗しました。' });
        return;
      }

      setMessage({ type: 'success', text: 'KPIが正常に更新されました。' });
      setEditingKpi(null);
      setShowKpiForm(false);
      setNewKpi({
        code: '',
        name: '',
        description: '',
        unit_type: 'ratio',
        source_type: 'manual'
      });
      fetchData(); // データを再取得
    } catch (error) {
      console.error('Error updating KPI:', error);
      setMessage({ type: 'error', text: '予期しないエラーが発生しました。' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKpi = async (kpiId: string) => {
    if (!confirm('このKPIを削除しますか？関連するデータも削除されます。')) return;
    
    try {
      setLoading(true);
      setMessage(null);

      const { error } = await supabase
        .from('kpis')
        .delete()
        .eq('id', kpiId);

      if (error) {
        console.error('Error deleting KPI:', error);
        setMessage({ type: 'error', text: 'KPIの削除に失敗しました。' });
        return;
      }

      setMessage({ type: 'success', text: 'KPIが正常に削除されました。' });
      fetchData(); // データを再取得
    } catch (error) {
      console.error('Error deleting KPI:', error);
      setMessage({ type: 'error', text: '予期しないエラーが発生しました。' });
    } finally {
      setLoading(false);
    }
  };

  const openEditForm = (kpi: KPI) => {
    setEditingKpi(kpi);
    setNewKpi({
      code: kpi.code,
      name: kpi.name,
      description: kpi.description || '',
      unit_type: kpi.unit_type,
      source_type: kpi.source_type,
      goal: kpi.thresholds?.goal,
      warn: kpi.thresholds?.warn
    });
    setShowKpiForm(true);
  };

  const resetForm = () => {
    setEditingKpi(null);
    setShowKpiForm(false);
    setNewKpi({
      code: '',
      name: '',
      description: '',
      unit_type: 'ratio',
      source_type: 'manual'
    });
  };

  if (!orgId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">アクセス権限が必要です</h1>
          <p className="text-slate-600">管理者権限でアクセスしてください。</p>
        </div>
      </div>
    );
  }

  const periods = generatePeriods();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center space-x-2">
                <Settings className="w-8 h-8 text-blue-600" aria-hidden="true" />
                <span>KPI データ入力</span>
              </h1>
              <p className="text-slate-600">月次KPIデータの手動入力・管理画面</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowKpiForm(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="新しいKPIを追加"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>KPI追加</span>
              </button>
              <button
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="CSVテンプレートをダウンロード"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>CSVテンプレート</span>
              </button>
              <button
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="CSVファイルを一括アップロード"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
                <span>CSV一括アップロード</span>
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={loading ? '保存中...' : 'データを保存'}
              >
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>{loading ? '保存中...' : '保存'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`} role="alert" aria-live="polite">
            {message.text}
          </div>
        )}

        {/* Data Input Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" role="table" aria-label="KPIデータ入力テーブル">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-slate-900 border-r border-slate-200">
                    KPI
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-slate-900 border-r border-slate-200">
                    単位
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-slate-900 border-r border-slate-200">
                    目標値
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-slate-900 border-r border-slate-200">
                    操作
                  </th>
                  {periods.map((period) => (
                    <th key={period} scope="col" className="px-4 py-4 text-center text-sm font-medium text-slate-900 border-r border-slate-200 min-w-[120px]">
                      {new Date(period).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {kpis.map((kpi) => (
                  <tr key={kpi.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 border-r border-slate-200">
                      <div>
                        <div className="font-medium">{kpi.name}</div>
                        <div className="text-xs text-slate-500">{kpi.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 border-r border-slate-200">
                      {kpi.unit_type === 'currency' && '円'}
                      {kpi.unit_type === 'ratio' && '%'}
                      {kpi.unit_type === 'index' && 'ポイント'}
                      {kpi.unit_type === 'count' && '件'}
                      {kpi.unit_type === 'per_capita' && '円/人'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 border-r border-slate-200">
                      {kpi.thresholds?.goal ? formatValue(kpi.unit_type, kpi.thresholds.goal) : '---'}
                    </td>
                    <td className="px-6 py-4 text-center border-r border-slate-200">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditForm(kpi)}
                          className="inline-flex items-center p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          aria-label={`${kpi.name}を編集`}
                        >
                          <Edit className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDeleteKpi(kpi.id)}
                          className="inline-flex items-center p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          aria-label={`${kpi.name}を削除`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                    {periods.map((period) => (
                      <td key={period} className="px-4 py-4 border-r border-slate-200">
                        <label htmlFor={`input-${kpi.id}-${period}`} className="sr-only">
                          {kpi.name}の{new Date(period).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}の値
                        </label>
                        <input
                          id={`input-${kpi.id}-${period}`}
                          type="number"
                          value={inputData[kpi.id]?.[period] || ''}
                          onChange={(e) => {
                            if (kpi.id) {
                              handleInputChange(kpi.id, period, e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 text-sm text-black border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="値を入力"
                          step={kpi.unit_type === 'ratio' ? '0.01' : '1'}
                          min="0"
                          aria-describedby={`help-${kpi.id}-${period}`}
                        />
                        <div id={`help-${kpi.id}-${period}`} className="sr-only">
                          {kpi.unit_type === 'ratio' ? '比率は小数点で入力（例：30% → 0.30）' : '数値を入力してください'}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">入力時の注意事項</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 比率系の値（成約率・離職率・学習進捗率）は小数点で入力してください（例：30% → 0.30）</li>
            <li>• 金額は円単位で入力してください（例：1,650,000）</li>
            <li>• 空欄の場合はデータなしとして扱われます</li>
            <li>• 保存ボタンを押すまで変更は反映されません</li>
          </ul>
        </div>

        {/* KPI追加・編集モーダル */}
        {showKpiForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingKpi ? 'KPI編集' : '新しいKPI追加'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="閉じる"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingKpi) {
                  handleEditKpi();
                } else {
                  handleAddKpi();
                }
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="kpi-code" className="block text-sm font-medium text-slate-700 mb-1">
                      KPIコード *
                    </label>
                    <input
                      id="kpi-code"
                      type="text"
                      value={newKpi.code}
                      onChange={(e) => setNewKpi(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-3 py-2 text-sm text-black border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例: profit_per_employee"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="kpi-name" className="block text-sm font-medium text-slate-700 mb-1">
                      KPI名 *
                    </label>
                    <input
                      id="kpi-name"
                      type="text"
                      value={newKpi.name}
                      onChange={(e) => setNewKpi(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm text-black border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例: 利益/従業員"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="kpi-description" className="block text-sm font-medium text-slate-700 mb-1">
                    説明
                  </label>
                  <textarea
                    id="kpi-description"
                    value={newKpi.description}
                    onChange={(e) => setNewKpi(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 text-sm text-black border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="KPIの詳細な説明"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="kpi-unit-type" className="block text-sm font-medium text-slate-700 mb-1">
                      単位タイプ *
                    </label>
                    <select
                      id="kpi-unit-type"
                      value={newKpi.unit_type}
                      onChange={(e) => setNewKpi(prev => ({ ...prev, unit_type: e.target.value as any }))}
                      className="w-full px-3 py-2 text-sm text-black border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="ratio">比率 (%)</option>
                      <option value="currency">通貨 (円)</option>
                      <option value="count">件数 (件)</option>
                      <option value="index">指数 (ポイント)</option>
                      <option value="per_capita">一人当たり (円/人)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="kpi-source-type" className="block text-sm font-medium text-slate-700 mb-1">
                      データソース *
                    </label>
                    <select
                      id="kpi-source-type"
                      value={newKpi.source_type}
                      onChange={(e) => setNewKpi(prev => ({ ...prev, source_type: e.target.value as any }))}
                      className="w-full px-3 py-2 text-sm text-black border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="manual">手動入力</option>
                      <option value="internal">内部システム</option>
                      <option value="external">外部API</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="kpi-goal" className="block text-sm font-medium text-slate-700 mb-1">
                      目標値
                    </label>
                    <input
                      id="kpi-goal"
                      type="number"
                      value={newKpi.goal || ''}
                      onChange={(e) => setNewKpi(prev => ({ ...prev, goal: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      className="w-full px-3 py-2 text-sm text-black border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="目標値を入力"
                      step="any"
                    />
                  </div>

                  <div>
                    <label htmlFor="kpi-warn" className="block text-sm font-medium text-slate-700 mb-1">
                      警告値
                    </label>
                    <input
                      id="kpi-warn"
                      type="number"
                      value={newKpi.warn || ''}
                      onChange={(e) => setNewKpi(prev => ({ ...prev, warn: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      className="w-full px-3 py-2 text-sm text-black border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="警告値を入力"
                      step="any"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {loading ? '処理中...' : (editingKpi ? '更新' : '追加')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminInputsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </div>
    }>
      <AdminInputsContent />
    </Suspense>
  );
}