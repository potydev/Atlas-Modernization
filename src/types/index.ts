// ============ Supabase Types ============

export interface Pledge {
  id: string;
  name: string;
  country: string | null;
  message: string;
  created_at: string;
}

export interface SimulatorRun {
  id: string;
  budget_digital_infra: number;
  budget_education: number;
  budget_research: number;
  budget_subsidy: number;
  projected_gdp: number;
  projected_employment: number;
  modernization_index: number;
  created_at: string;
}

export interface PageView {
  id: string;
  section: string;
  count: number;
  created_at: string;
}

// ============ Data Types ============

export interface GDPCountryData {
  country: string;
  code: string;
  values: { year: number; gdp: number }[];
}

export interface Pillar {
  id: string;
  title: string;
  icon: string;
  description: string;
  stat: string;
  statLabel: string;
  detail: string;
  color: string;
}

export interface CaseStudy {
  id: string;
  country: string;
  flag: string;
  image: string;
  metrics: { label: string; value: string; change: string }[];
  narrative: string;
  period: string;
}

export interface HumanProfile {
  id: string;
  name: string;
  from: string;
  to: string;
  country: string;
  image: string;
  quote: string;
  timeline: { year: string; event: string }[];
}

export interface GlobeHotspot {
  name: string;
  lat: number;
  lng: number;
  modernizationIndex: number;
  color: string;
}

// ============ Simulator Types ============

export interface BudgetAllocation {
  digital_infra: number;
  education: number;
  research: number;
  subsidy: number;
}

export interface ProjectionResult {
  gdpProjection: number[];
  employmentProjection: number[];
  modernizationIndex: number;
  yearLabels: string[];
}

// ============ Animation Types ============

export interface AnimationPreset {
  element: HTMLElement | string;
  delay?: number;
  duration?: number;
  ease?: string;
}

// ============ Component Props ============

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover3D?: boolean;
  onClick?: () => void;
}

export interface GlowButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
}

export interface AnimatedNumberProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}
