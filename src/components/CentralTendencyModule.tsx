/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Calculator, 
  Target, 
  TrendingUp,
  Activity,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { CentralTendencyResult } from '../types/statistics';
import { formatNumber } from '../statistics/centralTendency';

interface CentralTendencyModuleProps {
  result: CentralTendencyResult | null;
  variableName: string;
}

export function CentralTendencyModule({ result, variableName }: CentralTendencyModuleProps) {
  const [showCalculation, setShowCalculation] = useState(false);

  // Classification Badge Color Theme
  const getBadgeColor = (classification: string) => {
    switch (classification) {
      case 'VERY CLOSE':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
      case 'SLIGHT DIFFERENCE':
        return 'bg-teal-950/60 text-teal-300 border-teal-500/40';
      case 'MODERATE DIFFERENCE':
        return 'bg-blue-950/60 text-blue-300 border-blue-500/40';
      case 'SUBSTANTIAL DIFFERENCE':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      case 'CONSIDERABLE DIFFERENCE':
        return 'bg-purple-950/60 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="rounded-xl bg-[#090e1d]/90 border border-slate-800/90 overflow-hidden shadow-lg">
      {/* Module Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-[#0e1428]/80 to-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-1 rounded">
            01
          </span>
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-wide">
              CENTRAL TENDENCY
            </h3>
            <p className="text-xs text-slate-400">
              Mean, Median &amp; Mode analysis for baseline customer volume positioning
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

      {result ? (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Primary Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* MEAN */}
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Arithmetic Mean (μ)
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400">
                {formatNumber(result.mean)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                ΣX / N ({formatNumber(result.total)} / {result.count})
              </span>
            </div>

            {/* MEDIAN */}
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Median
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
                {formatNumber(result.median)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                50th percentile rank
              </span>
            </div>

            {/* MODE */}
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Mode
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-slate-100 truncate block">
                {result.mode === 'NO_MODE' ? (
                  <span className="text-sm text-slate-400 font-normal">No Mode</span>
                ) : (
                  result.mode.map((m) => formatNumber(m)).join(', ')
                )}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1 truncate">
                {result.mode === 'NO_MODE' ? 'Equal frequency' : 'Most frequent observation'}
              </span>
            </div>

            {/* MEAN-MEDIAN DIFF */}
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors col-span-2 sm:col-span-3 lg:col-span-1">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Mean–Median Diff %
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-teal-300">
                {result.meanMedianDiffPercent !== null
                  ? `${formatNumber(result.meanMedianDiffPercent)}%`
                  : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Symmetry indicator
              </span>
            </div>

          </div>

          {/* Supporting Dataset Parameters */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Total Observations (N):</span>
              <span className="text-slate-200 font-semibold">{result.count}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Sum Total (ΣX):</span>
              <span className="text-slate-200 font-semibold">{formatNumber(result.total)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Dataset Minimum:</span>
              <span className="text-slate-200 font-semibold">{formatNumber(result.min)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Dataset Maximum:</span>
              <span className="text-slate-200 font-semibold">{formatNumber(result.max)}</span>
            </div>
          </div>

          {/* Business Insight Structured Block */}
          <div className="rounded-lg bg-gradient-to-br from-slate-900/90 to-[#0d142b]/80 border border-slate-800 p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Statistical Decision Translation</span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="font-mono text-xs text-slate-400 block mb-0.5">1. STATISTICAL INTERPRETATION:</span>
                <p className="text-slate-200 leading-relaxed font-normal">
                  {result.interpretation}
                </p>
              </div>

              <div>
                <span className="font-mono text-xs text-slate-400 block mb-0.5">2. BUSINESS SIGNAL ({variableName}):</span>
                <p className="text-slate-300 leading-relaxed">
                  {result.businessSignal}
                </p>
              </div>

              <div>
                <span className="font-mono text-xs text-emerald-400/90 block mb-0.5">3. ACTIONABLE IMPLICATION:</span>
                <p className="text-emerald-200 leading-relaxed">
                  {result.action}
                </p>
              </div>
            </div>
          </div>

          {/* Auditable Calculation Transparency Drawer */}
          <div>
            <button
              type="button"
              onClick={() => setShowCalculation(!showCalculation)}
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>{showCalculation ? 'Hide Auditable Calculations' : 'VIEW CALCULATION'}</span>
              {showCalculation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showCalculation && (
              <div className="mt-3 p-4 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-3 animate-in fade-in duration-150">
                <div className="text-slate-400 font-semibold pb-1 border-b border-slate-800">
                  Mathematical Audit Trail (Central Tendency)
                </div>

                <div>
                  <span className="text-slate-500 block">// Arithmetic Mean</span>
                  <div className="text-slate-300">{result.steps.meanFormula}</div>
                  <div className="text-emerald-400">Mean = {result.steps.meanCalculation} = {result.steps.meanResult}</div>
                </div>

                <div>
                  <span className="text-slate-500 block">// Median</span>
                  <div className="text-slate-300">{result.steps.medianFormula}</div>
                  <div className="text-emerald-400">{result.steps.medianCalculation}</div>
                </div>

                <div>
                  <span className="text-slate-500 block">// Mode</span>
                  <div className="text-slate-300">{result.steps.modeDescription}</div>
                </div>

                <div>
                  <span className="text-slate-500 block">// Mean–Median Percentage Difference</span>
                  <div className="text-emerald-400">{result.steps.diffCalculation}</div>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Empty / Pending State */
        <div className="p-8 text-center text-slate-500 text-xs font-mono">
          Enter observations in the Dataset Input above and click <span className="text-emerald-400">ANALYZE DATA</span> to generate Central Tendency results.
        </div>
      )}
    </div>
  );
}
