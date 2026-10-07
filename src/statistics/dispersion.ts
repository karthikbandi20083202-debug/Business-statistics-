/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DispersionClassification, DispersionResult } from '../types/statistics';
import { formatNumber } from './centralTendency';

/**
 * Calculates Dispersion metrics:
 * Range, Q1, Q3, Quartile Deviation, Population Variance,
 * Population Standard Deviation, Coefficient of Variation (CV).
 */
export function calculateDispersion(
  data: number[],
  mean: number
): DispersionResult {
  const n = data.length;
  if (n === 0) {
    throw new Error('Dataset cannot be empty.');
  }

  const sorted = [...data].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[n - 1];

  // 1. Range = Max - Min
  const range = max - min;
  const rangeCalcStr = `Max (${formatNumber(max)}) − Min (${formatNumber(min)}) = ${formatNumber(range)}`;

  // 2. Quartiles via method of medians (Tukey's hinges)
  const { q1, q3, q1CalcStr, q3CalcStr } = calculateQuartilesWithAudit(sorted);
  const quartileDeviation = (q3 - q1) / 2;
  const qdCalcStr = `(Q3 [${formatNumber(q3)}] − Q1 [${formatNumber(q1)}]) / 2 = ${formatNumber(q3 - q1)} / 2 = ${formatNumber(quartileDeviation)}`;

  // 3. Population Variance: σ² = Σ(x - μ)² / N
  let sumSquaredDeviations = 0;
  for (const x of data) {
    const diff = x - mean;
    sumSquaredDeviations += diff * diff;
  }
  const populationVariance = sumSquaredDeviations / n;
  const varianceCalcStr = `Σ(x − μ)² = ${formatNumber(sumSquaredDeviations)}, N = ${n} → ${formatNumber(sumSquaredDeviations)} / ${n} = ${formatNumber(populationVariance)}`;

  // 4. Population Standard Deviation: σ = √Variance
  const populationStandardDeviation = Math.sqrt(populationVariance);
  const stdDevCalcStr = `√(${formatNumber(populationVariance)}) = ${formatNumber(populationStandardDeviation)}`;

  // 5. Coefficient of Variation: (σ / μ) * 100
  let coefficientOfVariation: number | null = null;
  let cvCalcStr = '';
  let classification: DispersionClassification = 'NOT APPLICABLE';

  if (Math.abs(mean) < 1e-12) {
    coefficientOfVariation = null;
    cvCalcStr = 'Mean (μ) is zero; Coefficient of Variation is undefined.';
    classification = 'NOT APPLICABLE';
  } else {
    // Relative to mean
    coefficientOfVariation = (populationStandardDeviation / Math.abs(mean)) * 100;
    cvCalcStr = `(σ [${formatNumber(populationStandardDeviation)}] / |μ| [${formatNumber(Math.abs(mean))}]) × 100% = ${formatNumber(coefficientOfVariation)}%`;

    if (coefficientOfVariation < 5) {
      classification = 'EXTREMELY CONSISTENT';
    } else if (coefficientOfVariation <= 10) {
      classification = 'VERY CONSISTENT';
    } else if (coefficientOfVariation <= 20) {
      classification = 'RELATIVELY CONSISTENT';
    } else if (coefficientOfVariation <= 30) {
      classification = 'MODERATE VARIATION';
    } else if (coefficientOfVariation <= 50) {
      classification = 'HIGH VARIATION';
    } else if (coefficientOfVariation <= 75) {
      classification = 'VERY HIGH VARIATION';
    } else {
      classification = 'EXTREMELY HIGH VARIATION';
    }
  }

  const { interpretation, businessSignal, action } = getDispersionInterpretation(
    classification,
    coefficientOfVariation
  );

  return {
    range,
    q1,
    q3,
    quartileDeviation,
    populationVariance,
    populationStandardDeviation,
    coefficientOfVariation,
    classification,
    interpretation,
    businessSignal,
    action,
    steps: {
      rangeCalculation: rangeCalcStr,
      q1Calculation: q1CalcStr,
      q3Calculation: q3CalcStr,
      qdCalculation: qdCalcStr,
      varianceFormula: 'σ² = Σ(X − μ)² / N (Population Variance)',
      varianceCalculation: varianceCalcStr,
      stdDevCalculation: stdDevCalcStr,
      cvCalculation: cvCalcStr,
    },
  };
}

