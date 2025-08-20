// OrgShift Data Sharing - 共通型定義
// 各アプリとダッシュボード間で統一して使用

export type KpiUnit = 'ratio' | 'currency' | 'count' | 'index' | 'per_capita'

export type KpiCandidate = {
  kpi_code: string
  value: number
  unit_type: KpiUnit
}

export type OrgShiftEvent = {
  org_id: string
  department_id?: string | null
  app: 'motivation' | 'quiz' | 'roleplay' | 'insight' | 'local' | 'worklink' | string
  event: string
  occurred_at?: string // ISO8601
  period_date: string // 'YYYY-MM-01'
  kpi_candidates: KpiCandidate[]
  meta?: Record<string, any>
  idempotency_key?: string
}

// KPI定義の型
export type KpiDefinition = {
  id: string
  code: string
  name: string
  description?: string
  unit_type: KpiUnit
  aggregation: 'sum' | 'avg' | 'median' | 'custom'
  source_type: 'manual' | 'internal' | 'external'
  source_connector?: string
  calc_formula?: string
  thresholds?: {
    goal?: number
    warn?: number
    critical?: number
  }
  dimensions?: string[]
  visible_roles?: string[]
}

// KPIスナップショットの型
export type KpiSnapshot = {
  id: number
  org_id: string
  department_id?: string | null
  kpi_id: string
  period_date: string
  value: number
  meta?: Record<string, any>
  created_at: string
}

// 組織・部署の型
export type Organization = {
  id: string
  name: string
}

export type Department = {
  id: string
  org_id: string
  name: string
}

// イベント送信用のユーティリティ関数
export async function sendEvent(event: OrgShiftEvent, baseUrl?: string): Promise<Response> {
  const url = baseUrl || 'https://your-project.supabase.co/functions/v1/ingest/webhook'
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 本番環境では認証ヘッダーを追加
      // 'Authorization': `Bearer ${token}`,
      // 'X-Signature': generateHmacSignature(event, secretKey)
    },
    body: JSON.stringify(event)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to send event: ${response.status} ${errorText}`)
  }

  return response
}

// 期間の正規化（月初に丸める）
export function normalizePeriodDate(date: string | Date): string {
  const d = new Date(date)
  d.setDate(1)
  return d.toISOString().split('T')[0]
}

// 現在の期間を取得
export function getCurrentPeriod(): string {
  return normalizePeriodDate(new Date())
}

// 前の期間を取得
export function getPreviousPeriod(currentPeriod: string): string {
  const date = new Date(currentPeriod)
  date.setMonth(date.getMonth() - 1)
  return normalizePeriodDate(date)
}
