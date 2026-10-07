/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ValidationState } from '../types/statistics';

/**
 * Validates the raw string observations from user input.
 * Ensures:
 * 1. Every field is non-empty and non-whitespace
 * 2. Every field contains a valid finite floating-point number
 * 3. Count matches expected count
 */
export function validateDatasetInputs(
  inputs: string[],
  requiredCount: number
): ValidationState {
  const errors: Record<number, string> = {};
  let missingCount = 0;

  if (inputs.length !== requiredCount) {
    return {
      isValid: false,
      errors: {},
      generalError: `Dataset requires exactly ${requiredCount} observations, but found ${inputs.length}.`,
      missingCount: Math.abs(requiredCount - inputs.length),
    };
  }

  inputs.forEach((val, idx) => {
    const trimmed = (val ?? '').trim();
    if (trimmed === '') {
      errors[idx] = `Observation ${idx + 1} is empty.`;
      missingCount++;
    } else {
      const num = Number(trimmed);
      if (isNaN(num) || !isFinite(num)) {
        errors[idx] = `Observation ${idx + 1} is not a valid number.`;
        missingCount++;
      }
    }
  });

  if (missingCount > 0) {
    const generalError =
      missingCount === 1
        ? `Complete 1 missing or invalid observation before analysis.`
        : `Complete all ${requiredCount} observations (${missingCount} missing or invalid) before analysis.`;

    return {
      isValid: false,
      errors,
      generalError,
      missingCount,
    };
  }

  return {
    isValid: true,
    errors: {},
    missingCount: 0,
  };
}

/**
 * Converts validated string inputs into high-precision numeric array.
 */
export function parseDataset(inputs: string[]): number[] {
  return inputs.map((v) => Number(v.trim()));
}

import { PairedObservation, PairedValidationState } from '../types/statistics';

/**
 * Validates paired (X, Y) string observations.
 * Ensures:
 * 1. Both X and Y in every pair are non-empty
 * 2. Every value is a valid finite numeric value
 * 3. Exact count of pairs matches requiredCount
 */
export function validatePairedDatasetInputs(
  inputsX: string[],
  inputsY: string[],
  requiredCount: number
): PairedValidationState {
  const errors: Record<number, { x?: string; y?: string }> = {};
  let missingCount = 0;

  if (inputsX.length !== requiredCount || inputsY.length !== requiredCount) {
    return {
      isValid: false,
      errors: {},
      generalError: `Paired dataset requires exactly ${requiredCount} pairs, but found X: ${inputsX.length}, Y: ${inputsY.length}.`,
      missingCount: Math.abs(requiredCount - Math.min(inputsX.length, inputsY.length)),
    };
  }

  for (let idx = 0; idx < requiredCount; idx++) {
    const rawX = (inputsX[idx] ?? '').trim();
    const rawY = (inputsY[idx] ?? '').trim();
    const pairErr: { x?: string; y?: string } = {};

    if (rawX === '') {
      pairErr.x = `Observation X${idx + 1} is empty.`;
      missingCount++;
    } else {
      const numX = Number(rawX);
      if (isNaN(numX) || !isFinite(numX)) {
        pairErr.x = `Observation X${idx + 1} is not a valid number.`;
        missingCount++;
      }
    }

    if (rawY === '') {
      pairErr.y = `Observation Y${idx + 1} is empty.`;
      missingCount++;
    } else {
      const numY = Number(rawY);
      if (isNaN(numY) || !isFinite(numY)) {
        pairErr.y = `Observation Y${idx + 1} is not a valid number.`;
        missingCount++;
      }
    }

    if (pairErr.x || pairErr.y) {
      errors[idx] = pairErr;
    }
  }

  if (missingCount > 0) {
    return {
      isValid: false,
      errors,
      generalError: 'Complete all paired observations before analysis.',
      missingCount,
    };
  }

  return {
    isValid: true,
    errors: {},
    missingCount: 0,
  };
}

/**
 * Converts validated paired string inputs into array of PairedObservation objects.
 */
export function parsePairedDataset(
  inputsX: string[],
  inputsY: string[]
): PairedObservation[] {
  return inputsX.map((x, i) => ({
    x: Number(x.trim()),
    y: Number(inputsY[i].trim()),
  }));
}

import { TimeSeriesObservation, TimeSeriesValidationState } from '../types/statistics';

/**
 * Validates Time Series observations (Period Label, Actual Value).
 * Ensures:
 * 1. Both Period Label and Actual Value in every observation are non-empty
 * 2. Actual Value is a valid finite numeric value
 * 3. Exact count matches requiredCount
 * 4. Never treats blank as zero or skips missing observations
 */
