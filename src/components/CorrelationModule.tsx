/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Calculator, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  ShieldAlert, 
  Sparkles, 
  RotateCcw, 
  Sliders, 
  Play, 
  AlertCircle, 
  CheckCircle2,
  Activity
} from 'lucide-react';
import { CorrelationResult, PairedObservation, PairedValidationState } from '../types/statistics';
import { calculateCorrelation } from '../statistics/correlation';
import { validatePairedDatasetInputs, parsePairedDataset } from '../statistics/validation';
import { formatNumber } from '../statistics/centralTendency';

// Verified KOI & CO. Item-Price Sample Dataset (Optional manual load)
const KOI_PRICE_SAMPLE_X = [
  169, 212, 260, 296, 346, 399, 448, 468, 516, 574, 602, 657
];
const KOI_PRICE_SAMPLE_Y = [
  409, 560, 440, 436, 486, 455, 466, 515, 640, 486, 660, 545
];

interface CorrelationModuleProps {
  onResultCalculated?: (res: CorrelationResult | null) => void;
}

export function CorrelationModule({ onResultCalculated }: CorrelationModuleProps = {}) {
  // Input parameters
  const [variableXName, setVariableXName] = useState('Base Price (₹)');
  const [variableYName, setVariableYName] = useState('Current Price (₹)');
  const [pairCount, setPairCount] = useState(12);
  const [showConfig, setShowConfig] = useState(false);

  // Raw string inputs for X and Y
  const [inputsX, setInputsX] = useState<string[]>(Array(12).fill(''));
  const [inputsY, setInputsY] = useState<string[]>(Array(12).fill(''));

  // Validation and Result states
  const [validationState, setValidationState] = useState<PairedValidationState | null>(null);
  const [result, setResult] = useState<CorrelationResult | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);

  // Invalidate analysis when inputs change
  const handleInputChangeX = (idx: number, val: string) => {
    const updated = [...inputsX];
    updated[idx] = val;
    setInputsX(updated);

    // Invalidate stale results
    if (hasAnalyzed) {
      setHasAnalyzed(false);
      setResult(null);
      onResultCalculated?.(null);
    }
    if (validationState) {
      setValidationState(null);
    }
  };

  const handleInputChangeY = (idx: number, val: string) => {
    const updated = [...inputsY];
    updated[idx] = val;
    setInputsY(updated);

    // Invalidate stale results
    if (hasAnalyzed) {
      setHasAnalyzed(false);
      setResult(null);
      onResultCalculated?.(null);
    }
    if (validationState) {
      setValidationState(null);
    }
  };

  // Change observation count
  const handleCountChange = (newCount: number) => {
    if (newCount < 2 || newCount > 50) return;
    setPairCount(newCount);
    const newX = Array(newCount).fill('');
    const newY = Array(newCount).fill('');
    for (let i = 0; i < Math.min(newCount, inputsX.length); i++) {
      newX[i] = inputsX[i];
      newY[i] = inputsY[i];
    }
    setInputsX(newX);
    setInputsY(newY);
    setHasAnalyzed(false);
    setResult(null);
    onResultCalculated?.(null);
    setValidationState(null);
  };

  // Optional sample load
  const handleLoadSample = () => {
    setPairCount(KOI_PRICE_SAMPLE_X.length);
    setVariableXName('Base Price (₹)');
    setVariableYName('Current Price (₹)');
    setInputsX(KOI_PRICE_SAMPLE_X.map((n) => n.toString()));
    setInputsY(KOI_PRICE_SAMPLE_Y.map((n) => n.toString()));
    setHasAnalyzed(false);
    setResult(null);
    onResultCalculated?.(null);
    setValidationState(null);
  };

  // Clear inputs
  const handleClear = () => {
    setInputsX(Array(pairCount).fill(''));
    setInputsY(Array(pairCount).fill(''));
    setHasAnalyzed(false);
    setResult(null);
    onResultCalculated?.(null);
    setValidationState(null);
  };

  // Analyze button click
  const handleAnalyze = () => {
    const validation = validatePairedDatasetInputs(inputsX, inputsY, pairCount);
    setValidationState(validation);

    if (!validation.isValid) {
      setHasAnalyzed(false);
      setResult(null);
      onResultCalculated?.(null);
      return;
    }

    try {
      const parsedPairs = parsePairedDataset(inputsX, inputsY);
      const corrResult = calculateCorrelation(parsedPairs, variableXName, variableYName);
      setResult(corrResult);
      setHasAnalyzed(true);
      onResultCalculated?.(corrResult);
    } catch (err) {
      console.error('Correlation analysis error:', err);
    }
  };

  // Count filled pairs
  let filledCount = 0;
  for (let i = 0; i < pairCount; i++) {
    const xVal = (inputsX[i] ?? '').trim();
    const yVal = (inputsY[i] ?? '').trim();
    if (xVal !== '' && yVal !== '' && !isNaN(Number(xVal)) && !isNaN(Number(yVal))) {
      filledCount++;
    }
  }
  const isComplete = filledCount === pairCount;

  const getBadgeColor = (classification: string) => {
    switch (classification) {
      case 'VERY STRONG POSITIVE':
      case 'STRONG POSITIVE':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
      case 'MODERATE POSITIVE':
        return 'bg-teal-950/60 text-teal-300 border-teal-500/40';
      case 'WEAK POSITIVE':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40';
      case 'VERY WEAK / NEGLIGIBLE':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'WEAK NEGATIVE':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      case 'MODERATE NEGATIVE':
        return 'bg-orange-950/60 text-orange-300 border-orange-500/40';
      case 'STRONG NEGATIVE':
      case 'VERY STRONG NEGATIVE':
        return 'bg-rose-950/60 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="rounded-xl bg-[#090e1d]/90 border border-slate-800/90 overflow-hidden shadow-lg space-y-0">
      
      {/* Module Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-[#0e1428]/80 to-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-teal-400 bg-teal-950/60 border border-teal-500/30 px-2 py-1 rounded">
            03
          </span>
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-wide">
              CORRELATION
            </h3>
            <p className="text-xs text-slate-400">
              Pearson&apos;s correlation coefficient measuring directional co-movement between two variables
            </p>
          </div>
        </div>

        {result && (
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono tracking-wider px-2.5 py-1 rounded border font-semibold ${getBadgeColor(result.classification)}`}>
              {result.classification}
            </span>
          </div>
        )}
      </div>

      {/* Module Body */}
      <div className="p-5 sm:p-6 space-y-6">

        {/* ==================================================
            1. COMPACT INPUT AREA (INSIDE MODULE)
            ================================================== */}
        <div className="p-4 sm:p-5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-300 font-semibold">
                Paired Observation Inputs (X, Y)
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 text-teal-300 border border-teal-500/30">
                {pairCount} Pairs Required
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-teal-950/40 text-teal-300 hover:text-teal-200 border border-teal-500/30 hover:border-teal-500/50 hover:bg-teal-900/30 transition-all cursor-pointer"
                title="Load verified price relationship sample dataset"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>LOAD SAMPLE DATA</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                title="Clear all paired inputs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                  showConfig 
                    ? 'bg-slate-800 text-white border-slate-600' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Configure variables & observation count"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Config</span>
              </button>
            </div>
          </div>

          {/* Configuration Drawer */}
          {showConfig && (
            <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Variable X Name
                  </label>
                  <input
                    type="text"
                    value={variableXName}
                    onChange={(e) => setVariableXName(e.target.value)}
                    placeholder="e.g. Base Price"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Variable Y Name
                  </label>
                  <input
                    type="text"
                    value={variableYName}
                    onChange={(e) => setVariableYName(e.target.value)}
                    placeholder="e.g. Current Price"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Number of Pairs (n)
                  </label>
                  <div className="flex items-center gap-2">
                    {[10, 12, 15, 20].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => handleCountChange(cnt)}
                        className={`px-2 py-1 rounded font-mono text-xs cursor-pointer ${
                          pairCount === cnt
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        n = {cnt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Metadata labels */}
          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
            <div className="flex items-center gap-3">
              <span>X: <strong className="text-slate-200">{variableXName}</strong></span>
              <span>·</span>
              <span>Y: <strong className="text-slate-200">{variableYName}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              {isComplete ? (
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{filledCount} / {pairCount} Complete ({pairCount * 2} values)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{filledCount} / {pairCount} Complete</span>
                </span>
              )}
            </div>
          </div>

          {/* Compact Observation Rows Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {Array.from({ length: pairCount }).map((_, idx) => {
              const err = validationState?.errors[idx];
              const valX = inputsX[idx] ?? '';
              const valY = inputsY[idx] ?? '';
              const isXFilled = valX.trim() !== '';
              const isYFilled = valY.trim() !== '';

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border transition-all flex items-center gap-2 ${
                    err
                      ? 'border-rose-500/80 bg-rose-950/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]'
                      : isXFilled && isYFilled
                      ? 'border-slate-700 bg-slate-900/80'
                      : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  {/* Observation Index */}
                  <span className="font-mono text-[10px] text-slate-500 shrink-0 px-1.5 py-0.5 border-r border-slate-800">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* X Input */}
                  <div className="flex-1 flex items-center gap-1">
                    <span className="text-[10px] font-mono text-slate-400">X:</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={valX}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (/^-?\d*\.?\d*$/.test(raw) || raw === '') {
                          handleInputChangeX(idx, raw);
                        }
                      }}
                      placeholder="—"
                      className={`w-full px-1.5 py-1 font-mono text-xs text-right rounded bg-slate-950/90 border focus:outline-none ${
                        err?.x ? 'border-rose-500 text-rose-300' : 'border-slate-800 text-teal-300 focus:border-teal-500'
                      }`}
                      aria-label={`Observation ${idx + 1} X`}
                    />
                  </div>

                  {/* Y Input */}
                  <div className="flex-1 flex items-center gap-1">
                    <span className="text-[10px] font-mono text-slate-400">Y:</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={valY}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (/^-?\d*\.?\d*$/.test(raw) || raw === '') {
                          handleInputChangeY(idx, raw);
                        }
                      }}
                      placeholder="—"
                      className={`w-full px-1.5 py-1 font-mono text-xs text-right rounded bg-slate-950/90 border focus:outline-none ${
                        err?.y ? 'border-rose-500 text-rose-300' : 'border-slate-800 text-emerald-300 focus:border-emerald-500'
                      }`}
                      aria-label={`Observation ${idx + 1} Y`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Validation Notice Banner */}
          {validationState && !validationState.isValid && (
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-rose-200">Strict Validation Rule: </span>
                <span>{validationState.generalError}</span>
                <p className="text-[11px] text-rose-400 mt-0.5">
                  Complete all {pairCount} paired observations before analysis. Empty fields are never treated as zero.
                </p>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] font-mono text-slate-500">
              {hasAnalyzed ? (
                <span className="text-teal-400">
                  ● Pearson correlation evaluated for current {pairCount} observations
                </span>
              ) : (
                <span>Mandatory: all {pairCount * 2} values must be entered to calculate correlation.</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold text-xs tracking-wider uppercase bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all shadow-[0_0_18px_rgba(20,184,166,0.22)] hover:shadow-[0_0_24px_rgba(20,184,166,0.38)] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>ANALYZE CORRELATION</span>
            </button>
          </div>

        </div>

        {/* ==================================================
            2. RESULT AREA (INSIDE THE SAME MODULE)
            ================================================== */}
        {result ? (
          <div className="space-y-6 pt-2 border-t border-slate-800/80">
            
            {/* Zero-variation Error Handling */}
            {result.errorReason ? (
              <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-800/60 flex items-start gap-3 text-xs text-amber-200">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <span className="font-semibold block">{result.errorReason}</span>
                  <p className="text-slate-400 text-[11px] mt-1">{result.interpretation}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Primary Metric Presentation Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Pearson r */}
                  <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                      Pearson&apos;s Coefficient (r)
                    </span>
                    <span className="font-mono text-3xl font-bold text-teal-300">
                      {formatNumber(result.r, 3)}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Bounded: −1.00 ≤ r ≤ +1.00
                    </span>
                  </div>

                  {/* Classification */}
                  <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                      Classification
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-bold text-white block truncate">
                      {result.classification}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Deterministic correlation band
                    </span>
                  </div>

                  {/* Paired Sample Size */}
                  <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                      Sample Size (n)
                    </span>
                    <span className="font-mono text-3xl font-bold text-slate-100">
                      {result.n} pairs
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      {result.n * 2} verified datapoints
                    </span>
                  </div>

                </div>

                {/* Structured Interpretation Block */}
                <div className="rounded-lg bg-gradient-to-br from-slate-900/90 to-[#0d142b]/80 border border-slate-800 p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-400">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Evidence-Based Interpretation</span>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm">
                    <div>
                      <span className="font-mono text-xs text-slate-400 block mb-0.5">Statistical Interpretation:</span>
                      <p className="text-slate-200 leading-relaxed font-normal">
                        {result.interpretation}
                      </p>
                    </div>

                    <div>
                      <span className="font-mono text-xs text-slate-400 block mb-0.5">Business Implication:</span>
                      <p className="text-slate-300 leading-relaxed">
                        {result.businessSignal}
                      </p>
                    </div>

                    <div>
                      <span className="font-mono text-xs text-teal-400/90 block mb-0.5">Actionable Decision Guidance:</span>
                      <p className="text-teal-200 leading-relaxed">
                        {result.action}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-500">
                    * Correlation does not prove causation. Association indicates empirical co-movement within this dataset.
                  </div>
                </div>
              </>
            )}

            {/* Auditable Calculation Transparency Drawer */}
            <div>
              <button
                type="button"
                onClick={() => setShowCalculation(!showCalculation)}
                className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-teal-400" />
                <span>{showCalculation ? 'Hide Auditable Calculations' : 'VIEW CALCULATION'}</span>
                {showCalculation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showCalculation && (
                <div className="mt-3 p-4 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-3 animate-in fade-in duration-150">
                  <div className="text-slate-400 font-semibold pb-1 border-b border-slate-800">
                    Mathematical Audit Trail (Pearson Correlation)
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-400">
                    <div>n = {result.steps.n}</div>
                    <div>ΣX = {result.steps.sumX}</div>
                    <div>ΣY = {result.steps.sumY}</div>
                    <div>ΣXY = {result.steps.sumXY}</div>
                    <div>ΣX² = {result.steps.sumX2}</div>
                    <div>ΣY² = {result.steps.sumY2}</div>
                  </div>

                  <div>
                    <span className="text-slate-500 block">// Numerator: nΣXY − (ΣX)(ΣY)</span>
                    <div className="text-teal-300">{result.steps.numeratorCalc}</div>
                  </div>

                  <div>
                    <span className="text-slate-500 block">// Denominator: √([nΣX² − (ΣX)²][nΣY² − (ΣY)²])</span>
                    <div className="text-slate-300">{result.steps.denominatorCalc}</div>
                  </div>

                  <div>
                    <span className="text-slate-500 block">// Correlation Coefficient (r)</span>
                    <div className="text-emerald-400 font-bold">r = {result.steps.rCalc}</div>
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs font-mono border-t border-slate-800/60">
            Enter paired observations above and click <span className="text-teal-400">ANALYZE CORRELATION</span> to generate results.
          </div>
        )}

      </div>
    </div>
  );
}
