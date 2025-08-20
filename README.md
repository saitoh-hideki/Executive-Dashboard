# OrgShift Executive Dashboard

経営が「ひと目で」会社の状態を把握し、学び→モチベ→利益の関係を明確化する次世代エグゼクティブダッシュボード

## 機能

- **KPI可視化**: 利益/人、成約率、離職率、採用コスト、学習進捗、モチベ指数を統合表示
- **AIインサイト**: データを自動分析し、経営判断に必要な洞察を自然言語で提供
- **拡張設計**: KPIメタデータ管理により、コード変更なしで指標追加・変更が可能
- **AIチャット**: KPIデータを参照した具体的なアドバイスと経営相談

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **スタイリング**: Tailwind CSS v4
- **バックエンド**: Supabase (PostgreSQL, Edge Functions)
- **チャート**: Recharts
- **アイコン**: Lucide React

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://sqzweukebvzrgqbxsywc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxendldWtlYnZ6cmdxYnhzeXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTg4NDIsImV4cCI6MjA3MTIzNDg0Mn0.9SAQEKSXigpxEcbqN1jHH5XHzxNLtIlawxBRtJ4_JHg

# 開発環境設定
NODE_ENV=development
```

### 3. Supabaseの設定

**プロジェクト情報:**
- プロジェクト名: Executive Dashboard
- プロジェクトID: `sqzweukebvzrgqbxsywc`
- リージョン: Northeast Asia (Tokyo)
- ダッシュボード: https://supabase.com/dashboard/project/sqzweukebvzrgqbxsywc

**Edge Functions:**
- `ai-chat`: AIチャット機能 ✅ デプロイ済み
- `get-ai-insights`: AIインサイト生成 ✅ デプロイ済み

**データベース:**
- スキーマ: `supabase-schema.sql` の内容で設定済み
- サンプルデータ: 初期データが投入済み

### 4. 開発サーバーの起動

```bash
npm run dev
```

## 使用方法

### ダッシュボード

- `/dashboard` - メインダッシュボード
- 主要KPIの表示
- トレンド分析と相関分析
- AIインサイトの表示

### 管理者機能

- `/admin/inputs?admin=ADMIN-ORG-A` - KPIデータ入力画面
- 月次データの手動入力
- CSVインポート/エクスポート

### AI機能

- ダッシュボード右下のチャットボタンからAIアシスタントにアクセス
- KPIモード：データに基づく具体的な回答
- 相談モード：経営に関する一般的なアドバイス

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # ダッシュボードページ
│   ├── admin/            # 管理者機能
│   └── globals.css       # グローバルスタイル
├── components/            # Reactコンポーネント
│   ├── DashboardContent.tsx
│   ├── KpiCard.tsx
│   ├── TrendChart.tsx
│   ├── CorrelationChart.tsx
│   ├── AiInsights.tsx
│   ├── AiChat.tsx
│   └── PeopleUtilization.tsx
└── lib/                  # ユーティリティ
    ├── supabase.ts       # Supabaseクライアント
    └── utils.ts          # ヘルパー関数

supabase/
├── functions/            # Edge Functions
│   ├── ai-chat/         # AIチャット機能 ✅ デプロイ済み
│   └── get-ai-insights/ # AIインサイト生成 ✅ デプロイ済み
└── _shared/             # 共有モジュール
```

## 開発

### ビルド

```bash
npm run build
```

### リント

```bash
npm run lint
```

### 型チェック

```bash
npx tsc --noEmit
```

## Supabase管理

### Edge Functionsの再デプロイ

```bash
# プロジェクトにリンク
supabase link --project-ref sqzweukebvzrgqbxsywc

# 関数をデプロイ
supabase functions deploy ai-chat
supabase functions deploy get-ai-insights
```

### データベースの管理

```bash
# スキーマの適用
supabase db push

# データベースの状態確認
supabase db diff
```

### シークレットの管理

```bash
# シークレットの一覧表示
supabase secrets list

# シークレットの設定
supabase secrets set SECRET_NAME=value
```

## トラブルシューティング

### 環境変数が設定されていない場合

```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```

→ `.env.local` ファイルが正しく設定されているか確認してください

### Supabase接続エラー

```
Error: Failed to fetch
```

→ SupabaseのURLとAPIキーが正しいか確認してください

### Edge Functionsが動作しない場合

→ Supabase Dashboardで関数のログを確認してください
→ https://supabase.com/dashboard/project/sqzweukebvzrgqbxsywc/functions

### Tailwind CSSが適用されない場合

→ `npm run dev` を再起動してください

## ライセンス

MIT License