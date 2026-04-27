import type { BudgetAllocation, ProjectionResult } from '@/types';

// Multiplier coefficients for each budget allocation area
// Based on simplified economic models
const COEFFICIENTS = {
  digital_infra: {
    gdp: 0.32,
    employment: 0.22,
    modernization: 0.35,
  },
  education: {
    gdp: 0.25,
    employment: 0.35,
    modernization: 0.28,
  },
  research: {
    gdp: 0.28,
    employment: 0.18,
    modernization: 0.30,
  },
  subsidy: {
    gdp: 0.12,
    employment: 0.30,
    modernization: 0.10,
  },
};

const BASE_GDP = 1.0; // Starting index
const BASE_EMPLOYMENT = 65; // Starting employment rate %
const BASE_MODERNIZATION = 35; // Starting modernization index

export function runProjection(allocation: BudgetAllocation): ProjectionResult {
  const total = allocation.digital_infra + allocation.education + allocation.research + allocation.subsidy;

  if (total !== 100) {
    throw new Error('Total budget allocation must equal 100%');
  }

  // Calculate weighted effectiveness score (diminishing returns above 30% per category)
  const diminishing = (val: number) => Math.log2(val + 1) / Math.log2(31);
  
  const scores = {
    digital_infra: diminishing(allocation.digital_infra),
    education: diminishing(allocation.education),
    research: diminishing(allocation.research),
    subsidy: diminishing(allocation.subsidy),
  };

  // 10-year projection
  const gdpProjection: number[] = [];
  const employmentProjection: number[] = [];
  const yearLabels: string[] = [];
  const currentYear = new Date().getFullYear();

  for (let year = 0; year <= 10; year++) {
    yearLabels.push(`${currentYear + year}`);

    // GDP growth with compounding
    const gdpGrowthRate =
      scores.digital_infra * COEFFICIENTS.digital_infra.gdp +
      scores.education * COEFFICIENTS.education.gdp +
      scores.research * COEFFICIENTS.research.gdp +
      scores.subsidy * COEFFICIENTS.subsidy.gdp;

    const gdpMultiplier = Math.pow(1 + gdpGrowthRate * 0.08, year);
    gdpProjection.push(+(BASE_GDP * gdpMultiplier).toFixed(3));

    // Employment growth (with saturation)
    const empGrowthRate =
      scores.digital_infra * COEFFICIENTS.digital_infra.employment +
      scores.education * COEFFICIENTS.education.employment +
      scores.research * COEFFICIENTS.research.employment +
      scores.subsidy * COEFFICIENTS.subsidy.employment;

    const empTarget = BASE_EMPLOYMENT + empGrowthRate * 25;
    const employment = BASE_EMPLOYMENT + (empTarget - BASE_EMPLOYMENT) * (1 - Math.exp(-year * 0.3));
    employmentProjection.push(+employment.toFixed(1));

    // Modernization Index
    const modGrowthRate =
      scores.digital_infra * COEFFICIENTS.digital_infra.modernization +
      scores.education * COEFFICIENTS.education.modernization +
      scores.research * COEFFICIENTS.research.modernization +
      scores.subsidy * COEFFICIENTS.subsidy.modernization;

    const modTarget = BASE_MODERNIZATION + modGrowthRate * 55;
    const modernization = BASE_MODERNIZATION + (modTarget - BASE_MODERNIZATION) * (1 - Math.exp(-year * 0.25));
    employmentProjection[year] = Math.min(employmentProjection[year], 95);
  }

  // Final modernization index
  const modGrowthRateFinal =
    scores.digital_infra * COEFFICIENTS.digital_infra.modernization +
    scores.education * COEFFICIENTS.education.modernization +
    scores.research * COEFFICIENTS.research.modernization +
    scores.subsidy * COEFFICIENTS.subsidy.modernization;

  const modernizationIndex = +(BASE_MODERNIZATION + modGrowthRateFinal * 55 * (1 - Math.exp(-10 * 0.25))).toFixed(1);

  return {
    gdpProjection,
    employmentProjection,
    modernizationIndex: Math.min(modernizationIndex, 98),
    yearLabels,
  };
}

export function getModernizationColor(index: number): string {
  if (index >= 75) return '#4ade80'; // Green
  if (index >= 55) return '#ffd700'; // Gold
  if (index >= 40) return '#ff6b35'; // Orange
  return '#ef4444'; // Red
}

export function getModernizationLabel(index: number): string {
  if (index >= 85) return 'Innovation Leader';
  if (index >= 75) return 'Rapid Transformer';
  if (index >= 60) return 'Steady Progressor';
  if (index >= 45) return 'Emerging Modernizer';
  return 'Early Stage';
}
