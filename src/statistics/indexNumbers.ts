/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  IndexItemObservation, 
  IndexNumbersResult, 
  IndexNumbersClassification 
} from '../types/statistics';
import { formatNumber } from './centralTendency';

/**
 * Calculates Simple Aggregative Price Index:
 * P01 = (ΣP1 / ΣP0) × 100
 * Percentage Change = P01 − 100
 *
 * Full mathematical precision is maintained internally.
 */
export function calculateIndexNumbers(
  items: IndexItemObservation[]
): IndexNumbersResult {
  const n = items.length;
  if (n === 0) {
    throw new Error('Index numbers calculation requires at least one item.');
  }

  let sumP0 = 0;
  let sumP1 = 0;

  const itemDetails = items.map((item) => {
    const p0 = item.basePrice;
    const p1 = item.currentPrice;
    sumP0 += p0;
    sumP1 += p1;
    const diff = p1 - p0;
    const diffPct = p0 !== 0 ? (diff / p0) * 100 : 0;
    return {
      itemName: item.itemName,
      p0,
      p1,
      itemDiff: diff,
      itemDiffPercent: diffPct,
    };
  });

  // Zero base value protection
  if (sumP0 === 0) {
    return {
      n,
      basePeriodTotal: 0,
      currentPeriodTotal: sumP1,
      priceIndex: 0,
      percentageChange: 0,
      classification: 'NOT APPLICABLE',
      interpretation: 'Index number cannot be calculated because the base-period total is zero.',
      businessImplication: 'The entered dataset has zero base-period expenditure, preventing relative price index computation.',
      businessSignal: 'Ensure baseline item prices are strictly positive.',
      items: itemDetails,
      errorReason: 'Index number cannot be calculated because the base-period total is zero.',
      steps: {
        n,
        sumP0: '0',
        sumP1: formatNumber(sumP1),
        indexFormula: 'Index = (ΣP1 / ΣP0) × 100',
        indexCalculation: 'Base period total evaluates to zero (Undefined)',
        finalIndexString: 'Undefined',
        pctChangeFormula: 'Percentage Change = Index − 100',
        pctChangeCalculation: 'Cannot compute percentage change without valid index',
      },
    };
  }

  // Full precision internally
  const priceIndex = (sumP1 / sumP0) * 100;
  const percentageChange = priceIndex - 100;

  const classification = getIndexClassification(priceIndex);
  const { interpretation, businessImplication, businessSignal } = getIndexInterpretations(
    priceIndex,
    percentageChange,
    classification
  );

  const sign = percentageChange > 0 ? '+' : percentageChange < 0 ? '−' : '';
  const absChangeFormatted = formatNumber(Math.abs(percentageChange), 2);
  const pctChangeFormatted = `${sign}${absChangeFormatted}%`;

  return {
    n,
    basePeriodTotal: sumP0,
    currentPeriodTotal: sumP1,
    priceIndex,
    percentageChange,
    classification,
    interpretation,
    businessImplication,
    businessSignal,
    items: itemDetails,
    errorReason: null,
    steps: {
      n,
      sumP0: formatNumber(sumP0),
      sumP1: formatNumber(sumP1),
      indexFormula: 'Price Index = (ΣP1 / ΣP0) × 100',
      indexCalculation: `Index = (${formatNumber(sumP1)} / ${formatNumber(sumP0)}) × 100 = ${formatNumber(priceIndex, 2)}`,
      finalIndexString: formatNumber(priceIndex, 2),
      pctChangeFormula: 'Percentage Change = Index − 100',
      pctChangeCalculation: `Percentage Change = ${formatNumber(priceIndex, 2)} − 100 = ${pctChangeFormatted}`,
    },
  };
}

/**
 * Deterministic Index classification bands:
 * Below 80: VERY LARGE DECREASE
 * 80–90: LARGE DECREASE
 * 90–95: MODERATE DECREASE
 * 95–100: SLIGHT DECREASE
 * 100: NO CHANGE
 * 100–105: SLIGHT INCREASE
 * 105–110: MODERATE INCREASE
 * 110–120: HIGH INCREASE
 * 120–130: VERY HIGH INCREASE
 * Above 130: EXTREMELY HIGH INCREASE
 */
export function getIndexClassification(index: number): IndexNumbersClassification {
  if (index < 80) return 'VERY LARGE DECREASE';
  if (index < 90) return 'LARGE DECREASE';
  if (index < 95) return 'MODERATE DECREASE';
  if (index < 100) return 'SLIGHT DECREASE';
  if (Math.abs(index - 100) < 1e-9) return 'NO CHANGE';
  if (index <= 105) return 'SLIGHT INCREASE';
  if (index <= 110) return 'MODERATE INCREASE';
  if (index <= 120) return 'HIGH INCREASE';
  if (index <= 130) return 'VERY HIGH INCREASE';
  return 'EXTREMELY HIGH INCREASE';
}

function getIndexInterpretations(
  index: number,
  percentageChange: number,
  classification: IndexNumbersClassification
): { interpretation: string; businessImplication: string; businessSignal: string } {
  const absChange = formatNumber(Math.abs(percentageChange), 2);

  let interpretation: string;
  let businessImplication: string;
  let businessSignal: string;

  if (Math.abs(index - 100) < 1e-9) {
    interpretation = 'The selected items show no aggregate change compared with the base period.';
    businessImplication = 'Aggregate selected-item prices across the entered dataset remain in equilibrium relative to the base period.';
    businessSignal = 'Aggregate selected-item prices remain broadly unchanged from the base period.';
  } else if (index > 100) {
    interpretation = `The selected items have increased by approximately ${absChange}% compared with the base period.`;
    
    if (index > 120) {
      businessImplication = 'Selected item prices have increased materially relative to the base period. This may be relevant when reviewing pricing, purchasing costs, margins, and menu strategy.';
      businessSignal = 'Review pricing and margin impact across the affected items.';
    } else if (index > 110) {
      businessImplication = 'Selected item prices exhibit substantial upward movement relative to the base period across the entered dataset.';
      businessSignal = 'Monitor price movement and evaluate whether margins remain aligned with current pricing.';
    } else {
      businessImplication = 'Selected item prices reflect moderate upward adjustment relative to the base period within the entered dataset.';
      businessSignal = 'Monitor price movement and evaluate whether margins remain aligned with current pricing.';
    }
  } else {
    interpretation = `The selected items are lower by approximately ${absChange}% compared with the base period.`;
    businessImplication = 'Selected item prices have decreased relative to the base period across the entered dataset.';
    businessSignal = 'Review whether lower prices reflect improved purchasing conditions, promotional pricing, or other business factors.';
  }

  return { interpretation, businessImplication, businessSignal };
}
