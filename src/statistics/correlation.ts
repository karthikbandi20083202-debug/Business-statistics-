/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CorrelationClassification, CorrelationResult, PairedObservation } from '../types/statistics';
import { formatNumber } from './centralTendency';

/**
 * Calculates Pearson's Correlation Coefficient (r) and classifications.
 */
export function calculateCorrelation(
  pairs: PairedObservation[],
  varXName: string = 'X',
  varYName: string = 'Y'
): CorrelationResult {
  const n = pairs.length;
  if (n < 2) {
    throw new Error('Correlation requires at least 2 paired observations.');
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const { x, y } of pairs) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const numerator = n * sumXY - sumX * sumY;
  const termX = n * sumX2 - sumX * sumX;
  const termY = n * sumY2 - sumY * sumY;

  // Zero variation edge cases
  if (Math.abs(termX) < 1e-12 || Math.abs(termY) < 1e-12) {
    return {
      n,
      sumX,
      sumY,
      sumXY,
      sumX2,
      sumY2,
      numerator,
      denominator: 0,
      r: 0,
      classification: 'NOT APPLICABLE',
      interpretation: 'Correlation cannot be calculated because one variable has zero variation.',
      businessSignal: `Zero variation detected in ${Math.abs(termX) < 1e-12 ? varXName : varYName}. Variable does not fluctuate, making covariance analysis statistically undefined.`,
      action: 'Ensure entered datasets feature natural operational variance across operating periods.',
      errorReason: 'Correlation cannot be calculated because one variable has zero variation.',
      steps: {
        n,
        sumX: formatNumber(sumX),
        sumY: formatNumber(sumY),
        sumXY: formatNumber(sumXY),
        sumX2: formatNumber(sumX2),
        sumY2: formatNumber(sumY2),
        numeratorCalc: `${n} × ${formatNumber(sumXY)} − (${formatNumber(sumX)})(${formatNumber(sumY)}) = ${formatNumber(numerator)}`,
        denominatorCalc: `√([${formatNumber(termX)}] × [${formatNumber(termY)}]) = 0 (Zero Variation)`,
        rCalc: 'Undefined (Division by zero)',
      },
    };
  }

  const denominator = Math.sqrt(termX * termY);

  if (denominator === 0 || isNaN(denominator)) {
    return {
      n,
      sumX,
      sumY,
      sumXY,
      sumX2,
      sumY2,
      numerator,
      denominator: 0,
      r: 0,
      classification: 'NOT APPLICABLE',
      interpretation: 'Correlation cannot be calculated because denominator evaluated to zero.',
      businessSignal: 'Statistical denominator is zero.',
      action: 'Check paired observation values.',
      errorReason: 'Correlation cannot be calculated because one variable has zero variation.',
      steps: {
        n,
        sumX: formatNumber(sumX),
        sumY: formatNumber(sumY),
        sumXY: formatNumber(sumXY),
        sumX2: formatNumber(sumX2),
        sumY2: formatNumber(sumY2),
        numeratorCalc: formatNumber(numerator),
        denominatorCalc: '0',
        rCalc: 'Undefined',
      },
    };
  }

  let rawR = numerator / denominator;

  // Numerical stability clamp to strictly [-1, +1]
  if (rawR > 1) rawR = 1;
  if (rawR < -1) rawR = -1;

  const classification = getCorrelationClassification(rawR);
  const { interpretation, businessSignal, action } = getCorrelationInterpretation(
    rawR,
    classification,
    varXName,
    varYName
  );

  return {
    n,
    sumX,
    sumY,
    sumXY,
    sumX2,
    sumY2,
    numerator,
    denominator,
    r: rawR,
    classification,
    interpretation,
    businessSignal,
    action,
    errorReason: null,
    steps: {
      n,
      sumX: formatNumber(sumX),
      sumY: formatNumber(sumY),
      sumXY: formatNumber(sumXY),
      sumX2: formatNumber(sumX2),
      sumY2: formatNumber(sumY2),
      numeratorCalc: `${n}(${formatNumber(sumXY)}) − (${formatNumber(sumX)})(${formatNumber(sumY)}) = ${formatNumber(numerator)}`,
      denominatorCalc: `√([${n}(${formatNumber(sumX2)}) − (${formatNumber(sumX)})²] × [${n}(${formatNumber(sumY2)}) − (${formatNumber(sumY)})²]) = √([${formatNumber(termX)}] × [${formatNumber(termY)}]) = ${formatNumber(denominator)}`,
      rCalc: `${formatNumber(numerator)} / ${formatNumber(denominator)} = ${formatNumber(rawR, 4)}`,
    },
  };
}

