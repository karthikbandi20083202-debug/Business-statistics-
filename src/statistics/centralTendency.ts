/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CentralClassification, CentralTendencyResult } from '../types/statistics';

/**
 * Calculates Central Tendency metrics:
 * Mean, Median, Mode, Min, Max, Total, and Mean-Median Difference %
 */
export function calculateCentralTendency(data: number[]): CentralTendencyResult {
  const n = data.length;
  if (n === 0) {
    throw new Error('Dataset cannot be empty.');
  }

  // Preserve full internal precision
  const total = data.reduce((acc, val) => acc + val, 0);
  const mean = total / n;

  const min = Math.min(...data);
  const max = Math.max(...data);

  // Sorted copy for Median and Quartiles
  const sorted = [...data].sort((a, b) => a - b);

  // Median calculation
  let median: number;
  let medianCalcStr = '';
  if (n % 2 === 1) {
    const midIdx = Math.floor(n / 2);
    median = sorted[midIdx];
    medianCalcStr = `n is odd (${n}): middle observation at position ${(n + 1) / 2} = ${formatNumber(median)}`;
  } else {
    const mid1 = sorted[n / 2 - 1];
    const mid2 = sorted[n / 2];
    median = (mid1 + mid2) / 2;
    medianCalcStr = `n is even (${n}): average of positions ${n / 2} (${formatNumber(mid1)}) and ${n / 2 + 1} (${formatNumber(mid2)}) = (${formatNumber(mid1)} + ${formatNumber(mid2)}) / 2 = ${formatNumber(median)}`;
  }

  // Mode calculation
  const freqMap = new Map<number, number>();
  for (const val of data) {
    freqMap.set(val, (freqMap.get(val) || 0) + 1);
  }

  let maxFreq = 0;
  for (const count of freqMap.values()) {
    if (count > maxFreq) {
      maxFreq = count;
    }
  }

  let mode: number[] | 'NO_MODE' = 'NO_MODE';
  let modeDescription = '';

  if (maxFreq === 1) {
    mode = 'NO_MODE';
    modeDescription = 'No mode — all observations occur with equal frequency (1 time each).';
  } else {
    const modes: number[] = [];
    for (const [val, count] of freqMap.entries()) {
      if (count === maxFreq) {
        modes.push(val);
      }
    }
    // Sort modes for display
    modes.sort((a, b) => a - b);
    mode = modes;

    if (modes.length === 1) {
      modeDescription = `Unimodal: ${formatNumber(modes[0])} occurs ${maxFreq} times (highest frequency).`;
    } else {
      modeDescription = `Multimodal (${modes.length} modes): [${modes.map((m) => formatNumber(m)).join(', ')}] each occur ${maxFreq} times.`;
    }
  }

  // Mean-Median Difference %: ABS(mean - median) / median * 100
  let diffPercent: number | null = null;
  let diffCalcStr = '';
  let classification: CentralClassification = 'NOT APPLICABLE';

  if (Math.abs(median) < 1e-12) {
    diffPercent = null;
    diffCalcStr = 'Median is zero; percentage difference relative to median is undefined.';
    classification = 'NOT APPLICABLE';
  } else {
    diffPercent = (Math.abs(mean - median) / Math.abs(median)) * 100;
    diffCalcStr = `|${formatNumber(mean)} - ${formatNumber(median)}| / |${formatNumber(median)}| × 100% = ${formatNumber(diffPercent)}%`;

    if (diffPercent < 2) {
      classification = 'VERY CLOSE';
    } else if (diffPercent <= 5) {
      classification = 'SLIGHT DIFFERENCE';
    } else if (diffPercent <= 10) {
      classification = 'MODERATE DIFFERENCE';
    } else if (diffPercent <= 20) {
      classification = 'SUBSTANTIAL DIFFERENCE';
    } else {
      classification = 'CONSIDERABLE DIFFERENCE';
    }
  }

  // Rule-based interpretations
  const { interpretation, businessSignal, action } = getCentralInterpretation(classification, diffPercent, mean, median);

  return {
    count: n,
    total,
    min,
    max,
    mean,
    median,
    mode,
    meanMedianDiffPercent: diffPercent,
    classification,
    interpretation,
    businessSignal,
    action,
    steps: {
      meanFormula: 'Mean (μ) = ΣX / N',
      meanCalculation: `ΣX = ${formatNumber(total)}, N = ${n} → ${formatNumber(total)} / ${n}`,
      meanResult: `${formatNumber(mean)}`,
      medianFormula: n % 2 === 1 ? 'Median = X[(N + 1) / 2]' : 'Median = (X[N/2] + X[N/2 + 1]) / 2',
      medianCalculation: medianCalcStr,
      medianResult: `${formatNumber(median)}`,
      modeDescription,
      diffCalculation: diffCalcStr,
    },
  };
}

