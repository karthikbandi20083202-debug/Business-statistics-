/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  ArrowLeft, 
  Layers, 
  Compass,
  Sparkles
} from 'lucide-react';
import { DatasetInput } from './DatasetInput';
import { CentralTendencyModule } from './CentralTendencyModule';
import { DispersionModule } from './DispersionModule';
import { CorrelationModule } from './CorrelationModule';
import { RegressionModule } from './RegressionModule';
import { TimeSeriesModule } from './TimeSeriesModule';
import { IndexNumbersModule } from './IndexNumbersModule';
import { BusinessDiagnosis } from './BusinessDiagnosis';
import { 
  AnalysisResults, 
  CentralTendencyResult, 
  DispersionResult, 
  ValidationState,
  CorrelationResult,
  RegressionResult,
  TimeSeriesResult,
  IndexNumbersResult,
  DiagnosisEvidenceState
} from '../types/statistics';
import { validateDatasetInputs, parseDataset } from '../statistics/validation';
import { calculateCentralTendency, formatNumber } from '../statistics/centralTendency';
import { calculateDispersion } from '../statistics/dispersion';
import { calculateCorrelation } from '../statistics/correlation';
import { calculateRegression } from '../statistics/regression';
import { calculateTimeSeries } from '../statistics/timeSeries';
import { calculateIndexNumbers } from '../statistics/indexNumbers';

// Verified KOI & CO. Global Sample Datasets for Complete Multi-Tool Synthesis
const VERIFIED_FOOTFALL_15 = [85, 65, 70, 72, 80, 1050, 1000, 419, 85, 565, 517, 550, 819, 1010, 100];
const VERIFIED_BIVARIATE_PAIRS = [
  { x: 169, y: 409 },
  { x: 212, y: 560 },
  { x: 260, y: 440 },
  { x: 296, y: 436 },
  { x: 346, y: 486 },
  { x: 399, y: 455 },
  { x: 448, y: 466 },
  { x: 468, y: 515 },
  { x: 516, y: 640 },
  { x: 574, y: 486 },
  { x: 602, y: 660 },
  { x: 657, y: 545 },
];
const VERIFIED_TIMELINE_15 = [
  { periodLabel: '24 Aug', value: 85 },
  { periodLabel: '25 Aug', value: 65 },
  { periodLabel: '26 Aug', value: 70 },
  { periodLabel: '27 Aug', value: 72 },
  { periodLabel: '28 Aug', value: 80 },
  { periodLabel: '29 Aug', value: 1050 },
  { periodLabel: '30 Aug', value: 1000 },
  { periodLabel: '31 Aug', value: 419 },
  { periodLabel: '1 Sep', value: 85 },
  { periodLabel: '2 Sep', value: 565 },
  { periodLabel: '3 Sep', value: 517 },
  { periodLabel: '4 Sep', value: 550 },
  { periodLabel: '5 Sep', value: 819 },
  { periodLabel: '6 Sep', value: 1010 },
  { periodLabel: '7 Sep', value: 100 },
];
const VERIFIED_INDEX_ITEMS_8 = [
  { itemName: 'Espresso Blend (250g)', basePrice: 380, currentPrice: 480 },
  { itemName: 'Cold Brew Reserve (Bottle)', basePrice: 220, currentPrice: 280 },
  { itemName: 'Japanese Matcha Latte', basePrice: 260, currentPrice: 320 },
  { itemName: 'Almond Croissant', basePrice: 190, currentPrice: 240 },
  { itemName: 'Truffle Parmesan Fries', basePrice: 290, currentPrice: 360 },
  { itemName: 'Smoked Salmon Tartine', basePrice: 460, currentPrice: 580 },
  { itemName: 'Basque Burnt Cheesecake', basePrice: 340, currentPrice: 425 },
  { itemName: 'Signature Pour Over Reserve', basePrice: 686, currentPrice: 858 },
];

interface BusinessAnalyzerProps {
  onBackToLanding: () => void;
}

