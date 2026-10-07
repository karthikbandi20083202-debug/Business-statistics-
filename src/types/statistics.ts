/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CentralClassification = 
  | 'VERY CLOSE'
  | 'SLIGHT DIFFERENCE'
  | 'MODERATE DIFFERENCE'
  | 'SUBSTANTIAL DIFFERENCE'
  | 'CONSIDERABLE DIFFERENCE'
  | 'NOT APPLICABLE';

export type DispersionClassification =
  | 'EXTREMELY CONSISTENT'
  | 'VERY CONSISTENT'
  | 'RELATIVELY CONSISTENT'
  | 'MODERATE VARIATION'
  | 'HIGH VARIATION'
  | 'VERY HIGH VARIATION'
  | 'EXTREMELY HIGH VARIATION'
  | 'NOT APPLICABLE';

export interface CentralTendencyResult {
  count: number;
  total: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  mode: number[] | 'NO_MODE';
  meanMedianDiffPercent: number | null;
  classification: CentralClassification;
  interpretation: string;
  businessSignal: string;
  action: string;
  steps: {
    meanFormula: string;
    meanCalculation: string;
    meanResult: string;
    medianFormula: string;
    medianCalculation: string;
    medianResult: string;
    modeDescription: string;
    diffCalculation: string;
  };
}

export interface DispersionResult {
  range: number;
  q1: number;
  q3: number;
  quartileDeviation: number;
  populationVariance: number;
  populationStandardDeviation: number;
  coefficientOfVariation: number | null;
  classification: DispersionClassification;
  interpretation: string;
  businessSignal: string;
  action: string;
  steps: {
    rangeCalculation: string;
    q1Calculation: string;
    q3Calculation: string;
    qdCalculation: string;
    varianceFormula: string;
    varianceCalculation: string;
    stdDevCalculation: string;
    cvCalculation: string;
  };
}

export interface AnalysisResults {
  dataset: number[];
  variableName: string;
  centralTendency: CentralTendencyResult;
  dispersion: DispersionResult;
  timestamp: string;
}

export interface ValidationState {
  isValid: boolean;
  errors: Record<number, string>;
  generalError?: string;
  missingCount: number;
}

export type CorrelationClassification =
  | 'VERY STRONG NEGATIVE'
  | 'STRONG NEGATIVE'
  | 'MODERATE NEGATIVE'
  | 'WEAK NEGATIVE'
  | 'VERY WEAK / NEGLIGIBLE'
  | 'WEAK POSITIVE'
  | 'MODERATE POSITIVE'
  | 'STRONG POSITIVE'
  | 'VERY STRONG POSITIVE'
  | 'NOT APPLICABLE';

export interface CorrelationResult {
  n: number;
  sumX: number;
  sumY: number;
  sumXY: number;
  sumX2: number;
  sumY2: number;
  numerator: number;
  denominator: number;
  r: number;
  classification: CorrelationClassification;
  interpretation: string;
  businessSignal: string;
  action: string;
  errorReason: string | null;
  steps: {
    n: number;
    sumX: string;
    sumY: string;
    sumXY: string;
    sumX2: string;
    sumY2: string;
    numeratorCalc: string;
    denominatorCalc: string;
    rCalc: string;
  };
}

export interface PairedObservation {
  x: number;
  y: number;
}

export interface PairedValidationState {
  isValid: boolean;
  errors: Record<number, { x?: string; y?: string }>;
  generalError?: string;
  missingCount: number;
}

export type RegressionStrengthClassification =
  | 'VERY WEAK'
  | 'WEAK'
  | 'MODERATE'
  | 'STRONG'
  | 'VERY STRONG'
  | 'EXTREMELY STRONG'
  | 'NOT APPLICABLE';

export interface RegressionResult {
  n: number;
  sumX: number;
  sumY: number;
  sumXY: number;
  sumX2: number;
  sumY2: number;
  slope: number;
  intercept: number;
  equation: string;
  r: number;
  r2: number;
  r2Percent: number;
  classification: RegressionStrengthClassification;
  interpretation: string;
  businessSignal: string;
  action: string;
  errorReason: string | null;
  steps: {
    n: number;
    sumX: string;
    sumY: string;
    sumXY: string;
    sumX2: string;
    sumY2: string;
    slopeFormula: string;
    slopeCalculation: string;
    interceptFormula: string;
    interceptCalculation: string;
    equationString: string;
    r2Calculation: string;
  };
}

export interface TimeSeriesObservation {
  periodLabel: string;
  value: number;
}

export type TimeSeriesTrajectory =
  | 'STRONG EXPANSION'
  | 'MODERATE EXPANSION'
  | 'STABLE / MINIMAL TREND'
  | 'MODERATE CONTRACTION'
  | 'SIGNIFICANT CONTRACTION'
  | 'NOT APPLICABLE';

export interface TimeSeriesAuditRow {
  t: number;
  periodLabel: string;
  y: number;
  ty: number;
  t2: number;
  trendValue: number;
  movingAverage3: number | null;
  residual: number;
  residualPercent: number;
}

export interface TimeSeriesForecastItem {
  t: number;
  periodLabel: string;
  forecastedValue: number;
}

