/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  DiagnosisEvidenceState, 
  BusinessDiagnosisReport, 
  HealthSignalItem, 
  BusinessStrengthItem, 
  BusinessWeaknessItem, 
  BusinessOpportunityItem, 
  BusinessRiskItem, 
  CrossToolInsightItem, 
  ActionPlanItem, 
  GrowthStrategyPillar,
  EvidenceLevel 
} from '../types/statistics';
import { formatNumber } from './centralTendency';

/**
 * Generates the Final Business Diagnosis & Growth Strategy:
 * Synthesizes outputs across Central Tendency, Dispersion, Correlation,
 * Regression, Time Series, and Index Numbers into deterministic,
 * evidence-grounded strategic guidance for KOI & CO.
 */
export function generateBusinessDiagnosis(
  evidence: DiagnosisEvidenceState
): BusinessDiagnosisReport {
  const { 
    centralTendency, 
    dispersion, 
    correlation, 
    regression, 
    timeSeries, 
    indexNumbers 
  } = evidence;

  // 1. Identify Available vs Missing Evidence
  const toolStatusList = [
    { name: '01 Central Tendency', isAvailable: centralTendency !== null },
    { name: '02 Dispersion', isAvailable: dispersion !== null },
    { name: '03 Correlation', isAvailable: correlation !== null },
    { name: '04 Regression', isAvailable: regression !== null },
    { name: '05 Time Series', isAvailable: timeSeries !== null },
    { name: '06 Index Numbers', isAvailable: indexNumbers !== null },
  ];

  const availableTools = toolStatusList.filter((t) => t.isAvailable).map((t) => t.name);
  const missingTools = toolStatusList.filter((t) => !t.isAvailable).map((t) => t.name);
  const completedCount = availableTools.length;
  const totalTools = toolStatusList.length;

  let completeness: 'COMPLETE' | 'PARTIAL' | 'INCOMPLETE';
  if (completedCount === totalTools) {
    completeness = 'COMPLETE';
  } else if (completedCount >= 2) {
    completeness = 'PARTIAL';
  } else {
    completeness = 'INCOMPLETE';
  }

  // 2. Health Signals
  const healthSignals: HealthSignalItem[] = [];

  // DEMAND SIGNAL
  if (timeSeries) {
    const isUpward = timeSeries.slope > 0;
    healthSignals.push({
      dimension: 'DEMAND',
      status: isUpward ? 'EXPANDING / UPWARD' : timeSeries.slope < 0 ? 'CONTRACTING' : 'STATIONARY',
      metric: `${timeSeries.slope >= 0 ? '+' : ''}${formatNumber(timeSeries.slope, 2)} units / period`,
      interpretation: `Secular trajectory indicates ${isUpward ? 'positive customer volume momentum' : 'softening demand'} across observed periods.`,
      tone: isUpward ? 'positive' : 'warning',
    });
  } else if (centralTendency) {
    healthSignals.push({
      dimension: 'DEMAND',
      status: 'BASELINE EVALUATED',
      metric: `Mean: ${formatNumber(centralTendency.mean)} · Median: ${formatNumber(centralTendency.median)}`,
      interpretation: `Operating baseline centered around ${formatNumber(centralTendency.median)} median typical units.`,
      tone: 'neutral',
    });
  } else {
    healthSignals.push({
      dimension: 'DEMAND',
      status: 'PENDING DATA',
      metric: 'No observation data',
      interpretation: 'Compute Central Tendency or Time Series to evaluate customer demand level.',
      tone: 'neutral',
    });
  }

  // CONSISTENCY SIGNAL
  if (dispersion) {
    const cv = dispersion.coefficientOfVariation;
    const isVolatile = cv !== null && cv > 35;
    healthSignals.push({
      dimension: 'CONSISTENCY',
      status: dispersion.classification,
      metric: cv !== null ? `CV: ${formatNumber(cv, 1)}% · Range: ${formatNumber(dispersion.range)}` : `Range: ${formatNumber(dispersion.range)}`,
      interpretation: isVolatile 
        ? 'Customer traffic exhibits high variance between quiet hours and peak spikes.'
        : 'Operations demonstrate steady consistency across measured intervals.',
      tone: isVolatile ? 'warning' : 'positive',
    });
  } else {
    healthSignals.push({
      dimension: 'CONSISTENCY',
      status: 'PENDING DATA',
      metric: 'No dispersion data',
      interpretation: 'Compute Dispersion module to assess variance and operational consistency.',
      tone: 'neutral',
    });
  }

  // RELATIONSHIPS SIGNAL
  if (correlation) {
    const r = correlation.r;
    const isStrong = Math.abs(r) >= 0.6;
    healthSignals.push({
      dimension: 'RELATIONSHIPS',
      status: correlation.classification,
      metric: `r = ${formatNumber(r, 4)}`,
      interpretation: isStrong 
        ? 'Meaningful co-movement detected between observed business variables.'
        : 'Linear association between evaluated variables is modest or weak.',
      tone: isStrong ? 'positive' : 'caution',
    });
  } else {
    healthSignals.push({
      dimension: 'RELATIONSHIPS',
      status: 'PENDING DATA',
      metric: 'No correlation data',
      interpretation: 'Compute Correlation module to measure associative strength between variables.',
      tone: 'neutral',
    });
  }

  // TREND SIGNAL
  if (timeSeries) {
    const isPositive = timeSeries.slope > 0;
    healthSignals.push({
      dimension: 'TREND',
      status: timeSeries.trajectory,
      metric: `Growth Rate: ${formatNumber(timeSeries.growthRatePercent, 2)}% / period`,
      interpretation: `Chronological direction shows ${isPositive ? 'compounding velocity' : 'downward shift'} with ${formatNumber(timeSeries.mape, 1)}% tracking deviation.`,
      tone: isPositive ? 'positive' : 'warning',
    });
  } else {
    healthSignals.push({
      dimension: 'TREND',
      status: 'PENDING DATA',
      metric: 'No timeline data',
      interpretation: 'Compute Time Series module to determine secular trendline and moving averages.',
      tone: 'neutral',
    });
  }

  // PRICE MOVEMENT SIGNAL
  if (indexNumbers) {
    const idxVal = indexNumbers.priceIndex;
    const isHigh = idxVal > 110;
    healthSignals.push({
      dimension: 'PRICE MOVEMENT',
      status: indexNumbers.classification,
      metric: `Index: ${formatNumber(idxVal, 2)} (${indexNumbers.percentageChange >= 0 ? '+' : ''}${formatNumber(indexNumbers.percentageChange, 2)}%)`,
      interpretation: isHigh 
        ? 'Substantial upward shift across selected items relative to base baseline.'
        : 'Selected item pricing remains in relative equilibrium with base period.',
      tone: isHigh ? 'caution' : 'positive',
    });
  } else {
    healthSignals.push({
      dimension: 'PRICE MOVEMENT',
      status: 'PENDING DATA',
      metric: 'No price index data',
      interpretation: 'Compute Index Numbers module to compare item prices against base period.',
      tone: 'neutral',
    });
  }

  // PREDICTABILITY SIGNAL
  if (regression) {
    const r2 = regression.r2Percent;
    const isStrong = r2 >= 50;
    healthSignals.push({
      dimension: 'PREDICTABILITY',
      status: isStrong ? 'MODERATE / RELIABLE' : 'LIMITED PREDICTABILITY',
      metric: `R² = ${formatNumber(r2, 1)}% explanatory variance`,
      interpretation: isStrong 
        ? 'Regression model explains a substantial share of variation in the response variable.'
        : 'Substantial variance remains unexplained; avoid relying solely on a single predictor.',
      tone: isStrong ? 'positive' : 'caution',
    });
  } else if (timeSeries) {
    healthSignals.push({
      dimension: 'PREDICTABILITY',
      status: timeSeries.mape < 15 ? 'MODERATE FIT' : 'VOLATILE FIT',
      metric: `MAPE = ${formatNumber(timeSeries.mape, 1)}% trend deviation`,
      interpretation: 'Chronological extrapolation captures secular path with observable residual swings.',
      tone: timeSeries.mape < 15 ? 'positive' : 'caution',
    });
  } else {
    healthSignals.push({
      dimension: 'PREDICTABILITY',
      status: 'PENDING DATA',
      metric: 'No regression model',
      interpretation: 'Compute Regression or Time Series to evaluate model fit and predictive power.',
      tone: 'neutral',
    });
  }

  // 3. Evidence-Based Strengths
  const strengths: BusinessStrengthItem[] = [];

  if (timeSeries && timeSeries.slope > 0) {
    strengths.push({
      strength: 'Positive Directional Demand Expansion',
      evidence: `Time Series secular trend slope is positive (b = +${formatNumber(timeSeries.slope, 2)} units per period, +${formatNumber(timeSeries.growthRatePercent, 2)}% growth rate).`,
      businessValue: 'Customer volume shows underlying organic expansion across consecutive operating windows.',
    });
  }

  if (centralTendency && centralTendency.median > 0) {
    strengths.push({
      strength: 'Established Baseline Operating Floor',
      evidence: `Median typical observation is ${formatNumber(centralTendency.median)} units across ${centralTendency.count} business measurements.`,
      businessValue: 'Provides an empirical benchmark for typical weekday staffing and procurement baselines.',
    });
  }

  if (correlation && correlation.r >= 0.5) {
    strengths.push({
      strength: 'Identifiable Linear Association Between Key Drivers',
      evidence: `Pearson correlation coefficient r = ${formatNumber(correlation.r, 4)} demonstrates ${correlation.classification.toLowerCase()} association.`,
      businessValue: 'Enables leadership to monitor leading indicator variables rather than operating purely reactively.',
    });
  }

  if (regression && regression.r2Percent >= 45) {
    strengths.push({
      strength: 'Actionable Forecasting Explanatory Power',
      evidence: `Linear regression equation accounts for ${formatNumber(regression.r2Percent, 1)}% of total observed response variance.`,
      businessValue: 'Yields a calibrated statistical model to inform inventory purchasing and price-setting adjustments.',
    });
  }

  if (indexNumbers && indexNumbers.priceIndex > 100) {
    strengths.push({
      strength: 'Demonstrated Price Realization Across Selected Menu Items',
      evidence: `Aggregative price index stands at ${formatNumber(indexNumbers.priceIndex, 2)} (+${formatNumber(indexNumbers.percentageChange, 2)}% above base period).`,
      businessValue: 'Indicates the enterprise has successfully implemented revised item price points across key offerings.',
    });
  }

  if (strengths.length === 0) {
    strengths.push({
      strength: 'Empirical Measurement Framework in Place',
      evidence: 'Statistical calculation pipeline initialized for quantitative analysis.',
      businessValue: 'Enables objective evaluation as data points populate across modules.',
    });
  }

  // 4. Evidence-Based Weaknesses
  const weaknesses: BusinessWeaknessItem[] = [];

  if (dispersion && dispersion.coefficientOfVariation !== null && dispersion.coefficientOfVariation > 35) {
    weaknesses.push({
      weakness: 'Extreme Demand & Activity Volatility',
      evidence: `Coefficient of Variation is ${formatNumber(dispersion.coefficientOfVariation, 1)}% (${dispersion.classification}), with a range spread of ${formatNumber(dispersion.range)} units.`,
      businessImpact: 'Unpredictable swings between quiet days and peak rushes complicate staffing, kitchen preparation, and perishable inventory buffers.',
    });
  }

  if (centralTendency && centralTendency.meanMedianDiffPercent !== null && Math.abs(centralTendency.meanMedianDiffPercent) > 10) {
    weaknesses.push({
      weakness: 'Divergence Between Average and Typical Daily Midpoint',
      evidence: `Mean (${formatNumber(centralTendency.mean)}) differs from Median (${formatNumber(centralTendency.median)}) by ${formatNumber(centralTendency.meanMedianDiffPercent, 1)}% (${centralTendency.classification}).`,
      businessImpact: 'Relying exclusively on the average overstates typical daily performance due to outlier surges; planning must account for both metrics.',
    });
  }

  if (regression && regression.r2Percent < 50) {
    weaknesses.push({
      weakness: 'Substantial Unexplained Variation in Linear Model',
      evidence: `Regression R² is ${formatNumber(regression.r2Percent, 1)}%, leaving ${(100 - regression.r2Percent).toFixed(1)}% of variance to unmeasured factors.`,
      businessImpact: 'Forecasting solely on this single relationship carries residual uncertainty; secondary drivers must be considered.',
    });
  }

  if (timeSeries && timeSeries.mape > 15) {
    weaknesses.push({
      weakness: 'Significant Periodic Fluctuations Around Secular Trend',
      evidence: `Mean Absolute Percentage Error is ${formatNumber(timeSeries.mape, 1)}% against the linear trendline.`,
      businessImpact: 'Customer demand is not smoothly compounding; operations experience short-term cycles and variance from day to day.',
    });
  }

  if (indexNumbers && indexNumbers.priceIndex > 120) {
    weaknesses.push({
      weakness: 'Elevated Price Level Differential Relative to Base',
      evidence: `Selected items have increased by ${formatNumber(indexNumbers.percentageChange, 2)}% (${indexNumbers.classification}).`,
      businessImpact: 'Substantial price increases may elevate customer value sensitivity, requiring careful monitoring of repeat footfall.',
    });
  }

  if (weaknesses.length === 0) {
    weaknesses.push({
      weakness: 'Data Capture Breadth Requires Expansion',
      evidence: 'Limited completed statistical tools currently active.',
      businessImpact: 'Partial data visibility leaves operational blind spots until all modules are analyzed.',
    });
  }

  // 5. Growth Opportunities
  const opportunities: BusinessOpportunityItem[] = [];

  if (timeSeries && dispersion && dispersion.coefficientOfVariation !== null && dispersion.coefficientOfVariation > 35) {
    opportunities.push({
      opportunity: 'Convert Irregular Peak Spikes into Repeatable Weekly Consistency',
      evidence: `Time Series shows positive direction (+${formatNumber(timeSeries.growthRatePercent, 2)}%) while Dispersion reveals heavy clustering around high-volume spikes.`,
      mechanism: 'Analyze operational conditions (weather, marketing promotions, weekend specials) present during peak volume surges and systematically replicate them on slower days.',
    });
  }

  if (indexNumbers && timeSeries && timeSeries.slope > 0) {
    opportunities.push({
      opportunity: 'Leverage Demand Momentum to Support Premium Menu Architecture',
      evidence: `Index Numbers show price realization at ${formatNumber(indexNumbers.priceIndex, 2)} while customer timeline momentum remains positive.`,
      mechanism: 'Introduce high-margin specialty items and curated tasting combos to lift average spend per customer while protecting volume.',
    });
  }

  if (centralTendency && dispersion) {
    opportunities.push({
      opportunity: 'Dual-Track Operational Scheduling (Baseline vs Peak Buffer)',
      evidence: `Median midpoint (${formatNumber(centralTendency.median)}) captures standard day requirement, while Quartile Deviation (${formatNumber(dispersion.quartileDeviation)}) brackets surge volume.`,
      mechanism: 'Calibrate core base staffing for median volume and use on-call flexible shift buffers for anticipated peak windows.',
    });
  }

  if (correlation && correlation.r >= 0.5) {
    opportunities.push({
      opportunity: 'Strategic Optimization of Verified Indicator Association',
      evidence: `Correlation r = ${formatNumber(correlation.r, 4)} confirms verified co-movement between evaluated business parameters.`,
      mechanism: 'Influence the leading operational input variable to drive favorable downstream commercial outcomes.',
    });
  }

  // 6. Business Risk Signals
  const risks: BusinessRiskItem[] = [];

  if (dispersion && dispersion.coefficientOfVariation !== null && dispersion.coefficientOfVariation > 40) {
    risks.push({
      risk: 'Severe Inventory Spoilage & Labor Inefficiency During Trough Days',
      evidence: `High CV of ${formatNumber(dispersion.coefficientOfVariation, 1)}% indicates wide swings in daily demand.`,
      whyItMatters: 'Over-preparing for surge traffic during an unexpected lull produces food waste and unabsorbed kitchen labor expense.',
    });
  }

  if (indexNumbers && indexNumbers.priceIndex > 120 && timeSeries && timeSeries.mape > 15) {
    risks.push({
      risk: 'Customer Retention Vulnerability Under Price Repositioning',
      evidence: `Prices +${formatNumber(indexNumbers.percentageChange, 2)}% higher alongside high demand volatility (${formatNumber(timeSeries.mape, 1)}% MAPE).`,
      whyItMatters: 'If customer perceived value erodes after substantial price adjustments, repeat visit frequency in Sainikpuri could contract.',
    });
  }

  if (regression && regression.r2Percent < 50) {
    risks.push({
      risk: 'Forecast Errors from Single-Factor Planning Models',
      evidence: `Regression R² is only ${formatNumber(regression.r2Percent, 1)}%.`,
      whyItMatters: 'Basing strategic supply agreements on this equation alone introduces forecast risk; multi-variable planning is necessary.',
    });
  }

  // 7. Cross-Tool Insights (Core Cross-Tool Synthesis Engine)
  const crossToolInsights: CrossToolInsightItem[] = [];

  // Insight 1: Dispersion CV + Time Series Direction
  if (dispersion && timeSeries) {
    const isVolatile = dispersion.coefficientOfVariation !== null && dispersion.coefficientOfVariation > 35;
    const isUpward = timeSeries.slope > 0;
    crossToolInsights.push({
      title: 'Volatile Demand Directionality Synthesis',
      toolsInvolved: ['02 Dispersion', '05 Time Series'],
      insight: isUpward && isVolatile
        ? `Customer activity demonstrates an overall upward trajectory (+${formatNumber(timeSeries.growthRatePercent, 2)}% per period), but extreme daily variance (CV = ${formatNumber(dispersion.coefficientOfVariation!, 1)}%) indicates growth is concentrated in periodic surges rather than steady incremental daily traffic.`
        : `Customer timeline indicates ${timeSeries.trajectory.toLowerCase()} paired with ${dispersion.classification.toLowerCase()} operational spread.`,
      businessImplication: 'Do not assume uniform daily growth; focus operational strategy on converting peak customer surges into consistent weekday habits.',
      evidenceLevel: 'HIGH',
    });
  }

  // Insight 2: Central Tendency Divergence + Dispersion Spread
  if (centralTendency && dispersion) {
    const hasDivergence = centralTendency.meanMedianDiffPercent !== null && Math.abs(centralTendency.meanMedianDiffPercent) > 8;
    crossToolInsights.push({
      title: 'Baseline Asymmetry & Operational Floor Calibration',
      toolsInvolved: ['01 Central Tendency', '02 Dispersion'],
      insight: hasDivergence
        ? `The arithmetic mean (${formatNumber(centralTendency.mean)}) diverges from the median midpoint (${formatNumber(centralTendency.median)}) by ${formatNumber(centralTendency.meanMedianDiffPercent!, 1)}% alongside a standard deviation of ${formatNumber(dispersion.populationStandardDeviation)}. This confirms that high-volume peak days skew the average upward.`
        : `The mean (${formatNumber(centralTendency.mean)}) and median (${formatNumber(centralTendency.median)}) are closely aligned, reflecting balanced distribution across normal operating windows.`,
      businessImplication: 'Use the median for baseline weekday prep and inventory minimums, while sizing labor buffers using the upper quartile (Q3 = ' + formatNumber(dispersion.q3) + ').',
      evidenceLevel: 'HIGH',
    });
  }

  // Insight 3: Correlation Co-Movement + Regression Explanatory Power
  if (correlation && regression) {
    crossToolInsights.push({
      title: 'Linear Association & Model Explanatory Discipline',
      toolsInvolved: ['03 Correlation', '04 Regression'],
      insight: `The two evaluated variables exhibit a ${correlation.classification.toLowerCase()} correlation (r = ${formatNumber(correlation.r, 4)}), and the linear regression equation explains ${formatNumber(regression.r2Percent, 1)}% of total response variance (Slope b = ${formatNumber(regression.slope, 4)}). This establishes a meaningful mathematical association without implying direct singular causation.`,
      businessImplication: 'The regression model can serve as a valuable planning calibration tool, but operational decisions must incorporate qualitative market dynamics.',
      evidenceLevel: regression.r2Percent >= 45 ? 'HIGH' : 'MODERATE',
    });
  }

  // Insight 4: Index Numbers Price Level + Time Series / Demand
  if (indexNumbers) {
    const isElevatedPrice = indexNumbers.priceIndex > 115;
    if (timeSeries) {
      crossToolInsights.push({
        title: 'Price Adjustment vs Customer Velocity Interaction',
        toolsInvolved: ['05 Time Series', '06 Index Numbers'],
        insight: isElevatedPrice && timeSeries.slope > 0
          ? `Selected menu item prices have shifted +${formatNumber(indexNumbers.percentageChange, 2)}% above base period levels (Index = ${formatNumber(indexNumbers.priceIndex, 2)}), yet customer footfall momentum remains positive (+${formatNumber(timeSeries.growthRatePercent, 2)}% per period). This suggests preliminary market resilience to adjusted price points in Sainikpuri.`
          : `Selected item price index stands at ${formatNumber(indexNumbers.priceIndex, 2)} alongside time series trend trajectory of ${timeSeries.trajectory.toLowerCase()}.`,
        businessImplication: 'Protect customer value perception through generous portion consistency and service speed to ensure price gains do not trigger delayed volume erosion.',
        evidenceLevel: 'MODERATE',
      });
    } else {
      crossToolInsights.push({
        title: 'Aggregative Item Price Realization',
        toolsInvolved: ['06 Index Numbers'],
        insight: `Selected items have increased by ${formatNumber(indexNumbers.percentageChange, 2)}% relative to base baseline (ΣP₀ = ${formatNumber(indexNumbers.basePeriodTotal)} vs ΣP₁ = ${formatNumber(indexNumbers.currentPeriodTotal)}).`,
        businessImplication: 'Audit item-level margin contribution and ensure price revisions align with customer value perception.',
        evidenceLevel: 'HIGH',
      });
    }
  }

  // 8 & 9. Prioritized Action Plan (P1, P2, P3)
  const prioritizedActions: ActionPlanItem[] = [];

  // P1 Actions
  if (dispersion && dispersion.coefficientOfVariation !== null && dispersion.coefficientOfVariation > 35) {
    prioritizedActions.push({
      priority: 'P1',
      priorityLabel: 'P1 — HIGH PRIORITY',
      action: 'Implement Flexible Shift Scheduling & Buffer Stocking',
      reason: `Dispersion reveals extreme variation (CV = ${formatNumber(dispersion.coefficientOfVariation, 1)}%), creating mismatch between fixed labor and actual customer footfall.`,
      expectedBusinessPurpose: 'Eliminate over-staffing on quiet weekdays while preventing service bottlenecks and food stockouts during peak rushes.',
      evidenceLevel: 'HIGH',
    });
  }

  if (indexNumbers && indexNumbers.priceIndex > 120) {
    prioritizedActions.push({
      priority: 'P1',
      priorityLabel: 'P1 — HIGH PRIORITY',
      action: 'Conduct Value-Perception & Menu Margin Audit',
      reason: `Selected prices are +${formatNumber(indexNumbers.percentageChange, 2)}% above base period, elevating risk of customer churn if quality or service lags.`,
      expectedBusinessPurpose: 'Confirm gross margins across adjusted items while auditing customer feedback to preserve loyalty in Sainikpuri.',
      evidenceLevel: 'HIGH',
    });
  }

  // P2 Actions
  if (timeSeries && timeSeries.slope > 0) {
    prioritizedActions.push({
      priority: 'P2',
      priorityLabel: 'P2 — MEDIUM PRIORITY',
      action: 'Launch Midweek Footfall Driver Campaigns',
      reason: `Time Series shows positive growth (+${formatNumber(timeSeries.growthRatePercent, 2)}%), but volume remains unevenly concentrated.`,
      expectedBusinessPurpose: 'Smooth out demand volatility by incentivizing visits during historical trough days through targeted coffee subscriptions or workstation specials.',
      evidenceLevel: 'MODERATE',
    });
  }

  if (regression && regression.r2Percent >= 40) {
    prioritizedActions.push({
      priority: 'P2',
      priorityLabel: 'P2 — MEDIUM PRIORITY',
      action: 'Integrate Calibrated Regression Predictor into Procurement',
      reason: `Regression model explains ${formatNumber(regression.r2Percent, 1)}% of response variable variance with slope b = ${formatNumber(regression.slope, 4)}.`,
      expectedBusinessPurpose: 'Use predictor levels to anticipate raw material reorder volumes 7–10 days in advance.',
      evidenceLevel: 'MODERATE',
    });
  }

  // P3 Actions
  prioritizedActions.push({
    priority: 'P3',
    priorityLabel: 'P3 — STRATEGIC / LONGER TERM',
    action: 'Institutionalize Continuous Multi-Variable Data Logging',
    reason: 'Single-variable models leave residual variation unexplained (Regression R² and Time Series MAPE indicate unmeasured factors).',
    expectedBusinessPurpose: 'Capture hourly POS ticket items, weather conditions, and promotion dates to construct a multi-dimensional decision engine.',
    evidenceLevel: 'HIGH',
  });

  // 10. KOI & CO. Growth Strategy Pillars
  const growthStrategy: GrowthStrategyPillar[] = [
    {
      pillar: '1. CUSTOMER GROWTH',
      whatToDo: 'Target Midweek Volume Stimulation & Event Activations',
      why: 'Demand direction is positive, but heavy volatility indicates slow weekdays suppress overall potential capacity.',
      dataEvidence: timeSeries 
        ? `Time Series slope b = +${formatNumber(timeSeries.slope, 2)} per period combined with dispersion spread (${dispersion ? formatNumber(dispersion.range) : 'N/A'} units).`
        : 'Baseline observation patterns show operational room for weekday demand lift.',
    },
    {
      pillar: '2. REVENUE / PRICING',
      whatToDo: 'Protect Premium Price Realization via Experiential Value',
      why: 'Selected menu items carry substantial price increases relative to base periods; customer retention requires perceived value reinforcement.',
      dataEvidence: indexNumbers 
        ? `Aggregative Price Index of ${formatNumber(indexNumbers.priceIndex, 2)} (+${formatNumber(indexNumbers.percentageChange, 2)}% change across selected items).`
        : 'Price relative benchmarking ensures margins outpace operational cost inflation.',
    },
    {
      pillar: '3. OPERATIONAL EFFICIENCY',
      whatToDo: 'Align Kitchen Preps with Median Baseline Rather Than Average',
      why: 'Due to peak day upward skew, arithmetic mean overstates typical daily requirements; median provides a more accurate floor.',
      dataEvidence: centralTendency && dispersion 
        ? `Median of ${formatNumber(centralTendency.median)} units vs Mean of ${formatNumber(centralTendency.mean)} (${centralTendency.classification}).`
        : 'Central tendency metrics provide differentiated baselines for regular vs peak days.',
    },
    {
      pillar: '4. CUSTOMER RETENTION',
      whatToDo: 'Implement Loyalty Pairing with High-Margin Specialty Items',
      why: 'Repeat visit frequency cushions the business against demand volatility and cushions against price sensitivity.',
      dataEvidence: correlation 
        ? `Correlation r = ${formatNumber(correlation.r, 4)} indicates clear associative relationship between core pricing and customer response.`
        : 'Customer behavioral consistency is the primary safeguard against volume fluctuations.',
    },
    {
      pillar: '5. DATA-DRIVEN DECISION MAKING',
      whatToDo: 'Execute Systematic Hypotheses Testing Before Major Strategy Shifts',
      why: 'Statistical evidence provides high-confidence diagnostic signals, but changes must be tested iteratively before full deployment.',
      dataEvidence: '6-Perspective Statistical Suite integration provides cross-tool verification preventing reliance on isolated single metrics.',
    },
  ];

  // 11. What the Data Does NOT Support
  const unsupportedClaims = [
    {
      claim: 'Do NOT assume correlation implies direct causation.',
      explanation: correlation 
        ? `While correlation is ${correlation.classification.toLowerCase()} (r = ${formatNumber(correlation.r, 4)}), association proves only co-movement, not that altering X automatically drives Y.`
        : 'Statistical association alone never proves operational causation.',
    },
    {
      claim: 'Do NOT treat the secular trend as a guaranteed forecast.',
      explanation: timeSeries 
        ? `The linear trendline carries a MAPE of ${formatNumber(timeSeries.mape, 1)}%. Real-world footfall will continue to experience day-to-day cyclical and seasonal swings.`
        : 'Trend projections represent secular trajectory, not deterministic certainty.',
    },
    {
      claim: 'Do NOT assume all restaurant menu items have inflated equally.',
      explanation: indexNumbers 
        ? `The Simple Aggregative Price Index (${formatNumber(indexNumbers.priceIndex, 2)}) reflects the specific items entered in the dataset, not general restaurant-wide inflation.`
        : 'Index numbers represent the selected basket of items, not overall business pricing.',
    },
    {
      claim: 'Do NOT base major capital commitments on isolated surge observations.',
      explanation: centralTendency 
        ? `Extreme peak days skew the average upward (${centralTendency.classification}); capital planning should be rooted in typical median performance.`
        : 'Single outlier periods must be separated from recurring commercial equilibrium.',
    },
    {
      claim: 'Do NOT treat statistical models as substitutes for customer hospitality.',
      explanation: 'Statistical metrics provide decision intelligence, but exceptional beverage quality, staff attentiveness, and cafe ambiance remain the core drivers of repeat patronage.',
    },
  ];

  // 12. Executive Summary & Management Takeaway
  let executiveSummary = '';
  if (completeness === 'COMPLETE') {
    const demandDesc = timeSeries?.slope && timeSeries.slope > 0 ? 'an upward demand expansion' : 'a stable customer baseline';
    const consistencyDesc = dispersion?.coefficientOfVariation && dispersion.coefficientOfVariation > 35 ? 'highly variable' : 'relatively consistent';
    const priceDesc = indexNumbers?.percentageChange && indexNumbers.percentageChange > 15 ? 'have increased materially' : 'show moderate adjustment';
    const relDesc = correlation?.r ? (Math.abs(correlation.r) > 0.6 ? 'demonstrate meaningful association' : 'show modest co-movement') : 'are evaluated';

    executiveSummary = `KOI & CO. demonstrates ${demandDesc} across sequential periods, yet day-to-day customer activity remains ${consistencyDesc} (CV = ${dispersion?.coefficientOfVariation ? formatNumber(dispersion.coefficientOfVariation, 1) + '%' : 'N/A'}). Evaluated operational variables ${relDesc}, while regression explains ${regression?.r2Percent ? formatNumber(regression.r2Percent, 1) + '%' : 'a portion'} of response variance. Concurrently, selected item prices ${priceDesc} relative to the base period (+${indexNumbers?.percentageChange ? formatNumber(indexNumbers.percentageChange, 2) + '%' : 'N/A'}). Management's immediate strategic priority must center on smoothing demand volatility between quiet days and peak rushes while preserving customer value perception under revised price points.`;
  } else if (completeness === 'PARTIAL') {
    executiveSummary = `Partial business evidence is currently available across ${completedCount} of 6 statistical modules (${availableTools.join(', ')}). Available metrics indicate meaningful business signals, but complete cross-tool synthesis requires running the remaining ${missingTools.length} modules (${missingTools.join(', ')}).`;
  } else {
    executiveSummary = `Preliminary diagnostic stage: Only ${completedCount} of 6 statistical tools have been calculated. Please run additional statistical modules (Central Tendency, Dispersion, Correlation, Regression, Time Series, Index Numbers) or load verified sample datasets to generate a complete executive diagnosis.`;
  }

  // Management Takeaway
  const currentCondition = timeSeries && dispersion 
    ? `Operating volume is expanding (+${formatNumber(timeSeries.growthRatePercent, 2)}% / period), but operational variance is high (${dispersion.classification}), causing friction between busy peak surges and slow lulls.`
    : 'Business activity is established with foundational measurement across active statistical dimensions.';

  const strongestPositiveSignal = timeSeries && timeSeries.slope > 0
    ? `Strong directional growth momentum in customer timeline (+${formatNumber(timeSeries.slope, 2)} units per period).`
    : (correlation && correlation.r >= 0.5 
      ? `Clear associative relationship (r = ${formatNumber(correlation.r, 4)}) between key business indicators.`
      : 'Measurable empirical performance across evaluated observation sets.');

  const biggestWeakness = dispersion && dispersion.coefficientOfVariation !== null && dispersion.coefficientOfVariation > 35
    ? `Extreme demand inconsistency (CV = ${formatNumber(dispersion.coefficientOfVariation, 1)}%) creating labor and inventory misallocation.`
    : (centralTendency && centralTendency.meanMedianDiffPercent && Math.abs(centralTendency.meanMedianDiffPercent) > 10
      ? `Mean-median divergence of ${formatNumber(centralTendency.meanMedianDiffPercent, 1)}% obscuring typical weekday volume.`
      : 'Variable distribution across non-peak periods.');

  const biggestRisk = indexNumbers && indexNumbers.priceIndex > 120
    ? `Customer price sensitivity risk following a +${formatNumber(indexNumbers.percentageChange, 2)}% increase on selected items if service speed lags.`
    : 'Operational bottlenecks during unforecasted volume surges.';

  const biggestOpportunity = timeSeries && dispersion
    ? 'Converting periodic high-footfall spikes into repeatable weekly consistency through targeted midweek activations.'
    : 'Systematic alignment of inventory and pricing models with empirical customer patterns.';

  const immediatePriority = dispersion && indexNumbers
    ? 'Implement flexible shift scheduling for surge volatility and audit customer value retention across updated menu items.'
    : 'Complete full 6-tool statistical evaluation to inform operational budgeting.';

  const summaryParagraph = `${currentCondition} The strongest positive indicator is ${strongestPositiveSignal.toLowerCase()} However, the principal operational challenge is ${biggestWeakness.toLowerCase()} Concurrently, management must monitor ${biggestRisk.toLowerCase()} The primary commercial opportunity lies in ${biggestOpportunity.toLowerCase()} Therefore, management's immediate action should be to ${immediatePriority.toLowerCase()}`;

  return {
    completeness,
    completedCount,
    totalTools,
    availableTools,
    missingTools,
    executiveSummary,
    healthSignals,
    strengths,
    weaknesses,
    opportunities,
    risks,
    crossToolInsights,
    prioritizedActions,
    growthStrategy,
    unsupportedClaims,
    managementTakeaway: {
      currentCondition,
      strongestPositiveSignal,
      biggestWeakness,
      biggestRisk,
      biggestOpportunity,
      immediatePriority,
      summaryParagraph,
    },
  };
}
