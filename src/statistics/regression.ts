/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PairedObservation, RegressionResult, RegressionStrengthClassification } from '../types/statistics';
import { formatNumber } from './centralTendency';

/**
 * Calculates Simple Linear Least-Squares Regression:
 * Slope (b), Intercept (a), Equation (Y = a + bX), and R² (r²).
 */
export function calculateRegression(
  pairs: PairedObservation[],
  varXName: string = 'X',
  varYName: string = 'Y'
): RegressionResult {
  const n = pairs.length;
  if (n < 2) {
    throw new Error('Regression requires at least 2 paired observations.');
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

  const denominatorX = n * sumX2 - sumX * sumX;

  // Zero variation in X edge case
  if (Math.abs(denominatorX) < 1e-12) {
    return {
      n,
      sumX,
      sumY,
      sumXY,
      sumX2,
      sumY2,
      slope: 0,
      intercept: 0,
      equation: 'Undefined',
      r: 0,
      r2: 0,
      r2Percent: 0,
      classification: 'NOT APPLICABLE',
      interpretation: 'Regression cannot be calculated because the independent variable has zero variation.',
      businessSignal: `Zero variation detected in independent variable (${varXName}). A linear slope cannot be determined without variation in the predictor.`,
      action: 'Ensure entered predictor values capture natural variance across operating observations.',
      errorReason: 'Regression cannot be calculated because the independent variable has zero variation.',
      steps: {
        n,
        sumX: formatNumber(sumX),
        sumY: formatNumber(sumY),
        sumXY: formatNumber(sumXY),
        sumX2: formatNumber(sumX2),
        sumY2: formatNumber(sumY2),
        slopeFormula: 'b = [nΣXY − (ΣX)(ΣY)] / [nΣX² − (ΣX)²]',
        slopeCalculation: 'Denominator evaluates to 0 (Zero variation in X)',
        interceptFormula: 'a = [ΣY − bΣX] / n',
        interceptCalculation: 'Cannot compute intercept without slope',
        equationString: 'Undefined',
        r2Calculation: 'Undefined',
      },
    };
  }

  const numeratorSlope = n * sumXY - sumX * sumY;
  const slope = numeratorSlope / denominatorX;
  const intercept = (sumY - slope * sumX) / n;

  // Pearson r and R²
  const denominatorY = n * sumY2 - sumY * sumY;
  let r = 0;
  if (denominatorX > 0 && denominatorY > 0) {
    const rawR = numeratorSlope / Math.sqrt(denominatorX * denominatorY);
    r = Math.min(1, Math.max(-1, rawR));
  }
  const r2 = Math.min(1, Math.max(0, r * r));
  const r2Percent = r2 * 100;

  const classification = getRegressionStrengthClassification(r2Percent);

  const sign = slope >= 0 ? '+' : '−';
  const absSlopeStr = formatNumber(Math.abs(slope), 4);
  const interceptStr = formatNumber(intercept, 2);
  const equation = `${varYName} = ${interceptStr} ${sign} ${absSlopeStr}${varXName}`;

  const { interpretation, businessSignal, action } = getRegressionInterpretation(
    r2Percent,
    classification,
    slope,
    intercept,
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
    slope,
    intercept,
    equation,
    r,
    r2,
    r2Percent,
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
      slopeFormula: 'b = [nΣXY − (ΣX)(ΣY)] / [nΣX² − (ΣX)²]',
      slopeCalculation: `[${n}(${formatNumber(sumXY)}) − (${formatNumber(sumX)})(${formatNumber(sumY)})] / [${n}(${formatNumber(sumX2)}) − (${formatNumber(sumX)})²] = ${formatNumber(numeratorSlope)} / ${formatNumber(denominatorX)} = ${formatNumber(slope, 4)}`,
      interceptFormula: 'a = [ΣY − bΣX] / n',
      interceptCalculation: `[${formatNumber(sumY)} − (${formatNumber(slope, 4)})(${formatNumber(sumX)})] / ${n} = ${formatNumber(intercept, 2)}`,
      equationString: equation,
      r2Calculation: `R² = r² = (${formatNumber(r, 4)})² = ${formatNumber(r2, 4)} (${formatNumber(r2Percent, 1)}%)`,
    },
  };
}