export interface TimeSeriesResult {
  n: number;
  variableName: string;
  sumT: number;
  sumY: number;
  sumTY: number;
  sumT2: number;
  meanY: number;
  slope: number;
  intercept: number;
  trendEquation: string;
  growthRatePercent: number;
  mape: number;
  trajectory: TimeSeriesTrajectory;
  interpretation: string;
  businessSignal: string;
  action: string;
  auditRows: TimeSeriesAuditRow[];
  forecasts: TimeSeriesForecastItem[];
  errorReason: string | null;
  steps: {
    n: number;
    sumT: string;
    sumY: string;
    sumTY: string;
    sumT2: string;
    slopeFormula: string;
    slopeCalculation: string;
    interceptFormula: string;
    interceptCalculation: string;
    trendEquation: string;
    growthRateCalculation: string;
    mapeCalculation: string;
  };
}

export interface TimeSeriesValidationState {
  isValid: boolean;
  errors: Record<number, { period?: string; value?: string }>;
  generalError?: string;
  missingCount: number;
}

export interface IndexItemObservation {
  itemName: string;
  basePrice: number;
  currentPrice: number;
}

export type IndexNumbersClassification =
  | 'VERY LARGE DECREASE'
  | 'LARGE DECREASE'
  | 'MODERATE DECREASE'
  | 'SLIGHT DECREASE'
  | 'NO CHANGE'
  | 'SLIGHT INCREASE'
  | 'MODERATE INCREASE'
  | 'HIGH INCREASE'
  | 'VERY HIGH INCREASE'
  | 'EXTREMELY HIGH INCREASE'
  | 'NOT APPLICABLE';

export interface IndexNumbersResult {
  n: number;
  basePeriodTotal: number;
  currentPeriodTotal: number;
  priceIndex: number;
  percentageChange: number;
  classification: IndexNumbersClassification;
  interpretation: string;
  businessImplication: string;
  businessSignal: string;
  items: Array<{
    itemName: string;
    p0: number;
    p1: number;
    itemDiff: number;
    itemDiffPercent: number;
  }>;
  errorReason: string | null;
  steps: {
    n: number;
    sumP0: string;
    sumP1: string;
    indexFormula: string;
    indexCalculation: string;
    finalIndexString: string;
    pctChangeFormula: string;
    pctChangeCalculation: string;
  };
}

export interface IndexValidationState {
  isValid: boolean;
  errors: Record<number, { name?: string; base?: string; current?: string }>;
  generalError?: string;
  missingCount: number;
}

export interface DiagnosisEvidenceState {
  centralTendency: CentralTendencyResult | null;
  dispersion: DispersionResult | null;
  correlation: CorrelationResult | null;
  regression: RegressionResult | null;
  timeSeries: TimeSeriesResult | null;
  indexNumbers: IndexNumbersResult | null;
}

export type EvidenceLevel = 'HIGH' | 'MODERATE' | 'LOW';

export interface HealthSignalItem {
  dimension: 'DEMAND' | 'CONSISTENCY' | 'RELATIONSHIPS' | 'TREND' | 'PRICE MOVEMENT' | 'PREDICTABILITY';
  status: string;
  metric: string;
  interpretation: string;
  tone: 'positive' | 'warning' | 'neutral' | 'caution';
}

export interface BusinessStrengthItem {
  strength: string;
  evidence: string;
  businessValue: string;
}

export interface BusinessWeaknessItem {
  weakness: string;
  evidence: string;
  businessImpact: string;
}

export interface BusinessOpportunityItem {
  opportunity: string;
  evidence: string;
  mechanism: string;
}

export interface BusinessRiskItem {
  risk: string;
  evidence: string;
  whyItMatters: string;
}

export interface CrossToolInsightItem {
  title: string;
  toolsInvolved: string[];
  insight: string;
  businessImplication: string;
  evidenceLevel: EvidenceLevel;
}

export interface ActionPlanItem {
  priority: 'P1' | 'P2' | 'P3';
  priorityLabel: 'P1 — HIGH PRIORITY' | 'P2 — MEDIUM PRIORITY' | 'P3 — STRATEGIC / LONGER TERM';
  action: string;
  reason: string;
  expectedBusinessPurpose: string;
  evidenceLevel: EvidenceLevel;
}

export interface GrowthStrategyPillar {
  pillar: string;
  whatToDo: string;
  why: string;
  dataEvidence: string;
}

export interface BusinessDiagnosisReport {
  completeness: 'COMPLETE' | 'PARTIAL' | 'INCOMPLETE';
  completedCount: number;
  totalTools: number;
  availableTools: string[];
  missingTools: string[];
  executiveSummary: string;
  healthSignals: HealthSignalItem[];
  strengths: BusinessStrengthItem[];
  weaknesses: BusinessWeaknessItem[];
  opportunities: BusinessOpportunityItem[];
  risks: BusinessRiskItem[];
  crossToolInsights: CrossToolInsightItem[];
  prioritizedActions: ActionPlanItem[];
  growthStrategy: GrowthStrategyPillar[];
  unsupportedClaims: Array<{ claim: string; explanation: string }>;
  managementTakeaway: {
    currentCondition: string;
    strongestPositiveSignal: string;
    biggestWeakness: string;
    biggestRisk: string;
    biggestOpportunity: string;
    immediatePriority: string;
    summaryParagraph: string;
  };
}