export function validateTimeSeriesInputs(
  periodLabels: string[],
  values: string[],
  requiredCount: number
): TimeSeriesValidationState {
  const errors: Record<number, { period?: string; value?: string }> = {};
  let missingCount = 0;

  if (periodLabels.length !== requiredCount || values.length !== requiredCount) {
    return {
      isValid: false,
      errors: {},
      generalError: `Time series requires exactly ${requiredCount} periods, but found Period labels: ${periodLabels.length}, Values: ${values.length}.`,
      missingCount: Math.abs(requiredCount - Math.min(periodLabels.length, values.length)),
    };
  }

  for (let idx = 0; idx < requiredCount; idx++) {
    const rawPeriod = (periodLabels[idx] ?? '').trim();
    const rawVal = (values[idx] ?? '').trim();
    const rowErr: { period?: string; value?: string } = {};

    if (rawPeriod === '') {
      rowErr.period = `Period label for entry ${idx + 1} is empty.`;
      missingCount++;
    }

    if (rawVal === '') {
      rowErr.value = `Observed value for entry ${idx + 1} is empty.`;
      missingCount++;
    } else {
      const numVal = Number(rawVal);
      if (isNaN(numVal) || !isFinite(numVal)) {
        rowErr.value = `Observed value for entry ${idx + 1} must be a valid number.`;
        missingCount++;
      }
    }

    if (rowErr.period || rowErr.value) {
      errors[idx] = rowErr;
    }
  }

  if (missingCount > 0) {
    return {
      isValid: false,
      errors,
      generalError: 'Complete all time series observations before analyzing.',
      missingCount,
    };
  }

  return {
    isValid: true,
    errors: {},
    missingCount: 0,
  };
}

/**
 * Converts validated Time Series inputs into TimeSeriesObservation objects.
 */
export function parseTimeSeriesDataset(
  periodLabels: string[],
  values: string[]
): TimeSeriesObservation[] {
  return periodLabels.map((lbl, idx) => ({
    periodLabel: lbl.trim(),
    value: Number(values[idx].trim()),
  }));
}

import { IndexItemObservation, IndexValidationState } from '../types/statistics';

/**
 * Validates Index Numbers item inputs.
 * Ensures:
 * 1. Item name, Base Period Value (P0), and Current Period Value (P1) are present
 * 2. Prices are valid finite numbers > 0 (normal price rule)
 * 3. Never treats blank as zero or skips missing items
 */
export function validateIndexInputs(
  itemNames: string[],
  basePrices: string[],
  currentPrices: string[],
  requiredCount: number
): IndexValidationState {
  const errors: Record<number, { name?: string; base?: string; current?: string }> = {};
  let missingCount = 0;

  if (
    itemNames.length !== requiredCount ||
    basePrices.length !== requiredCount ||
    currentPrices.length !== requiredCount
  ) {
    return {
      isValid: false,
      errors: {},
      generalError: `Index calculation requires exactly ${requiredCount} items.`,
      missingCount: Math.abs(
        requiredCount - Math.min(itemNames.length, basePrices.length, currentPrices.length)
      ),
    };
  }

  for (let idx = 0; idx < requiredCount; idx++) {
    const rawName = (itemNames[idx] ?? '').trim();
    const rawBase = (basePrices[idx] ?? '').trim();
    const rawCurrent = (currentPrices[idx] ?? '').trim();
    const itemErr: { name?: string; base?: string; current?: string } = {};

    if (rawName === '') {
      itemErr.name = `Item ${idx + 1} name is empty.`;
      missingCount++;
    }

    if (rawBase === '') {
      itemErr.base = `Item ${idx + 1} base value is empty.`;
      missingCount++;
    } else {
      const numBase = Number(rawBase);
      if (isNaN(numBase) || !isFinite(numBase)) {
        itemErr.base = `Item ${idx + 1} base value is not a valid number.`;
        missingCount++;
      } else if (numBase <= 0) {
        itemErr.base = `Item ${idx + 1} base price must be greater than zero.`;
        missingCount++;
      }
    }

    if (rawCurrent === '') {
      itemErr.current = `Item ${idx + 1} current value is empty.`;
      missingCount++;
    } else {
      const numCurrent = Number(rawCurrent);
      if (isNaN(numCurrent) || !isFinite(numCurrent)) {
        itemErr.current = `Item ${idx + 1} current value is not a valid number.`;
        missingCount++;
      } else if (numCurrent <= 0) {
        itemErr.current = `Item ${idx + 1} current price must be greater than zero.`;
        missingCount++;
      }
    }

    if (itemErr.name || itemErr.base || itemErr.current) {
      errors[idx] = itemErr;
    }
  }

  if (missingCount > 0) {
    return {
      isValid: false,
      errors,
      generalError: 'Complete all item values before analysis.',
      missingCount,
    };
  }

  return {
    isValid: true,
    errors: {},
    missingCount: 0,
  };
}

/**
 * Converts validated string inputs into array of IndexItemObservation.
 */
export function parseIndexDataset(
  itemNames: string[],
  basePrices: string[],
  currentPrices: string[]
): IndexItemObservation[] {
  return itemNames.map((name, idx) => ({
    itemName: name.trim(),
    basePrice: Number(basePrices[idx].trim()),
    currentPrice: Number(currentPrices[idx].trim()),
  }));
}