/**
 * Predicts Y given a specified X value using the linear equation:
 * Predicted Y = a + bX
 */
export function predictY(
  intercept: number,
  slope: number,
  xVal: number
): number {
  return intercept + slope * xVal;
}

function getRegressionStrengthClassification(r2Percent: number): RegressionStrengthClassification {
  if (r2Percent >= 90) return 'EXTREMELY STRONG';
  if (r2Percent >= 75) return 'VERY STRONG';
  if (r2Percent >= 50) return 'STRONG';
  if (r2Percent >= 25) return 'MODERATE';
  if (r2Percent >= 10) return 'WEAK';
  return 'VERY WEAK';
}

function getRegressionInterpretation(
  r2Percent: number,
  classification: RegressionStrengthClassification,
  slope: number,
  intercept: number,
  varX: string,
  varY: string
): { interpretation: string; businessSignal: string; action: string } {
  const roundedR2 = formatNumber(r2Percent, 1);
  const baseMeaning = `Approximately ${roundedR2}% of the variation in ${varY} is explained by the linear relationship with ${varX} within this dataset.`;

  const slopeDirection = slope >= 0 
    ? `${varY} tends to increase as ${varX} increases within the observed dataset (positive marginal sensitivity of +${formatNumber(slope, 4)}).`
    : `${varY} tends to decrease as ${varX} increases within the observed dataset (negative marginal sensitivity of ${formatNumber(slope, 4)}).`;

  switch (classification) {
    case 'EXTREMELY STRONG':
      return {
        interpretation: `${baseMeaning} The linear specification captures nearly all systematic variance.`,
        businessSignal: `${slopeDirection} High predictive reliability across the sample range.`,
        action: `Use the fitted linear model as a calibrated planning reference, bearing in mind that empirical association does not prove direct causation.`,
      };
    case 'VERY STRONG':
      return {
        interpretation: `${baseMeaning} The model demonstrates very strong explanatory capability.`,
        businessSignal: `${slopeDirection} Baseline intercept is estimated at ${formatNumber(intercept, 2)}.`,
        action: `Incorporate model projections into revenue and pricing estimations; monitor for external market changes.`,
      };
    case 'STRONG':
      return {
        interpretation: `${baseMeaning} The linear model accounts for the majority of observed movement.`,
        businessSignal: `${slopeDirection} Substantial linear coupling, while approximately ${formatNumber(100 - r2Percent, 1)}% of variance reflects external factors.`,
        action: `Combine linear estimations with operational domain knowledge when setting targets.`,
      };
    case 'MODERATE':
      return {
        interpretation: `${baseMeaning}`,
        businessSignal: `${slopeDirection} A moderate portion of variation is associated with ${varX}, while significant unexplained dispersion remains.`,
        action: `Use linear predictions as directional guidance rather than deterministic commercial commitments.`,
      };
    case 'WEAK':
      return {
        interpretation: `${baseMeaning} Linear association explains only a modest fraction of total variance.`,
        businessSignal: `${slopeDirection} Substantial residual dispersion exists around the regression line.`,
        action: `Avoid relying on single-variable linear forecasting for critical resource commitments.`,
      };
    case 'VERY WEAK':
      return {
        interpretation: `${baseMeaning} Minimal linear explanatory capacity.`,
        businessSignal: `No reliable linear trend observed between ${varX} and ${varY} within this dataset.`,
        action: `Investigate non-linear patterns or additional operating factors before drawing conclusions.`,
      };
    default:
      return {
        interpretation: 'Model evaluation unavailable due to zero variance in predictor.',
        businessSignal: 'Zero variance in independent variable.',
        action: 'Review input data validity.',
      };
  }
}
