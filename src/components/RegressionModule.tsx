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
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { RegressionResult, PairedObservation, PairedValidationState } from '../types/statistics';
import { calculateRegression, predictY } from '../statistics/regression';
import { validatePairedDatasetInputs, parsePairedDataset } from '../statistics/validation';
import { formatNumber } from '../statistics/centralTendency';

// Verified KOI & CO. Item-Price Sample Dataset (Old/Base Price X vs Current Price Y)
const KOI_PRICE_SAMPLE_X = [
  169, 212, 260, 296, 346, 399, 448, 468, 516, 574, 602, 657
];
const KOI_PRICE_SAMPLE_Y = [
  409, 560, 440, 436, 486, 455, 466, 515, 640, 486, 660, 545
];

interface RegressionModuleProps {
  onResultCalculated?: (res: RegressionResult | null) => void;
}

export function RegressionModule({ onResultCalculated }: RegressionModuleProps = {}) {
  // Input parameters
  const [variableXName, setVariableXName] = useState('Old/Base Price (X)');
  const [variableYName, setVariableYName] = useState('Current Price (Y)');
  const [observationCount, setObservationCount] = useState(12);
  const [showConfig, setShowConfig] = useState(false);

  // Raw inputs
  const [inputsX, setInputsX] = useState<string[]>(Array(12).fill(''));
  const [inputsY, setInputsY] = useState<string[]>(Array(12).fill(''));

  // Validation & Result states
  const [validationState, setValidationState] = useState<PairedValidationState | null>(null);
  const [result, setResult] = useState<RegressionResult | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);

  // Prediction state
  const [predictionInputX, setPredictionInputX] = useState<string>('400');
  const [predictedYValue, setPredictedYValue] = useState<number | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Input change handlers
  const handleInputChangeX = (idx: number, val: string) => {
    const updated = [...inputsX];
    updated[idx] = val;
    setInputsX(updated);

    if (hasAnalyzed) {
      setHasAnalyzed(false);
      setResult(null);
      setPredictedYValue(null);
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

    if (hasAnalyzed) {
      setHasAnalyzed(false);
      setResult(null);
      setPredictedYValue(null);
      onResultCalculated?.(null);
    }
    if (validationState) {
      setValidationState(null);
    }
  };

  const handleCountChange = (newCount: number) => {
    if (newCount < 2 || newCount > 50) return;
    setObservationCount(newCount);
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
    setPredictedYValue(null);
    onResultCalculated?.(null);
    setValidationState(null);
  };

  const handleLoadSample = () => {
    setObservationCount(KOI_PRICE_SAMPLE_X.length);
    setVariableXName('Old/Base Price (X)');
    setVariableYName('Current Price (Y)');
    setInputsX(KOI_PRICE_SAMPLE_X.map((n) => n.toString()));
    setInputsY(KOI_PRICE_SAMPLE_Y.map((n) => n.toString()));
    setHasAnalyzed(false);
    setResult(null);
    setPredictedYValue(null);
    onResultCalculated?.(null);
    setValidationState(null);
  };

  const handleClear = () => {
    setInputsX(Array(observationCount).fill(''));
    setInputsY(Array(observationCount).fill(''));
    setHasAnalyzed(false);
    setResult(null);
    setPredictedYValue(null);
    onResultCalculated?.(null);
    setValidationState(null);
  };

  const handleAnalyze = () => {
    const validation = validatePairedDatasetInputs(inputsX, inputsY, observationCount);
    setValidationState(validation);

    if (!validation.isValid) {
      setHasAnalyzed(false);
      setResult(null);
      setPredictedYValue(null);
      onResultCalculated?.(null);
      return;
    }

    try {
      const parsedPairs = parsePairedDataset(inputsX, inputsY);
      const regResult = calculateRegression(parsedPairs, variableXName, variableYName);
      setResult(regResult);
      setHasAnalyzed(true);
      onResultCalculated?.(regResult);

      // If prediction input is present and valid, compute initial prediction
      if (predictionInputX.trim() !== '' && !regResult.errorReason) {
        const xNum = Number(predictionInputX.trim());
        if (!isNaN(xNum) && isFinite(xNum)) {
          setPredictedYValue(predictY(regResult.intercept, regResult.slope, xNum));
          setPredictionError(null);
        }
      }
    } catch (err) {
      console.error('Regression analysis error:', err);
    }
  };

  const handlePredict = () => {
    if (!result || result.errorReason) return;
    const trimmed = predictionInputX.trim();
    if (trimmed === '') {
      setPredictedYValue(null);
      setPredictionError('Enter an X value to calculate predicted Y.');
      return;
    }
    const xNum = Number(trimmed);
    if (isNaN(xNum) || !isFinite(xNum)) {
      setPredictedYValue(null);
      setPredictionError('Enter a valid numeric value for prediction.');
      return;
    }
    setPredictionError(null);
    const pred = predictY(result.intercept, result.slope, xNum);
    setPredictedYValue(pred);
  };

  // Count filled pairs
  let filledCount = 0;
  for (let i = 0; i < observationCount; i++) {
    const xVal = (inputsX[i] ?? '').trim();
    const yVal = (inputsY[i] ?? '').trim();
    if (xVal !== '' && yVal !== '' && !isNaN(Number(xVal)) && !isNaN(Number(yVal))) {
      filledCount++;
    }
  }
  const isComplete = filledCount === observationCount;

  const getR2BadgeColor = (classification: string) => {
    switch (classification) {
      case 'EXTREMELY STRONG':
      case 'VERY STRONG':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
      case 'STRONG':
        return 'bg-teal-950/60 text-teal-300 border-teal-500/40';
      case 'MODERATE':
        return 'bg-blue-950/60 text-blue-300 border-blue-500/40';
      case 'WEAK':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      case 'VERY WEAK':
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
            04
          </span>
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-wide">
              REGRESSION
            </h3>
            <p className="text-xs text-slate-400">
              Simple linear least-squares modeling, parameter estimation (Y = a + bX), and R² determination
            </p>
          </div>
        </div>

        {result && (
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono tracking-wider px-2.5 py-1 rounded border font-semibold ${getR2BadgeColor(result.classification)}`}>
              Fit: {result.classification}
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
                {observationCount} Pairs Required
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-teal-950/40 text-teal-300 hover:text-teal-200 border border-teal-500/30 hover:border-teal-500/50 hover:bg-teal-900/30 transition-all cursor-pointer"
                title="Load verified item-price test dataset"
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
                    Independent Variable X
                  </label>
                  <input
                    type="text"
                    value={variableXName}
                    onChange={(e) => setVariableXName(e.target.value)}
                    placeholder="e.g. Old/Base Price"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Dependent Variable Y
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
                    Number of Observations (n)
                  </label>
                  <div className="flex items-center gap-2">
                    {[10, 12, 15, 20].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => handleCountChange(cnt)}
                        className={`px-2 py-1 rounded font-mono text-xs cursor-pointer ${
                          observationCount === cnt
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
              <span>Predictor (X): <strong className="text-slate-200">{variableXName}</strong></span>
              <span>·</span>
              <span>Response (Y): <strong className="text-slate-200">{variableYName}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              {isComplete ? (
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{filledCount} / {observationCount} Complete ({observationCount * 2} values)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{filledCount} / {observationCount} Complete</span>
                </span>
              )}
            </div>
          </div>

          {/* Compact Observation Rows Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {Array.from({ length: observationCount }).map((_, idx) => {
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
                  Complete all {observationCount} paired observations before analysis. Empty fields are never treated as zero.
                </p>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] font-mono text-slate-500">
              {hasAnalyzed ? (
                <span className="text-teal-400">
                  ● Linear regression model fitted for current {observationCount} observations
                </span>
              ) : (
                <span>Mandatory: all {observationCount * 2} values must be entered to fit regression.</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-semibold text-xs tracking-wider uppercase bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all shadow-[0_0_18px_rgba(20,184,166,0.22)] hover:shadow-[0_0_24px_rgba(20,184,166,0.38)] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>ANALYZE REGRESSION</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* REGRESSION EQUATION */}
                  <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors col-span-1 sm:col-span-2">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                      REGRESSION EQUATION (Y = a + bX)
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-teal-300 break-words">
                      {result.equation}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Dynamically fitted least-squares line
                    </span>
                  </div>

                  {/* INTERCEPT (a) */}
                  <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                      INTERCEPT (a)
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
                      a = {formatNumber(result.intercept, 2)}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Value of Y when X = 0
                    </span>
                  </div>

                  {/* SLOPE (b) */}
                  <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                      SLOPE (b)
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
                      b = {formatNumber(result.slope, 4)}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Marginal sensitivity ΔY/ΔX
                    </span>
                  </div>

                </div>

                {/* R² Determination Strip */}
                <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                      R² (Coefficient of Determination)
                    </span>
                    <span className="font-mono text-2xl font-bold text-emerald-400">
                      R² = {formatNumber(result.r2Percent, 1)}%
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      R² = r² = ({formatNumber(result.r, 3)})²
                    </span>
                  </div>

                  <div className="sm:col-span-2 text-xs text-slate-300 leading-relaxed border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
                    <span className="font-mono text-xs text-teal-400 font-semibold block mb-0.5">
                      Strength: {result.classification}
                    </span>
                    <p>
                      Approximately <span className="text-emerald-300 font-semibold">{formatNumber(result.r2Percent, 1)}%</span> of the variation in {variableYName} is explained by the linear relationship with {variableXName} within this dataset.
                    </p>
                  </div>
                </div>

                {/* ==================================================
                    3. PREDICTION SANDBOX
                    ================================================== */}
                <div className="p-4 sm:p-5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-teal-400 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Linear Prediction Sandbox</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">
                      Ŷ = a + bX
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <label htmlFor="predXInput" className="text-xs font-mono text-slate-300 whitespace-nowrap">
                        ENTER X VALUE FOR PREDICTION:
                      </label>
                      <input
                        id="predXInput"
                        type="text"
                        inputMode="decimal"
                        value={predictionInputX}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (/^-?\d*\.?\d*$/.test(raw) || raw === '') {
                            setPredictionInputX(raw);
                            if (predictionError) setPredictionError(null);
                          }
                        }}
                        placeholder="e.g. 400"
                        className="w-28 px-2.5 py-1.5 font-mono text-xs text-right rounded bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-500"
                      />
                      <button
                        type="button"
                        onClick={handlePredict}
                        className="px-3 py-1.5 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-mono font-semibold transition-colors cursor-pointer"
                      >
                        PREDICT Y
                      </button>
                    </div>

                    <div className="p-2 sm:px-4 sm:py-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-3 justify-between sm:justify-start">
                      <span className="font-mono text-xs text-slate-400">
                        Predicted Y:
                      </span>
                      <span className="font-mono text-base font-bold text-teal-300">
                        {predictedYValue !== null ? formatNumber(predictedYValue, 2) : '—'}
                      </span>
                    </div>
                  </div>

                  {predictionError && (
                    <p className="text-xs text-rose-400 font-mono">
                      {predictionError}
                    </p>
                  )}
                </div>

                {/* ==================================================
                    4. THREE-LAYER BUSINESS INTERPRETATION
                    ================================================== */}
                <div className="rounded-lg bg-gradient-to-br from-slate-900/90 to-[#0d142b]/80 border border-slate-800 p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-400">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Three-Layer Decision Interpretation</span>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm">
                    {/* Layer 1: STATISTICAL RESULT */}
                    <div>
                      <span className="font-mono text-xs text-slate-400 block mb-0.5">1. STATISTICAL RESULT:</span>
                      <p className="text-slate-200 leading-relaxed font-normal">
                        Fitted equation: <span className="font-mono text-teal-300">{result.equation}</span> with R² = <span className="font-mono text-emerald-400">{formatNumber(result.r2Percent, 1)}%</span> ({result.classification} fit).
                      </p>
                    </div>

                    {/* Layer 2: WHAT IT MEANS */}
                    <div>
                      <span className="font-mono text-xs text-slate-400 block mb-0.5">2. WHAT IT MEANS:</span>
                      <p className="text-slate-300 leading-relaxed">
                        {result.interpretation} {result.slope >= 0 ? `${variableYName} tends to increase as ${variableXName} increases within the observed dataset.` : `${variableYName} tends to decrease as ${variableXName} increases within the observed dataset.`}
                      </p>
                    </div>

                    {/* Layer 3: BUSINESS IMPLICATION */}
                    <div>
                      <span className="font-mono text-xs text-teal-400/90 block mb-0.5">3. BUSINESS IMPLICATION:</span>
                      <p className="text-teal-200 leading-relaxed">
                        {result.action}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-500">
                    * Note: Linear regression models quantify statistical association; they do not establish empirical causation.
                  </div>
                </div>
              </>
            )}

            {/* ==================================================
                5. AUDITABLE CALCULATION TRANSPARENCY
                ================================================== */}
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
                    Mathematical Audit Trail (Simple Linear Regression)
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
                    <span className="text-slate-500 block">// Slope calculation: b = [nΣXY − (ΣX)(ΣY)] / [nΣX² − (ΣX)²]</span>
                    <div className="text-teal-300">{result.steps.slopeCalculation}</div>
                  </div>

                  <div>
                    <span className="text-slate-500 block">// Intercept calculation: a = [ΣY − bΣX] / n</span>
                    <div className="text-slate-300">{result.steps.interceptCalculation}</div>
                  </div>

                  <div>
                    <span className="text-slate-500 block">// Fitted Regression Equation</span>
                    <div className="text-emerald-400 font-bold">{result.steps.equationString}</div>
                  </div>

                  <div>
                    <span className="text-slate-500 block">// R² Calculation</span>
                    <div className="text-teal-300">{result.steps.r2Calculation}</div>
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs font-mono border-t border-slate-800/60">
            Enter paired observations above and click <span className="text-teal-400">ANALYZE REGRESSION</span> to fit the linear equation and R².
          </div>
        )}

      </div>
    </div>
  );
}
