'use client'

import { useState } from 'react'
import { sendEvent, OrgShiftEvent, getCurrentPeriod } from '@/lib/types'

// サンプルイベントテンプレート
const sampleEvents: Record<string, OrgShiftEvent> = {
  motivation: {
    org_id: 'a6e2e2c9-1a77-4f2a-b8ce-7d8c5d9a3c2f', // Sample CorpのID
    app: 'motivation',
    event: 'learning_task.completed',
    period_date: getCurrentPeriod(),
    kpi_candidates: [
      { kpi_code: 'learning_progress', value: 0.75, unit_type: 'ratio' }
    ],
    meta: { user: 'device_123', category: 'learn', title: '英語30分学習' }
  },
  quiz: {
    org_id: 'a6e2e2c9-1a77-4f2a-b8ce-7d8c5d9a3c2f',
    app: 'quiz',
    event: 'quiz.completed',
    period_date: getCurrentPeriod(),
    kpi_candidates: [
      { kpi_code: 'learning_progress', value: 0.80, unit_type: 'ratio' }
    ],
    meta: { user: 'device_456', score: 85, quiz_type: 'sales_training' }
  },
  roleplay: {
    org_id: 'a6e2e2c9-1a77-4f2a-b8ce-7d8c5d9a3c2f',
    app: 'roleplay',
    event: 'roleplay.session_scored',
    period_date: getCurrentPeriod(),
    kpi_candidates: [
      { kpi_code: 'motivation_index', value: 72, unit_type: 'index' }
    ],
    meta: { user: 'device_789', scenario: 'customer_complaint', score: 85 }
  },
  local: {
    org_id: 'a6e2e2c9-1a77-4f2a-b8ce-7d8c5d9a3c2f',
    app: 'local',
    event: 'local.lead_submitted',
    period_date: getCurrentPeriod(),
    kpi_candidates: [
      { kpi_code: 'sales_conversion_rate', value: 0.32, unit_type: 'ratio' }
    ],
    meta: { user: 'device_101', lead_value: 500000, source: 'local_referral' }
  }
}

export default function EventSender() {
  const [selectedEvent, setSelectedEvent] = useState<string>('motivation')
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<string>('')
  const [customUrl, setCustomUrl] = useState('')

  const handleSendEvent = async () => {
    setIsSending(true)
    setResult('')
    
    try {
      const event = sampleEvents[selectedEvent]
      if (!event) {
        setResult('❌ エラー: イベントが見つかりません')
        return
      }
      
      const url = customUrl || undefined
      
      const response = await sendEvent(event, url)
      const data = await response.json()
      
      setResult(`✅ 成功: ${data.message}`)
    } catch (error) {
      setResult(`❌ エラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">イベント送信テスト</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            イベントタイプ
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="motivation">Motivation - 学習タスク完了</option>
            <option value="quiz">Quiz - クイズ完了</option>
            <option value="roleplay">Roleplay - セッション評価</option>
            <option value="local">Local - リード提出</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カスタムURL（オプション）
          </label>
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://your-project.supabase.co/functions/v1/ingest/webhook"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">送信内容プレビュー:</h4>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(sampleEvents[selectedEvent], null, 2)}
          </pre>
        </div>

        <button
          onClick={handleSendEvent}
          disabled={isSending}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? '送信中...' : 'イベントを送信'}
        </button>

        {result && (
          <div className={`p-3 rounded-md ${
            result.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {result}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 mb-2">使用方法:</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>イベントタイプを選択</li>
          <li>必要に応じてカスタムURLを設定</li>
          <li>「イベントを送信」をクリック</li>
          <li>結果を確認</li>
        </ol>
        <p className="text-xs text-blue-600 mt-2">
          このコンポーネントは、各OrgShiftアプリからのイベント送信をシミュレートします。
          実際のアプリでは、このイベント形式でIngestエンドポイントにPOSTしてください。
        </p>
      </div>
    </div>
  )
}