function getCorrelationClassification(r: number): CorrelationClassification {
  if (r >= 0.8) return 'VERY STRONG POSITIVE';
  if (r >= 0.6) return 'STRONG POSITIVE';
  if (r >= 0.4) return 'MODERATE POSITIVE';
  if (r >= 0.2) return 'WEAK POSITIVE';
  if (r > -0.2) return 'VERY WEAK / NEGLIGIBLE';
  if (r > -0.4) return 'WEAK NEGATIVE';
  if (r > -0.6) return 'MODERATE NEGATIVE';
  if (r > -0.8) return 'STRONG NEGATIVE';
  return 'VERY STRONG NEGATIVE';
}

function getCorrelationInterpretation(
  r: number,
  classification: CorrelationClassification,
  varX: string,
  varY: string
): { interpretation: string; businessSignal: string; action: string } {
  switch (classification) {
    case 'VERY STRONG POSITIVE':
      return {
        interpretation: `${varX} and ${varY} demonstrate a very strong positive association (r = ${formatNumber(r, 3)}), moving together tightly within this dataset.`,
        businessSignal: `High co-movement: Increases in ${varX} are consistently associated with higher values of ${varY}.`,
        action: `Use ${varX} shifts as an early indicator for joint planning, bearing in mind correlation does not imply direct causation.`,
      };
    case 'STRONG POSITIVE':
      return {
        interpretation: `${varX} and ${varY} show a strong positive linear relationship within this dataset (r = ${formatNumber(r, 3)}).`,
        businessSignal: `Clear alignment: ${varX} and ${varY} reliably trend in the same direction across operating observations.`,
        action: `Incorporate directional co-movement into demand and pricing scenarios.`,
      };
    case 'MODERATE POSITIVE':
      return {
        interpretation: `${varX} and ${varY} exhibit a moderate positive association (r = ${formatNumber(r, 3)}).`,
        businessSignal: `Noticeable shared trajectory, though additional unobserved factors also influence ${varY}.`,
        action: `Evaluate complementary drivers alongside ${varX} rather than relying on a single indicator.`,
      };
    case 'WEAK POSITIVE':
      return {
        interpretation: `The observed linear association between ${varX} and ${varY} is limited (r = ${formatNumber(r, 3)}).`,
        businessSignal: `Slight positive tendency, but relationship contains substantial statistical noise.`,
        action: `Avoid basing major operational commitments solely on ${varX} tracking.`,
      };
    case 'VERY WEAK / NEGLIGIBLE':
      return {
        interpretation: `Virtually no linear relationship exists between ${varX} and ${varY} within this dataset (r = ${formatNumber(r, 3)}).`,
        businessSignal: `Independent movement: Variations in ${varX} do not systematically reflect shifts in ${varY}.`,
        action: `Treat ${varX} and ${varY} as independent operational variables in commercial strategies.`,
      };
    case 'WEAK NEGATIVE':
      return {
        interpretation: `Mild inverse linear tendency between ${varX} and ${varY} (r = ${formatNumber(r, 3)}), though association is weak.`,
        businessSignal: `Slight negative tilt amidst high individual variation.`,
        action: `Investigate whether underlying market conditions create mild tradeoffs.`,
      };
    case 'MODERATE NEGATIVE':
      return {
        interpretation: `${varX} and ${varY} demonstrate a moderate inverse association (r = ${formatNumber(r, 3)}).`,
        businessSignal: `Counter-movement: Higher ${varX} values moderately correspond to lower ${varY} levels.`,
        action: `Account for potential volume-price tradeoffs when altering commercial terms.`,
      };
    case 'STRONG NEGATIVE':
      return {
        interpretation: `${varX} and ${varY} show a strong negative linear association (r = ${formatNumber(r, 3)}).`,
        businessSignal: `Pronounced tradeoff pattern across observations.`,
        action: `Review strategic elasticity before scaling higher values of ${varX}.`,
      };
    case 'VERY STRONG NEGATIVE':
      return {
        interpretation: `${varX} and ${varY} display a very strong inverse association (r = ${formatNumber(r, 3)}).`,
        businessSignal: `Direct inverse linkage: ${varX} expansion coincides closely with contractions in ${varY}.`,
        action: `Manage inverse dependencies with careful commercial hedging.`,
      };
    default:
      return {
        interpretation: 'Correlation cannot be established due to lack of variation.',
        businessSignal: 'Zero variance in baseline.',
        action: 'Review input data validity.',
      };
  }
}
