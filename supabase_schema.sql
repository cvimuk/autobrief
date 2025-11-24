-- TM Web Structure Generator - Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Projects table: เก็บทุก project ที่สร้าง
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name VARCHAR(100) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  focus_type VARCHAR(100) NOT NULL,
  focus_percentages JSONB NOT NULL, -- {"lottery": 60, "casino": 40}
  url_style VARCHAR(20) NOT NULL, -- "nested" or "flat"
  output_language VARCHAR(20) NOT NULL, -- "thai" or "thai_english"
  total_pages INTEGER NOT NULL,
  tone VARCHAR(50) DEFAULT 'professional',
  word_count_range VARCHAR(20) DEFAULT '1500-2000',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pages table: เก็บทุกหน้าที่ generate
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url_path VARCHAR(255) NOT NULL,
  page_type VARCHAR(50) NOT NULL, -- "pillar", "cluster", "conversion", "support"
  title_pattern VARCHAR(255) NOT NULL,
  category VARCHAR(50), -- "lottery", "casino", "slots", "football", "general"
  search_intent VARCHAR(50), -- "informational", "transactional", "navigational", "commercial"
  is_required BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20), -- "main", "primary", "secondary", "cta"
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content briefs table: เก็บ brief ของแต่ละหน้า
CREATE TABLE IF NOT EXISTS content_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  h1 VARCHAR(255),
  content_structure JSONB, -- [{h2: "...", h3s: ["...", "..."]}]
  word_count_min INTEGER,
  word_count_max INTEGER,
  internal_links JSONB, -- [{target: "/lottery", type: "pillar"}, ...]
  cta_placements JSONB, -- [{position: "after_intro", text: "สมัครเลย"}]
  keywords JSONB, -- ["หวยฮานอย", "แทงหวย", ...]
  created_at TIMESTAMP DEFAULT NOW()
);

-- URL patterns table: เก็บ patterns ที่ใช้ไปแล้ว (เช็ค duplicate)
CREATE TABLE IF NOT EXISTS url_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern VARCHAR(255) NOT NULL UNIQUE, -- normalized pattern
  example_url VARCHAR(255) NOT NULL,
  project_id UUID REFERENCES projects(id),
  category VARCHAR(50),
  used_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_domain ON projects(domain);
CREATE INDEX IF NOT EXISTS idx_projects_brand ON projects(brand_name);
CREATE INDEX IF NOT EXISTS idx_pages_project ON pages(project_id);
CREATE INDEX IF NOT EXISTS idx_url_patterns_pattern ON url_patterns(pattern);
CREATE INDEX IF NOT EXISTS idx_url_patterns_category ON url_patterns(category);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample seed data for testing (optional)
-- Uncomment to insert test data
/*
INSERT INTO projects (brand_name, domain, focus_type, focus_percentages, url_style, output_language, total_pages)
VALUES ('rb7', 'rb7huay.com', 'หวย + คาสิโน', '{"lottery": 60, "casino": 40}', 'nested', 'thai_english', 10);
*/
