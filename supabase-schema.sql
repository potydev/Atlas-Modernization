-- ============================================
-- The Modernization Atlas - Supabase Schema
-- ============================================

-- 1. Pledges table
CREATE TABLE IF NOT EXISTS pledges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  message TEXT NOT NULL CHECK (char_length(message) <= 200),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Simulator runs table
CREATE TABLE IF NOT EXISTS simulator_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_digital_infra NUMERIC CHECK (budget_digital_infra >= 0 AND budget_digital_infra <= 100),
  budget_education NUMERIC CHECK (budget_education >= 0 AND budget_education <= 100),
  budget_research NUMERIC CHECK (budget_research >= 0 AND budget_research <= 100),
  budget_subsidy NUMERIC CHECK (budget_subsidy >= 0 AND budget_subsidy <= 100),
  projected_gdp NUMERIC,
  projected_employment NUMERIC,
  modernization_index NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Page views table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Pledges: SELECT enabled for anon, INSERT enabled for anon
CREATE POLICY "Pledges are readable by everyone" ON pledges
  FOR SELECT USING (true);

CREATE POLICY "Anyone can submit a pledge" ON pledges
  FOR INSERT WITH CHECK (true);

-- Simulator runs: INSERT enabled for anon, SELECT disabled for anon (admin only)
CREATE POLICY "Anyone can submit simulator runs" ON simulator_runs
  FOR INSERT WITH CHECK (true);

-- No SELECT policy for simulator_runs = only admin (service_role) can read

-- Page views: INSERT enabled for anon, SELECT disabled for anon
CREATE POLICY "Anyone can insert page views" ON page_views
  FOR INSERT WITH CHECK (true);

-- No SELECT policy for page_views = only admin (service_role) can read

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_pledges_created_at ON pledges (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulator_runs_created_at ON simulator_runs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_section ON page_views (section);
