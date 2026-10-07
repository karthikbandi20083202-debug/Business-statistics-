/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  TimeSeriesObservation, 
  TimeSeriesResult, 
  TimeSeriesTrajectory,
  TimeSeriesAuditRow,
  TimeSeriesForecastItem 
} from '../types/statistics';
import { formatNumber } from './centralTendency';

/**
 * Calculates Time Series Decomposition & Secular Trend Analysis:
 * 1. Least-Squares Linear Secular Trend Line (T = a + bt)
 * 2. 3-Period Simple Moving Average (Smoothing)
 * 3. Trend Residuals & Fluctuation Variance
 * 4. Mean Absolute Percentage Error (MAPE)
 * 5. Multi-Period Forward Forecast Projections
 */
export function calculateTimeSeries(
  observations: TimeSeriesObservation[],
  variableName: string = 'Observed Value'
): TimeSeriesResult {
  const n = observations.length;
  if (n < 3) {
    throw new Error('Time series requires at least 3 sequential observations.');
  }

  let sumT = 0;
  let sumY = 0;
  let sumTY = 0;
  let sumT2 = 0;

  observations.forEach((obs, idx) => {
    const t = idx + 1; // 1-based chronological index
    const y = obs.value;
    sumT += t;
    sumY += y;
    sumTY += t * y;
    sumT2 += t * t;
  });

  const meanY = sumY / n;
  const denominatorT = n * sumT2 - sumT * sumT;

  if (Math.abs(denominatorT) < 1e-12) {
    return {
      n,
      variableName,
      sumT,
      sumY,
      sumTY,
      sumT2,
      meanY,
      slope: 0,
      intercept: meanY,
      trendEquation: 'Undefined',
      growthRatePercent: 0,
      mape: 0,
      trajectory: 'NOT APPLICABLE',
      interpretation: 'Cannot compute time trend because the chronological denominator is zero.',
      businessSignal: 'Chronological timeline requires multiple non-identical time indices.',
      action: 'Ensure distinct sequential time periods are provided.',
      auditRows: [],
      forecasts: [],
      errorReason: 'Zero denominator in secular trend calculation.',
      steps: {
        n,
        sumT: formatNumber(sumT),
        sumY: formatNumber(sumY),
        sumTY: formatNumber(sumTY),
        sumT2: formatNumber(sumT2),
        slopeFormula: 'b = [nΣtY − (Σt)(ΣY)] / [nΣt² − (Σt)²]',
        slopeCalculation: 'Denominator evaluates to 0',
        interceptFormula: 'a = [ΣY − bΣt] / n',
        interceptCalculation: 'Cannot compute intercept without slope',
        trendEquation: 'Undefined',
        growthRateCalculation: 'Undefined',
        mapeCalculation: 'Undefined',
      },
    };
  }

  const numeratorSlope = n * sumTY - sumT * sumY;
  const slope = numeratorSlope / denominatorT;
  const intercept = (sumY - slope * sumT) / n;

  // Trend Equation string
  const sign = slope >= 0 ? '+' : '−';
  const absSlopeStr = formatNumber(Math.abs(slope), 4);
  const interceptStr = formatNumber(intercept, 2);
  const trendEquation = `T_t = ${interceptStr} ${sign} (${absSlopeStr} · t)`;

  // Percentage growth per period relative to mean baseline
  const growthRatePercent = meanY !== 0 ? (slope / Math.abs(meanY)) * 100 : 0;

  // Trajectory classification
  const trajectory = getTimeSeriesTrajectory(growthRatePercent);

  // Compute Audit Rows, Trend Values, 3-Period Moving Averages, and Residuals
  let totalAbsPercentageError = 0;
  let validMapePoints = 0;

  const auditRows: TimeSeriesAuditRow[] = observations.map((obs, idx) => {
    const t = idx + 1;
    const y = obs.value;
    const ty = t * y;
    const t2 = t * t;
    const trendValue = intercept + slope * t;
    const residual = y - trendValue;
    const residualPercent = trendValue !== 0 ? (residual / Math.abs(trendValue)) * 100 : 0;

    // 3-Period Simple Moving Average
    let movingAverage3: number | null = null;
    if (idx > 0 && idx < n - 1) {
      movingAverage3 = (observations[idx - 1].value + obs.value + observations[idx + 1].value) / 3;
    }

    if (y !== 0) {
      totalAbsPercentageError += Math.abs((y - trendValue) / y) * 100;
      validMapePoints++;
    }

    return {
      t,
      periodLabel: obs.periodLabel,
      y,
      ty,
      t2,
      trendValue,
      movingAverage3,
      residual,
      residualPercent,
    };
  });

  const mape = validMapePoints > 0 ? totalAbsPercentageError / validMapePoints : 0;

  // Generate 3 Next-Period Forecasts
  const forecasts: TimeSeriesForecastItem[] = [1, 2, 3].map((step) => {
    const futureT = n + step;
    const forecastedValue = intercept + slope * futureT;
    const futureLabel = getPredictedPeriodLabel(observations[n - 1].periodLabel, step);
    return {
      t: futureT,
      periodLabel: futureLabel,
      forecastedValue,
    };
  });

  const { interpretation, businessSignal, action } = getTimeSeriesInterpretation(
    trajectory,
    slope,
    growthRatePercent,
    mape,
    variableName,
    n
  );

  return {
    n,
    variableName,
    sumT,
    sumY,
    sumTY,
    sumT2,
    meanY,
    slope,
    intercept,
    trendEquation,
    growthRatePercent,
    mape,
    trajectory,
    interpretation,
    businessSignal,
    action,
    auditRows,
    forecasts,
    errorReason: null,
    steps: {
      n,
      sumT: formatNumber(sumT),
      sumY: formatNumber(sumY),
      sumTY: formatNumber(sumTY),
      sumT2: formatNumber(sumT2),
      slopeFormula: 'b = [nΣ(t·Y) − (Σt)(ΣY)] / [nΣt² − (Σt)²]',
      slopeCalculation: `b = [${n}·(${formatNumber(sumTY)}) − (${formatNumber(sumT)})·(${formatNumber(sumY)})] / [${n}·(${formatNumber(sumT2)}) − (${formatNumber(sumT)})²] = ${formatNumber(slope, 4)}`,
      interceptFormula: 'a = [ΣY − b·Σt] / n',
      interceptCalculation: `a = [${formatNumber(sumY)} − (${formatNumber(slope, 4)})·(${formatNumber(sumT)})] / ${n} = ${formatNumber(intercept, 2)}`,
      trendEquation,
      growthRateCalculation: `Growth Rate = (b / Mean_Y) · 100 = (${formatNumber(slope, 4)} / ${formatNumber(meanY, 2)}) · 100 = ${formatNumber(growthRatePercent, 2)}% per period`,
      mapeCalculation: `MAPE = (1/n) · Σ| (Y_t − T_t) / Y_t | · 100 = ${formatNumber(mape, 2)}% average trend fit deviation`,
    },
  };
}