function getCentralInterpretation(
  classification: CentralClassification,
  diffPercent: number | null,
  mean: number,
  median: number
): { interpretation: string; businessSignal: string; action: string } {
  switch (classification) {
    case 'VERY CLOSE':
      return {
        interpretation: 'Mean and median are highly aligned, indicating that the central location of the dataset is relatively stable.',
        businessSignal: 'Symmetric activity curve. Typical business days reflect the overall average without heavy skew.',
        action: 'Baseline metrics can reliably anchor monthly forecasts and staffing allocations.',
      };
    case 'SLIGHT DIFFERENCE':
      return {
        interpretation: 'Mean and median show a slight difference, reflecting a largely balanced central distribution with mild asymmetry.',
        businessSignal: 'Mild distributional tilt. Occasional peak days elevate or depress the mathematical average slightly.',
        action: 'Monitor peak periods while utilizing the mean as the primary standard operating indicator.',
      };
    case 'MODERATE DIFFERENCE':
      return {
        interpretation: 'Mean and median exhibit a moderate difference, indicating moderate skewness or variation in business activity.',
        businessSignal: `Noticeable divergence (${diffPercent ? formatNumber(diffPercent) : ''}%). ${mean > median ? 'Upper-tier outlier events are lifting the mean above typical volume.' : 'Slower periods are pulling the mean below mid-point volume.'}`,
        action: 'Cross-reference operational capacity using the median as the typical customer day baseline.',
      };
    case 'SUBSTANTIAL DIFFERENCE':
      return {
        interpretation: 'Mean and median display a substantial difference, signaling notable asymmetry and potential concentration effects.',
        businessSignal: 'Pronounced asymmetry. A significant portion of volume or revenue is concentrated in specific outlier periods.',
        action: 'Separate high-volume anomaly periods from everyday baseline planning to avoid over-committing resources.',
      };
    case 'CONSIDERABLE DIFFERENCE':
      return {
        interpretation: 'Mean and median differ considerably. Extreme or uneven observations may be influencing the mean, so the median may provide an important complementary view.',
        businessSignal: 'High skewness profile. Mathematical average is disproportionately driven by extreme values rather than typical occurrences.',
        action: 'Adopt median-centered targets for standard commercial routines; analyze extreme outliers as independent operational events.',
      };
    default:
      return {
        interpretation: 'Zero-median baseline detected. Relative percentage calculation is unavailable.',
        businessSignal: 'Non-standard zero central value requires direct level comparison.',
        action: 'Inspect individual values and dispersion before setting commercial goals.',
      };
  }
}

/**
 * Clean formatting utility for presentation without mutating internal precision.
 */
export function formatNumber(val: number, decimals: number = 2): string {
  if (!isFinite(val)) return 'N/A';
  // If it's an exact integer, show clean integer or standard decimals depending on context
  if (Number.isInteger(val)) {
    return val.toString();
  }
  return Number(val.toFixed(decimals)).toString();
}
