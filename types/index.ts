// Database Types
export interface Project {
  id: string;
  brand_name: string;
  domain: string;
  focus_type: string;
  focus_percentages: Record<string, number>;
  url_style: 'nested' | 'flat';
  output_language: 'thai' | 'thai_english';
  total_pages: number;
  tone?: string;
  word_count_range?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Page {
  id: string;
  project_id: string;
  url_path: string;
  page_type: 'pillar' | 'cluster' | 'conversion' | 'support';
  title_pattern: string;
  category?: 'lottery' | 'casino' | 'slots' | 'football' | 'general';
  search_intent?: 'informational' | 'transactional' | 'navigational' | 'commercial';
  is_required: boolean;
  priority?: 'main' | 'primary' | 'secondary' | 'cta';
  created_at?: string;
}

export interface ContentBrief {
  id: string;
  page_id: string;
  meta_title?: string;
  meta_description?: string;
  h1?: string;
  content_structure?: ContentSection[];
  word_count_min?: number;
  word_count_max?: number;
  internal_links?: InternalLink[];
  cta_placements?: CTAPlacement[];
  keywords?: string[];
  created_at?: string;
}

export interface ContentSection {
  h2: string;
  h3s?: string[];
  description?: string;
}

export interface InternalLink {
  target: string;
  anchor_suggestion?: string;
  type: 'pillar' | 'cluster' | 'support';
}

export interface CTAPlacement {
  position: string;
  text: string;
  link: string;
}

export interface URLPattern {
  id: string;
  pattern: string;
  example_url: string;
  project_id?: string;
  category?: string;
  used_count: number;
  created_at?: string;
}

// Form Types
export interface ProjectFormData {
  brand_name: string;
  domain: string;
  focus_type: FocusType;
  focus_percentages: Record<string, number>;
  total_pages: number;
  url_style: 'nested' | 'flat';
  output_language: 'thai' | 'thai_english';
  tone?: string;
  word_count_range?: string;
  custom_cta_text?: string;
}

// Focus Types
export type FocusType =
  | 'บอลล้วน'
  | 'บอล + คาสิโน'
  | 'คาสิโนล้วน'
  | 'คาสิโน + สล็อต'
  | 'สล็อตล้วน'
  | 'หวยล้วน'
  | 'หวย + คาสิโน'
  | 'หวย + คาสิโน + สล็อต'
  | 'หวย + คาสิโน + สล็อต + บอล';

export const FOCUS_TYPE_CONFIGS: Record<FocusType, Record<string, number>> = {
  'บอลล้วน': { football: 100 },
  'บอล + คาสิโน': { football: 60, casino: 40 },
  'คาสิโนล้วน': { casino: 100 },
  'คาสิโน + สล็อต': { casino: 60, slots: 40 },
  'สล็อตล้วน': { slots: 100 },
  'หวยล้วน': { lottery: 100 },
  'หวย + คาสิโน': { lottery: 60, casino: 40 },
  'หวย + คาสิโน + สล็อต': { lottery: 50, casino: 30, slots: 20 },
  'หวย + คาสิโน + สล็อต + บอล': { lottery: 40, casino: 25, slots: 20, football: 15 }
};

// API Response Types
export interface GenerateStructureResponse {
  pages: Page[];
  internal_links: Record<string, string[]>;
}

export interface GenerateBriefResponse extends ContentBrief {}

// Export Types
export type ExportFormat = 'json' | 'csv' | 'markdown' | 'zip';

export interface ExportData {
  project: Project;
  pages: Page[];
  briefs?: ContentBrief[];
}