/**
 * Predicts Y for any given arbitrary future period index t
 */
export function predictTimeSeriesValue(
  intercept: number,
  slope: number,
  futureT: number
): number {
  return intercept + slope * futureT;
}

function getTimeSeriesTrajectory(growthRatePercent: number): TimeSeriesTrajectory {
  if (growthRatePercent >= 4.0) return 'STRONG EXPANSION';
  if (growthRatePercent >= 1.0) return 'MODERATE EXPANSION';
  if (growthRatePercent > -1.0) return 'STABLE / MINIMAL TREND';
  if (growthRatePercent > -4.0) return 'MODERATE CONTRACTION';
  return 'SIGNIFICANT CONTRACTION';
}

function getPredictedPeriodLabel(lastLabel: string, stepOffset: number): string {
  // Check if lastLabel matches standard date pattern like "24 Aug" or "04 Sep"
  const dateMatch = lastLabel.match(/^(\d{1,2})\s+([A-Za-z]{3,})$/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const month = dateMatch[2];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIdx = months.findIndex((m) => m.toLowerCase().startsWith(month.toLowerCase().slice(0, 3)));
    
    if (monthIdx !== -1) {
      // Estimate projected day
      const date = new Date(2026, monthIdx, day + stepOffset);
      const projectedDay = String(date.getDate()).padStart(2, '0');
      const projectedMonth = months[date.getMonth()];
      return `${projectedDay} ${projectedMonth} (Proj)`;
    }
  }

  // Check if lastLabel matches "Period X" or "Day X"
  const numMatch = lastLabel.match(/(.*?)(\d+)$/);
  if (numMatch) {
    const prefix = numMatch[1];
    const num = parseInt(numMatch[2], 10);
    return `${prefix}${num + stepOffset} (Proj)`;
  }

  return `Period +${stepOffset} (Proj)`;
}