export function BusinessAnalyzer({ onBackToLanding }: BusinessAnalyzerProps) {
  // Navigation & Workspace Filter
  const [activeFilter, setActiveFilter] = useState<'ALL' | '01' | '02' | '03' | '04' | '05' | '06' | 'DIAGNOSIS'>('ALL');

  // ==========================================
  // Cross-Tool Output State for Business Diagnosis
  // ==========================================
  const [correlationResult, setCorrelationResult] = useState<CorrelationResult | null>(null);
  const [regressionResult, setRegressionResult] = useState<RegressionResult | null>(null);
  const [timeSeriesResult, setTimeSeriesResult] = useState<TimeSeriesResult | null>(null);
  const [indexNumbersResult, setIndexNumbersResult] = useState<IndexNumbersResult | null>(null);

  // ==========================================
  // Univariate State (Central Tendency & Dispersion)
  // ==========================================
  const [variableName, setVariableName] = useState('Customer Footfall');
  const [observationCount, setObservationCount] = useState(15);
  const [rawInputs, setRawInputs] = useState<string[]>(Array(15).fill(''));
  const [validationState, setValidationState] = useState<ValidationState | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Synthesize all 6 verified datasets in one click
  const handleSynthesizeAllData = () => {
    // 1. Univariate
    const uParsed = [...VERIFIED_FOOTFALL_15];
    const uInputs = uParsed.map((n) => n.toString());
    setRawInputs(uInputs);
    setObservationCount(uParsed.length);
    setVariableName('Customer Footfall');
    const ctRes = calculateCentralTendency(uParsed);
    const dispRes = calculateDispersion(uParsed, ctRes.mean);
    setResults({
      dataset: uParsed,
      variableName: 'Customer Footfall',
      centralTendency: ctRes,
      dispersion: dispRes,
      timestamp: new Date().toLocaleTimeString(),
    });
    setHasAnalyzed(true);
    setValidationState({ isValid: true, errors: {}, missingCount: 0 });

    // 2. Correlation
    const corrRes = calculateCorrelation(VERIFIED_BIVARIATE_PAIRS, 'Base Price (₹)', 'Current Price (₹)');
    setCorrelationResult(corrRes);

    // 3. Regression
    const regRes = calculateRegression(VERIFIED_BIVARIATE_PAIRS, 'Old/Base Price (X)', 'Current Price (Y)');
    setRegressionResult(regRes);

    // 4. Time Series
    const tsRes = calculateTimeSeries(VERIFIED_TIMELINE_15, 'Customer Footfall');
    setTimeSeriesResult(tsRes);

    // 5. Index Numbers
    const idxRes = calculateIndexNumbers(VERIFIED_INDEX_ITEMS_8);
    setIndexNumbersResult(idxRes);
  };

  const evidenceState: DiagnosisEvidenceState = {
    centralTendency: results ? results.centralTendency : null,
    dispersion: results ? results.dispersion : null,
    correlation: correlationResult,
    regression: regressionResult,
    timeSeries: timeSeriesResult,
    indexNumbers: indexNumbersResult,
  };

  // Univariate Input Handlers
  const handleInputChange = (index: number, value: string) => {
    const updated = [...rawInputs];
    updated[index] = value;
    setRawInputs(updated);
    if (hasAnalyzed) {
      setHasAnalyzed(false);
      setResults(null);
    }
    if (validationState) {
      setValidationState(null);
    }
  };

  const handleBulkSetInputs = (inputs: string[]) => {
    setRawInputs(inputs);
    setHasAnalyzed(false);
    setResults(null);
    setValidationState(null);
  };

  const handleAnalyze = () => {
    const validation = validateDatasetInputs(rawInputs, observationCount);
    setValidationState(validation);
    if (!validation.isValid) {
      setHasAnalyzed(false);
      setResults(null);
      return;
    }

    try {
      const parsedData = parseDataset(rawInputs);
      const centralResult: CentralTendencyResult = calculateCentralTendency(parsedData);
      const dispersionResult: DispersionResult = calculateDispersion(parsedData, centralResult.mean);

      setResults({
        dataset: parsedData,
        variableName,
        centralTendency: centralResult,
        dispersion: dispersionResult,
        timestamp: new Date().toLocaleTimeString(),
      });
      setHasAnalyzed(true);
    } catch (err) {
      console.error('Univariate analysis error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      
      {/* Top Breadcrumb & Page Title Header */}
      <div className="space-y-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>RETURN TO OVERVIEW</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>All 06 Statistical Suites Live</span>
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-emerald-400 mb-2">
            <span>KOI &amp; CO. • SAINIKPURI, HYDERABAD</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            BUSINESS ANALYZER
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2 font-medium">
            Turn business data into measurable evidence and actionable insight.
          </p>
        </div>
      </div>

      {/* Primary Dataset Input Engine (Central Tendency & Dispersion) */}
      <DatasetInput
        variableName={variableName}
        onVariableNameChange={setVariableName}
        observationCount={observationCount}
        onObservationCountChange={setObservationCount}
        rawInputs={rawInputs}
        onInputChange={handleInputChange}
        onBulkSetInputs={handleBulkSetInputs}
        onAnalyze={handleAnalyze}
        validationState={validationState}
        hasAnalyzed={hasAnalyzed}
      />

      {/* Cross-Tool Synthesis Card (Central Tendency & Dispersion) */}
      {results && (activeFilter === 'ALL' || activeFilter === '01' || activeFilter === '02') && (
        <div className="rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-purple-950/30 border border-emerald-500/30 p-5 sm:p-6 shadow-xl animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h3 className="font-display text-sm sm:text-base font-bold text-white tracking-wide">
                SYNTHESIZED BASELINE &amp; DISPERSION INTELLIGENCE
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-400">
              Evaluated at {results.timestamp} · N = {results.dataset.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono mb-4">
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block">Baseline Mean:</span>
              <span className="text-emerald-400 font-bold text-sm">
                {formatNumber(results.centralTendency.mean)}
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block">Median Midpoint:</span>
              <span className="text-slate-200 font-bold text-sm">
                {formatNumber(results.centralTendency.median)}
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block">Std Deviation (σ):</span>
              <span className="text-slate-200 font-bold text-sm">
                {formatNumber(results.dispersion.populationStandardDeviation)}
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block">Coeff. of Variation (CV):</span>
              <span className="text-teal-300 font-bold text-sm">
                {results.dispersion.coefficientOfVariation !== null
                  ? `${formatNumber(results.dispersion.coefficientOfVariation)}%`
                  : 'N/A'}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <strong className="text-emerald-300 font-semibold">Executive Assessment: </strong>
            Customer footfall demonstrates{' '}
            <span className="text-slate-100 font-medium lowercase">
              {results.centralTendency.classification}
            </span>{' '}
            between mean ({formatNumber(results.centralTendency.mean)}) and median ({formatNumber(results.centralTendency.median)}), paired with{' '}
            <span className="text-slate-100 font-medium lowercase">
              {results.dispersion.classification}
            </span>{' '}
            dispersion across operating observations. Commercial decisions should balance median typical days with variance buffering.
          </p>
        </div>
      )}

      {/* Module Navigation Filter Bar (Compact Single-Page Controller) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Perspectives (6)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('01')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeFilter === '01'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            01 Central Tendency
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('02')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeFilter === '02'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            02 Dispersion
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('03')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeFilter === '03'
                ? 'bg-teal-950/80 text-teal-300 border border-teal-500/40 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            03 Correlation
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('04')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeFilter === '04'
                ? 'bg-teal-950/80 text-teal-300 border border-teal-500/40 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            04 Regression
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('05')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeFilter === '05'
                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            05 Time Series
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('06')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeFilter === '06'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            06 Index Numbers
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('DIAGNOSIS')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer font-semibold flex items-center gap-1.5 ${
              activeFilter === 'DIAGNOSIS'
                ? 'bg-gradient-to-r from-purple-600 to-emerald-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-purple-300 hover:text-white border border-purple-500/30 bg-purple-950/40'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Diagnosis &amp; Strategy</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <button
            type="button"
            onClick={handleSynthesizeAllData}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer text-[11px]"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Load All 6 Datasets</span>
          </button>
          <span className="text-slate-500 hidden sm:inline">
            Deterministic Decision Layer Active
          </span>
        </div>
      </div>

      {/* Six Statistical Modules Container */}
      <div className="space-y-6">
        
        {/* Module 01: Central Tendency */}
        {(activeFilter === 'ALL' || activeFilter === '01') && (
          <CentralTendencyModule
            result={results ? results.centralTendency : null}
            variableName={variableName}
          />
        )}

        {/* Module 02: Dispersion */}
        {(activeFilter === 'ALL' || activeFilter === '02') && (
          <DispersionModule
            result={results ? results.dispersion : null}
            variableName={variableName}
          />
        )}

        {/* Module 03: Correlation (Independent Module with Self-Contained Input & Audit) */}
        {(activeFilter === 'ALL' || activeFilter === '03') && (
          <CorrelationModule 
            onResultCalculated={(res) => setCorrelationResult(res)}
          />
        )}

        {/* Module 04: Regression (Independent Module with Self-Contained Input, Prediction & Audit) */}
        {(activeFilter === 'ALL' || activeFilter === '04') && (
          <RegressionModule 
            onResultCalculated={(res) => setRegressionResult(res)}
          />
        )}

        {/* Module 05: Time Series (Independent Module with Chronological Input, Moving Average & Forecast) */}
        {(activeFilter === 'ALL' || activeFilter === '05') && (
          <TimeSeriesModule 
            onResultCalculated={(res) => setTimeSeriesResult(res)}
          />
        )}

        {/* Module 06: Index Numbers (Independent Module with Base/Current Prices & Aggregative Index) */}
        {(activeFilter === 'ALL' || activeFilter === '06') && (
          <IndexNumbersModule 
            onResultCalculated={(res) => setIndexNumbersResult(res)}
          />
        )}

      </div>

      {/* ==================================================
          FINAL BUSINESS INTELLIGENCE LAYER:
          BUSINESS DIAGNOSIS & GROWTH STRATEGY
          ================================================== */}
      {(activeFilter === 'ALL' || activeFilter === 'DIAGNOSIS') && (
        <div className="pt-8 border-t border-slate-800/80">
          <BusinessDiagnosis
            evidence={evidenceState}
            onLoadAllVerifiedData={handleSynthesizeAllData}
            onNavigateToModule={(mod) => setActiveFilter(mod)}
          />
        </div>
      )}

    </div>
  );
}
