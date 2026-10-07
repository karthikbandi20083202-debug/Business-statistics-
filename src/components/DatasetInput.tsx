/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Database, 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  Sliders,
  Play
} from 'lucide-react';
import { ValidationState } from '../types/statistics';

// Verified KOI & CO. test sample dataset (Customer Footfall)
export const KOI_SAMPLE_DATA = [
  85, 65, 70, 72, 80, 1050, 1000, 419, 85, 565, 517, 550, 819, 1010, 100
];

interface DatasetInputProps {
  variableName: string;
  onVariableNameChange: (name: string) => void;
  observationCount: number;
  onObservationCountChange: (count: number) => void;
  rawInputs: string[];
  onInputChange: (index: number, value: string) => void;
  onBulkSetInputs: (inputs: string[]) => void;
  onAnalyze: () => void;
  validationState: ValidationState | null;
  hasAnalyzed: boolean;
}

export function DatasetInput({
  variableName,
  onVariableNameChange,
  observationCount,
  onObservationCountChange,
  rawInputs,
  onInputChange,
  onBulkSetInputs,
  onAnalyze,
  validationState,
  hasAnalyzed,
}: DatasetInputProps) {
  const [showConfig, setShowConfig] = useState(false);

  // Check how many fields are filled
  const filledCount = rawInputs.filter((v) => v.trim() !== '').length;
  const isComplete = filledCount === observationCount && rawInputs.every((v) => !isNaN(Number(v.trim())) && v.trim() !== '');

  const handleLoadSample = () => {
    onObservationCountChange(KOI_SAMPLE_DATA.length);
    onBulkSetInputs(KOI_SAMPLE_DATA.map((n) => n.toString()));
  };

  const handleClear = () => {
    onBulkSetInputs(Array(observationCount).fill(''));
  };

  const handleCountChange = (newCount: number) => {
    if (newCount < 3 || newCount > 60) return;
    onObservationCountChange(newCount);
    const newInputs = Array(newCount).fill('');
    // preserve existing where possible
    for (let i = 0; i < Math.min(newCount, rawInputs.length); i++) {
      newInputs[i] = rawInputs[i];
    }
    onBulkSetInputs(newInputs);
  };

  return (
    <div className="rounded-xl bg-[#090e1d]/90 border border-slate-800/90 p-5 sm:p-7 shadow-lg relative">
      {/* Header and Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800/80 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base sm:text-lg font-bold text-white tracking-wide">
                DATASET INPUT ENGINE
              </h2>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50">
                Shared Input Architecture
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical observation entry for statistical validation and deterministic analysis
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-950/40 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-900/30 transition-all cursor-pointer"
            title="Load verified 15-observation customer footfall dataset"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>LOAD KOI &amp; CO. SAMPLE DATA</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            title="Clear all fields"
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
            title="Configure variable & sample size"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Config ({observationCount})</span>
          </button>
        </div>
      </div>

      {/* Dataset Metadata Strip */}
      <div className="py-3 px-1 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-500">Variable: </span>
            <span className="text-slate-200 font-semibold">{variableName}</span>
          </div>
          <div>
            <span className="text-slate-500">Required Observations: </span>
            <span className="text-emerald-400 font-semibold">{observationCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Input Status:</span>
          {isComplete ? (
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{filledCount} / {observationCount} Completed</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{filledCount} / {observationCount} Entered</span>
            </span>
          )}
        </div>
      </div>

      {/* Optional Configuration Drawer */}
      {showConfig && (
        <div className="mb-4 p-4 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-3 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-mono uppercase text-[11px]">
                Business Variable Name
              </label>
              <input
                type="text"
                value={variableName}
                onChange={(e) => onVariableNameChange(e.target.value)}
                placeholder="e.g. Customer Footfall"
                className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono uppercase text-[11px]">
                Sample Size N (Observations)
              </label>
              <div className="flex items-center gap-2">
                {[10, 15, 20, 25].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handleCountChange(cnt)}
                    className={`px-2.5 py-1 rounded font-mono text-xs cursor-pointer ${
                      observationCount === cnt
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    N = {cnt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Observation Grid */}
      <div className="mt-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
          {rawInputs.map((val, idx) => {
            const hasError = validationState && validationState.errors[idx];
            const isFilled = val.trim() !== '';

            return (
              <div
                key={idx}
                className={`relative flex items-center rounded-lg border transition-all ${
                  hasError
                    ? 'border-rose-500/80 bg-rose-950/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                    : isFilled
                    ? 'border-slate-700 bg-slate-900/80 hover:border-slate-600'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                {/* Observation Index Label */}
                <span className="font-mono text-[10px] tracking-wider text-slate-500 px-2 py-1.5 select-none shrink-0 border-r border-slate-800/80">
                  #{String(idx + 1).padStart(2, '0')}
                </span>

                {/* Input Field */}
                <input
                  type="text"
                  inputMode="decimal"
                  value={val}
                  onChange={(e) => {
                    const raw = e.target.value;
                    // Allow digits, decimal dot, minus sign
                    if (/^-?\d*\.?\d*$/.test(raw) || raw === '') {
                      onInputChange(idx, raw);
                    }
                  }}
                  placeholder="—"
                  className={`w-full px-2 py-1.5 font-mono text-xs sm:text-sm text-right focus:outline-none bg-transparent ${
                    isFilled ? 'text-emerald-300 font-medium' : 'text-slate-400'
                  }`}
                  aria-label={`Observation ${idx + 1}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation Banner or Notice */}
      {validationState && !validationState.isValid && (
        <div className="mt-4 p-3 rounded-lg bg-rose-950/30 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-rose-200">Validation Rule Enforced: </span>
            <span>{validationState.generalError}</span>
            <p className="text-[11px] text-rose-400 mt-0.5">
              KOI &amp; CO. decision standards prohibit calculating from partial or empty observations.
            </p>
          </div>
        </div>
      )}

      {/* Action Strip: ANALYZE DATA Button */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-[11px] font-mono text-slate-500 text-center sm:text-left">
          {hasAnalyzed ? (
            <span className="text-emerald-400/90">
              ● Deterministic calculations active for entered observations
            </span>
          ) : (
            <span>All {observationCount} observations must be entered before analysis can execute.</span>
          )}
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-lg font-semibold text-xs tracking-wider uppercase bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-[0_0_18px_rgba(16,185,129,0.22)] hover:shadow-[0_0_24px_rgba(16,185,129,0.38)] cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>ANALYZE DATA</span>
        </button>
      </div>
    </div>
  );
}