function getTimeSeriesInterpretation(
  trajectory: TimeSeriesTrajectory,
  slope: number,
  growthRatePercent: number,
  mape: number,
  variableName: string,
  n: number
): { interpretation: string; businessSignal: string; action: string } {
  const slopeFormatted = `${slope >= 0 ? '+' : ''}${formatNumber(slope, 2)}`;
  const rateFormatted = `${growthRatePercent >= 0 ? '+' : ''}${formatNumber(growthRatePercent, 2)}%`;
  const mapeFormatted = `${formatNumber(mape, 1)}%`;

  switch (trajectory) {
    case 'STRONG EXPANSION':
      return {
        interpretation: `The time series demonstrates a strong, sustained upward expansion across ${n} chronological periods. On average, ${variableName} accelerates by ${slopeFormatted} units (${rateFormatted}) per sequential period, with an average trend tracking accuracy of ${mapeFormatted} MAPE.`,
        businessSignal: `High upward velocity. Demand and revenue trends at KOI & CO. are compounding sequentially, indicating expanding commercial traction in Sainikpuri.`,
        action: `Scale kitchen inventory buffers, align staff shift capacity with rising weekend velocity, and preserve operating margins as volume scales.`,
      };

    case 'MODERATE EXPANSION':
      return {
        interpretation: `The time series exhibits steady, disciplined expansion over ${n} periods. The secular trend indicates a steady pace of ${slopeFormatted} units (${rateFormatted}) gained per period with reasonable smoothness (${mapeFormatted} MAPE).`,
        businessSignal: `Healthy organic growth. Operations exhibit steady sequential progress without uncontrolled peak volatility.`,
        action: `Maintain current procurement cycles while testing targeted promotional initiatives to accelerate momentum into high-margin categories.`,
      };

    case 'STABLE / MINIMAL TREND':
      return {
        interpretation: `The time series reflects stable equilibrium across ${n} periods, shifting by only ${slopeFormatted} units (${rateFormatted}) per period. The business operates within a consistent stationary baseline with ${mapeFormatted} MAPE.`,
        businessSignal: `Operational plateau. Demand is predictable and steady, with fluctuations largely driven by transient daily noise rather than directional shifts.`,
        action: `Optimize kitchen cost structures and introduce seasonal menu refreshes or loyalty incentives to catalyze new demand inflections.`,
      };

    case 'MODERATE CONTRACTION':
      return {
        interpretation: `The time series reveals moderate sequential decline over ${n} periods, shedding ${slopeFormatted} units (${rateFormatted}) per period. Fluctuations exhibit ${mapeFormatted} MAPE against the downward slope.`,
        businessSignal: `Softening velocity. Successive periods show slight sequential erosion in customer volume or sales output.`,
        action: `Audit repeat customer footfall, evaluate local Sainikpuri competitive shifts, and run promotional pairings to arrest further downward movement.`,
      };

    case 'SIGNIFICANT CONTRACTION':
      return {
        interpretation: `The time series exhibits sharp contraction across ${n} periods, declining at ${slopeFormatted} units (${rateFormatted}) per period. Average trend deviation is ${mapeFormatted} MAPE.`,
        businessSignal: `Urgent commercial headwind. Velocity is systematically contracting across consecutive operating windows.`,
        action: `Conduct immediate pricing and product audits, reduce perishable inventory order quantities to prevent waste, and review operational service standards.`,
      };

    default:
      return {
        interpretation: `Time series trend evaluated across ${n} observations.`,
        businessSignal: `Baseline evaluation completed.`,
        action: `Review time series observations.`,
      };
  }
}