function calculateQuartilesWithAudit(sorted: number[]): {
  q1: number;
  q3: number;
  q1CalcStr: string;
  q3CalcStr: string;
} {
  const n = sorted.length;
  if (n === 1) {
    return {
      q1: sorted[0],
      q3: sorted[0],
      q1CalcStr: 'Single element dataset: Q1 = ' + sorted[0],
      q3CalcStr: 'Single element dataset: Q3 = ' + sorted[0],
    };
  }

  const mid = Math.floor(n / 2);
  const lowerHalf = sorted.slice(0, mid);
  const upperHalf = n % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);

  const q1 = getMedian(lowerHalf);
  const q3 = getMedian(upperHalf);

  const q1CalcStr = `Lower half (${lowerHalf.length} elements: [${lowerHalf.map((v) => formatNumber(v)).join(', ')}]) → Median Q1 = ${formatNumber(q1)}`;
  const q3CalcStr = `Upper half (${upperHalf.length} elements: [${upperHalf.map((v) => formatNumber(v)).join(', ')}]) → Median Q3 = ${formatNumber(q3)}`;

  return { q1, q3, q1CalcStr, q3CalcStr };
}

function getMedian(arr: number[]): number {
  const len = arr.length;
  if (len === 0) return 0;
  if (len % 2 === 1) {
    return arr[Math.floor(len / 2)];
  }
  return (arr[len / 2 - 1] + arr[len / 2]) / 2;
}

function getDispersionInterpretation(
  classification: DispersionClassification,
  cv: number | null
): { interpretation: string; businessSignal: string; action: string } {
  switch (classification) {
    case 'EXTREMELY CONSISTENT':
      return {
        interpretation: 'Extremely consistent activity with near-zero relative fluctuation across operating periods.',
        businessSignal: 'Predictable baseline operations with negligible day-to-day swing.',
        action: 'Standardize operational staffing and inventory orders with high certainty.',
      };
    case 'VERY CONSISTENT':
      return {
        interpretation: 'Very consistent performance with tight clustering around the operational mean.',
        businessSignal: 'Stable commercial volume showing dependable routine cycles.',
        action: 'Maintain existing replenishment cadence; monitor for unforeseen seasonal drift.',
      };
    case 'RELATIVELY CONSISTENT':
      return {
        interpretation: 'Relatively consistent activity with manageable dispersion around normal business levels.',
        businessSignal: 'Normal commercial variation without destabilizing volatility.',
        action: 'Establish standard operating bands within ±1 standard deviation of baseline.',
      };
    case 'MODERATE VARIATION':
      return {
        interpretation: 'Moderate dispersion observed; operating figures show noticeable periodic movement.',
        businessSignal: 'Mixed period volume indicating shifts between steady and brisk business periods.',
        action: 'Implement flexible shift scheduling and dynamic buffer inventory.',
      };
    case 'HIGH VARIATION':
      return {
        interpretation: 'High variation indicates that observations fluctuate substantially relative to their average.',
        businessSignal: 'Substantial dispersion. Activity levels experience significant surges or drop-offs.',
        action: 'Investigate commercial drivers behind peak vs trough operating days.',
      };
    case 'VERY HIGH VARIATION':
      return {
        interpretation: 'Very high variation indicates wide volatility across operating observations relative to the mean.',
        businessSignal: 'High commercial volatility. Average numbers alone do not represent daily reality.',
        action: 'Track median and quartile spreads rather than simple averages to govern cash flow and inventory.',
      };
    case 'EXTREMELY HIGH VARIATION':
      return {
        interpretation: 'Extremely high variation indicates that observations fluctuate substantially relative to their average.',
        businessSignal: `Pronounced volatility (${cv ? formatNumber(cv) : ''}% CV). Observations exhibit extreme spikes or intermittent surges.`,
        action: 'Business activity may require closer monitoring of demand consistency and the factors contributing to large fluctuations.',
      };
    default:
      return {
        interpretation: 'Mean is zero; relative coefficient of variation cannot be evaluated.',
        businessSignal: 'Zero mean baseline necessitates direct absolute variance assessment.',
        action: 'Evaluate raw range and standard deviation values directly.',
      };
  }
}
