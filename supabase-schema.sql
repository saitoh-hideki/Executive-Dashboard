-- 組織・部署
create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade,
  name text not null
);

-- KPIメタ（拡張の核）
create table if not exists kpis (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  unit_type text check (unit_type in ('ratio','currency','count','index','per_capita')),
  aggregation text check (aggregation in ('sum','avg','median','custom')) default 'avg',
  source_type text check (source_type in ('manual','internal','external')) not null,
  source_connector text,
  calc_formula text,
  thresholds jsonb,
  dimensions text[],
  visible_roles text[]
);

-- KPIスナップショット（月次など）
create table if not exists kpi_snapshots (
  id bigserial primary key,
  org_id uuid references orgs(id) on delete cascade,
  department_id uuid references departments(id) on delete set null,
  kpi_id uuid references kpis(id) on delete cascade,
  period_date date not null,
  value numeric not null,
  meta jsonb,
  created_at timestamptz default now(),
  unique (org_id, department_id, kpi_id, period_date)
);

-- 手入力ログ（任意）
create table if not exists kpi_manual_inputs (
  id bigserial primary key,
  org_id uuid references orgs(id) on delete cascade,
  department_id uuid references departments(id) on delete set null,
  kpi_id uuid references kpis(id) on delete cascade,
  period_date date not null,
  value numeric not null,
  note text,
  created_at timestamptz default now()
);

-- ダッシュボードレイアウト
create table if not exists dashboards (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade,
  name text not null,
  is_default boolean default false
);

create table if not exists dashboard_widgets (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid references dashboards(id) on delete cascade,
  kpi_id uuid references kpis(id) on delete cascade,
  position integer not null,
  width integer default 1,
  config jsonb
);

-- Motivation最小（モチベ指数の内部集計用）
create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null
);

create table if not exists profiles (
  id bigserial primary key,
  device_id text unique not null,
  display_name text,
  avatar_style text,
  community_code text references communities(code)
);

create table if not exists tasks (
  id bigserial primary key,
  device_id text not null,
  community_code text references communities(code),
  category text check (category in ('work','learn','life','local')) not null,
  title text not null,
  done boolean default false,
  created_at timestamptz default now(),
  done_at timestamptz
);

create table if not exists posts (
  id bigserial primary key,
  community_code text references communities(code),
  device_id text not null,
  task_id bigint references tasks(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists reactions (
  id bigserial primary key,
  post_id bigint references posts(id) on delete cascade,
  device_id text not null,
  type text check (type in ('clap','fire','power')) not null,
  created_at timestamptz default now(),
  unique (post_id, device_id, type)
);

-- AIインサイト/チャット（キャッシュ/ログ）
create table if not exists ai_insights (
  id bigserial primary key,
  org_id uuid not null references orgs(id),
  period_date date not null,
  scope text default 'company',
  department_id uuid references departments(id),
  prompt_hash text not null,
  insight_text text not null,
  stats jsonb,
  created_at timestamptz default now(),
  unique (org_id, period_date, scope, coalesce(department_id,'00000000-0000-0000-0000-000000000000'), prompt_hash)
);

create table if not exists ai_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id),
  created_at timestamptz default now()
);

create table if not exists ai_chat_messages (
  id bigserial primary key,
  session_id uuid references ai_chat_sessions(id) on delete cascade,
  role text check (role in ('user','assistant','system')) not null,
  content text not null,
  meta jsonb,
  created_at timestamptz default now()
);

-- 初期データ（サンプル）
DO $$
DECLARE
  org_id uuid;
BEGIN
  -- 組織作成
  INSERT INTO orgs (name) VALUES ('Sample Corp') RETURNING id INTO org_id;
  
  -- 部署作成
  INSERT INTO departments (org_id, name) VALUES 
    (org_id, '営業'),
    (org_id, '開発');
  
  -- KPI定義（仕様書の必須6点）
  INSERT INTO kpis (code, name, description, unit_type, source_type, source_connector, calc_formula, thresholds, dimensions, visible_roles) VALUES
    ('profit_per_employee', '利益/従業員', '営業利益を従業員数で割った値。最重要KPI。', 'currency', 'manual', 'manual_form', 'gross_profit / headcount', '{"goal":1800000,"warn":1200000}', ARRAY['department','period'], ARRAY['executive','hr','admin']),
    ('sales_conversion_rate', '成約率', '商談から成約への転換率。', 'ratio', 'manual', 'manual_form', 'closed_deals / total_opportunities', '{"goal":0.30,"warn":0.20}', ARRAY['department','period'], ARRAY['executive','sales','admin']),
    ('turnover_rate', '離職率', '従業員の離職率。', 'ratio', 'manual', 'manual_form', 'departures / average_headcount', '{"goal":0.05,"warn":0.08}', ARRAY['department','period'], ARRAY['executive','hr','admin']),
    ('hiring_cost_per_head', '採用コスト/人', '1人採用するための総コスト。', 'currency', 'manual', 'manual_form', 'total_hiring_cost / new_hires', '{"goal":300000,"warn":450000}', ARRAY['department','period'], ARRAY['executive','hr','admin']),
    ('learning_progress', '学習進捗率', '従業員の学習完了率。', 'ratio', 'internal', 'motivation', 'completed_tasks / total_assigned_tasks', '{"goal":0.75,"warn":0.60}', ARRAY['department','period'], ARRAY['executive','hr','admin']),
    ('motivation_index', 'モチベ指数', '達成タスク数と応援数の合成指数。', 'index', 'internal', 'motivation', 'achievement_score * support_score', '{"goal":70,"warn":50}', ARRAY['department','period'], ARRAY['executive','hr','admin']);
  
  -- サンプルスナップショット（2025年7月）
  INSERT INTO kpi_snapshots (org_id, kpi_id, period_date, value)
  SELECT org_id, k.id, '2025-07-01'::date, 
    CASE k.code
      WHEN 'profit_per_employee' THEN 1650000
      WHEN 'sales_conversion_rate' THEN 0.28
      WHEN 'turnover_rate' THEN 0.042
      WHEN 'hiring_cost_per_head' THEN 350000
      WHEN 'learning_progress' THEN 0.72
      WHEN 'motivation_index' THEN 68
    END
  FROM kpis k;
  
  -- 前月のデータ（2025年6月）
  INSERT INTO kpi_snapshots (org_id, kpi_id, period_date, value)
  SELECT org_id, k.id, '2025-06-01'::date,
    CASE k.code
      WHEN 'profit_per_employee' THEN 1473214
      WHEN 'sales_conversion_rate' THEN 0.25
      WHEN 'turnover_rate' THEN 0.048
      WHEN 'hiring_cost_per_head' THEN 380000
      WHEN 'learning_progress' THEN 0.68
      WHEN 'motivation_index' THEN 62
    END
  FROM kpis k;
END $$;