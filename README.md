# OrgShift Executive Dashboard

オーグシフト・シリーズ（Motivation / Quiz / Roleplay / Insight / Local / WorkLink）と連携するエグゼクティブダッシュボードです。

## 🚀 主要機能

### 1. KPI管理・可視化
- **必須6KPI**の自動表示・追跡
  - 利益/従業員（profit_per_employee）
  - 成約率（sales_conversion_rate）
  - 離職率（turnover_rate）
  - 採用コスト/人（hiring_cost_per_head）
  - 学習進捗率（learning_progress）
  - モチベ指数（motivation_index）
- リアルタイムKPIカード生成
- 期間別トレンド分析
- 相関分析チャート

### 2. データ連携（OrgShift Data Sharing）
- **統一イベント形式**で各アプリからデータ受信
- **Ingest Edge Function**による自動KPI変換
- 共通ID・共通KPI・共通イベントの契約
- 新アプリ追加時の最小改修

### 3. AIインサイト
- KPIデータに基づく自動分析
- 自然言語での質問応答
- 相関関係の自動発見

## 🏗️ アーキテクチャ

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   OrgShift      │    │   Ingest Edge    │    │   Dashboard     │
│   Apps          │───▶│   Function       │───▶│   (Next.js)     │
│                 │    │                  │    │                 │
│ • Motivation    │    │ • イベント受信     │    │ • KPI表示       │
│ • Quiz          │    │ • KPI変換        │    │ • トレンド分析   │
│ • Roleplay      │    │ • データ正規化    │    │ • AIインサイト   │
│ • Local         │    │ • スナップショット │    │ • 保存           │
│ • WorkLink      │    │   保存           │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📊 データフロー

### 1. イベント送信
各アプリは以下の形式でイベントを送信：

```typescript
type OrgShiftEvent = {
  org_id: string;           // 組織ID（必須）
  department_id?: string;   // 部署ID（オプション）
  app: string;              // アプリ名
  event: string;            // イベント名
  period_date: string;      // 期間（月初日）
  kpi_candidates: {         // KPI候補
    kpi_code: string;
    value: number;
    unit_type: KpiUnit;
  }[];
  meta?: Record<string, any>;
}
```

### 2. 自動変換
Ingest Edge Functionが：
- イベントを検証・正規化
- KPIコードを解決
- スナップショットに変換・保存

### 3. ダッシュボード表示
- KPIメタデータ駆動の自動カード生成
- リアルタイム更新
- 相関分析・AIインサイト

## 🛠️ セットアップ

### 1. 依存関係インストール
```bash
npm install
```

### 2. 環境変数設定
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. データベース初期化
```bash
# supabase-schema.sqlを実行
psql -h your_host -U your_user -d your_db -f supabase-schema.sql
```

### 4. 開発サーバー起動
```bash
npm run dev
```

## 🔧 開発・テスト

### イベント送信テスト
管理画面（`/admin/inputs?admin=ADMIN-ORG-A`）で：
- 各アプリのイベント送信をシミュレート
- データ連携の動作確認
- KPI変換の検証

### 新KPI追加
1. `kpis`テーブルに1レコード追加
2. ダッシュボードに自動表示
3. 必要に応じてIngestマッピング追加

### 新アプリ連携
1. 共通イベント形式でデータ送信
2. `sendEvent()`関数を使用
3. ダッシュボード側の変更は不要

## 📁 プロジェクト構造

```
orgshift-dashboard/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── dashboard/       # メインダッシュボード
│   │   ├── admin/           # 管理画面
│   │   └── globals.css      # グローバルスタイル
│   ├── components/          # Reactコンポーネント
│   │   ├── KpiCard.tsx      # KPIカード
│   │   ├── TrendChart.tsx   # トレンドチャート
│   │   ├── EventSender.tsx  # イベント送信テスト
│   │   └── ...
│   └── lib/                 # ユーティリティ
│       ├── types.ts         # 共通型定義
│       ├── supabase.ts      # Supabase設定
│       └── utils.ts         # ヘルパー関数
├── supabase/
│   ├── functions/           # Edge Functions
│   │   └── ingest/          # データ受信
│   └── ...
├── supabase-schema.sql      # データベーススキーマ
└── package.json
```

## 🔒 セキュリティ

### プロトタイプ環境
- RLS OFF（開発用）
- 固定トークン認証
- CORS許可

### 本番環境
- RLS ON（行レベル制御）
- HMAC-SHA256署名検証
- SSO + RBAC
- 組織別データ分離

## 📈 拡張性

### 新KPI追加
```sql
INSERT INTO kpis (code, name, unit_type, source_type) 
VALUES ('new_kpi', '新KPI', 'ratio', 'internal');
```

### 新アプリ連携
```typescript
// イベント送信のみ
await sendEvent({
  org_id: 'org_id',
  app: 'new_app',
  event: 'new_event',
  period_date: '2025-07-01',
  kpi_candidates: [...]
});
```

## 🤝 コントリビューション

1. イシューの作成
2. フィーチャーブランチの作成
3. コードの実装・テスト
4. プルリクエストの作成

## 📄 ライセンス

MIT License

---

**OrgShift Executive Dashboard** - オーグシフト・シリーズの統合データ可視化プラットフォーム