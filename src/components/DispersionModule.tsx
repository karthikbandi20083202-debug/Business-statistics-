/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Calculator, 
  Activity, 
  TrendingUp, 
  Lightbulb,
  ShieldAlert
} from 'lucide-react';
import { DispersionResult } from '../types/statistics';
import { formatNumber } from '../statistics/centralTendency';

interface DispersionModuleProps {
  result: DispersionResult | null;
  variableName: string;
}

export function DispersionModule({ result, variableName }: DispersionModuleProps) {
  const [showCalculation, setShowCalculation] = useState(false);

  const getCVBadgeColor = (classification: string) => {
    switch (classification) {
      case 'EXTREMELY CONSISTENT':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
      case 'VERY CONSISTENT':
        return 'bg-teal-950/60 text-teal-300 border-teal-500/40';
      case 'RELATIVELY CONSISTENT':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40';
      case 'MODERATE VARIATION':
        return 'bg-blue-950/60 text-blue-300 border-blue-500/40';
      case 'HIGH VARIATION':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      case 'VERY HIGH VARIATION':
        return 'bg-orange-950/60 text-orange-300 border-orange-500/40';
      case 'EXTREMELY HIGH VARIATION':
        return 'bg-rose-950/60 text-rose-300 border-rose-500/40';
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
            02
          </span>
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-wide">
              DISPERSION
            </h3>
            <p className="text-xs text-slate-400">
              Volatility, spread, and standard deviation across operating periods
            </p>
          </div>
        </div>

        {result && (
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono tracking-wider px-2.5 py-1 rounded border font-semibold ${getCVBadgeColor(result.classification)}`}>
              CV: {result.classification}
            </span>
          </div>
        )}
      </div>

      {result ? (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Primary Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            
            {/* RANGE */}
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Range (Max − Min)
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
                {formatNumber(result.range)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Total spread
              </span>
            </div>

            {/* QUARTILE DEVIATION */}
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Quartile Deviation
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
                {formatNumber(result.quartileDeviation)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                (Q3 − Q1) / 2
              </span>
            </div>

            {/* POPULATION VARIANCE */}
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Population Variance (σ²)
              </span>
              <span className="font-mono text-lg sm:text-xl font-bold text-slate-100 truncate block">
                {formatNumber(result.populationVariance)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Σ(X − μ)² / N
              </span>
            </div>

            {/* POPULATION STANDARD DEVIATION */}
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Standard Deviation (σ)
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400">
                {formatNumber(result.populationStandardDeviation)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Absolute spread
              </span>
            </div>

            {/* COEFFICIENT OF VARIATION */}
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors col-span-2 sm:col-span-1">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                Coeff. of Variation (CV)
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-teal-300">
                {result.coefficientOfVariation !== null
                  ? `${formatNumber(result.coefficientOfVariation)}%`
                  : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                (σ / μ) × 100
              </span>
            </div>

          </div>

          {/* Quartile Detail Strip */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">First Quartile (Q1 - 25%):</span>
              <span className="text-slate-200 font-semibold">{formatNumber(result.q1)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Third Quartile (Q3 - 75%):</span>
              <span className="text-slate-200 font-semibold">{formatNumber(result.q3)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Interquartile Range (IQR):</span>
              <span className="text-slate-200 font-semibold">{formatNumber(result.q3 - result.q1)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Relative Volatility Index:</span>
              <span className="text-emerald-400 font-semibold">{result.classification}</span>
            </div>
          </div>

          {/* Business Insight Structured Block */}
          <div className="rounded-lg bg-gradient-to-br from-slate-900/90 to-[#0d142b]/80 border border-slate-800 p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Dispersion &amp; Volatility Analysis</span>
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
                  Mathematical Audit Trail (Dispersion)
                </div>

                <div>
                  <span className="text-slate-500 block">// Range</span>
                  <div className="text-emerald-400">{result.steps.rangeCalculation}</div>
                </div>

                <div>
                  <span className="text-slate-500 block">// Quartiles &amp; Quartile Deviation</span>
                  <div className="text-slate-300">{result.steps.q1Calculation}</div>
                  <div className="text-slate-300">{result.steps.q3Calculation}</div>
                  <div className="text-emerald-400">{result.steps.qdCalculation}</div>
                </div>

                <div>
                  <span className="text-slate-500 block">// Population Variance (σ²)</span>
                  <div className="text-slate-300">{result.steps.varianceFormula}</div>
                  <div className="text-emerald-400">{result.steps.varianceCalculation}</div>
                </div>

                <div>
                  <span className="text-slate-500 block">// Population Standard Deviation (σ)</span>
                  <div className="text-emerald-400">{result.steps.stdDevCalculation}</div>
                </div>

                <div>
                  <span className="text-slate-500 block">// Coefficient of Variation (CV)</span>
                  <div className="text-emerald-400">{result.steps.cvCalculation}</div>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Empty / Pending State */
        <div className="p-8 text-center text-slate-500 text-xs font-mono">
          Enter observations in the Dataset Input above and click <span className="text-emerald-400">ANALYZE DATA</span> to generate Dispersion results.
        </div>
      )}
    </div>
  );
}
